import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import {
  AssignRoleInputSchema,
  CreateUserInputSchema,
  UpdateUserInputSchema
} from "@crm/shared";
import { getRequestContext } from "../../common/request-context";
import { Public } from "../../common/decorators/public.decorator";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { UsersService } from "./users.service";

@UseGuards(AuthGuard, PermissionsGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("health")
  @Public()
  health() {
    return this.usersService.health();
  }

  @Get()
  @RequirePermissions("user:read")
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.usersService.list(ctx);
  }

  @Post()
  @RequirePermissions("user:write")
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateUserInputSchema.parse(body);
    return this.usersService.create(ctx, input);
  }

  @Get(":id")
  @RequirePermissions("user:read")
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.usersService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("user:write")
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateUserInputSchema.parse(body);
    return this.usersService.update(ctx, id, input);
  }

  @Get(":id/roles")
  @RequirePermissions("user:read")
  async listRoles(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.usersService.listRoles(ctx, id);
  }

  @Post(":id/roles")
  @RequirePermissions("user:role:write")
  async assignRole(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = AssignRoleInputSchema.parse(body);
    return this.usersService.assignRole(ctx, id, input.roleId);
  }

  @Delete(":id/roles/:roleId")
  @RequirePermissions("user:role:write")
  async removeRole(
    @Req() req: Request,
    @Param("id") id: string,
    @Param("roleId") roleId: string
  ) {
    const ctx = getRequestContext(req);
    return this.usersService.removeRole(ctx, id, roleId);
  }
}
