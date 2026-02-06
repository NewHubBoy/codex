import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import type { ApprovalPayload } from "@crm/shared";
import type { RequestContext } from "../../common/request-context";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";
import type { ListQuery } from "../../common/list-query";
import { parseSort } from "../../common/list-query";
import { ApprovalRulesService } from "./approval-rules.service";
import { assertTransition } from "../../common/status-transitions";

const TASK_STATUS_PENDING = "PENDING";
const TASK_STATUS_WAITING = "WAITING";
const TASK_STATUS_APPROVED = "APPROVED";
const TASK_STATUS_REJECTED = "REJECTED";
const TASK_STATUS_CANCELLED = "CANCELLED";

const NODE_STATUS_PENDING = "PENDING";
const NODE_STATUS_WAITING = "WAITING";
const NODE_STATUS_APPROVED = "APPROVED";
const NODE_STATUS_REJECTED = "REJECTED";
const NODE_STATUS_CANCELLED = "CANCELLED";

const INSTANCE_STATUS_PENDING = "PENDING";
const INSTANCE_STATUS_APPROVED = "APPROVED";
const INSTANCE_STATUS_REJECTED = "REJECTED";
const INSTANCE_STATUS_CANCELLED = "CANCELLED";

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rules: ApprovalRulesService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  async listInstances(
    ctx: RequestContext,
    query: ListQuery,
    filters?: { entityType?: string; entityId?: string }
  ) {
    const orderBy = parseSort(query.sort, ["createdAt", "updatedAt", "status", "entityType"]);
    const where = {
      tenantId: ctx.tenantId,
      status: query.status,
      entityType: filters?.entityType,
      entityId: filters?.entityId
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.approvalInstance.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take
      }),
      this.prisma.approvalInstance.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async getInstance(ctx: RequestContext, id: string) {
    const instance = await this.prisma.approvalInstance.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: { nodes: { include: { tasks: true } }, logs: true, rule: true }
    });
    if (!instance) {
      throw new NotFoundException("Approval instance not found");
    }
    return instance;
  }

  async listTasks(
    ctx: RequestContext,
    query: ListQuery,
    filters?: { entityType?: string; entityId?: string; roleCode?: string }
  ) {
    if (!ctx.userId) {
      throw new BadRequestException("Missing user context");
    }
    const roleCodes = await this.getUserRoleCodes(ctx.userId);
    const filteredRoleCodes = filters?.roleCode
      ? roleCodes.filter((code) => code === filters.roleCode)
      : roleCodes;
    if (!filteredRoleCodes.length) {
      return { data: [], page: query.page, pageSize: query.pageSize, total: 0 };
    }
    const orderBy = parseSort(query.sort, ["createdAt", "status"], "createdAt");
    const where = {
      status: query.status,
      roleCode: { in: filteredRoleCodes },
      instance: {
        tenantId: ctx.tenantId,
        entityType: filters?.entityType,
        entityId: filters?.entityId
      }
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.approvalTask.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.take,
        include: { instance: true, node: true }
      }),
      this.prisma.approvalTask.count({ where })
    ]);
    return {
      data,
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  }

  async approveTask(ctx: RequestContext, taskId: string, note?: string) {
    if (!ctx.userId) {
      throw new BadRequestException("Missing user context");
    }
    const task = await this.prisma.approvalTask.findFirst({
      where: { id: taskId, instance: { tenantId: ctx.tenantId } },
      include: { instance: true, node: true }
    });
    if (!task) {
      throw new NotFoundException("Approval task not found");
    }
    if (task.status !== TASK_STATUS_PENDING) {
      throw new BadRequestException("Task is not pending");
    }
    if (task.node.status !== NODE_STATUS_PENDING) {
      throw new BadRequestException("Approval node is not active");
    }
    if (task.instance.status !== INSTANCE_STATUS_PENDING) {
      throw new BadRequestException("Approval instance is not active");
    }
    if (task.assigneeId && task.assigneeId !== ctx.userId) {
      throw new ForbiddenException("Task already claimed by another approver");
    }
    const roleCodes = await this.getUserRoleCodes(ctx.userId);
    if (!roleCodes.includes(task.roleCode)) {
      throw new ForbiddenException("You do not have permission to approve this task");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const decidedAt = new Date();
      await tx.approvalTask.update({
        where: { id: taskId },
        data: {
          status: TASK_STATUS_APPROVED,
          assigneeId: ctx.userId,
          decidedAt,
          note: note ?? undefined
        }
      });
      await tx.approvalLog.create({
        data: {
          instanceId: task.instanceId,
          actorId: ctx.userId,
          action: "task.approved",
          note
        }
      });

      const remaining = await tx.approvalTask.count({
        where: {
          nodeId: task.nodeId,
          status: { not: TASK_STATUS_APPROVED }
        }
      });
      let instanceStatus: string | null = null;
      if (remaining === 0) {
        await tx.approvalNode.update({
          where: { id: task.nodeId },
          data: { status: NODE_STATUS_APPROVED, decidedAt }
        });

        const nextNode = await tx.approvalNode.findFirst({
          where: {
            instanceId: task.instanceId,
            groupIndex: { gt: task.node.groupIndex }
          },
          orderBy: { groupIndex: "asc" }
        });

        if (nextNode) {
          await tx.approvalNode.update({
            where: { id: nextNode.id },
            data: { status: NODE_STATUS_PENDING, startedAt: decidedAt }
          });
          await tx.approvalTask.updateMany({
            where: { nodeId: nextNode.id },
            data: { status: TASK_STATUS_PENDING }
          });
          await tx.approvalInstance.update({
            where: { id: task.instanceId },
            data: { currentGroup: nextNode.groupIndex }
          });
        } else {
          instanceStatus = INSTANCE_STATUS_APPROVED;
          await tx.approvalInstance.update({
            where: { id: task.instanceId },
            data: { status: INSTANCE_STATUS_APPROVED }
          });
          await tx.approvalLog.create({
            data: {
              instanceId: task.instanceId,
              actorId: ctx.userId,
              action: "instance.approved"
            }
          });
        }
      }
      return { instanceStatus };
    });

    if (result.instanceStatus === INSTANCE_STATUS_APPROVED) {
      await this.applyApprovalResult(ctx, task.instance.entityType, task.instance.entityId, true);
    }

    await this.audit.log(ctx, "update", "ApprovalTask", taskId, "Approved task");
    await this.outbox.enqueue(ctx, "ApprovalTask", taskId, "approval.task.approved", {
      instanceId: task.instanceId
    });

    return this.getInstance(ctx, task.instanceId);
  }

  async rejectTask(ctx: RequestContext, taskId: string, note?: string) {
    if (!ctx.userId) {
      throw new BadRequestException("Missing user context");
    }
    const task = await this.prisma.approvalTask.findFirst({
      where: { id: taskId, instance: { tenantId: ctx.tenantId } },
      include: { instance: true, node: true }
    });
    if (!task) {
      throw new NotFoundException("Approval task not found");
    }
    if (task.status !== TASK_STATUS_PENDING) {
      throw new BadRequestException("Task is not pending");
    }
    if (task.node.status !== NODE_STATUS_PENDING) {
      throw new BadRequestException("Approval node is not active");
    }
    if (task.instance.status !== INSTANCE_STATUS_PENDING) {
      throw new BadRequestException("Approval instance is not active");
    }
    if (task.assigneeId && task.assigneeId !== ctx.userId) {
      throw new ForbiddenException("Task already claimed by another approver");
    }
    const roleCodes = await this.getUserRoleCodes(ctx.userId);
    if (!roleCodes.includes(task.roleCode)) {
      throw new ForbiddenException("You do not have permission to reject this task");
    }

    await this.prisma.$transaction(async (tx) => {
      const decidedAt = new Date();
      await tx.approvalTask.update({
        where: { id: taskId },
        data: {
          status: TASK_STATUS_REJECTED,
          assigneeId: ctx.userId,
          decidedAt,
          note: note ?? undefined
        }
      });
      await tx.approvalNode.update({
        where: { id: task.nodeId },
        data: { status: NODE_STATUS_REJECTED, decidedAt }
      });
      await tx.approvalTask.updateMany({
        where: { instanceId: task.instanceId, status: { in: [TASK_STATUS_PENDING, TASK_STATUS_WAITING] } },
        data: { status: TASK_STATUS_CANCELLED }
      });
      await tx.approvalNode.updateMany({
        where: { instanceId: task.instanceId, status: { in: [NODE_STATUS_PENDING, NODE_STATUS_WAITING] } },
        data: { status: NODE_STATUS_CANCELLED, decidedAt }
      });
      await tx.approvalInstance.update({
        where: { id: task.instanceId },
        data: { status: INSTANCE_STATUS_REJECTED }
      });
      await tx.approvalLog.create({
        data: {
          instanceId: task.instanceId,
          actorId: ctx.userId,
          action: "instance.rejected",
          note
        }
      });
    });

    await this.applyApprovalResult(ctx, task.instance.entityType, task.instance.entityId, false);

    await this.audit.log(ctx, "update", "ApprovalTask", taskId, "Rejected task");
    await this.outbox.enqueue(ctx, "ApprovalTask", taskId, "approval.task.rejected", {
      instanceId: task.instanceId
    });

    return this.getInstance(ctx, task.instanceId);
  }

  async createApprovalForEntity(
    ctx: RequestContext,
    entityType: string,
    entityId: string,
    payload?: ApprovalPayload
  ) {
    const existing = await this.prisma.approvalInstance.findFirst({
      where: {
        tenantId: ctx.tenantId,
        entityType,
        entityId,
        status: INSTANCE_STATUS_PENDING
      }
    });
    if (existing) {
      throw new BadRequestException("Approval already in progress");
    }
    const matched = await this.rules.matchRule(ctx, entityType, payload ?? {});
    if (!matched) {
      throw new BadRequestException("No approval rule matched");
    }
    const steps = matched.steps;
    const grouped = new Map<number, typeof steps>();
    steps.forEach((step) => {
      const list = grouped.get(step.groupIndex) ?? [];
      list.push(step);
      grouped.set(step.groupIndex, list);
    });
    const groupIndexes = Array.from(grouped.keys()).sort((a, b) => a - b);
    if (!groupIndexes.length) {
      throw new BadRequestException("Approval rule has no steps");
    }
    const firstGroup = groupIndexes[0];

    const instance = await this.prisma.$transaction(async (tx) => {
      const created = await tx.approvalInstance.create({
        data: {
          tenantId: ctx.tenantId,
          entityType,
          entityId,
          ruleId: matched.rule.id,
          status: INSTANCE_STATUS_PENDING,
          currentGroup: firstGroup,
          payload: payload ?? undefined,
          createdBy: ctx.userId ?? undefined
        }
      });

      for (const groupIndex of groupIndexes) {
        const nodeStatus = groupIndex === firstGroup ? NODE_STATUS_PENDING : NODE_STATUS_WAITING;
        const node = await tx.approvalNode.create({
          data: {
            instanceId: created.id,
            groupIndex,
            status: nodeStatus,
            startedAt: groupIndex === firstGroup ? new Date() : undefined
          }
        });
        const stepsForGroup = grouped.get(groupIndex) ?? [];
        await tx.approvalTask.createMany({
          data: stepsForGroup.map((step) => ({
            instanceId: created.id,
            nodeId: node.id,
            roleCode: step.roleCode,
            status: groupIndex === firstGroup ? TASK_STATUS_PENDING : TASK_STATUS_WAITING
          }))
        });
      }

      await tx.approvalLog.create({
        data: {
          instanceId: created.id,
          actorId: ctx.userId ?? undefined,
          action: "instance.created"
        }
      });

      return created;
    });

    await this.audit.log(ctx, "create", "ApprovalInstance", instance.id, "Created approval instance");
    await this.outbox.enqueue(ctx, "ApprovalInstance", instance.id, "approval.instance.created", {
      entityType,
      entityId
    });

    return this.getInstance(ctx, instance.id);
  }

  private async getUserRoleCodes(userId: string) {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true }
    });
    return roles.map((assignment) => assignment.role.code);
  }

  private async applyApprovalResult(
    ctx: RequestContext,
    entityType: string,
    entityId: string,
    approved: boolean
  ) {
    if (entityType === "Quote") {
      const quote = await this.prisma.quote.findFirst({
        where: { id: entityId, tenantId: ctx.tenantId }
      });
      if (!quote) {
        return;
      }
      const nextStatus = approved ? "APPROVED" : "REJECTED";
      assertTransition("Quote", quote.status, nextStatus);
      await this.prisma.quote.update({
        where: { id: quote.id },
        data: { status: nextStatus }
      });
    }
  }
}
