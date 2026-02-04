import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../base";
import { OPPORTUNITY_STATUSES } from "../../statuses";

const OpportunityStatusSchema = z.enum(OPPORTUNITY_STATUSES);

export const CreateOpportunityInputSchema = z.object({
  name: z.string().min(1),
  stage: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  status: OpportunityStatusSchema.optional(),
  expectedCloseDate: DateTimeSchema.optional(),
  probability: z.number().optional(),
  accountId: IdSchema,
  contactId: IdSchema.nullish(),
  leadId: IdSchema.nullish(),
  reasonLost: z.string().optional()
});

export const UpdateOpportunityInputSchema = CreateOpportunityInputSchema.partial();

export type CreateOpportunityInput = z.infer<typeof CreateOpportunityInputSchema>;
export type UpdateOpportunityInput = z.infer<typeof UpdateOpportunityInputSchema>;
