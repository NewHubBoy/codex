import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateApprovalRuleInput, TestApprovalRuleInput, UpdateApprovalRuleInput } from "@crm/shared";
import type { RequestContext } from "../../common/request-context";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSort } from "../../common/list-query";

const RULE_FIELDS = ["discountRate", "amount", "isCustom", "hasSpecialTerms"] as const;
const OPERATORS = ["EQ", "NEQ", "GT", "GTE", "LT", "LTE", "IN", "NOT_IN"] as const;

type RuleField = (typeof RULE_FIELDS)[number];
type Operator = (typeof OPERATORS)[number];

type RulePayload = {
  discountRate?: number;
  amount?: number;
  isCustom?: boolean;
  hasSpecialTerms?: boolean;
};

@Injectable()
export class ApprovalRulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  async list(ctx: RequestContext, query: ListQuery, filters?: { entityType?: string; isActive?: boolean }) {
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "priority", "name", "entityType"]);
    const qFilters: Record<string, unknown>[] = [];
    if (query.q) {
      qFilters.push({ name: { contains: query.q, mode: "insensitive" as const } });
    }
    const where = {
      tenantId: ctx.tenantId,
      entityType: filters?.entityType,
      isActive: filters?.isActive,
      ...(qFilters.length ? { OR: qFilters } : {})
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.approvalRule.findMany({
        where,
        orderBy,
        include: { conditions: true, steps: true },
        skip: query.skip,
        take: query.take
      }),
      this.prisma.approvalRule.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async get(ctx: RequestContext, id: string) {
    const rule = await this.prisma.approvalRule.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: { conditions: true, steps: true }
    });
    if (!rule) {
      throw new NotFoundException("Approval rule not found");
    }
    return rule;
  }

  async create(ctx: RequestContext, input: CreateApprovalRuleInput) {
    const rule = await this.prisma.approvalRule.create({
      data: {
        tenantId: ctx.tenantId,
        entityType: input.entityType,
        name: input.name,
        priority: input.priority ?? 0,
        isActive: input.isActive ?? true,
        effectiveFrom: input.effectiveFrom ?? undefined,
        effectiveTo: input.effectiveTo ?? undefined,
        conditions: {
          create: input.conditions.map((condition) => ({
            field: condition.field,
            operator: condition.operator,
            value: condition.value
          }))
        },
        steps: {
          create: input.steps.map((step) => ({
            roleCode: step.roleCode,
            groupIndex: step.groupIndex ?? 0,
            sortOrder: step.sortOrder ?? 0
          }))
        }
      },
      include: { conditions: true, steps: true }
    });
    await this.audit.log(ctx, "create", "ApprovalRule", rule.id, `Created ${rule.name}`);
    await this.outbox.enqueue(ctx, "ApprovalRule", rule.id, "approval.rule.created", {
      entityType: rule.entityType
    });
    return rule;
  }

  async update(ctx: RequestContext, id: string, input: UpdateApprovalRuleInput) {
    await this.get(ctx, id);
    const rule = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.approvalRule.update({
        where: { id },
        data: {
          entityType: input.entityType,
          name: input.name,
          priority: input.priority,
          isActive: input.isActive,
          effectiveFrom: input.effectiveFrom ?? undefined,
          effectiveTo: input.effectiveTo ?? undefined
        }
      });
      if (input.conditions) {
        await tx.approvalRuleCondition.deleteMany({ where: { ruleId: id } });
        if (input.conditions.length) {
          await tx.approvalRuleCondition.createMany({
            data: input.conditions.map((condition) => ({
              ruleId: id,
              field: condition.field,
              operator: condition.operator,
              value: condition.value
            }))
          });
        }
      }
      if (input.steps) {
        await tx.approvalRuleStep.deleteMany({ where: { ruleId: id } });
        if (input.steps.length) {
          await tx.approvalRuleStep.createMany({
            data: input.steps.map((step) => ({
              ruleId: id,
              roleCode: step.roleCode,
              groupIndex: step.groupIndex ?? 0,
              sortOrder: step.sortOrder ?? 0
            }))
          });
        }
      }
      return updated;
    });
    await this.audit.log(ctx, "update", "ApprovalRule", rule.id, `Updated ${rule.name}`);
    await this.outbox.enqueue(ctx, "ApprovalRule", rule.id, "approval.rule.updated", {
      entityType: rule.entityType
    });
    return this.get(ctx, id);
  }

  async test(ctx: RequestContext, input: TestApprovalRuleInput) {
    const match = await this.matchRule(ctx, input.entityType, input.payload);
    if (!match) {
      return { matched: false };
    }
    return {
      matched: true,
      rule: match.rule,
      steps: match.steps
    };
  }

  async matchRule(ctx: RequestContext, entityType: string, payload: RulePayload) {
    const now = new Date();
    const rules = await this.prisma.approvalRule.findMany({
      where: {
        tenantId: ctx.tenantId,
        entityType,
        isActive: true,
        AND: [
          { OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: now } }] },
          { OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }] }
        ]
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: { conditions: true, steps: true }
    });
    for (const rule of rules) {
      const conditions = rule.conditions ?? [];
      const passed = conditions.every((condition) =>
        this.evaluateCondition(condition.field as RuleField, condition.operator as Operator, condition.value, payload)
      );
      if (passed && rule.steps.length) {
        const steps = [...rule.steps].sort((a, b) => {
          if (a.groupIndex !== b.groupIndex) return a.groupIndex - b.groupIndex;
          return a.sortOrder - b.sortOrder;
        });
        return { rule, steps };
      }
    }
    return null;
  }

  private evaluateCondition(
    field: RuleField,
    operator: Operator,
    value: unknown,
    payload: RulePayload
  ) {
    if (!RULE_FIELDS.includes(field)) {
      throw new BadRequestException(`Unsupported condition field: ${field}`);
    }
    if (!OPERATORS.includes(operator)) {
      throw new BadRequestException(`Unsupported operator: ${operator}`);
    }
    const actual = payload[field];
    if (actual === undefined || actual === null) {
      return false;
    }
    switch (operator) {
      case "EQ":
        return actual === value;
      case "NEQ":
        return actual !== value;
      case "GT":
        return Number(actual) > Number(value);
      case "GTE":
        return Number(actual) >= Number(value);
      case "LT":
        return Number(actual) < Number(value);
      case "LTE":
        return Number(actual) <= Number(value);
      case "IN":
        return Array.isArray(value) ? value.includes(actual) : false;
      case "NOT_IN":
        return Array.isArray(value) ? !value.includes(actual) : false;
      default:
        return false;
    }
  }
}
