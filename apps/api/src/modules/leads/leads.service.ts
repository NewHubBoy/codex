import { Injectable } from "@nestjs/common";
import type { CreateLeadInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ctx: RequestContext, input: CreateLeadInput) {
    return this.prisma.lead.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        name: input.name,
        source: input.source,
        rating: input.rating,
        expectedValue: input.expectedValue,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined,
        description: input.description
      }
    });
  }

  async list(ctx: RequestContext) {
    return this.prisma.lead.findMany({
      where: { tenantId: ctx.tenantId }
    });
  }
}
