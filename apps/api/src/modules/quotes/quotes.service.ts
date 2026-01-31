import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateQuoteInput,
  CreateQuoteItemInput,
  UpdateQuoteInput,
  UpdateQuoteItemInput
} from "@crm/shared";
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

  async listItems(ctx: RequestContext, quoteId: string, query: ListQuery) {
    await this.get(ctx, quoteId);
    const orderBy = parseSort(query.sort, ["createdAt", "unitPrice", "qty"]);
    const where = { quoteId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.quoteItem.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.quoteItem.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async addItem(ctx: RequestContext, quoteId: string, input: CreateQuoteItemInput) {
    await this.get(ctx, quoteId);
    const values = this.normalizeItemInput(input);
    const item = await this.prisma.quoteItem.create({
      data: {
        quoteId,
        productId: input.productId ?? undefined,
        qty: values.qty,
        unitPrice: values.unitPrice,
        discount: values.discount,
        tax: values.tax,
        lineTotal: values.lineTotal
      }
    });
    await this.audit.log(ctx, "create", "QuoteItem", item.id, `Added to ${quoteId}`);
    await this.outbox.enqueue(ctx, "Quote", quoteId, "quote.item.created", {
      itemId: item.id
    });
    return item;
  }

  async updateItem(
    ctx: RequestContext,
    quoteId: string,
    itemId: string,
    input: UpdateQuoteItemInput
  ) {
    await this.get(ctx, quoteId);
    const existing = await this.prisma.quoteItem.findFirst({
      where: { id: itemId, quoteId }
    });
    if (!existing) {
      throw new NotFoundException("Quote item not found");
    }
    const values = this.normalizeItemInput(input, existing);
    const item = await this.prisma.quoteItem.update({
      where: { id: itemId },
      data: {
        productId: input.productId ?? undefined,
        qty: values.qty,
        unitPrice: values.unitPrice,
        discount: values.discount,
        tax: values.tax,
        lineTotal: values.lineTotal
      }
    });
    await this.audit.log(ctx, "update", "QuoteItem", item.id, `Updated ${item.id}`);
    await this.outbox.enqueue(ctx, "Quote", quoteId, "quote.item.updated", {
      itemId: item.id
    });
    return item;
  }

  async removeItem(ctx: RequestContext, quoteId: string, itemId: string) {
    await this.get(ctx, quoteId);
    const existing = await this.prisma.quoteItem.findFirst({
      where: { id: itemId, quoteId }
    });
    if (!existing) {
      throw new NotFoundException("Quote item not found");
    }
    const item = await this.prisma.quoteItem.delete({ where: { id: itemId } });
    await this.audit.log(ctx, "delete", "QuoteItem", item.id, `Removed ${item.id}`);
    await this.outbox.enqueue(ctx, "Quote", quoteId, "quote.item.deleted", {
      itemId: item.id
    });
    return item;
  }

  private normalizeItemInput(
    input: {
      qty?: number;
      unitPrice?: number;
      discount?: number;
      tax?: number;
      lineTotal?: number;
    },
    existing?: {
      qty: number | null;
      unitPrice: number | null;
      discount: number | null;
      tax: number | null;
      lineTotal: number | null;
    }
  ) {
    this.assertNonNegative(input.qty, "qty");
    this.assertNonNegative(input.unitPrice, "unitPrice");
    this.assertNonNegative(input.discount, "discount");
    this.assertNonNegative(input.tax, "tax");
    this.assertNonNegative(input.lineTotal, "lineTotal");

    const merged = {
      qty: input.qty ?? existing?.qty ?? undefined,
      unitPrice: input.unitPrice ?? existing?.unitPrice ?? undefined,
      discount: input.discount ?? existing?.discount ?? undefined,
      tax: input.tax ?? existing?.tax ?? undefined
    };
    const shouldCompute =
      input.lineTotal === undefined &&
      (input.qty !== undefined ||
        input.unitPrice !== undefined ||
        input.discount !== undefined ||
        input.tax !== undefined);
    const computed = shouldCompute
      ? this.computeLineTotal(merged.qty, merged.unitPrice, merged.discount, merged.tax)
      : undefined;
    return {
      qty: input.qty,
      unitPrice: input.unitPrice,
      discount: input.discount,
      tax: input.tax,
      lineTotal: input.lineTotal ?? computed
    };
  }

  private computeLineTotal(
    qty?: number | null,
    unitPrice?: number | null,
    discount?: number | null,
    tax?: number | null
  ) {
    const baseQty = qty ?? 0;
    const baseUnit = unitPrice ?? 0;
    const baseDiscount = discount ?? 0;
    const baseTax = tax ?? 0;
    return baseQty * baseUnit - baseDiscount + baseTax;
  }

  private assertNonNegative(value: number | undefined, field: string) {
    if (value !== undefined && value < 0) {
      throw new BadRequestException(`${field} must be >= 0`);
    }
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
