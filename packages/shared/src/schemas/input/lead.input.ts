import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../base";
import { LEAD_STATUSES } from "../../statuses";

const LeadStatusSchema = z.enum(LEAD_STATUSES);

const stripNulls = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return value;
  }
  const record = value as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(record)) {
    if (val !== null) {
      cleaned[key] = val;
    }
  }
  return cleaned;
};

const LeadBaseSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().min(1),
  companyName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  source: z.string().min(1),
  initialNeed: z.string().min(1),
  firstFollowUpDueAt: DateTimeSchema,
  rating: z.string().optional(),
  status: LeadStatusSchema.optional(),
  expectedValue: z.number().optional(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish(),
  description: z.string().optional(),
  disqualifyReason: z.string().optional(),
  disqualifyNote: z.string().optional()
});

export const CreateLeadInputSchema = z.preprocess(stripNulls, LeadBaseSchema).superRefine((data, ctx) => {
  if (!data.phone && !data.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: "Either phone or email is required."
    });
  }
});

export const UpdateLeadInputSchema = z.preprocess(stripNulls, LeadBaseSchema.partial());

export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadInputSchema>;
