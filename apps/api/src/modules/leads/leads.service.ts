import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
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
    const shouldConvert = input.status === "QUALIFIED" || input.status === "CONVERTED";
    const leadData = {
      tenantId: ctx.tenantId,
      orgUnitId: ctx.orgUnitId,
      ownerId: ctx.userId,
      status: input.status ?? undefined,
      name: input.name,
      source: input.source,
      rating: input.rating,
      expectedValue: input.expectedValue,
      contactName: input.contactName,
      companyName: input.companyName,
      phone: input.phone,
      email: input.email,
      initialNeed: input.initialNeed,
      firstFollowUpDueAt: input.firstFollowUpDueAt
        ? new Date(input.firstFollowUpDueAt)
        : undefined,
      disqualifyReason: input.disqualifyReason,
      disqualifyNote: input.disqualifyNote,
      accountId: input.accountId ?? undefined,
      contactId: input.contactId ?? undefined,
      description: input.description
    };
    if (shouldConvert) {
      const { lead: convertedLead, account, contact, opportunity } =
        await this.prisma.$transaction(async (tx) => {
          const createdLead = await tx.lead.create({ data: leadData });
          return this.convertLead(ctx, createdLead, input, tx);
        });
      await this.audit.log(ctx, "create", "Lead", convertedLead.id, `Created ${convertedLead.name}`);
      await this.outbox.enqueue(ctx, "Lead", convertedLead.id, "lead.created", {
        name: convertedLead.name
      });
      if (account) {
        await this.audit.log(ctx, "create", "Account", account.id, `Created ${account.name}`);
        await this.outbox.enqueue(ctx, "Account", account.id, "account.created", {
          name: account.name
        });
      }
      if (contact) {
        await this.audit.log(ctx, "create", "Contact", contact.id, `Created ${contact.name}`);
        await this.outbox.enqueue(ctx, "Contact", contact.id, "contact.created", {
          name: contact.name
        });
      }
      await this.audit.log(
        ctx,
        "create",
        "Opportunity",
        opportunity.id,
        `Created ${opportunity.name}`
      );
      await this.outbox.enqueue(ctx, "Opportunity", opportunity.id, "opportunity.created", {
        name: opportunity.name
      });
      return convertedLead;
    }
    const lead = await this.prisma.lead.create({ data: leadData });
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
      // 支持名称模糊搜索
      qFilters.push({ name: { contains: query.q, mode: "insensitive" as const } });
    }
    if (serialId !== undefined) {
      // 支持按编号精确搜索
      qFilters.push({ serialId });
    }
    const statusFilter = query.status ?? { not: "DRAFT" };
    const now = new Date();
    const terminalStatuses = ["CONVERTED", "DISQUALIFIED", "DRAFT"];
    const andFilters: Record<string, unknown>[] = [];
    if (query.overdueFirstFollowUp) {
      // 首次跟进超时：到期且还未产生任何跟进记录
      andFilters.push({
        firstFollowUpDueAt: { lt: now },
        lastActivityAt: null,
        status: { notIn: terminalStatuses }
      });
    }
    if (query.overdueNextFollowUp) {
      // 下次跟进超时：已设置下次跟进时间但已过期
      andFilters.push({
        nextFollowUpAt: { lt: now },
        status: { notIn: terminalStatuses }
      });
    }
    if (query.inactiveDays) {
      const cutoff = new Date(now.getTime() - query.inactiveDays * 24 * 60 * 60 * 1000);
      // 停滞：最后跟进时间或创建时间早于阈值
      andFilters.push({
        status: { notIn: terminalStatuses },
        OR: [
          { lastActivityAt: { lt: cutoff } },
          { lastActivityAt: null, createdAt: { lt: cutoff } }
        ]
      });
    }
    const where = {
      tenantId: ctx.tenantId,
      ...scopeFilter,
      status: statusFilter,
      ownerId: query.ownerId,
      orgUnitId: query.orgUnitId,
      ...(qFilters.length ? { OR: qFilters } : {}),
      ...(andFilters.length ? { AND: andFilters } : {})
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
    }
    if (input.status === "QUALIFIED" || input.status === "CONVERTED") {
      // 进入 QUALIFIED/CONVERTED 时执行转化逻辑，并确保幂等
      const { lead, account, contact, opportunity } =
        await this.prisma.$transaction(async (tx) =>
          this.convertLead(ctx, existing, input, tx)
        );
      await this.audit.log(ctx, "update", "Lead", lead.id, `Updated ${lead.name}`);
      await this.outbox.enqueue(ctx, "Lead", lead.id, "lead.updated", { name: lead.name });
      if (account) {
        await this.audit.log(ctx, "create", "Account", account.id, `Created ${account.name}`);
        await this.outbox.enqueue(ctx, "Account", account.id, "account.created", {
          name: account.name
        });
      }
      if (contact) {
        await this.audit.log(ctx, "create", "Contact", contact.id, `Created ${contact.name}`);
        await this.outbox.enqueue(ctx, "Contact", contact.id, "contact.created", {
          name: contact.name
        });
      }
      await this.audit.log(
        ctx,
        "create",
        "Opportunity",
        opportunity.id,
        `Created ${opportunity.name}`
      );
      await this.outbox.enqueue(ctx, "Opportunity", opportunity.id, "opportunity.created", {
        name: opportunity.name
      });
      return lead;
    }
    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        name: input.name,
        source: input.source,
        rating: input.rating,
        expectedValue: input.expectedValue,
        contactName: input.contactName,
        companyName: input.companyName,
        phone: input.phone,
        email: input.email,
        initialNeed: input.initialNeed,
        firstFollowUpDueAt: input.firstFollowUpDueAt
          ? new Date(input.firstFollowUpDueAt)
          : undefined,
        disqualifyReason: input.disqualifyReason ?? undefined,
        disqualifyNote: input.disqualifyNote ?? undefined,
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
    if (status === "QUALIFIED" || status === "CONVERTED") {
      // 草稿提交时也支持转化，保持与更新逻辑一致
      const { lead, account, contact, opportunity } =
        await this.prisma.$transaction(async (tx) =>
          this.convertLead(ctx, existing, { ...input, status }, tx)
        );
      await this.audit.log(ctx, "create", "Lead", lead.id, `Created ${lead.name}`);
      await this.outbox.enqueue(ctx, "Lead", lead.id, "lead.created", { name: lead.name });
      if (account) {
        await this.audit.log(ctx, "create", "Account", account.id, `Created ${account.name}`);
        await this.outbox.enqueue(ctx, "Account", account.id, "account.created", {
          name: account.name
        });
      }
      if (contact) {
        await this.audit.log(ctx, "create", "Contact", contact.id, `Created ${contact.name}`);
        await this.outbox.enqueue(ctx, "Contact", contact.id, "contact.created", {
          name: contact.name
        });
      }
      await this.audit.log(
        ctx,
        "create",
        "Opportunity",
        opportunity.id,
        `Created ${opportunity.name}`
      );
      await this.outbox.enqueue(ctx, "Opportunity", opportunity.id, "opportunity.created", {
        name: opportunity.name
      });
      return lead;
    }
    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        name: input.name,
        source: input.source,
        rating: input.rating,
        expectedValue: input.expectedValue,
        contactName: input.contactName,
        companyName: input.companyName,
        phone: input.phone,
        email: input.email,
        initialNeed: input.initialNeed,
        firstFollowUpDueAt: input.firstFollowUpDueAt
          ? new Date(input.firstFollowUpDueAt)
          : undefined,
        disqualifyReason: input.disqualifyReason,
        disqualifyNote: input.disqualifyNote,
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
        if (input.status === "QUALIFIED" || input.status === "CONVERTED") {
          this.assertLeadConversionReady(ctx, lead, input);
        }
      }
      return { updated: leads.length, ids: leads.map((lead) => lead.id) };
    }
    const conversions: Array<{
      account?: { id: string; name: string };
      contact?: { id: string; name: string };
      opportunity: { id: string; name: string };
    }> = [];
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
        if (input.status === "QUALIFIED" || input.status === "CONVERTED") {
          const conversion = await this.convertLead(ctx, lead, input, tx);
          results.push(conversion.lead);
          conversions.push(conversion);
          continue;
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
    const finalStatus = input.status === "QUALIFIED" ? "CONVERTED" : input.status;
    for (const conversion of conversions) {
      if (conversion.account) {
        await this.audit.log(
          ctx,
          "create",
          "Account",
          conversion.account.id,
          `Created ${conversion.account.name}`
        );
        await this.outbox.enqueue(ctx, "Account", conversion.account.id, "account.created", {
          name: conversion.account.name
        });
      }
      if (conversion.contact) {
        await this.audit.log(
          ctx,
          "create",
          "Contact",
          conversion.contact.id,
          `Created ${conversion.contact.name}`
        );
        await this.outbox.enqueue(ctx, "Contact", conversion.contact.id, "contact.created", {
          name: conversion.contact.name
        });
      }
      await this.audit.log(
        ctx,
        "create",
        "Opportunity",
        conversion.opportunity.id,
        `Created ${conversion.opportunity.name}`
      );
      await this.outbox.enqueue(ctx, "Opportunity", conversion.opportunity.id, "opportunity.created", {
        name: conversion.opportunity.name
      });
    }
    for (const lead of updated) {
      await this.audit.log(ctx, "update", "Lead", lead.id, `Status -> ${finalStatus}`);
      await this.outbox.enqueue(ctx, "Lead", lead.id, "lead.status.bulk", {
        status: finalStatus
      });
    }
    return { updated: updated.length, ids: updated.map((lead) => lead.id) };
  }

  private getLeadSnapshot(existing: Record<string, unknown>, input: Record<string, unknown>) {
    const asString = (value: unknown) => (typeof value === "string" ? value : undefined);
    const asNumber = (value: unknown) =>
      typeof value === "number" ? value : undefined;
    const asDateString = (value: unknown) =>
      typeof value === "string" ? value : undefined;
    const existingFollowUp =
      existing.firstFollowUpDueAt instanceof Date
        ? existing.firstFollowUpDueAt.toISOString()
        : undefined;
    return {
      name: asString(input.name) ?? asString(existing.name),
      contactName: asString(input.contactName) ?? asString(existing.contactName),
      companyName: asString(input.companyName) ?? asString(existing.companyName),
      phone: asString(input.phone) ?? asString(existing.phone),
      email: asString(input.email) ?? asString(existing.email),
      source: asString(input.source) ?? asString(existing.source),
      initialNeed: asString(input.initialNeed) ?? asString(existing.initialNeed),
      expectedValue: asNumber(input.expectedValue) ?? asNumber(existing.expectedValue),
      firstFollowUpDueAt:
        asDateString(input.firstFollowUpDueAt) ?? existingFollowUp,
      accountId: asString(input.accountId) ?? asString(existing.accountId),
      contactId: asString(input.contactId) ?? asString(existing.contactId)
    };
  }

  private assertLeadConversionReady(
    ctx: RequestContext,
    existing: Record<string, unknown>,
    input: Record<string, unknown>
  ) {
    const snapshot = this.getLeadSnapshot(existing, input);
    // 转化前的最小校验：客户、联系人、联系方式、来源、首响时间
    const missing = [];
    if (!snapshot.companyName && !snapshot.accountId) {
      missing.push("companyName");
    }
    if (!snapshot.contactName && !snapshot.contactId) {
      missing.push("contactName");
    }
    if (!snapshot.phone && !snapshot.email && !snapshot.contactId) {
      missing.push("phone/email");
    }
    if (!snapshot.source) {
      missing.push("source");
    }
    if (!snapshot.firstFollowUpDueAt) {
      missing.push("firstFollowUpDueAt");
    }
    if (missing.length) {
      throw badRequest(
        this.i18n,
        ctx.locale,
        "LEAD_CONVERT_MISSING_FIELDS",
        "lead.convert.missing_fields",
        { fields: missing.join(", ") }
      );
    }
    const bantScore = [
      snapshot.initialNeed,
      snapshot.expectedValue !== undefined ? "yes" : undefined,
      snapshot.contactName ?? snapshot.contactId,
      snapshot.firstFollowUpDueAt
    ].filter(Boolean).length;
    // 轻量 BANT 规则：满足 2 项以上才允许转化
    if (bantScore < 2) {
      throw badRequest(
        this.i18n,
        ctx.locale,
        "LEAD_CONVERT_BANT_INSUFFICIENT",
        "lead.convert.bant_insufficient"
      );
    }
  }

  private async convertLead(
    ctx: RequestContext,
    existing: Record<string, unknown>,
    input: Record<string, unknown>,
    tx: Prisma.TransactionClient | PrismaService = this.prisma
  ) {
    const snapshot = this.getLeadSnapshot(existing, input);
    this.assertLeadConversionReady(ctx, existing, input);
    // 如果已存在关联商机则复用，避免重复创建
    const existingOpportunity = await tx.opportunity.findFirst({
      where: {
        tenantId: ctx.tenantId,
        leadId: existing.id as string
      }
    });
    let accountId = snapshot.accountId;
    let contactId = snapshot.contactId;
    let account;
    let contact;
    if (!accountId) {
      account = await tx.account.create({
        data: {
          tenantId: ctx.tenantId,
          orgUnitId: ctx.orgUnitId,
          ownerId: ctx.userId,
          name: snapshot.companyName ?? snapshot.name ?? "Account"
        }
      });
      accountId = account.id;
    }
    if (!contactId) {
      contact = await tx.contact.create({
        data: {
          tenantId: ctx.tenantId,
          orgUnitId: ctx.orgUnitId,
          ownerId: ctx.userId,
          accountId: accountId,
          name: snapshot.contactName ?? "Contact",
          email: snapshot.email,
          phone: snapshot.phone
        }
      });
      contactId = contact.id;
    }
    const opportunity = existingOpportunity
      ? await tx.opportunity.update({
          where: { id: existingOpportunity.id },
          data: {
            accountId: accountId ?? existingOpportunity.accountId ?? undefined,
            contactId: contactId ?? existingOpportunity.contactId ?? undefined,
            amount: snapshot.expectedValue ?? existingOpportunity.amount ?? undefined
          }
        })
      : await tx.opportunity.create({
          data: {
            tenantId: ctx.tenantId,
            orgUnitId: ctx.orgUnitId,
            ownerId: ctx.userId,
            status: "OPEN",
            name: snapshot.name ?? "Opportunity",
            stage: "Qualification",
            amount: snapshot.expectedValue,
            accountId: accountId,
            contactId: contactId ?? undefined,
            leadId: existing.id as string
          }
        });
    const lead = await tx.lead.update({
      where: { id: existing.id as string },
      data: {
        name: input.name as string | undefined,
        source: input.source as string | undefined,
        rating: input.rating as string | undefined,
        expectedValue: input.expectedValue as number | undefined,
        contactName: input.contactName as string | undefined,
        companyName: input.companyName as string | undefined,
        phone: input.phone as string | undefined,
        email: input.email as string | undefined,
        initialNeed: input.initialNeed as string | undefined,
        firstFollowUpDueAt: input.firstFollowUpDueAt
          ? new Date(input.firstFollowUpDueAt as string)
          : undefined,
        disqualifyReason: input.disqualifyReason as string | undefined,
        disqualifyNote: input.disqualifyNote as string | undefined,
        accountId: accountId ?? undefined,
        contactId: contactId ?? undefined,
        description: input.description as string | undefined,
        status: "CONVERTED"
      }
    });
    return { lead, account, contact, opportunity };
  }
}
