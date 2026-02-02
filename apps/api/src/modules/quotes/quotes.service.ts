import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateQuoteInput,
  CreateQuoteItemInput,
  BulkQuoteItemsInput,
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
import { parseSerialId, parseSort } from "../../common/list-query";
import { assertTransition } from "../../common/status-transitions";

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
    const serialId = parseSerialId(query.q);
    const qFilters: Record<string, unknown>[] = [];
    if (query.q) {
      qFilters.push({ number: { contains: query.q, mode: "insensitive" as const } });
    }
    if (serialId !== undefined) {
      qFilters.push({ serialId });
    }
    const where = {
      tenantId: ctx.tenantId,
      ...scopeFilter,
      status: query.status,
      ownerId: query.ownerId,
      orgUnitId: query.orgUnitId,
      ...(qFilters.length ? { OR: qFilters } : {})
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
    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.quoteItem.create({
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
      await this.recomputeTotal(tx, quoteId);
      return created;
    });
    await this.audit.log(ctx, "create", "QuoteItem", item.id, `Added to ${quoteId}`);
    await this.outbox.enqueue(ctx, "Quote", quoteId, "quote.item.created", {
      itemId: item.id
    });
    return item;
  }

  async addItemsBulk(ctx: RequestContext, quoteId: string, input: BulkQuoteItemsInput) {
    await this.get(ctx, quoteId);
    const items = input.items.map((item) => {
      const values = this.normalizeItemInput(item);
      return {
        quoteId,
        productId: item.productId ?? undefined,
        qty: values.qty,
        unitPrice: values.unitPrice,
        discount: values.discount,
        tax: values.tax,
        lineTotal: values.lineTotal
      };
    });
    const result = await this.prisma.$transaction(async (tx) => {
      if (input.mode === "replace") {
        await tx.quoteItem.deleteMany({ where: { quoteId } });
      }
      await tx.quoteItem.createMany({ data: items });
      await this.recomputeTotal(tx, quoteId);
      return tx.quoteItem.findMany({ where: { quoteId }, orderBy: { createdAt: "asc" } });
    });
    const action = input.mode === "replace" ? "quote.items.replaced" : "quote.items.added";
    await this.audit.log(ctx, "update", "Quote", quoteId, `Upserted ${items.length} items`);
    await this.outbox.enqueue(ctx, "Quote", quoteId, action, { count: items.length });
    return result;
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
    const item = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.quoteItem.update({
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
      await this.recomputeTotal(tx, quoteId);
      return updated;
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
    const item = await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.quoteItem.delete({ where: { id: itemId } });
      await this.recomputeTotal(tx, quoteId);
      return deleted;
    });
    await this.audit.log(ctx, "delete", "QuoteItem", item.id, `Removed ${item.id}`);
    await this.outbox.enqueue(ctx, "Quote", quoteId, "quote.item.deleted", {
      itemId: item.id
    });
    return item;
  }

  private async recomputeTotal(
    tx: {
      quoteItem: { aggregate: Function };
      quote: { update: Function };
    },
    quoteId: string
  ) {
    const total = await this.computeTotal(tx, quoteId);
    await tx.quote.update({
      where: { id: quoteId },
      data: { totalAmount: total }
    });
  }

  private async computeTotal(
    tx: {
      quoteItem: { aggregate: Function };
    },
    quoteId: string
  ) {
    const aggregate = await tx.quoteItem.aggregate({
      where: { quoteId },
      _sum: { lineTotal: true }
    });
    return aggregate._sum.lineTotal ?? 0;
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
    if (computed !== undefined && computed < 0) {
      throw new BadRequestException("lineTotal must be >= 0");
    }
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
    const existing = await this.get(ctx, id);
    if (input.status) {
      assertTransition("Quote", existing.status, input.status);
      const totalAmount = input.totalAmount ?? existing.totalAmount;
      const currency = input.currency ?? existing.currency;
      const validTo =
        input.validTo ?? (existing.validTo ? existing.validTo.toISOString() : undefined);
      const accountId = input.accountId ?? existing.accountId;
      if (["APPROVED", "SENT", "ACCEPTED"].includes(input.status)) {
        if (totalAmount === undefined || totalAmount === null) {
          throw new BadRequestException("totalAmount is required for this status");
        }
        if (!currency) {
          throw new BadRequestException("currency is required for this status");
        }
      }
      if (["SENT", "ACCEPTED"].includes(input.status)) {
        if (!validTo) {
          throw new BadRequestException("validTo is required when status is SENT or ACCEPTED");
        }
      }
      if (input.status === "ACCEPTED" && !accountId) {
        throw new BadRequestException("accountId is required when status is ACCEPTED");
      }
    }
    const quote = await this.prisma.$transaction(async (tx) => {
      const total =
        input.totalAmount === undefined ? await this.computeTotal(tx, id) : input.totalAmount;
      return tx.quote.update({
        where: { id },
        data: {
          status: input.status,
          version: input.version,
          validFrom: input.validFrom ?? undefined,
          validTo: input.validTo ?? undefined,
          totalAmount: total,
          currency: input.currency ?? undefined,
          opportunityId: input.opportunityId ?? undefined,
          accountId: input.accountId ?? undefined,
          contactId: input.contactId ?? undefined
        }
      });
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
