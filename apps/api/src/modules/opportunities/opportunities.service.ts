import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateOpportunityInput, UpdateOpportunityInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSort } from "../../common/list-query";
import { assertTransition } from "../../common/status-transitions";

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  async create(ctx: RequestContext, input: CreateOpportunityInput) {
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
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined,
        leadId: input.leadId ?? undefined,
        reasonLost: input.reasonLost
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
    const where = {
      tenantId: ctx.tenantId,
      ...scopeFilter,
      status: query.status,
      ownerId: query.ownerId,
      orgUnitId: query.orgUnitId,
      ...(query.q
        ? { name: { contains: query.q, mode: "insensitive" as const } }
        : {})
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
    return {
      data,
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
      throw new NotFoundException("Opportunity not found");
    }
    return opportunity;
  }

  async update(ctx: RequestContext, id: string, input: UpdateOpportunityInput) {
    const existing = await this.get(ctx, id);
    if (input.status) {
      assertTransition("Opportunity", existing.status, input.status);
      if (input.status === "WON") {
        const amount = input.amount ?? existing.amount;
        const closeDate = input.expectedCloseDate ?? existing.expectedCloseDate?.toISOString();
        if (amount === undefined || amount === null) {
          throw new BadRequestException("amount is required when status is WON");
        }
        if (!closeDate) {
          throw new BadRequestException("expectedCloseDate is required when status is WON");
        }
      }
      if (input.status === "LOST") {
        const reasonLost = input.reasonLost ?? existing.reasonLost;
        if (!reasonLost) {
          throw new BadRequestException("reasonLost is required when status is LOST");
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
        status: input.status
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
}
