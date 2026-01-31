import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateDeliveryInput, UpdateDeliveryInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { NumberingService } from "../../common/services/numbering.service";
import type { ListQuery } from "../../common/list-query";
import { parseSort } from "../../common/list-query";

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService,
    private readonly numbering: NumberingService
  ) {}

  async create(ctx: RequestContext, input: CreateDeliveryInput) {
    const number = await this.numbering.next(ctx, "delivery");
    const delivery = await this.prisma.delivery.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: input.status ?? undefined,
        number,
        orderId: input.orderId ?? undefined,
        deliveredAt: input.deliveredAt ?? undefined,
        deliveryNotes: input.deliveryNotes ?? undefined,
        deliveredQty: input.deliveredQty ?? undefined
      }
    });
    await this.audit.log(ctx, "create", "Delivery", delivery.id, `Created ${delivery.number}`);
    await this.outbox.enqueue(ctx, "Delivery", delivery.id, "delivery.created", {
      number: delivery.number
    });
    return delivery;
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "number", "deliveredAt"]);
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
      this.prisma.delivery.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.delivery.count({ where })
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
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!delivery) {
      throw new NotFoundException("Delivery not found");
    }
    return delivery;
  }

  async update(ctx: RequestContext, id: string, input: UpdateDeliveryInput) {
    await this.get(ctx, id);
    const delivery = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: input.status,
        orderId: input.orderId ?? undefined,
        deliveredAt: input.deliveredAt ?? undefined,
        deliveryNotes: input.deliveryNotes ?? undefined,
        deliveredQty: input.deliveredQty ?? undefined
      }
    });
    await this.audit.log(ctx, "update", "Delivery", delivery.id, `Updated ${delivery.number}`);
    await this.outbox.enqueue(ctx, "Delivery", delivery.id, "delivery.updated", {
      number: delivery.number
    });
    return delivery;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const delivery = await this.prisma.delivery.delete({ where: { id } });
    await this.audit.log(ctx, "delete", "Delivery", delivery.id, `Deleted ${delivery.number}`);
    await this.outbox.enqueue(ctx, "Delivery", delivery.id, "delivery.deleted", {
      number: delivery.number
    });
    return delivery;
  }
}
