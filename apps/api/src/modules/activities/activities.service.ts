import { Injectable } from "@nestjs/common";
import type { CreateActivityInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ctx: RequestContext, input: CreateActivityInput) {
    return this.prisma.activity.create({
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
  }

  async list(ctx: RequestContext) {
    return this.prisma.activity.findMany({
      where: { tenantId: ctx.tenantId }
    });
  }
}
