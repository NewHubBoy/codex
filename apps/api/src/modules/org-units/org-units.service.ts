import { Injectable, NotFoundException } from "@nestjs/common";
import type { AddOrgMemberInput, CreateOrgUnitInput, UpdateOrgUnitInput } from "@crm/shared";
import type { RequestContext } from "../../common/request-context";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class OrgUnitsService {
  constructor(private readonly prisma: PrismaService) {}

  health() {
    return { status: "ok", module: "org-units" };
  }

  async list(ctx: RequestContext) {
    return this.prisma.orgUnit.findMany({
      where: { tenantId: ctx.tenantId }
    });
  }

  async get(ctx: RequestContext, id: string) {
    const orgUnit = await this.prisma.orgUnit.findFirst({
      where: { id, tenantId: ctx.tenantId }
    });
    if (!orgUnit) {
      throw new NotFoundException("Org unit not found");
    }
    return orgUnit;
  }

  async create(ctx: RequestContext, input: CreateOrgUnitInput) {
    return this.prisma.orgUnit.create({
      data: {
        tenantId: ctx.tenantId,
        parentId: input.parentId ?? undefined,
        name: input.name,
        code: input.code,
        type: input.type,
        path: input.path,
        status: input.status ?? "ACTIVE"
      }
    });
  }

  async update(ctx: RequestContext, id: string, input: UpdateOrgUnitInput) {
    await this.get(ctx, id);
    return this.prisma.orgUnit.update({
      where: { id },
      data: {
        parentId: input.parentId ?? undefined,
        name: input.name,
        code: input.code,
        type: input.type,
        path: input.path,
        status: input.status
      }
    });
  }

  async listMembers(ctx: RequestContext, orgUnitId: string) {
    await this.get(ctx, orgUnitId);
    return this.prisma.userOrgMembership.findMany({
      where: {
        orgUnitId,
        user: { tenantId: ctx.tenantId }
      },
      include: { user: true }
    });
  }

  async addMember(ctx: RequestContext, orgUnitId: string, input: AddOrgMemberInput) {
    await this.get(ctx, orgUnitId);
    const user = await this.prisma.user.findFirst({
      where: { id: input.userId, tenantId: ctx.tenantId }
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.prisma.userOrgMembership.upsert({
      where: {
        userId_orgUnitId: {
          userId: input.userId,
          orgUnitId
        }
      },
      update: {
        roleInOrg: input.roleInOrg
      },
      create: {
        userId: input.userId,
        orgUnitId,
        roleInOrg: input.roleInOrg
      }
    });
  }

  async removeMember(ctx: RequestContext, orgUnitId: string, userId: string) {
    await this.get(ctx, orgUnitId);
    return this.prisma.userOrgMembership.delete({
      where: {
        userId_orgUnitId: {
          userId,
          orgUnitId
        }
      }
    });
  }
}
