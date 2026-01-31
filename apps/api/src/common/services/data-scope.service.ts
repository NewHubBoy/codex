import { Injectable } from "@nestjs/common";
import type { RequestContext } from "../request-context";
import { PrismaService } from "../../prisma/prisma.service";

type DataScope = "SELF" | "TEAM" | "SUBTREE" | "ALL";

const scopeOrder: Record<DataScope, number> = {
  SELF: 1,
  TEAM: 2,
  SUBTREE: 3,
  ALL: 4
};

@Injectable()
export class DataScopeService {
  constructor(private readonly prisma: PrismaService) {}

  async buildOrgScopeFilter(ctx: RequestContext) {
    if (!ctx.userId) {
      return {};
    }
    const scope = await this.getEffectiveScope(ctx);
    if (scope === "ALL") {
      return {};
    }
    if (scope === "SELF") {
      return { ownerId: ctx.userId };
    }
    const orgUnitIds = await this.getOrgUnitIds(ctx, scope);
    return { orgUnitId: { in: orgUnitIds } };
  }

  private async getEffectiveScope(ctx: RequestContext): Promise<DataScope> {
    const roles = await this.prisma.userRole.findMany({
      where: {
        userId: ctx.userId!,
        role: { tenantId: ctx.tenantId }
      },
      include: { role: true }
    });
    if (roles.length === 0) {
      return "SELF";
    }
    let effective: DataScope = "SELF";
    for (const { role } of roles) {
      const scope = role.dataScope as DataScope;
      if (scopeOrder[scope] > scopeOrder[effective]) {
        effective = scope;
      }
    }
    return effective;
  }

  private async getOrgUnitIds(ctx: RequestContext, scope: DataScope) {
    const memberships = await this.prisma.userOrgMembership.findMany({
      where: { userId: ctx.userId! },
      include: { orgUnit: true }
    });
    const baseUnits = memberships
      .map((membership) => membership.orgUnit)
      .filter((orgUnit) => orgUnit && orgUnit.tenantId === ctx.tenantId);
    if (scope === "TEAM") {
      return baseUnits.map((unit) => unit.id);
    }
    const paths = baseUnits.map((unit) => unit.path).filter(Boolean);
    if (paths.length === 0) {
      return baseUnits.map((unit) => unit.id);
    }
    const subUnits = await this.prisma.orgUnit.findMany({
      where: {
        tenantId: ctx.tenantId,
        OR: paths.map((path) => ({ path: { startsWith: path! } }))
      },
      select: { id: true }
    });
    return subUnits.map((unit) => unit.id);
  }
}
