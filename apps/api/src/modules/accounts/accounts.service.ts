import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateAccountInput, UpdateAccountInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSort } from "../../common/list-query";

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  async create(ctx: RequestContext, input: CreateAccountInput) {
    const account = await this.prisma.account.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        name: input.name,
        type: input.type,
        industry: input.industry,
        rating: input.rating,
        lifecycleStatus: input.lifecycleStatus,
        parentId: input.parentId ?? undefined,
        bpId: input.bpId ?? undefined
      }
    });
    await this.audit.log(ctx, "create", "Account", account.id, `Created ${account.name}`);
    await this.outbox.enqueue(ctx, "Account", account.id, "account.created", {
      name: account.name
    });
    return account;
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
      this.prisma.account.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.account.count({ where })
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
    const account = await this.prisma.account.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!account) {
      throw new NotFoundException("Account not found");
    }
    return account;
  }

  async update(ctx: RequestContext, id: string, input: UpdateAccountInput) {
    await this.get(ctx, id);
    const account = await this.prisma.account.update({
      where: { id },
      data: {
        name: input.name,
        type: input.type,
        industry: input.industry,
        rating: input.rating,
        lifecycleStatus: input.lifecycleStatus,
        parentId: input.parentId ?? undefined,
        bpId: input.bpId ?? undefined
      }
    });
    await this.audit.log(ctx, "update", "Account", account.id, `Updated ${account.name}`);
    await this.outbox.enqueue(ctx, "Account", account.id, "account.updated", {
      name: account.name
    });
    return account;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const account = await this.prisma.account.delete({ where: { id } });
    await this.audit.log(ctx, "delete", "Account", account.id, `Deleted ${account.name}`);
    await this.outbox.enqueue(ctx, "Account", account.id, "account.deleted", {
      name: account.name
    });
    return account;
  }
}
