import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateOrderInput, UpdateOrderInput } from "@crm/shared";
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
