import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createHash, randomUUID } from "crypto";
import path from "path";
import type {
  CreateAttachmentInput,
  UpdateAttachmentInput,
  CreateAttachmentLinkInput,
  DeleteAttachmentLinkInput
} from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSort } from "../../common/list-query";

const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;
const MIME_TYPE_PATTERN = /^[\w.+-]+\/[\w.+-]+$/;
const DEFAULT_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
];

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  private getAllowedMimeTypes(): string[] {
    const raw = process.env.ATTACHMENT_ALLOWED_MIME_TYPES;
    if (!raw) {
      return DEFAULT_ALLOWED_MIME_TYPES;
    }
    return raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private getS3Client() {
    const accessKeyId =
      process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID ?? undefined;
    const secretAccessKey =
      process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY ?? undefined;
    const region = process.env.S3_REGION ?? process.env.AWS_REGION ?? "us-east-1";
    const endpoint = process.env.S3_ENDPOINT;
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";
    if (!accessKeyId || !secretAccessKey) {
      throw new BadRequestException("S3 credentials are not configured");
    }
    return new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
      ...(endpoint ? { endpoint } : {}),
      ...(forcePathStyle ? { forcePathStyle } : {})
    });
  }

  private getBucket(): string {
    const bucket = process.env.S3_BUCKET ?? process.env.AWS_S3_BUCKET;
    if (!bucket) {
      throw new BadRequestException("S3 bucket is not configured");
    }
    return bucket;
  }

  private buildPublicUrl(bucket: string, objectKey: string): string | undefined {
    const base = process.env.S3_PUBLIC_BASE_URL;
    if (base) {
      return `${base.replace(/\\/$/, "")}/${objectKey}`;
    }
    const endpoint = process.env.S3_ENDPOINT;
    if (endpoint) {
      const normalized = endpoint.replace(/\\/$/, "");
      const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";
      return forcePathStyle
        ? `${normalized}/${bucket}/${objectKey}`
        : `${normalized}/${objectKey}`;
    }
    const region = process.env.S3_REGION ?? process.env.AWS_REGION;
    if (!region) {
      return undefined;
    }
    return `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;
  }

  private sanitizeFileName(fileName: string) {
    const base = path.basename(fileName);
    const sanitized = base.replace(/[^\w.\-]+/g, "_");
    return sanitized || `file-${Date.now()}`;
  }

  private validateAttachment(input: CreateAttachmentInput | UpdateAttachmentInput) {
    const allowedMimeTypes = this.getAllowedMimeTypes();
    if (input.mimeType && !MIME_TYPE_PATTERN.test(input.mimeType)) {
      throw new BadRequestException("Invalid mimeType format");
    }
    if (input.mimeType && allowedMimeTypes.length > 0) {
      if (!allowedMimeTypes.includes(input.mimeType)) {
        throw new BadRequestException("mimeType is not allowed");
      }
    }
    if (input.size !== undefined) {
      if (input.size <= 0) {
        throw new BadRequestException("Attachment size must be greater than 0");
      }
      if (input.size > MAX_ATTACHMENT_SIZE_BYTES) {
        throw new BadRequestException("Attachment size exceeds 20MB limit");
      }
    }
  }

  async create(ctx: RequestContext, input: CreateAttachmentInput) {
    this.validateAttachment(input);
    const attachment = await this.prisma.attachment.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: input.status ?? undefined,
        fileName: input.fileName,
        mimeType: input.mimeType,
        size: input.size,
        checksumSha256: input.checksumSha256,
        storageProvider: input.storageProvider ?? "S3",
        bucket: input.bucket,
        objectKey: input.objectKey,
        url: input.url,
        metadata: input.metadata as object | undefined
      }
    });
    await this.audit.log(
      ctx,
      "create",
      "Attachment",
      attachment.id,
      `Created ${attachment.fileName}`
    );
    await this.outbox.enqueue(ctx, "Attachment", attachment.id, "attachment.created", {
      fileName: attachment.fileName
    });
    return attachment;
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "fileName", "size"]);
    const qFilters: Record<string, unknown>[] = [];
    if (query.q) {
      qFilters.push(
        { fileName: { contains: query.q, mode: "insensitive" as const } },
        { objectKey: { contains: query.q, mode: "insensitive" as const } }
      );
    }
    const statusFilter = query.status ?? { not: "DELETED" };
    const linkFilter: Record<string, string> = {};
    if (query.relatedType) {
      linkFilter.relatedType = query.relatedType;
    }
    if (query.relatedId) {
      linkFilter.relatedId = query.relatedId;
    }
    const where = {
      tenantId: ctx.tenantId,
      ...scopeFilter,
      status: statusFilter,
      ownerId: query.ownerId,
      orgUnitId: query.orgUnitId,
      ...(qFilters.length ? { OR: qFilters } : {}),
      ...(Object.keys(linkFilter).length ? { links: { some: linkFilter } } : {})
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.attachment.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.attachment.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async get(ctx: RequestContext, id: string) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const attachment = await this.prisma.attachment.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!attachment) {
      throw new NotFoundException("Attachment not found");
    }
    return attachment;
  }

  async update(ctx: RequestContext, id: string, input: UpdateAttachmentInput) {
    await this.get(ctx, id);
    this.validateAttachment(input);
    const attachment = await this.prisma.attachment.update({
      where: { id },
      data: {
        fileName: input.fileName,
        mimeType: input.mimeType,
        size: input.size,
        checksumSha256: input.checksumSha256,
        storageProvider: input.storageProvider,
        bucket: input.bucket,
        objectKey: input.objectKey,
        url: input.url,
        metadata: input.metadata as object | undefined,
        status: input.status
      }
    });
    await this.audit.log(
      ctx,
      "update",
      "Attachment",
      attachment.id,
      `Updated ${attachment.fileName}`
    );
    await this.outbox.enqueue(ctx, "Attachment", attachment.id, "attachment.updated", {
      fileName: attachment.fileName
    });
    return attachment;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const attachment = await this.prisma.attachment.delete({ where: { id } });
    await this.audit.log(
      ctx,
      "delete",
      "Attachment",
      attachment.id,
      `Deleted ${attachment.fileName}`
    );
    await this.outbox.enqueue(ctx, "Attachment", attachment.id, "attachment.deleted", {
      fileName: attachment.fileName
    });
    return attachment;
  }

  async addLink(ctx: RequestContext, id: string, input: CreateAttachmentLinkInput) {
    await this.get(ctx, id);
    const link = await this.prisma.attachmentLink.upsert({
      where: {
        attachmentId_relatedType_relatedId: {
          attachmentId: id,
          relatedType: input.relatedType,
          relatedId: input.relatedId
        }
      },
      update: {
        note: input.note ?? undefined
      },
      create: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        attachmentId: id,
        relatedType: input.relatedType,
        relatedId: input.relatedId,
        note: input.note
      }
    });
    await this.audit.log(
      ctx,
      "link",
      "Attachment",
      id,
      `Linked to ${input.relatedType}:${input.relatedId}`
    );
    await this.outbox.enqueue(ctx, "Attachment", id, "attachment.linked", {
      relatedType: input.relatedType,
      relatedId: input.relatedId
    });
    return link;
  }

  async removeLink(ctx: RequestContext, id: string, input: DeleteAttachmentLinkInput) {
    await this.get(ctx, id);
    const existing = await this.prisma.attachmentLink.findFirst({
      where: {
        tenantId: ctx.tenantId,
        attachmentId: id,
        relatedType: input.relatedType,
        relatedId: input.relatedId
      }
    });
    if (!existing) {
      throw new NotFoundException("Attachment link not found");
    }
    const link = await this.prisma.attachmentLink.delete({ where: { id: existing.id } });
    await this.audit.log(
      ctx,
      "unlink",
      "Attachment",
      id,
      `Unlinked from ${input.relatedType}:${input.relatedId}`
    );
    await this.outbox.enqueue(ctx, "Attachment", id, "attachment.unlinked", {
      relatedType: input.relatedType,
      relatedId: input.relatedId
    });
    return link;
  }

  async upload(
    ctx: RequestContext,
    file: Express.Multer.File,
    link?: CreateAttachmentLinkInput
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    this.validateAttachment({ mimeType: file.mimetype, size: file.size } as CreateAttachmentInput);
    const bucket = this.getBucket();
    const attachmentId = randomUUID();
    const safeName = this.sanitizeFileName(file.originalname || "file");
    const objectKey = `${ctx.tenantId}/attachments/${attachmentId}/${safeName}`;
    const checksum = createHash("sha256").update(file.buffer).digest("hex");
    const client = this.getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size
      })
    );
    const url = this.buildPublicUrl(bucket, objectKey);
    const attachment = await this.prisma.attachment.create({
      data: {
        id: attachmentId,
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: "ACTIVE",
        fileName: safeName,
        mimeType: file.mimetype,
        size: file.size,
        checksumSha256: checksum,
        storageProvider: "S3",
        bucket,
        objectKey,
        url: url ?? undefined
      }
    });
    await this.audit.log(
      ctx,
      "create",
      "Attachment",
      attachment.id,
      `Uploaded ${attachment.fileName}`
    );
    await this.outbox.enqueue(ctx, "Attachment", attachment.id, "attachment.uploaded", {
      fileName: attachment.fileName
    });
    if (link) {
      await this.addLink(ctx, attachment.id, link);
    }
    return attachment;
  }
}
