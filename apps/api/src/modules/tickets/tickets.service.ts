import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateTicketInput, UpdateTicketInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import { NumberingService } from "../../common/services/numbering.service";
import type { ListQuery } from "../../common/list-query";
import { parseSort } from "../../common/list-query";

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService,
    private readonly numbering: NumberingService
  ) {}

  async create(ctx: RequestContext, input: CreateTicketInput) {
    const number = await this.numbering.next(ctx, "ticket");
    const ticket = await this.prisma.ticket.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: input.status ?? undefined,
        number,
        type: input.type ?? undefined,
        priority: input.priority ?? undefined,
        subject: input.subject ?? undefined,
        slaDueAt: input.slaDueAt ?? undefined,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined,
        orderId: input.orderId ?? undefined
      }
    });
    await this.audit.log(ctx, "create", "Ticket", ticket.id, `Created ${ticket.number}`);
    await this.outbox.enqueue(ctx, "Ticket", ticket.id, "ticket.created", {
      number: ticket.number
    });
    return ticket;
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "number", "slaDueAt"]);
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
      this.prisma.ticket.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.ticket.count({ where })
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
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }
    return ticket;
  }

  async update(ctx: RequestContext, id: string, input: UpdateTicketInput) {
    await this.get(ctx, id);
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: input.status,
        type: input.type ?? undefined,
        priority: input.priority ?? undefined,
        subject: input.subject ?? undefined,
        slaDueAt: input.slaDueAt ?? undefined,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined,
        orderId: input.orderId ?? undefined
      }
    });
    await this.audit.log(ctx, "update", "Ticket", ticket.id, `Updated ${ticket.number}`);
    await this.outbox.enqueue(ctx, "Ticket", ticket.id, "ticket.updated", {
      number: ticket.number
    });
    return ticket;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const ticket = await this.prisma.ticket.delete({ where: { id } });
    await this.audit.log(ctx, "delete", "Ticket", ticket.id, `Deleted ${ticket.number}`);
    await this.outbox.enqueue(ctx, "Ticket", ticket.id, "ticket.deleted", {
      number: ticket.number
    });
    return ticket;
  }
}
