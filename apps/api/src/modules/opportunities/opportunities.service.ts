import { Injectable } from "@nestjs/common";
import type { CreateOpportunityInput, UpdateOpportunityInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSerialId, parseSort } from "../../common/list-query";
import { assertTransition } from "../../common/status-transitions";
import { I18nService } from "../../common/i18n/i18n.service";
import { badRequest, notFound } from "../../common/i18n/i18n-error";

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService,
    private readonly i18n: I18nService
  ) {}

  async create(ctx: RequestContext, input: CreateOpportunityInput) {
    if (!input.accountId) {
      throw badRequest(
        this.i18n,
        ctx.locale,
        "OPPORTUNITY_MISSING_ACCOUNT",
        "opportunity.missing_account"
      );
    }
    // 创建时写入阶段变更时间，后续用于停滞预警
    const opportunity = await this.prisma.opportunity.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: input.status ?? undefined,
        name: input.name,
        stage: input.stage ?? "Qualification",
        amount: input.amount,
        currency: input.currency,
        expectedCloseDate: input.expectedCloseDate
          ? new Date(input.expectedCloseDate)
          : undefined,
        probability: input.probability,
        accountId: input.accountId,
        contactId: input.contactId ?? undefined,
        leadId: input.leadId ?? undefined,
        reasonLost: input.reasonLost,
        lastStageChangedAt: new Date()
      }
    });
    await this.audit.log(
      ctx,
      "create",
      "Opportunity",
      opportunity.id,
      `Created ${opportunity.name}`
    );
    await this.outbox.enqueue(ctx, "Opportunity", opportunity.id, "opportunity.created", {
      name: opportunity.name
    });
    return opportunity;
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "name", "stage"]);
    const serialId = parseSerialId(query.q);
    const qFilters: Record<string, unknown>[] = [];
    if (query.q) {
      // 支持名称模糊搜索
      qFilters.push({ name: { contains: query.q, mode: "insensitive" as const } });
    }
    if (serialId !== undefined) {
      // 支持按编号精确搜索
      qFilters.push({ serialId });
    }
    const andFilters: Record<string, unknown>[] = [];
    if (query.staleDays) {
      // 停滞筛选：阶段在阈值天数内没有变化
      const cutoff = new Date(Date.now() - query.staleDays * 24 * 60 * 60 * 1000);
      andFilters.push({
        status: { notIn: ["WON", "LOST"] },
        lastStageChangedAt: { lt: cutoff }
      });
    }
    const where = {
      tenantId: ctx.tenantId,
      ...scopeFilter,
      status: query.status,
      ownerId: query.ownerId,
      orgUnitId: query.orgUnitId,
      ...(qFilters.length ? { OR: qFilters } : {}),
      ...(andFilters.length ? { AND: andFilters } : {})
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.opportunity.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.opportunity.count({ where })
    ]);
    const enrichedData = await this.withOwners(ctx, data);
    return {
      data: enrichedData,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async get(ctx: RequestContext, id: string) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const opportunity = await this.prisma.opportunity.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!opportunity) {
      throw notFound(
        this.i18n,
        ctx.locale,
        "OPPORTUNITY_NOT_FOUND",
        "opportunity.not_found"
      );
    }
    return this.withOwner(ctx, opportunity);
  }

  async update(ctx: RequestContext, id: string, input: UpdateOpportunityInput) {
    const existing = await this.get(ctx, id);
    if (input.status) {
      // 状态变更需通过状态机校验，并补齐必要字段
      assertTransition("Opportunity", existing.status, input.status, ({ entity, from, to }) =>
        badRequest(
          this.i18n,
          ctx.locale,
          "OPPORTUNITY_STATUS_TRANSITION_INVALID",
          "opportunity.status.transition_invalid",
          { entity, from, to }
        )
      );
      if (input.status === "WON") {
        // 赢单必须有金额和预计成交时间
        const amount = input.amount ?? existing.amount;
        const closeDate = input.expectedCloseDate ?? existing.expectedCloseDate?.toISOString();
        if (amount === undefined || amount === null) {
          throw badRequest(
            this.i18n,
            ctx.locale,
            "OPPORTUNITY_WON_MISSING_AMOUNT",
            "opportunity.won.missing_amount"
          );
        }
        if (!closeDate) {
          throw badRequest(
            this.i18n,
            ctx.locale,
            "OPPORTUNITY_WON_MISSING_EXPECTED_CLOSE_DATE",
            "opportunity.won.missing_expected_close_date"
          );
        }
      }
      if (input.status === "LOST") {
        // 输单必须填写原因
        const reasonLost = input.reasonLost ?? existing.reasonLost;
        if (!reasonLost) {
          throw badRequest(
            this.i18n,
            ctx.locale,
            "OPPORTUNITY_LOST_MISSING_REASON",
            "opportunity.lost.missing_reason"
          );
        }
      }
    }
    const opportunity = await this.prisma.opportunity.update({
      where: { id },
      data: {
        name: input.name,
        stage: input.stage,
        amount: input.amount,
        currency: input.currency,
        expectedCloseDate: input.expectedCloseDate
          ? new Date(input.expectedCloseDate)
          : undefined,
        probability: input.probability,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined,
        leadId: input.leadId ?? undefined,
        reasonLost: input.reasonLost ?? undefined,
        status: input.status,
        // 仅当阶段变化时更新，用于停滞预警判断
        lastStageChangedAt:
          input.stage && input.stage !== existing.stage ? new Date() : undefined
      }
    });
    await this.audit.log(
      ctx,
      "update",
      "Opportunity",
      opportunity.id,
      `Updated ${opportunity.name}`
    );
    await this.outbox.enqueue(ctx, "Opportunity", opportunity.id, "opportunity.updated", {
      name: opportunity.name
    });
    return opportunity;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const opportunity = await this.prisma.opportunity.delete({ where: { id } });
    await this.audit.log(
      ctx,
      "delete",
      "Opportunity",
      opportunity.id,
      `Deleted ${opportunity.name}`
    );
    await this.outbox.enqueue(ctx, "Opportunity", opportunity.id, "opportunity.deleted", {
      name: opportunity.name
    });
    return opportunity;
  }

  private async withOwner(ctx: RequestContext, opportunity: any) {
    const [row] = await this.withOwners(ctx, [opportunity]);
    return row;
  }

  private async withOwners(ctx: RequestContext, opportunities: any[]) {
    if (!opportunities.length) {
      return opportunities;
    }
    const ownerIds = Array.from(
      new Set(
        opportunities
          .map((item) => item.ownerId)
          .filter((ownerId): ownerId is string => typeof ownerId === "string" && ownerId.length > 0)
      )
    );
    if (!ownerIds.length) {
      return opportunities.map((item) => ({ ...item, owner: null }));
    }
    const owners = await this.prisma.user.findMany({
      where: {
        tenantId: ctx.tenantId,
        id: { in: ownerIds }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    const ownerMap = new Map(owners.map((owner) => [owner.id, owner]));
    return opportunities.map((item) => ({
      ...item,
      owner: item.ownerId ? ownerMap.get(item.ownerId) ?? null : null
    }));
  }
}
