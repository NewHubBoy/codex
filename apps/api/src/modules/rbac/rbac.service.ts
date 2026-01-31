import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreatePermissionInput,
  CreateRoleInput,
  UpdatePermissionInput,
  UpdateRoleInput
} from "@crm/shared";
import type { RequestContext } from "../../common/request-context";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  health() {
    return { status: "ok", module: "rbac" };
  }

  async listRoles(ctx: RequestContext) {
    return this.prisma.role.findMany({
      where: { tenantId: ctx.tenantId }
    });
  }

  async getRole(ctx: RequestContext, id: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId: ctx.tenantId }
    });
    if (!role) {
      throw new NotFoundException("Role not found");
    }
    return role;
  }

  async createRole(ctx: RequestContext, input: CreateRoleInput) {
    return this.prisma.role.create({
      data: {
        tenantId: ctx.tenantId,
        code: input.code,
        name: input.name,
        dataScope: input.dataScope ?? "SELF",
        status: input.status ?? "ACTIVE"
      }
    });
  }

  async updateRole(ctx: RequestContext, id: string, input: UpdateRoleInput) {
    await this.getRole(ctx, id);
    return this.prisma.role.update({
      where: { id },
      data: {
        code: input.code,
        name: input.name,
        dataScope: input.dataScope,
        status: input.status
      }
    });
  }

  async listPermissions() {
    return this.prisma.permission.findMany();
  }

  async getPermission(id: string) {
    const permission = await this.prisma.permission.findFirst({
      where: { id }
    });
    if (!permission) {
      throw new NotFoundException("Permission not found");
    }
    return permission;
  }

  async createPermission(input: CreatePermissionInput) {
    return this.prisma.permission.create({
      data: {
        code: input.code,
        name: input.name,
        type: input.type ?? "ACTION",
        description: input.description
      }
    });
  }

  async updatePermission(id: string, input: UpdatePermissionInput) {
    await this.getPermission(id);
    return this.prisma.permission.update({
      where: { id },
      data: {
        code: input.code,
        name: input.name,
        type: input.type,
        description: input.description
      }
    });
  }

  async listRolePermissions(ctx: RequestContext, roleId: string) {
    await this.getRole(ctx, roleId);
    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true }
    });
  }

  async addRolePermission(ctx: RequestContext, roleId: string, permissionId: string) {
    await this.getRole(ctx, roleId);
    await this.getPermission(permissionId);
    return this.prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId
        }
      },
      update: {},
      create: {
        roleId,
        permissionId
      }
    });
  }

  async removeRolePermission(ctx: RequestContext, roleId: string, permissionId: string) {
    await this.getRole(ctx, roleId);
    return this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId
        }
      }
    });
  }
}
