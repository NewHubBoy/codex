import { Injectable } from "@nestjs/common";
import type { CreateActivityInput, UpdateActivityInput } from "@crm/shared";
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
export class ActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService,
    private readonly i18n: I18nService
  ) {}

  async create(ctx: RequestContext, input: CreateActivityInput) {
    this.assertLeadActivityRequired(ctx, input);
    const activity = await this.prisma.activity.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: input.status ?? undefined,
        type: input.type,
        subject: input.subject,
        content: input.content,
        relatedType: input.relatedType,
        relatedId: input.relatedId,
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
        completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
        outcome: input.outcome,
        nextFollowUpAt: input.nextFollowUpAt
          ? new Date(input.nextFollowUpAt)
          : undefined
      }
    });
    if (activity.relatedType === "Lead" && activity.relatedId) {
      // 线索相关的活动会回写最近跟进时间与下次跟进时间
      await this.prisma.lead.update({
        where: { id: activity.relatedId },
        data: {
          lastActivityAt: activity.completedAt ?? activity.createdAt,
          nextFollowUpAt: activity.nextFollowUpAt ?? undefined
        }
      });
    }
    await this.audit.log(
      ctx,
      "create",
      "Activity",
      activity.id,
      `Created ${activity.subject ?? "activity"}`
    );
    await this.outbox.enqueue(ctx, "Activity", activity.id, "activity.created", {
      subject: activity.subject
    });
    return activity;
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "dueAt", "completedAt"]);
    const serialId = parseSerialId(query.q);
    const qFilters: Record<string, unknown>[] = [];
    if (query.q) {
      // 支持主题/类型模糊搜索
      qFilters.push(
        { subject: { contains: query.q, mode: "insensitive" as const } },
        { type: { contains: query.q, mode: "insensitive" as const } }
      );
    }
    if (serialId !== undefined) {
      // 支持按编号精确搜索
      qFilters.push({ serialId });
    }
    const where = {
      tenantId: ctx.tenantId,
      ...scopeFilter,
      status: query.status,
      ownerId: query.ownerId,
      orgUnitId: query.orgUnitId,
      relatedType: query.relatedType,
      relatedId: query.relatedId,
      ...(qFilters.length ? { OR: qFilters } : {})
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.activity.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.activity.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async get(ctx: RequestContext, id: string) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const activity = await this.prisma.activity.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!activity) {
      throw notFound(this.i18n, ctx.locale, "ACTIVITY_NOT_FOUND", "activity.not_found");
    }
    return activity;
  }

  async update(ctx: RequestContext, id: string, input: UpdateActivityInput) {
    const existing = await this.get(ctx, id);
    this.assertLeadActivityRequired(ctx, input, existing);
    if (input.status) {
      // 状态流校验与完成时间必填校验
      assertTransition("Activity", existing.status, input.status, ({ entity, from, to }) =>
        badRequest(
          this.i18n,
          ctx.locale,
          "ACTIVITY_STATUS_TRANSITION_INVALID",
          "activity.status.transition_invalid",
          { entity, from, to }
        )
      );
      if (input.status === "COMPLETED") {
        const completedAt =
          input.completedAt ??
          (existing.completedAt ? existing.completedAt.toISOString() : undefined);
        if (!completedAt) {
          throw badRequest(
            this.i18n,
            ctx.locale,
            "ACTIVITY_COMPLETED_MISSING_COMPLETED_AT",
            "activity.completed.missing_completed_at"
          );
        }
      }
    }
    const activity = await this.prisma.activity.update({
      where: { id },
      data: {
        type: input.type,
        subject: input.subject,
        content: input.content,
        relatedType: input.relatedType,
        relatedId: input.relatedId,
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
        completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
        outcome: input.outcome,
        nextFollowUpAt: input.nextFollowUpAt
          ? new Date(input.nextFollowUpAt)
          : undefined,
        status: input.status
      }
    });
    if (activity.relatedType === "Lead" && activity.relatedId) {
      // 更新 Lead 的 SLA 字段
      await this.prisma.lead.update({
        where: { id: activity.relatedId },
        data: {
          lastActivityAt: activity.completedAt ?? activity.createdAt,
          nextFollowUpAt: activity.nextFollowUpAt ?? undefined
        }
      });
    }
    await this.audit.log(
      ctx,
      "update",
      "Activity",
      activity.id,
      `Updated ${activity.subject ?? "activity"}`
    );
    await this.outbox.enqueue(ctx, "Activity", activity.id, "activity.updated", {
      subject: activity.subject
    });
    return activity;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const activity = await this.prisma.activity.delete({ where: { id } });
    await this.audit.log(
      ctx,
      "delete",
      "Activity",
      activity.id,
      `Deleted ${activity.subject ?? "activity"}`
    );
    await this.outbox.enqueue(ctx, "Activity", activity.id, "activity.deleted", {
      subject: activity.subject
    });
    return activity;
  }

  private assertLeadActivityRequired(
    ctx: RequestContext,
    input: Record<string, unknown>,
    existing?: Record<string, unknown>
  ) {
    const relatedType = (input.relatedType ?? existing?.relatedType) as string | undefined;
    if (relatedType !== "Lead") {
      return;
    }
    // Lead 的活动必须包含跟进信息，用于 SLA 与预警
    const type = (input.type ?? existing?.type) as string | undefined;
    const completedAt =
      (input.completedAt as string | undefined) ??
      (existing?.completedAt instanceof Date
        ? existing.completedAt.toISOString()
        : undefined);
    const outcome = (input.outcome ?? existing?.outcome) as string | undefined;
    const content = (input.content ?? existing?.content) as string | undefined;
    const nextFollowUpAt =
      (input.nextFollowUpAt as string | undefined) ??
      (existing?.nextFollowUpAt instanceof Date
        ? existing.nextFollowUpAt.toISOString()
        : undefined);
    const missing = [];
    if (!type) missing.push("type");
    if (!completedAt) missing.push("completedAt");
    if (!outcome) missing.push("outcome");
    if (!content) missing.push("content");
    if (!nextFollowUpAt) missing.push("nextFollowUpAt");
    if (missing.length) {
      throw badRequest(
        this.i18n,
        ctx.locale,
        "ACTIVITY_LEAD_MISSING_FIELDS",
        "activity.lead.missing_fields",
        { fields: missing.join(", ") }
      );
    }
  }
}
