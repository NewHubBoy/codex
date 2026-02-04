import { Injectable } from "@nestjs/common";
import type { RequestContext } from "../../common/request-context";
import { PrismaService } from "../../prisma/prisma.service";
import { DataScopeService } from "../../common/services/data-scope.service";

export interface AlertSummary {
  leadFirstFollowUpOverdue: number;
  leadNextFollowUpOverdue: number;
  leadInactive: number;
  opportunityStale: number;
  inactiveDays: number;
  staleDays: number;
}

export interface AlertSettingResult {
  inactiveDays: number;
  staleDays: number;
  scopeType: "USER" | "ORG_UNIT" | "TENANT" | "DEFAULT";
  scopeId?: string;
}

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService
  ) {}

  private resolveScopeId(ctx: RequestContext, scopeType: "USER" | "ORG_UNIT" | "TENANT") {
    if (scopeType === "USER") {
      return ctx.userId ?? null;
    }
    if (scopeType === "ORG_UNIT") {
      return ctx.orgUnitId ?? null;
    }
    return ctx.tenantId;
  }

  async getEffectiveSettings(ctx: RequestContext): Promise<AlertSettingResult> {
    const userId = this.resolveScopeId(ctx, "USER");
    if (userId) {
      const userSetting = await this.prisma.alertSetting.findUnique({
        where: {
          tenantId_scopeType_scopeId: {
            tenantId: ctx.tenantId,
            scopeType: "USER",
            scopeId: userId
          }
        }
      });
      if (userSetting) {
        return {
          inactiveDays: userSetting.inactiveDays,
          staleDays: userSetting.staleDays,
          scopeType: "USER",
          scopeId: userId
        };
      }
    }

    const orgUnitId = this.resolveScopeId(ctx, "ORG_UNIT");
    if (orgUnitId) {
      const orgSetting = await this.prisma.alertSetting.findUnique({
        where: {
          tenantId_scopeType_scopeId: {
            tenantId: ctx.tenantId,
            scopeType: "ORG_UNIT",
            scopeId: orgUnitId
          }
        }
      });
      if (orgSetting) {
        return {
          inactiveDays: orgSetting.inactiveDays,
          staleDays: orgSetting.staleDays,
          scopeType: "ORG_UNIT",
          scopeId: orgUnitId
        };
      }
    }

    const tenantSetting = await this.prisma.alertSetting.findUnique({
      where: {
        tenantId_scopeType_scopeId: {
          tenantId: ctx.tenantId,
          scopeType: "TENANT",
          scopeId: ctx.tenantId
        }
      }
    });
    if (tenantSetting) {
      return {
        inactiveDays: tenantSetting.inactiveDays,
        staleDays: tenantSetting.staleDays,
        scopeType: "TENANT",
        scopeId: ctx.tenantId
      };
    }

    return {
      inactiveDays: 7,
      staleDays: 7,
      scopeType: "DEFAULT"
    };
  }

  async upsertSetting(
    ctx: RequestContext,
    input: { scopeType: "USER" | "ORG_UNIT" | "TENANT"; inactiveDays?: number; staleDays?: number }
  ) {
    const scopeId = this.resolveScopeId(ctx, input.scopeType);
    if (!scopeId) {
      return null;
    }
    const existing = await this.prisma.alertSetting.findUnique({
      where: {
        tenantId_scopeType_scopeId: {
          tenantId: ctx.tenantId,
          scopeType: input.scopeType,
          scopeId
        }
      }
    });
    const inactiveDays = input.inactiveDays ?? existing?.inactiveDays ?? 7;
    const staleDays = input.staleDays ?? existing?.staleDays ?? 7;
    return this.prisma.alertSetting.upsert({
      where: {
        tenantId_scopeType_scopeId: {
          tenantId: ctx.tenantId,
          scopeType: input.scopeType,
          scopeId
        }
      },
      update: {
        inactiveDays,
        staleDays
      },
      create: {
        tenantId: ctx.tenantId,
        scopeType: input.scopeType,
        scopeId,
        inactiveDays,
        staleDays
      }
    });
  }

  async getSummary(
    ctx: RequestContext,
    options: { inactiveDays?: number; staleDays?: number }
  ): Promise<AlertSummary> {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const now = new Date();
    const settings = await this.getEffectiveSettings(ctx);
    const inactiveDays =
      options.inactiveDays && options.inactiveDays > 0
        ? options.inactiveDays
        : settings.inactiveDays;
    const staleDays =
      options.staleDays && options.staleDays > 0 ? options.staleDays : settings.staleDays;
    const inactiveCutoff = new Date(now.getTime() - inactiveDays * 24 * 60 * 60 * 1000);
    const staleCutoff = new Date(now.getTime() - staleDays * 24 * 60 * 60 * 1000);
    const leadBaseWhere = {
      tenantId: ctx.tenantId,
      ...scopeFilter,
      status: { notIn: ["CONVERTED", "DISQUALIFIED", "DRAFT"] }
    };

    const [leadFirstFollowUpOverdue, leadNextFollowUpOverdue, leadInactive, opportunityStale] =
      await this.prisma.$transaction([
        this.prisma.lead.count({
          where: {
            ...leadBaseWhere,
            firstFollowUpDueAt: { lt: now },
            lastActivityAt: null
          }
        }),
        this.prisma.lead.count({
          where: {
            ...leadBaseWhere,
            nextFollowUpAt: { lt: now }
          }
        }),
        this.prisma.lead.count({
          where: {
            ...leadBaseWhere,
            OR: [
              { lastActivityAt: { lt: inactiveCutoff } },
              { lastActivityAt: null, createdAt: { lt: inactiveCutoff } }
            ]
          }
        }),
        this.prisma.opportunity.count({
          where: {
            tenantId: ctx.tenantId,
            ...scopeFilter,
            status: { notIn: ["WON", "LOST"] },
            lastStageChangedAt: { lt: staleCutoff }
          }
        })
      ]);

    return {
      leadFirstFollowUpOverdue,
      leadNextFollowUpOverdue,
      leadInactive,
      opportunityStale,
      inactiveDays,
      staleDays
    };
  }
}
