import { Injectable } from "@nestjs/common";
import type { RequestContext } from "../request-context";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueue(
    ctx: RequestContext,
    aggregateType: string,
    aggregateId: string,
    eventType: string,
    payload: Prisma.InputJsonValue
  ) {
    return this.prisma.outboxEvent.create({
      data: {
        tenantId: ctx.tenantId,
        aggregateType,
        aggregateId,
        eventType,
        payloadJson: payload,
        status: "PENDING"
      }
    });
  }
}
