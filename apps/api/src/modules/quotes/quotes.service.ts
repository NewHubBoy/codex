import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateQuoteInput, UpdateQuoteInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { NumberingService } from "../../common/services/numbering.service";
import type { ListQuery } from "../../common/list-query";
import { parseSort } from "../../common/list-query";

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService,
    private readonly numbering: NumberingService
  ) {}

  async create(ctx: RequestContext, input: CreateQuoteInput) {
    const number = await this.numbering.next(ctx, "quote");
    const quote = await this.prisma.quote.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: input.status ?? undefined,
        number,
        version: input.version ?? undefined,
        validFrom: input.validFrom ?? undefined,
        validTo: input.validTo ?? undefined,
        totalAmount: input.totalAmount ?? undefined,
        currency: input.currency ?? undefined,
        opportunityId: input.opportunityId ?? undefined,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined
      }
    });
    await this.audit.log(ctx, "create", "Quote", quote.id, `Created ${quote.number}`);
    await this.outbox.enqueue(ctx, "Quote", quote.id, "quote.created", {
      number: quote.number
    });
    return quote;
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "number", "validFrom", "validTo"]);
    const where = {
      tenantId: ctx.tenantId,
      ...scopeFilter,
      status: query.status,
      ownerId: query.ownerId,
      orgUnitId: query.orgUnitId,
      ...(query.q
        ? { number: { contains: query.q, mode: "insensitive" as const } }
        : {})
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.quote.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.quote.count({ where })
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
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!quote) {
      throw new NotFoundException("Quote not found");
    }
    return quote;
  }

  async update(ctx: RequestContext, id: string, input: UpdateQuoteInput) {
    await this.get(ctx, id);
    const quote = await this.prisma.quote.update({
      where: { id },
      data: {
        status: input.status,
        version: input.version,
        validFrom: input.validFrom ?? undefined,
        validTo: input.validTo ?? undefined,
        totalAmount: input.totalAmount ?? undefined,
        currency: input.currency ?? undefined,
        opportunityId: input.opportunityId ?? undefined,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined
      }
    });
    await this.audit.log(ctx, "update", "Quote", quote.id, `Updated ${quote.number}`);
    await this.outbox.enqueue(ctx, "Quote", quote.id, "quote.updated", {
      number: quote.number
    });
    return quote;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const quote = await this.prisma.quote.delete({ where: { id } });
    await this.audit.log(ctx, "delete", "Quote", quote.id, `Deleted ${quote.number}`);
    await this.outbox.enqueue(ctx, "Quote", quote.id, "quote.deleted", {
      number: quote.number
    });
    return quote;
  }
}
