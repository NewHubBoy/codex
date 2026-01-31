import {
  Body,
  Controller,
  Delete,
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
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  getSchemaPath
} from "@nestjs/swagger";
import {
  AssignPermissionInputSchema,
  CreatePermissionInputSchema,
  CreateRoleInputSchema,
  UpdatePermissionInputSchema,
  UpdateRoleInputSchema
} from "@crm/shared";
import { parseListQuery } from "../../common/list-query";
import { getRequestContext } from "../../common/request-context";
import { Public } from "../../common/decorators/public.decorator";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PaginatedResponseDto } from "../../common/swagger/pagination";
import { RbacService } from "./rbac.service";
import {
  AssignPermissionDto,
  CreatePermissionDto,
  CreateRoleDto,
  PermissionDto,
  RoleDto,
  RolePermissionDto,
  UpdatePermissionDto,
  UpdateRoleDto
} from "./dto/rbac.swagger";

@ApiTags("rbac")
@ApiBearerAuth()
@ApiSecurity("tenant")
@ApiExtraModels(PaginatedResponseDto, RoleDto, PermissionDto)
@UseGuards(AuthGuard, PermissionsGuard)
@Controller("rbac")
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get("roles")
  @RequirePermissions("rbac:role:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(RoleDto) }
            }
          }
        }
      ]
    }
  })
  async listRoles(@Req() req: Request, @Query() query: Record<string, string>) {
    const ctx = getRequestContext(req);
    const listQuery = parseListQuery(query);
    return this.rbacService.listRoles(ctx, listQuery);
  }

  @Post("roles")
  @RequirePermissions("rbac:role:write")
  @ApiBody({ type: CreateRoleDto })
  @ApiCreatedResponse({ type: RoleDto })
  async createRole(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateRoleInputSchema.parse(body);
    return this.rbacService.createRole(ctx, input);
  }

  @Get("roles/:id")
  @RequirePermissions("rbac:role:read")
  @ApiOkResponse({ type: RoleDto })
  async getRole(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.rbacService.getRole(ctx, id);
  }

  @Patch("roles/:id")
  @RequirePermissions("rbac:role:write")
  @ApiBody({ type: UpdateRoleDto })
  @ApiOkResponse({ type: RoleDto })
  async updateRole(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const ctx = getRequestContext(req);
    const input = UpdateRoleInputSchema.parse(body);
    return this.rbacService.updateRole(ctx, id, input);
  }

  @Get("permissions")
  @RequirePermissions("rbac:permission:read")
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(PermissionDto) }
            }
          }
        }
      ]
    }
  })
  async listPermissions(@Query() query: Record<string, string>) {
    const listQuery = parseListQuery(query);
    return this.rbacService.listPermissions(listQuery);
  }

  @Post("permissions")
  @RequirePermissions("rbac:permission:write")
  @ApiBody({ type: CreatePermissionDto })
  @ApiCreatedResponse({ type: PermissionDto })
  async createPermission(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreatePermissionInputSchema.parse(body);
    return this.rbacService.createPermission(ctx, input);
  }

  @Get("permissions/:id")
  @RequirePermissions("rbac:permission:read")
  @ApiOkResponse({ type: PermissionDto })
  async getPermission(@Param("id") id: string) {
    return this.rbacService.getPermission(id);
  }

  @Patch("permissions/:id")
  @RequirePermissions("rbac:permission:write")
  @ApiBody({ type: UpdatePermissionDto })
  @ApiOkResponse({ type: PermissionDto })
  async updatePermission(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdatePermissionInputSchema.parse(body);
    return this.rbacService.updatePermission(ctx, id, input);
  }

  @Get("roles/:id/permissions")
  @RequirePermissions("rbac:role:read")
  @ApiOkResponse({ type: RolePermissionDto, isArray: true })
  async listRolePermissions(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.rbacService.listRolePermissions(ctx, id);
  }

  @Post("roles/:id/permissions")
  @RequirePermissions("rbac:role:write")
  @ApiBody({ type: AssignPermissionDto })
  @ApiOkResponse({ type: RolePermissionDto })
  async addRolePermission(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const ctx = getRequestContext(req);
    const input = AssignPermissionInputSchema.parse(body);
    return this.rbacService.addRolePermission(ctx, id, input.permissionId);
  }

  @Delete("roles/:id/permissions/:permissionId")
  @RequirePermissions("rbac:role:write")
  async removeRolePermission(
    @Req() req: Request,
    @Param("id") id: string,
    @Param("permissionId") permissionId: string
  ) {
    const ctx = getRequestContext(req);
    return this.rbacService.removeRolePermission(ctx, id, permissionId);
  }

  @Get("health")
  @Public()
  health() {
    return this.rbacService.health();
  }
}
