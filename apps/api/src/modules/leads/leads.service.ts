import { Injectable } from "@nestjs/common";
import type { BulkLeadStatusInput, CreateLeadInput, UpdateLeadInput } from "@crm/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestContext } from "../../common/request-context";
import { DataScopeService } from "../../common/services/data-scope.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSerialId, parseSort } from "../../common/list-query";
import { assertTransition } from "../../common/status-transitions";
import { I18nService } from "../../common/i18n/i18n.service";
import { badRequest, notFound } from "../../common/i18n/i18n-error";

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataScope: DataScopeService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService,
    private readonly i18n: I18nService
  ) {}

  async create(ctx: RequestContext, input: CreateLeadInput) {
    if (input.status === "DRAFT") {
      throw badRequest(
        this.i18n,
        ctx.locale,
        "LEAD_DRAFT_CREATE_FORBIDDEN",
        "lead.draft.create_forbidden"
      );
    }
    const lead = await this.prisma.lead.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: input.status ?? undefined,
        name: input.name,
        source: input.source,
        rating: input.rating,
        expectedValue: input.expectedValue,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined,
        description: input.description
      }
    });
    await this.audit.log(ctx, "create", "Lead", lead.id, `Created ${lead.name}`);
    await this.outbox.enqueue(ctx, "Lead", lead.id, "lead.created", { name: lead.name });
    return lead;
  }

  async createDraft(ctx: RequestContext) {
    return this.prisma.lead.create({
      data: {
        tenantId: ctx.tenantId,
        orgUnitId: ctx.orgUnitId,
        ownerId: ctx.userId,
        status: "DRAFT",
        name: ""
      }
    });
  }

  async list(ctx: RequestContext, query: ListQuery) {
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "name"]);
    const serialId = parseSerialId(query.q);
    const qFilters: Record<string, unknown>[] = [];
    if (query.q) {
      qFilters.push({ name: { contains: query.q, mode: "insensitive" as const } });
    }
    if (serialId !== undefined) {
      qFilters.push({ serialId });
    }
    const statusFilter = query.status ?? { not: "DRAFT" };
    const where = {
      tenantId: ctx.tenantId,
      ...scopeFilter,
      status: statusFilter,
      ownerId: query.ownerId,
      orgUnitId: query.orgUnitId,
      ...(qFilters.length ? { OR: qFilters } : {})
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.lead.count({ where })
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
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId: ctx.tenantId, ...scopeFilter }
    });
    if (!lead) {
      throw notFound(this.i18n, ctx.locale, "LEAD_NOT_FOUND", "lead.not_found");
    }
    return lead;
  }

  async update(ctx: RequestContext, id: string, input: UpdateLeadInput) {
    const existing = await this.get(ctx, id);
    if (existing.status === "DRAFT") {
      throw badRequest(
        this.i18n,
        ctx.locale,
        "LEAD_DRAFT_UPDATE_FORBIDDEN",
        "lead.draft.update_forbidden"
      );
    }
    if (input.status) {
      if (input.status === "DRAFT") {
        throw badRequest(
          this.i18n,
          ctx.locale,
          "LEAD_STATUS_DRAFT_FORBIDDEN",
          "lead.status.draft_forbidden"
        );
      }
      assertTransition("Lead", existing.status, input.status, ({ entity, from, to }) =>
        badRequest(this.i18n, ctx.locale, "LEAD_STATUS_TRANSITION_INVALID", "lead.status.transition_invalid", {
          entity,
          from,
          to
        })
      );
      if (input.status === "CONVERTED") {
        const accountId = input.accountId ?? existing.accountId;
        const contactId = input.contactId ?? existing.contactId;
        if (!accountId && !contactId) {
          throw badRequest(
            this.i18n,
            ctx.locale,
            "LEAD_CONVERT_MISSING_ACCOUNT_CONTACT",
            "lead.convert.missing_account_contact"
          );
        }
      }
    }
    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        name: input.name,
        source: input.source,
        rating: input.rating,
        expectedValue: input.expectedValue,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined,
        description: input.description ?? undefined,
        status: input.status
      }
    });
    await this.audit.log(ctx, "update", "Lead", lead.id, `Updated ${lead.name}`);
    await this.outbox.enqueue(ctx, "Lead", lead.id, "lead.updated", { name: lead.name });
    return lead;
  }

  async submitDraft(ctx: RequestContext, id: string, input: CreateLeadInput) {
    const existing = await this.get(ctx, id);
    if (existing.status !== "DRAFT") {
      throw badRequest(
        this.i18n,
        ctx.locale,
        "LEAD_NOT_DRAFT",
        "lead.draft.not_in_draft"
      );
    }
    const status = input.status ?? "NEW";
    if (status === "DRAFT") {
      throw badRequest(
        this.i18n,
        ctx.locale,
        "LEAD_DRAFT_SUBMIT_INVALID_STATUS",
        "lead.draft.submit_invalid_status"
      );
    }
    assertTransition("Lead", existing.status, status, ({ entity, from, to }) =>
      badRequest(this.i18n, ctx.locale, "LEAD_STATUS_TRANSITION_INVALID", "lead.status.transition_invalid", {
        entity,
        from,
        to
      })
    );
    if (status === "CONVERTED") {
      const accountId = input.accountId ?? existing.accountId;
      const contactId = input.contactId ?? existing.contactId;
      if (!accountId && !contactId) {
        throw badRequest(
          this.i18n,
          ctx.locale,
          "LEAD_CONVERT_MISSING_ACCOUNT_CONTACT",
          "lead.convert.missing_account_contact"
        );
      }
    }
    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        name: input.name,
        source: input.source,
        rating: input.rating,
        expectedValue: input.expectedValue,
        accountId: input.accountId ?? undefined,
        contactId: input.contactId ?? undefined,
        description: input.description ?? undefined,
        status
      }
    });
    await this.audit.log(ctx, "create", "Lead", lead.id, `Created ${lead.name}`);
    await this.outbox.enqueue(ctx, "Lead", lead.id, "lead.created", { name: lead.name });
    return lead;
  }

  async remove(ctx: RequestContext, id: string) {
    await this.get(ctx, id);
    const lead = await this.prisma.lead.delete({ where: { id } });
    if (lead.status !== "DRAFT") {
      await this.audit.log(ctx, "delete", "Lead", lead.id, `Deleted ${lead.name}`);
      await this.outbox.enqueue(ctx, "Lead", lead.id, "lead.deleted", { name: lead.name });
    }
    return lead;
  }

  async bulkUpdateStatus(ctx: RequestContext, input: BulkLeadStatusInput) {
    if (input.status === "DRAFT") {
      throw badRequest(
        this.i18n,
        ctx.locale,
        "LEAD_STATUS_DRAFT_FORBIDDEN",
        "lead.status.draft_forbidden"
      );
    }
    const scopeFilter = await this.dataScope.buildOrgScopeFilter(ctx);
    const leads = await this.prisma.lead.findMany({
      where: {
        tenantId: ctx.tenantId,
        id: { in: input.ids },
        ...scopeFilter
      }
    });
    if (leads.length !== input.ids.length) {
      const found = new Set(leads.map((lead) => lead.id));
      const missing = input.ids.filter((id) => !found.has(id));
      throw notFound(this.i18n, ctx.locale, "LEAD_BULK_NOT_FOUND", "lead.bulk.not_found", {
        ids: missing.join(", ")
      });
    }
    if (input.dryRun) {
      for (const lead of leads) {
        assertTransition("Lead", lead.status, input.status, ({ entity, from, to }) =>
          badRequest(
            this.i18n,
            ctx.locale,
            "LEAD_STATUS_TRANSITION_INVALID",
            "lead.status.transition_invalid",
            { entity, from, to }
          )
        );
        if (input.status === "CONVERTED") {
          const accountId = input.accountId ?? lead.accountId;
          const contactId = input.contactId ?? lead.contactId;
          if (!accountId && !contactId) {
            throw badRequest(
              this.i18n,
              ctx.locale,
              "LEAD_CONVERT_MISSING_ACCOUNT_CONTACT",
              "lead.convert.missing_account_contact"
            );
          }
        }
      }
      return { updated: leads.length, ids: leads.map((lead) => lead.id) };
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      const results = [];
      for (const lead of leads) {
        assertTransition("Lead", lead.status, input.status, ({ entity, from, to }) =>
          badRequest(
            this.i18n,
            ctx.locale,
            "LEAD_STATUS_TRANSITION_INVALID",
            "lead.status.transition_invalid",
            { entity, from, to }
          )
        );
        if (input.status === "CONVERTED") {
          const accountId = input.accountId ?? lead.accountId;
          const contactId = input.contactId ?? lead.contactId;
          if (!accountId && !contactId) {
            throw badRequest(
              this.i18n,
              ctx.locale,
              "LEAD_CONVERT_MISSING_ACCOUNT_CONTACT",
              "lead.convert.missing_account_contact"
            );
          }
        }
        const row = await tx.lead.update({
          where: { id: lead.id },
          data: {
            status: input.status,
            accountId: input.accountId ?? undefined,
            contactId: input.contactId ?? undefined
          }
        });
        results.push(row);
      }
      return results;
    });
    for (const lead of updated) {
      await this.audit.log(ctx, "update", "Lead", lead.id, `Status -> ${input.status}`);
      await this.outbox.enqueue(ctx, "Lead", lead.id, "lead.status.bulk", {
        status: input.status
      });
    }
    return { updated: updated.length, ids: updated.map((lead) => lead.id) };
  }
}
