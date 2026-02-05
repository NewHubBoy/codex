import { z } from "zod";

export const ApprovalPayloadSchema = z.object({
  discountRate: z.number().optional(),
  amount: z.number().optional(),
  isCustom: z.boolean().optional(),
  hasSpecialTerms: z.boolean().optional(),
  note: z.string().optional()
});

export const SubmitApprovalInputSchema = z.object({
  payload: ApprovalPayloadSchema.optional()
});

export const ResubmitApprovalInputSchema = SubmitApprovalInputSchema;

export const ApproveApprovalTaskInputSchema = z.object({
  note: z.string().optional()
});

export const RejectApprovalTaskInputSchema = z.object({
  note: z.string().optional()
});

export type ApprovalPayload = z.infer<typeof ApprovalPayloadSchema>;
export type SubmitApprovalInput = z.infer<typeof SubmitApprovalInputSchema>;
export type ResubmitApprovalInput = z.infer<typeof ResubmitApprovalInputSchema>;
export type ApproveApprovalTaskInput = z.infer<typeof ApproveApprovalTaskInputSchema>;
export type RejectApprovalTaskInput = z.infer<typeof RejectApprovalTaskInputSchema>;
