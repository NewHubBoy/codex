import { Injectable } from "@nestjs/common";
import type { CreateContactInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";

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

  async list(ctx: RequestContext) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    return this.prisma.contact.findMany({
      where: { tenantId: ctx.tenantId, ...scopeFilter }
    });
  }
}
