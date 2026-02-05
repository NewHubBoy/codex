import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateOrderInput,
  CreateOrderItemInput,
  BulkOrderItemsInput,
  UpdateOrderInput,
  UpdateOrderItemInput,
  ApprovalPayload
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
import { ApprovalsService } from "../approvals/approvals.service";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService,
    private readonly numbering: NumberingService,
    private readonly approvals: ApprovalsService
  ) {}

  async create(ctx: RequestContext, input: CreateOrderInput) {
    const number = await this.numbering.next(ctx, "order");
    const order = await this.prisma.order.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: input.status ?? undefined,
        number,
        orderDate: input.orderDate ?? undefined,
        totalAmount: input.totalAmount ?? undefined,
        currency: input.currency ?? undefined,
        discountRate: input.discountRate ?? undefined,
        isCustom: input.isCustom ?? undefined,
        hasSpecialTerms: input.hasSpecialTerms ?? undefined,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined,
        opportunityId: input.opportunityId ?? undefined
      }
    });
    await this.audit.log(ctx, "create", "Order", order.id, `Created ${order.number}`);
    await this.outbox.enqueue(ctx, "Order", order.id, "order.created", {
      number: order.number
    });
    return order;
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "number", "orderDate"]);
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
      this.prisma.order.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.order.count({ where })
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
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    return order;
  }

  async listItems(ctx: RequestContext, orderId: string, query: ListQuery) {
    await this.get(ctx, orderId);
    const orderBy = parseSort(query.sort, ["createdAt", "unitPrice", "qty"]);
    const where = { orderId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.orderItem.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.orderItem.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async addItem(ctx: RequestContext, orderId: string, input: CreateOrderItemInput) {
    await this.get(ctx, orderId);
    const values = this.normalizeItemInput(input);
    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.orderItem.create({
        data: {
          orderId,
          productId: input.productId ?? undefined,
          qty: values.qty,
          unitPrice: values.unitPrice,
          discount: values.discount,
          tax: values.tax,
          lineTotal: values.lineTotal
        }
      });
      await this.recomputeTotal(tx, orderId);
      return created;
    });
    await this.audit.log(ctx, "create", "OrderItem", item.id, `Added to ${orderId}`);
    await this.outbox.enqueue(ctx, "Order", orderId, "order.item.created", {
      itemId: item.id
    });
    return item;
  }

  async addItemsBulk(ctx: RequestContext, orderId: string, input: BulkOrderItemsInput) {
    await this.get(ctx, orderId);
    const items = input.items.map((item) => {
      const values = this.normalizeItemInput(item);
      return {
        orderId,
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
        await tx.orderItem.deleteMany({ where: { orderId } });
      }
      await tx.orderItem.createMany({ data: items });
      await this.recomputeTotal(tx, orderId);
      return tx.orderItem.findMany({ where: { orderId }, orderBy: { createdAt: "asc" } });
    });
    const action = input.mode === "replace" ? "order.items.replaced" : "order.items.added";
    await this.audit.log(ctx, "update", "Order", orderId, `Upserted ${items.length} items`);
    await this.outbox.enqueue(ctx, "Order", orderId, action, { count: items.length });
    return result;
  }

  async updateItem(
    ctx: RequestContext,
    orderId: string,
    itemId: string,
    input: UpdateOrderItemInput
  ) {
    await this.get(ctx, orderId);
    const existing = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId }
    });
    if (!existing) {
      throw new NotFoundException("Order item not found");
    }
    const values = this.normalizeItemInput(input, existing);
    const item = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.orderItem.update({
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
      await this.recomputeTotal(tx, orderId);
      return updated;
    });
    await this.audit.log(ctx, "update", "OrderItem", item.id, `Updated ${item.id}`);
    await this.outbox.enqueue(ctx, "Order", orderId, "order.item.updated", {
      itemId: item.id
    });
    return item;
  }

  async removeItem(ctx: RequestContext, orderId: string, itemId: string) {
    await this.get(ctx, orderId);
    const existing = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId }
    });
    if (!existing) {
      throw new NotFoundException("Order item not found");
    }
    const item = await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.orderItem.delete({ where: { id: itemId } });
      await this.recomputeTotal(tx, orderId);
      return deleted;
    });
    await this.audit.log(ctx, "delete", "OrderItem", item.id, `Removed ${item.id}`);
    await this.outbox.enqueue(ctx, "Order", orderId, "order.item.deleted", {
      itemId: item.id
    });
    return item;
  }

  private async recomputeTotal(
    tx: {
      orderItem: { aggregate: Function };
      order: { update: Function };
    },
    orderId: string
  ) {
    const total = await this.computeTotal(tx, orderId);
    await tx.order.update({
      where: { id: orderId },
      data: { totalAmount: total }
    });
  }

  private async computeTotal(
    tx: {
      orderItem: { aggregate: Function };
    },
    orderId: string
  ) {
    const aggregate = await tx.orderItem.aggregate({
      where: { orderId },
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

  async update(ctx: RequestContext, id: string, input: UpdateOrderInput) {
    const existing = await this.get(ctx, id);
    if (input.status) {
      assertTransition("Order", existing.status, input.status);
      const accountId = input.accountId ?? existing.accountId;
      const orderDate =
        input.orderDate ?? (existing.orderDate ? existing.orderDate.toISOString() : undefined);
      const totalAmount = input.totalAmount ?? existing.totalAmount;
      const currency = input.currency ?? existing.currency;
      if (
        [
          "CONFIRMED",
          "IN_FULFILLMENT",
          "PARTIALLY_DELIVERED",
          "DELIVERED",
          "CLOSED"
        ].includes(input.status)
      ) {
        if (!accountId) {
          throw new BadRequestException("accountId is required for this status");
        }
        if (!orderDate) {
          throw new BadRequestException("orderDate is required for this status");
        }
        if (totalAmount === undefined || totalAmount === null) {
          throw new BadRequestException("totalAmount is required for this status");
        }
        if (!currency) {
          throw new BadRequestException("currency is required for this status");
        }
      }
    }
    const order = await this.prisma.$transaction(async (tx) => {
      const total =
        input.totalAmount === undefined ? await this.computeTotal(tx, id) : input.totalAmount;
      return tx.order.update({
        where: { id },
        data: {
          status: input.status,
          orderDate: input.orderDate ?? undefined,
          totalAmount: total,
          currency: input.currency ?? undefined,
          discountRate: input.discountRate ?? undefined,
          isCustom: input.isCustom ?? undefined,
          hasSpecialTerms: input.hasSpecialTerms ?? undefined,
          accountId: input.accountId ?? undefined,
          contactId: input.contactId ?? undefined,
          opportunityId: input.opportunityId ?? undefined
        }
      });
    });
    await this.audit.log(ctx, "update", "Order", order.id, `Updated ${order.number}`);
    await this.outbox.enqueue(ctx, "Order", order.id, "order.updated", {
      number: order.number
    });
    return order;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const order = await this.prisma.order.delete({ where: { id } });
    await this.audit.log(ctx, "delete", "Order", order.id, `Deleted ${order.number}`);
    await this.outbox.enqueue(ctx, "Order", order.id, "order.deleted", {
      number: order.number
    });
    return order;
  }

  async submitForApproval(ctx: RequestContext, id: string, payload?: ApprovalPayload) {
    const order = await this.get(ctx, id);
    if (order.status !== "DRAFT") {
      throw new BadRequestException("Only DRAFT orders can be submitted for approval");
    }
    const approvalPayload = this.buildApprovalPayload(order, payload);
    await this.approvals.createApprovalForEntity(ctx, "Order", id, approvalPayload);
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        discountRate: payload?.discountRate ?? order.discountRate ?? undefined,
        isCustom: payload?.isCustom ?? order.isCustom ?? undefined,
        hasSpecialTerms: payload?.hasSpecialTerms ?? order.hasSpecialTerms ?? undefined
      }
    });
    await this.audit.log(ctx, "update", "Order", updated.id, `Submitted ${updated.number} for approval`);
    await this.outbox.enqueue(ctx, "Order", updated.id, "order.submitted", { number: updated.number });
    return updated;
  }

  async resubmitForApproval(ctx: RequestContext, id: string, payload?: ApprovalPayload) {
    const order = await this.get(ctx, id);
    if (order.status !== "DRAFT") {
      throw new BadRequestException("Only DRAFT orders can be resubmitted");
    }
    const lastInstance = await this.prisma.approvalInstance.findFirst({
      where: { tenantId: ctx.tenantId, entityType: "Order", entityId: id },
      orderBy: { createdAt: "desc" }
    });
    if (!lastInstance || lastInstance.status !== "REJECTED") {
      throw new BadRequestException("Order has no rejected approval to resubmit");
    }
    const approvalPayload = this.buildApprovalPayload(order, payload);
    await this.approvals.createApprovalForEntity(ctx, "Order", id, approvalPayload);
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        discountRate: payload?.discountRate ?? order.discountRate ?? undefined,
        isCustom: payload?.isCustom ?? order.isCustom ?? undefined,
        hasSpecialTerms: payload?.hasSpecialTerms ?? order.hasSpecialTerms ?? undefined
      }
    });
    await this.audit.log(ctx, "update", "Order", updated.id, `Resubmitted ${updated.number}`);
    await this.outbox.enqueue(ctx, "Order", updated.id, "order.resubmitted", { number: updated.number });
    return updated;
  }

  private buildApprovalPayload(order: { totalAmount?: number | null; discountRate?: number | null; isCustom?: boolean | null; hasSpecialTerms?: boolean | null }, payload?: ApprovalPayload) {
    return {
      discountRate: payload?.discountRate ?? (order.discountRate ?? undefined),
      amount: payload?.amount ?? (order.totalAmount ?? undefined),
      isCustom: payload?.isCustom ?? (order.isCustom ?? undefined),
      hasSpecialTerms: payload?.hasSpecialTerms ?? (order.hasSpecialTerms ?? undefined),
      note: payload?.note
    };
  }
}
