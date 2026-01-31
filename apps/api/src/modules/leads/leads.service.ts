import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateLeadInput, UpdateLeadInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSort } from "../../common/list-query";

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

  async list(ctx: RequestContext, query: ListQuery) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "name"]);
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
      this.prisma.lead.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.lead.count({ where })
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
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!lead) {
      throw new NotFoundException("Lead not found");
    }
    return lead;
  }

  async update(ctx: RequestContext, id: string, input: UpdateLeadInput) {
    await this.get(ctx, id);
    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        name: input.name,
        source: input.source,
        rating: input.rating,
        expectedValue: input.expectedValue,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined,
        description: input.description ?? undefined,
        status: input.status
      }
    });
    await this.audit.log(ctx, "update", "Lead", lead.id, `Updated ${lead.name}`);
    await this.outbox.enqueue(ctx, "Lead", lead.id, "lead.updated", { name: lead.name });
    return lead;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const lead = await this.prisma.lead.delete({ where: { id } });
    await this.audit.log(ctx, "delete", "Lead", lead.id, `Deleted ${lead.name}`);
    await this.outbox.enqueue(ctx, "Lead", lead.id, "lead.deleted", { name: lead.name });
    return lead;
  }
}
