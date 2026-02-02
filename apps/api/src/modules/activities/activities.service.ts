import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateActivityInput, UpdateActivityInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSerialId, parseSort } from "../../common/list-query";
import { assertTransition } from "../../common/status-transitions";

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  async create(ctx: RequestContext, input: CreateActivityInput) {
    const activity = await this.prisma.activity.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: input.status ?? undefined,
        type: input.type,
        subject: input.subject,
        relatedType: input.relatedType,
        relatedId: input.relatedId,
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
        completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
        outcome: input.outcome
      }
    });
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
      qFilters.push(
        { subject: { contains: query.q, mode: "insensitive" as const } },
        { type: { contains: query.q, mode: "insensitive" as const } }
      );
    }
    if (serialId !== undefined) {
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
      throw new NotFoundException("Activity not found");
    }
    return activity;
  }

  async update(ctx: RequestContext, id: string, input: UpdateActivityInput) {
    const existing = await this.get(ctx, id);
    if (input.status) {
      assertTransition("Activity", existing.status, input.status);
      if (input.status === "COMPLETED") {
        const completedAt =
          input.completedAt ??
          (existing.completedAt ? existing.completedAt.toISOString() : undefined);
        if (!completedAt) {
          throw new BadRequestException("completedAt is required when status is COMPLETED");
        }
      }
    }
    const activity = await this.prisma.activity.update({
      where: { id },
      data: {
        type: input.type,
        subject: input.subject,
        relatedType: input.relatedType,
        relatedId: input.relatedId,
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
        completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
        outcome: input.outcome,
        status: input.status
      }
    });
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
}
