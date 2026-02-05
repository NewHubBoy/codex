import { z } from "zod";
import { DateTimeSchema } from "../base";

const ApprovalEntityTypeSchema = z.enum(["Quote", "Order"]);
const ApprovalOperatorSchema = z.enum(["EQ", "NEQ", "GT", "GTE", "LT", "LTE", "IN", "NOT_IN"]);
const ApprovalFieldSchema = z.enum(["discountRate", "amount", "isCustom", "hasSpecialTerms"]);

const ApprovalValueSchema = z.union([
  z.number(),
  z.boolean(),
  z.string(),
  z.array(z.union([z.number(), z.boolean(), z.string()]))
]);

export const ApprovalRuleConditionInputSchema = z.object({
  field: ApprovalFieldSchema,
  operator: ApprovalOperatorSchema,
  value: ApprovalValueSchema
});

export const ApprovalRuleStepInputSchema = z.object({
  roleCode: z.string().min(1),
  groupIndex: z.number().int().nonnegative().optional(),
  sortOrder: z.number().int().nonnegative().optional()
});

export const CreateApprovalRuleInputSchema = z.object({
  name: z.string().min(1),
  entityType: ApprovalEntityTypeSchema,
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
  effectiveFrom: DateTimeSchema.optional(),
  effectiveTo: DateTimeSchema.optional(),
  conditions: z.array(ApprovalRuleConditionInputSchema).default([]),
  steps: z.array(ApprovalRuleStepInputSchema).min(1)
});

export const UpdateApprovalRuleInputSchema = CreateApprovalRuleInputSchema.partial();

export const TestApprovalRuleInputSchema = z.object({
  entityType: ApprovalEntityTypeSchema,
  payload: z.object({
    discountRate: z.number().optional(),
    amount: z.number().optional(),
    isCustom: z.boolean().optional(),
    hasSpecialTerms: z.boolean().optional()
  })
});

export type ApprovalRuleConditionInput = z.infer<typeof ApprovalRuleConditionInputSchema>;
export type ApprovalRuleStepInput = z.infer<typeof ApprovalRuleStepInputSchema>;
export type CreateApprovalRuleInput = z.infer<typeof CreateApprovalRuleInputSchema>;
export type UpdateApprovalRuleInput = z.infer<typeof UpdateApprovalRuleInputSchema>;
export type TestApprovalRuleInput = z.infer<typeof TestApprovalRuleInputSchema>;
