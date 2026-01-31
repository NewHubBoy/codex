import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import type { Request } from "express";
import {
  CreateFieldDefinitionInputSchema,
  CreateFieldGroupInputSchema,
  UpdateFieldDefinitionInputSchema,
  UpdateFieldGroupInputSchema
} from "@crm/shared";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  getSchemaPath
} from "@nestjs/swagger";
import { parseListQuery } from "../../common/list-query";
import { getRequestContext } from "../../common/request-context";
import { Public } from "../../common/decorators/public.decorator";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PaginatedResponseDto } from "../../common/swagger/pagination";
import { FieldsService } from "./fields.service";
import {
  CreateFieldDefinitionDto,
  CreateFieldGroupDto,
  FieldDefinitionDto,
  FieldGroupDto,
  UpdateFieldDefinitionDto,
  UpdateFieldGroupDto
} from "./dto/fields.swagger";

@ApiTags("fields")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, FieldDefinitionDto, FieldGroupDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("config/fields")
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Get("health")
  @Public()
  health() {
    return { status: "ok", module: "fields" };
  }

  @Get()
  @RequirePermissions("config:field:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(FieldDefinitionDto) }
            }
          }
        }
      ]
    }
  })
  async list(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    const entityType =
      typeof query.entityType === "string" && query.entityType.trim()
        ? query.entityType.trim()
        : undefined;
    return this.fieldsService.listDefinitions(ctx, listQuery, entityType);
  }

  @Post()
  @RequirePermissions("config:field:write")
  @ApiBody({ type: CreateFieldDefinitionDto })
  @ApiCreatedResponse({ type: FieldDefinitionDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateFieldDefinitionInputSchema.parse(body);
    return this.fieldsService.createDefinition(ctx, input);
  }

  @Patch(":id")
  @RequirePermissions("config:field:write")
  @ApiBody({ type: UpdateFieldDefinitionDto })
  @ApiOkResponse({ type: FieldDefinitionDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateFieldDefinitionInputSchema.parse(body);
    return this.fieldsService.updateDefinition(ctx, id, input);
  }

  @Get("groups")
  @RequirePermissions("config:field:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(FieldGroupDto) }
            }
          }
        }
      ]
    }
  })
  async listGroups(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    const entityType =
      typeof query.entityType === "string" && query.entityType.trim()
        ? query.entityType.trim()
        : undefined;
    return this.fieldsService.listGroups(ctx, listQuery, entityType);
  }

  @Post("groups")
  @RequirePermissions("config:field:write")
  @ApiBody({ type: CreateFieldGroupDto })
  @ApiCreatedResponse({ type: FieldGroupDto })
  async createGroup(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateFieldGroupInputSchema.parse(body);
    return this.fieldsService.createGroup(ctx, input);
  }

  @Patch("groups/:id")
  @RequirePermissions("config:field:write")
  @ApiBody({ type: UpdateFieldGroupDto })
  @ApiOkResponse({ type: FieldGroupDto })
  async updateGroup(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateFieldGroupInputSchema.parse(body);
    return this.fieldsService.updateGroup(ctx, id, input);
  }
}
