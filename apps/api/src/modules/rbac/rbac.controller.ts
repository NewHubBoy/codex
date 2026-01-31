import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";
import type { Request } from "express";
import {
  AssignPermissionInputSchema,
  CreatePermissionInputSchema,
  CreateRoleInputSchema,
  UpdatePermissionInputSchema,
  UpdateRoleInputSchema
} from "@crm/shared";
import { getRequestContext } from "../../common/request-context";
import { Public } from "../../common/decorators/public.decorator";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RbacService } from "./rbac.service";

@UseGuards(AuthGuard, PermissionsGuard)
@Controller("rbac")
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get("roles")
  @RequirePermissions("rbac:role:read")
  async listRoles(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.rbacService.listRoles(ctx);
  }

  @Post("roles")
  @RequirePermissions("rbac:role:write")
  async createRole(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateRoleInputSchema.parse(body);
    return this.rbacService.createRole(ctx, input);
  }

  @Get("roles/:id")
  @RequirePermissions("rbac:role:read")
  async getRole(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.rbacService.getRole(ctx, id);
  }

  @Patch("roles/:id")
  @RequirePermissions("rbac:role:write")
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
  async listPermissions() {
    return this.rbacService.listPermissions();
  }

  @Post("permissions")
  @RequirePermissions("rbac:permission:write")
  async createPermission(@Body() body: unknown) {
    const input = CreatePermissionInputSchema.parse(body);
    return this.rbacService.createPermission(input);
  }

  @Get("permissions/:id")
  @RequirePermissions("rbac:permission:read")
  async getPermission(@Param("id") id: string) {
    return this.rbacService.getPermission(id);
  }

  @Patch("permissions/:id")
  @RequirePermissions("rbac:permission:write")
  async updatePermission(@Param("id") id: string, @Body() body: unknown) {
    const input = UpdatePermissionInputSchema.parse(body);
    return this.rbacService.updatePermission(id, input);
  }

  @Get("roles/:id/permissions")
  @RequirePermissions("rbac:role:read")
  async listRolePermissions(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.rbacService.listRolePermissions(ctx, id);
  }

  @Post("roles/:id/permissions")
  @RequirePermissions("rbac:role:write")
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
