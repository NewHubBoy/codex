import { Injectable } from "@nestjs/common";
import type { CreateAccountInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ctx: RequestContext, input: CreateAccountInput) {
    return this.prisma.account.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        name: input.name,
        type: input.type,
        industry: input.industry,
        rating: input.rating,
        lifecycleStatus: input.lifecycleStatus,
        parentId: input.parentId ?? undefined,
        bpId: input.bpId ?? undefined
      }
    });
  }

  async list(ctx: RequestContext) {
    return this.prisma.account.findMany({
      where: { tenantId: ctx.tenantId }
    });
  }
}
