import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../base";

export const ApprovalRuleDTOSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  entityType: z.string(),
  name: z.string(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
  effectiveFrom: DateTimeSchema.optional(),
  effectiveTo: DateTimeSchema.optional(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema
});

export const ApprovalInstanceDTOSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  entityType: z.string(),
  entityId: IdSchema,
  ruleId: IdSchema.nullish(),
  status: z.string(),
  currentGroup: z.number().optional(),
  payload: z.unknown().optional(),
  createdBy: IdSchema.nullish(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema
});

export const ApprovalTaskDTOSchema = z.object({
  id: IdSchema,
  instanceId: IdSchema,
  nodeId: IdSchema,
  roleCode: z.string(),
  status: z.string(),
  assigneeId: IdSchema.nullish(),
  decidedAt: DateTimeSchema.optional(),
  note: z.string().optional(),
  createdAt: DateTimeSchema
});

export type ApprovalRuleDTO = z.infer<typeof ApprovalRuleDTOSchema>;
export type ApprovalInstanceDTO = z.infer<typeof ApprovalInstanceDTOSchema>;
export type ApprovalTaskDTO = z.infer<typeof ApprovalTaskDTOSchema>;
