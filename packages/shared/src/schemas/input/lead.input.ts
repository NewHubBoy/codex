import { z } from "zod";
import { IdSchema } from "../base";

export const CreateLeadInputSchema = z.object({
  name: z.string().min(1),
  source: z.string().optional(),
  rating: z.string().optional(),
  status: z.string().optional(),
  expectedValue: z.number().optional(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish(),
  description: z.string().optional()
});

export const UpdateLeadInputSchema = CreateLeadInputSchema.partial();

export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadInputSchema>;
