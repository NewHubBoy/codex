import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateFieldDefinitionInput,
  CreateFieldGroupInput,
  UpdateFieldDefinitionInput,
  UpdateFieldGroupInput
} from "@crm/shared";
import type { RequestContext } from "../../common/request-context";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSerialId, parseSort } from "../../common/list-query";

@Injectable()
export class FieldsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  async listDefinitions(ctx: RequestContext, query: ListQuery, entityType?: string) {
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "fieldKey", "label"]);
    const serialId = parseSerialId(query.q);
    const qFilters: Record<string, unknown>[] = [];
    if (query.q) {
      qFilters.push(
        { fieldKey: { contains: query.q, mode: "insensitive" as const } },
        { label: { contains: query.q, mode: "insensitive" as const } }
      );
    }
    if (serialId !== undefined) {
      qFilters.push({ serialId });
    }
    const where = {
      tenantId: ctx.tenantId,
      entityType: entityType ?? undefined,
      ...(qFilters.length ? { OR: qFilters } : {})
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.fieldDefinition.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.fieldDefinition.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async createDefinition(ctx: RequestContext, input: CreateFieldDefinitionInput) {
    const field = await this.prisma.fieldDefinition.create({
      data: {
        tenantId: ctx.tenantId,
        entityType: input.entityType,
        fieldKey: input.fieldKey,
        label: input.label,
        dataType: input.dataType,
        required: input.required ?? false,
        optionsJson: (input.optionsJson ?? undefined) as Prisma.InputJsonValue | undefined,
        validationJson: (input.validationJson ?? undefined) as Prisma.InputJsonValue | undefined
      }
    });
    await this.audit.log(ctx, "create", "FieldDefinition", field.id, `${field.entityType}.${field.fieldKey}`);
    await this.outbox.enqueue(ctx, "FieldDefinition", field.id, "field.created", {
      entityType: field.entityType,
      fieldKey: field.fieldKey
    });
    return field;
  }

  async updateDefinition(ctx: RequestContext, id: string, input: UpdateFieldDefinitionInput) {
    const existing = await this.prisma.fieldDefinition.findFirst({
      where: { id, tenantId: ctx.tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Field definition not found");
    }
    const field = await this.prisma.fieldDefinition.update({
      where: { id },
      data: {
        entityType: input.entityType,
        fieldKey: input.fieldKey,
        label: input.label,
        dataType: input.dataType,
        required: input.required,
        optionsJson: (input.optionsJson ?? undefined) as Prisma.InputJsonValue | undefined,
        validationJson: (input.validationJson ?? undefined) as Prisma.InputJsonValue | undefined
      }
    });
    await this.audit.log(ctx, "update", "FieldDefinition", field.id, `${field.entityType}.${field.fieldKey}`);
    await this.outbox.enqueue(ctx, "FieldDefinition", field.id, "field.updated", {
      entityType: field.entityType,
      fieldKey: field.fieldKey
    });
    return field;
  }

  async listGroups(ctx: RequestContext, query: ListQuery, entityType?: string) {
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "groupName", "sortOrder"]);
    const serialId = parseSerialId(query.q);
    const qFilters: Record<string, unknown>[] = [];
    if (query.q) {
      qFilters.push({ groupName: { contains: query.q, mode: "insensitive" as const } });
    }
    if (serialId !== undefined) {
      qFilters.push({ serialId });
    }
    const where = {
      tenantId: ctx.tenantId,
      entityType: entityType ?? undefined,
      ...(qFilters.length ? { OR: qFilters } : {})
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.fieldGroup.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.fieldGroup.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async createGroup(ctx: RequestContext, input: CreateFieldGroupInput) {
    const group = await this.prisma.fieldGroup.create({
      data: {
        tenantId: ctx.tenantId,
        entityType: input.entityType,
        groupName: input.groupName,
        sortOrder: input.sortOrder ?? 0,
        layoutJson: (input.layoutJson ?? undefined) as Prisma.InputJsonValue | undefined
      }
    });
    await this.audit.log(ctx, "create", "FieldGroup", group.id, `${group.entityType}.${group.groupName}`);
    await this.outbox.enqueue(ctx, "FieldGroup", group.id, "field.group.created", {
      entityType: group.entityType,
      groupName: group.groupName
    });
    return group;
  }

  async updateGroup(ctx: RequestContext, id: string, input: UpdateFieldGroupInput) {
    const existing = await this.prisma.fieldGroup.findFirst({
      where: { id, tenantId: ctx.tenantId }
    });
    if (!existing) {
      throw new NotFoundException("Field group not found");
    }
    const group = await this.prisma.fieldGroup.update({
      where: { id },
      data: {
        entityType: input.entityType,
        groupName: input.groupName,
        sortOrder: input.sortOrder,
        layoutJson: (input.layoutJson ?? undefined) as Prisma.InputJsonValue | undefined
      }
    });
    await this.audit.log(ctx, "update", "FieldGroup", group.id, `${group.entityType}.${group.groupName}`);
    await this.outbox.enqueue(ctx, "FieldGroup", group.id, "field.group.updated", {
      entityType: group.entityType,
      groupName: group.groupName
    });
    return group;
  }
}
