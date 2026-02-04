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

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService
  ) {}

  async getSummary(
    ctx: RequestContext,
    options: { inactiveDays?: number; staleDays?: number }
  ): Promise<AlertSummary> {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const now = new Date();
    const inactiveDays = options.inactiveDays && options.inactiveDays > 0 ? options.inactiveDays : 7;
    const staleDays = options.staleDays && options.staleDays > 0 ? options.staleDays : 7;
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
