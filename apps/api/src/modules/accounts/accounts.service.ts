import { Injectable } from "@nestjs/common";
import type { CreateAccountInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";

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

  async list(ctx: RequestContext) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    return this.prisma.account.findMany({
      where: { tenantId: ctx.tenantId, ...scopeFilter }
    });
  }
}
