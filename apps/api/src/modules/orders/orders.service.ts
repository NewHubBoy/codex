import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateOrderInput,
  CreateOrderItemInput,
  UpdateOrderInput,
  UpdateOrderItemInput
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
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService,
    private readonly numbering: NumberingService
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
    const item = await this.prisma.orderItem.create({
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
    await this.audit.log(ctx, "create", "OrderItem", item.id, `Added to ${orderId}`);
    await this.outbox.enqueue(ctx, "Order", orderId, "order.item.created", {
      itemId: item.id
    });
    return item;
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
    const item = await this.prisma.orderItem.update({
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
    const item = await this.prisma.orderItem.delete({ where: { id: itemId } });
    await this.audit.log(ctx, "delete", "OrderItem", item.id, `Removed ${item.id}`);
    await this.outbox.enqueue(ctx, "Order", orderId, "order.item.deleted", {
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

  async update(ctx: RequestContext, id: string, input: UpdateOrderInput) {
    await this.get(ctx, id);
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: input.status,
        orderDate: input.orderDate ?? undefined,
        totalAmount: input.totalAmount ?? undefined,
        currency: input.currency ?? undefined,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined,
        opportunityId: input.opportunityId ?? undefined
      }
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
}
