import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateContactInput, UpdateContactInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSerialId, parseSort } from "../../common/list-query";

@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  async create(ctx: RequestContext, input: CreateContactInput) {
    const contact = await this.prisma.contact.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        accountId: input.accountId,
        name: input.name,
        title: input.title,
        email: input.email,
        phone: input.phone,
        role: input.role,
        bpId: input.bpId ?? undefined
      }
    });
    await this.audit.log(ctx, "create", "Contact", contact.id, `Created ${contact.name}`);
    await this.outbox.enqueue(ctx, "Contact", contact.id, "contact.created", {
      name: contact.name
    });
    return contact;
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "name"]);
    const serialId = parseSerialId(query.q);
    const qFilters: Record<string, unknown>[] = [];
    if (query.q) {
      qFilters.push(
        { name: { contains: query.q, mode: "insensitive" as const } },
        { email: { contains: query.q, mode: "insensitive" as const } },
        { phone: { contains: query.q, mode: "insensitive" as const } }
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
      this.prisma.contact.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.contact.count({ where })
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
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!contact) {
      throw new NotFoundException("Contact not found");
    }
    return contact;
  }

  async update(ctx: RequestContext, id: string, input: UpdateContactInput) {
    await this.get(ctx, id);
    const contact = await this.prisma.contact.update({
      where: { id },
      data: {
        accountId: input.accountId ?? undefined,
        name: input.name,
        title: input.title,
        email: input.email,
        phone: input.phone,
        role: input.role,
        bpId: input.bpId ?? undefined
      }
    });
    await this.audit.log(ctx, "update", "Contact", contact.id, `Updated ${contact.name}`);
    await this.outbox.enqueue(ctx, "Contact", contact.id, "contact.updated", {
      name: contact.name
    });
    return contact;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const contact = await this.prisma.contact.delete({ where: { id } });
    await this.audit.log(ctx, "delete", "Contact", contact.id, `Deleted ${contact.name}`);
    await this.outbox.enqueue(ctx, "Contact", contact.id, "contact.deleted", {
      name: contact.name
    });
    return contact;
  }
}
