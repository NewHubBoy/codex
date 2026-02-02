import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateProductInput, UpdateProductInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSerialId, parseSort } from "../../common/list-query";
import { assertTransition } from "../../common/status-transitions";

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  async create(ctx: RequestContext, input: CreateProductInput) {
    const product = await this.prisma.product.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: input.status ?? undefined,
        sku: input.sku ?? undefined,
        name: input.name,
        category: input.category,
        listPrice: input.listPrice,
        currency: input.currency
      }
    });
    await this.audit.log(ctx, "create", "Product", product.id, `Created ${product.name}`);
    await this.outbox.enqueue(ctx, "Product", product.id, "product.created", {
      name: product.name
    });
    return product;
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "name", "sku", "listPrice"]);
    const serialId = parseSerialId(query.q);
    const qFilters: Record<string, unknown>[] = [];
    if (query.q) {
      qFilters.push(
        { name: { contains: query.q, mode: "insensitive" as const } },
        { sku: { contains: query.q, mode: "insensitive" as const } }
      );
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
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.product.count({ where })
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
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }

  async update(ctx: RequestContext, id: string, input: UpdateProductInput) {
    const existing = await this.get(ctx, id);
    if (input.status) {
      assertTransition("Product", existing.status, input.status);
    }
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        status: input.status,
        sku: input.sku,
        name: input.name,
        category: input.category,
        listPrice: input.listPrice,
        currency: input.currency
      }
    });
    await this.audit.log(ctx, "update", "Product", product.id, `Updated ${product.name}`);
    await this.outbox.enqueue(ctx, "Product", product.id, "product.updated", {
      name: product.name
    });
    return product;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const product = await this.prisma.product.delete({ where: { id } });
    await this.audit.log(ctx, "delete", "Product", product.id, `Deleted ${product.name}`);
    await this.outbox.enqueue(ctx, "Product", product.id, "product.deleted", {
      name: product.name
    });
    return product;
  }
}
