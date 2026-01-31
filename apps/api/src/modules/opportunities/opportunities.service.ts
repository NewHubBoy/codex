import { Injectable } from "@nestjs/common";
import type { CreateOpportunityInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ctx: RequestContext, input: CreateOpportunityInput) {
    return this.prisma.opportunity.create({
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
  }

  async list(ctx: RequestContext) {
    return this.prisma.opportunity.findMany({
      where: { tenantId: ctx.tenantId }
    });
  }
}
