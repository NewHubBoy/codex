import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import type { Request } from "express";
import {
  CreateAttachmentInputSchema,
  UpdateAttachmentInputSchema,
  CreateAttachmentLinkInputSchema,
  DeleteAttachmentLinkInputSchema
} from "@crm/shared";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { parseListQuery } from "../../common/list-query";
import { getRequestContext } from "../../common/request-context";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  getSchemaPath
} from "@nestjs/swagger";
import { AttachmentsService } from "./attachments.service";
import {
  AttachmentDto,
  AttachmentConfigDto,
  AttachmentLinkDto,
  CreateAttachmentDto,
  CreateAttachmentLinkDto,
  UpdateAttachmentDto
} from "./dto/attachments.swagger";
import { PaginatedResponseDto } from "../../common/swagger/pagination";

const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;
const MIME_TYPE_PATTERN = /^[\w.+-]+\/[\w.+-]+$/;

function resolveAllowedMimeTypes() {
  const raw = process.env.ATTACHMENT_ALLOWED_MIME_TYPES;
  if (!raw) {
    return [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp"
    ];
  }
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

@ApiTags("attachments")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, AttachmentDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("attachments")
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  @RequirePermissions("attachment:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(AttachmentDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.attachmentsService.list(ctx, listQuery);
  }

  @Get("config")
  @RequirePermissions("attachment:read")
  @ApiOkResponse({ type: AttachmentConfigDto })
  getConfig() {
    return this.attachmentsService.getConfig();
  }

  @Post()
  @RequirePermissions("attachment:write")
  @ApiBody({ type: CreateAttachmentDto })
  @ApiCreatedResponse({ type: AttachmentDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateAttachmentInputSchema.parse(body);
    return this.attachmentsService.create(ctx, input);
  }

  @Post("upload")
  @RequirePermissions("attachment:write")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        relatedType: { type: "string" },
        relatedId: { type: "string" },
        note: { type: "string" }
      },
      required: ["file"]
    }
  })
  @ApiCreatedResponse({ type: AttachmentDto })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_ATTACHMENT_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!MIME_TYPE_PATTERN.test(file.mimetype)) {
          return callback(new BadRequestException("Invalid mimeType format"), false);
        }
        const allowed = resolveAllowedMimeTypes();
        if (allowed.length > 0 && !allowed.includes(file.mimetype)) {
          return callback(new BadRequestException("mimeType is not allowed"), false);
        }
        return callback(null, true);
      }
    })
  )
  async upload(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Record<string, string>
  ) {
    const ctx = getRequestContext(req);
    const relatedType = body.relatedType?.trim();
    const relatedId = body.relatedId?.trim();
    const note = body.note?.trim();
    const link =
      relatedType && relatedId
        ? CreateAttachmentLinkInputSchema.parse({ relatedType, relatedId, note })
        : undefined;
    return this.attachmentsService.upload(ctx, file, link);
  }

  @Get(":id")
  @RequirePermissions("attachment:read")
  @ApiOkResponse({ type: AttachmentDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.attachmentsService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("attachment:write")
  @ApiBody({ type: UpdateAttachmentDto })
  @ApiOkResponse({ type: AttachmentDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateAttachmentInputSchema.parse(body);
    return this.attachmentsService.update(ctx, id, input);
  }

  @Delete(":id")
  @RequirePermissions("attachment:write")
  @ApiOkResponse({ type: AttachmentDto })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.attachmentsService.remove(ctx, id);
  }

  @Post(":id/links")
  @RequirePermissions("attachment:write")
  @ApiBody({ type: CreateAttachmentLinkDto })
  @ApiCreatedResponse({ type: AttachmentLinkDto })
  async addLink(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateAttachmentLinkInputSchema.parse(body);
    return this.attachmentsService.addLink(ctx, id, input);
  }

  @Delete(":id/links")
  @RequirePermissions("attachment:write")
  @ApiOkResponse({ type: AttachmentLinkDto })
  async removeLink(
    @Req() req: Request,
    @Param("id") id: string,
    @Query() query: Record<string, string>
  ) {
    const ctx = getRequestContext(req);
    const input = DeleteAttachmentLinkInputSchema.parse(query);
    return this.attachmentsService.removeLink(ctx, id, input);
  }
}
