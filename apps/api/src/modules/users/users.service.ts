import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateUserInput, UpdateUserInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { hashPassword } from "../../common/security/password";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  health() {
    return { status: "ok", module: "users" };
  }

  async list(ctx: RequestContext) {
    return this.prisma.user.findMany({
      where: { tenantId: ctx.tenantId }
    });
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
    return this.prisma.user.create({
      data: {
        tenantId: ctx.tenantId,
        email: input.email,
        name: input.name,
        passwordHash: hashPassword(input.password),
        status: input.status ?? "ACTIVE"
      }
    });
  }

  async update(ctx: RequestContext, id: string, input: UpdateUserInput) {
    await this.get(ctx, id);
    return this.prisma.user.update({
      where: { id },
      data: {
        email: input.email,
        name: input.name,
        status: input.status,
        passwordHash: input.password ? hashPassword(input.password) : undefined
      }
    });
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
    return this.prisma.userRole.upsert({
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
  }

  async removeRole(ctx: RequestContext, userId: string, roleId: string) {
    await this.get(ctx, userId);
    return this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });
  }
}
