import { Injectable } from "@nestjs/common";
import type { CreateActivityInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";

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

  async list(ctx: RequestContext) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    return this.prisma.activity.findMany({
      where: { tenantId: ctx.tenantId, ...scopeFilter }
    });
  }
}
