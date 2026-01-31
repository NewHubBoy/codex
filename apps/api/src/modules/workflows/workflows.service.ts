import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateProcessDefinitionInput,
  CreateProcessStateInput,
  CreateProcessTransitionInput,
  UpdateProcessDefinitionInput
} from "@crm/shared";
import type { RequestContext } from "../../common/request-context";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/services/audit-log.service";
import { OutboxService } from "../../common/services/outbox.service";

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService
  ) {}

  async list(ctx: RequestContext) {
    return this.prisma.processDefinition.findMany({
      where: { tenantId: ctx.tenantId },
      include: { states: true, transitions: true }
    });
  }

  async get(ctx: RequestContext, id: string) {
    const workflow = await this.prisma.processDefinition.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: { states: true, transitions: true }
    });
    if (!workflow) {
      throw new NotFoundException("Workflow not found");
    }
    return workflow;
  }

  async create(ctx: RequestContext, input: CreateProcessDefinitionInput) {
    const workflow = await this.prisma.processDefinition.create({
      data: {
        tenantId: ctx.tenantId,
        entityType: input.entityType,
        name: input.name,
        isActive: input.isActive ?? true
      }
    });
    await this.audit.log(ctx, "create", "ProcessDefinition", workflow.id, `Created ${workflow.name}`);
    await this.outbox.enqueue(ctx, "ProcessDefinition", workflow.id, "workflow.created", {
      entityType: workflow.entityType
    });
    return workflow;
  }

  async update(ctx: RequestContext, id: string, input: UpdateProcessDefinitionInput) {
    await this.get(ctx, id);
    const workflow = await this.prisma.processDefinition.update({
      where: { id },
      data: {
        entityType: input.entityType,
        name: input.name,
        isActive: input.isActive
      }
    });
    await this.audit.log(ctx, "update", "ProcessDefinition", workflow.id, `Updated ${workflow.name}`);
    await this.outbox.enqueue(ctx, "ProcessDefinition", workflow.id, "workflow.updated", {
      entityType: workflow.entityType
    });
    return workflow;
  }

  async addState(ctx: RequestContext, workflowId: string, input: CreateProcessStateInput) {
    await this.get(ctx, workflowId);
    const state = await this.prisma.processState.create({
      data: {
        processId: workflowId,
        stateKey: input.stateKey,
        displayName: input.displayName,
        category: input.category,
        sortOrder: input.sortOrder ?? 0
      }
    });
    await this.audit.log(ctx, "create", "ProcessState", state.id, `Created ${state.stateKey}`);
    await this.outbox.enqueue(ctx, "ProcessDefinition", workflowId, "workflow.state.created", {
      stateKey: state.stateKey
    });
    return state;
  }

  async addTransition(ctx: RequestContext, workflowId: string, input: CreateProcessTransitionInput) {
    await this.get(ctx, workflowId);
    const transition = await this.prisma.processTransition.create({
      data: {
        processId: workflowId,
        fromState: input.fromState,
        toState: input.toState,
        conditionExpr: input.conditionExpr,
        requiredRoles: input.requiredRoles
      }
    });
    await this.audit.log(
      ctx,
      "create",
      "ProcessTransition",
      transition.id,
      `${transition.fromState} -> ${transition.toState}`
    );
    await this.outbox.enqueue(ctx, "ProcessDefinition", workflowId, "workflow.transition.created", {
      fromState: transition.fromState,
      toState: transition.toState
    });
    return transition;
  }
}
