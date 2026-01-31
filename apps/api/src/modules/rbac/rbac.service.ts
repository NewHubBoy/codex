import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreatePermissionInput,
  CreateRoleInput,
  UpdatePermissionInput,
  UpdateRoleInput
} from "@crm/shared";
import type { RequestContext } from "../../common/request-context";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSort } from "../../common/list-query";
import type { RoleStatus } from "@prisma/client";

@Injectable()
export class RbacService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  health() {
    return { status: "ok", module: "rbac" };
  }

  async listRoles(ctx: RequestContext, query: ListQuery) {
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "code", "name"]);
    const status = query.status && ["ACTIVE", "INACTIVE"].includes(query.status)
      ? (query.status as RoleStatus)
      : undefined;
    const where = {
      tenantId: ctx.tenantId,
      status,
      ...(query.q
        ? {
            OR: [
              { code: { contains: query.q, mode: "insensitive" as const } },
              { name: { contains: query.q, mode: "insensitive" as const } }
            ]
          }
        : {})
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.role.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
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
    const role = await this.prisma.role.create({
      data: {
        tenantId: ctx.tenantId,
        code: input.code,
        name: input.name,
        dataScope: input.dataScope ?? "SELF",
        status: input.status ?? "ACTIVE"
      }
    });
    await this.audit.log(ctx, "create", "Role", role.id, `Created ${role.code}`);
    await this.outbox.enqueue(ctx, "Role", role.id, "role.created", { code: role.code });
    return role;
  }

  async updateRole(ctx: RequestContext, id: string, input: UpdateRoleInput) {
    await this.getRole(ctx, id);
    const role = await this.prisma.role.update({
      where: { id },
      data: {
        code: input.code,
        name: input.name,
        dataScope: input.dataScope,
        status: input.status
      }
    });
    await this.audit.log(ctx, "update", "Role", role.id, `Updated ${role.code}`);
    await this.outbox.enqueue(ctx, "Role", role.id, "role.updated", { code: role.code });
    return role;
  }

  async listPermissions(query: ListQuery) {
    const orderBy = parseSort(query.sort, ["code", "name", "type"], "code");
    const where = query.q
      ? {
          OR: [
            { code: { contains: query.q, mode: "insensitive" as const } },
            { name: { contains: query.q, mode: "insensitive" as const } }
          ]
        }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.permission.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.permission.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
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

  async createPermission(ctx: RequestContext, input: CreatePermissionInput) {
    const permission = await this.prisma.permission.create({
      data: {
        code: input.code,
        name: input.name,
        type: input.type ?? "ACTION",
        description: input.description
      }
    });
    await this.audit.log(ctx, "create", "Permission", permission.id, `Created ${permission.code}`);
    await this.outbox.enqueue(ctx, "Permission", permission.id, "permission.created", {
      code: permission.code
    });
    return permission;
  }

  async updatePermission(ctx: RequestContext, id: string, input: UpdatePermissionInput) {
    await this.getPermission(id);
    const permission = await this.prisma.permission.update({
      where: { id },
      data: {
        code: input.code,
        name: input.name,
        type: input.type,
        description: input.description
      }
    });
    await this.audit.log(ctx, "update", "Permission", permission.id, `Updated ${permission.code}`);
    await this.outbox.enqueue(ctx, "Permission", permission.id, "permission.updated", {
      code: permission.code
    });
    return permission;
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
    const assignment = await this.prisma.rolePermission.upsert({
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
    await this.audit.log(ctx, "update", "RolePermission", `${roleId}:${permissionId}`, "Assigned");
    await this.outbox.enqueue(ctx, "Role", roleId, "role.permission.assigned", {
      permissionId
    });
    return assignment;
  }

  async removeRolePermission(ctx: RequestContext, roleId: string, permissionId: string) {
    await this.getRole(ctx, roleId);
    const removal = await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId
        }
      }
    });
    await this.audit.log(ctx, "delete", "RolePermission", `${roleId}:${permissionId}`, "Removed");
    await this.outbox.enqueue(ctx, "Role", roleId, "role.permission.removed", {
      permissionId
    });
    return removal;
  }
}
