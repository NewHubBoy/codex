import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateUserInput, UpdateUserInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { hashPassword } from "../../common/security/password";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSort } from "../../common/list-query";
import type { UserStatus } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  health() {
    return { status: "ok", module: "users" };
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "email", "name"]);
    const status =
      query.status && ["ACTIVE", "INACTIVE", "INVITED"].includes(query.status)
        ? (query.status as UserStatus)
        : undefined;
    const where = {
      tenantId: ctx.tenantId,
      status,
      ...(query.q
        ? {
            OR: [
              { email: { contains: query.q, mode: "insensitive" as const } },
              { name: { contains: query.q, mode: "insensitive" as const } }
            ]
          }
        : {})
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.user.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async get(ctx: RequestContext, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId: ctx.tenantId }
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async create(ctx: RequestContext, input: CreateUserInput) {
    const user = await this.prisma.user.create({
      data: {
        tenantId: ctx.tenantId,
        email: input.email,
        name: input.name,
        passwordHash: hashPassword(input.password),
        status: input.status ?? "ACTIVE"
      }
    });
    await this.audit.log(ctx, "create", "User", user.id, `Created ${user.email}`);
    await this.outbox.enqueue(ctx, "User", user.id, "user.created", { email: user.email });
    return user;
  }

  async update(ctx: RequestContext, id: string, input: UpdateUserInput) {
    await this.get(ctx, id);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: input.email,
        name: input.name,
        status: input.status,
        passwordHash: input.password ? hashPassword(input.password) : undefined
      }
    });
    await this.audit.log(ctx, "update", "User", user.id, `Updated ${user.email}`);
    await this.outbox.enqueue(ctx, "User", user.id, "user.updated", { email: user.email });
    return user;
  }

  async listRoles(ctx: RequestContext, userId: string) {
    await this.get(ctx, userId);
    return this.prisma.userRole.findMany({
      where: {
        userId,
        role: { tenantId: ctx.tenantId }
      },
      include: { role: true }
    });
  }

  async assignRole(ctx: RequestContext, userId: string, roleId: string) {
    await this.get(ctx, userId);
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId: ctx.tenantId }
    });
    if (!role) {
      throw new NotFoundException("Role not found");
    }
    const assignment = await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      },
      update: {},
      create: {
        userId,
        roleId
      }
    });
    await this.audit.log(ctx, "update", "UserRole", `${userId}:${roleId}`, "Assigned role");
    await this.outbox.enqueue(ctx, "User", userId, "user.role.assigned", { roleId });
    return assignment;
  }

  async removeRole(ctx: RequestContext, userId: string, roleId: string) {
    await this.get(ctx, userId);
    const removal = await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });
    await this.audit.log(ctx, "delete", "UserRole", `${userId}:${roleId}`, "Removed role");
    await this.outbox.enqueue(ctx, "User", userId, "user.role.removed", { roleId });
    return removal;
  }
}
