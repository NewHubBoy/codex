import { Injectable } from "@nestjs/common";
import type { CreateOpportunityInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";

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

  async list(ctx: RequestContext) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    return this.prisma.opportunity.findMany({
      where: { tenantId: ctx.tenantId, ...scopeFilter }
    });
  }
}
