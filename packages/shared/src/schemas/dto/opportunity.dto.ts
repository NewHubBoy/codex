import { z } from "zod";
import { BaseEntitySchema, DateTimeSchema, IdSchema } from "../base";

export const OpportunityDTOSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  stage: z.string(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  expectedCloseDate: DateTimeSchema.optional(),
  probability: z.number().optional(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish(),
  leadId: IdSchema.nullish(),
  reasonLost: z.string().optional()
});

export type OpportunityDTO = z.infer<typeof OpportunityDTOSchema>;
