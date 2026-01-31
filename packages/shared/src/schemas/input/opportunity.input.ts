import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../base";

export const CreateOpportunityInputSchema = z.object({
  name: z.string().min(1),
  stage: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  status: z.string().optional(),
  expectedCloseDate: DateTimeSchema.optional(),
  probability: z.number().optional(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish(),
  leadId: IdSchema.nullish(),
  reasonLost: z.string().optional()
});

export const UpdateOpportunityInputSchema = CreateOpportunityInputSchema.partial();

export type CreateOpportunityInput = z.infer<typeof CreateOpportunityInputSchema>;
export type UpdateOpportunityInput = z.infer<typeof UpdateOpportunityInputSchema>;
