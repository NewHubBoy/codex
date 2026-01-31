import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags
} from "@nestjs/swagger";
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
import {
  AssignRoleDto,
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  UserRoleDto
} from "./dto/users.swagger";

@ApiTags("users")
@ApiBearerAuth()
@ApiSecurity("tenant")
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
  @ApiOkResponse({ type: UserDto, isArray: true })
  async list(@Req() req: Request) {
    const ctx = getRequestContext(req);
    return this.usersService.list(ctx);
  }

  @Post()
  @RequirePermissions("user:write")
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ type: UserDto })
  async create(@Req() req: Request, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = CreateUserInputSchema.parse(body);
    return this.usersService.create(ctx, input);
  }

  @Get(":id")
  @RequirePermissions("user:read")
  @ApiOkResponse({ type: UserDto })
  async get(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.usersService.get(ctx, id);
  }

  @Patch(":id")
  @RequirePermissions("user:write")
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserDto })
  async update(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = UpdateUserInputSchema.parse(body);
    return this.usersService.update(ctx, id, input);
  }

  @Get(":id/roles")
  @RequirePermissions("user:read")
  @ApiOkResponse({ type: UserRoleDto, isArray: true })
  async listRoles(@Req() req: Request, @Param("id") id: string) {
    const ctx = getRequestContext(req);
    return this.usersService.listRoles(ctx, id);
  }

  @Post(":id/roles")
  @RequirePermissions("user:role:write")
  @ApiBody({ type: AssignRoleDto })
  @ApiOkResponse({ type: UserRoleDto })
  async assignRole(@Req() req: Request, @Param("id") id: string, @Body() body: unknown) {
    const ctx = getRequestContext(req);
    const input = AssignRoleInputSchema.parse(body);
    return this.usersService.assignRole(ctx, id, input.roleId);
  }

  @Delete(":id/roles/:roleId")
  @RequirePermissions("user:role:write")
  @ApiOkResponse({ schema: { example: { userId: "...", roleId: "..." } } })
  async removeRole(
    @Req() req: Request,
    @Param("id") id: string,
    @Param("roleId") roleId: string
  ) {
    const ctx = getRequestContext(req);
    return this.usersService.removeRole(ctx, id, roleId);
  }
}
