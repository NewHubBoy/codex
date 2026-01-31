import { Injectable } from "@nestjs/common";
import type { CreateLeadInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  async create(ctx: RequestContext, input: CreateLeadInput) {
    const lead = await this.prisma.lead.create({
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
    await this.audit.log(ctx, "create", "Lead", lead.id, `Created ${lead.name}`);
    await this.outbox.enqueue(ctx, "Lead", lead.id, "lead.created", { name: lead.name });
    return lead;
  }

  async list(ctx: RequestContext) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    return this.prisma.lead.findMany({
      where: { tenantId: ctx.tenantId, ...scopeFilter }
    });
  }
}
