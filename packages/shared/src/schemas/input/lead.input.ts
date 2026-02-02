import { z } from "zod";
import { IdSchema } from "../base";
import { LEAD_STATUSES } from "../../statuses";

const LeadStatusSchema = z.enum(LEAD_STATUSES);

export const CreateLeadInputSchema = z.object({
  name: z.string().min(1),
  source: z.string().optional(),
  rating: z.string().optional(),
  status: LeadStatusSchema.optional(),
  expectedValue: z.number().optional(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish(),
  description: z.string().optional()
});

export const UpdateLeadInputSchema = CreateLeadInputSchema.partial();

export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadInputSchema>;
