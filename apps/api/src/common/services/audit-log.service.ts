import { Injectable } from "@nestjs/common";
import type { RequestContext } from "../request-context";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    ctx: RequestContext,
    action: string,
    objectType: string,
    objectId: string,
    summary?: string
  ) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: ctx.tenantId,
        actorId: ctx.userId ?? null,
        action,
        objectType,
        objectId,
        summary
      }
    });
  }
}
