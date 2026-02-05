import { z } from "zod";
import { BaseEntitySchema, DateTimeSchema, IdSchema } from "../base";

export const QuoteDTOSchema = BaseEntitySchema.extend({
  number: z.string().optional(),
  version: z.number().optional(),
  status: z.string(),
  validFrom: DateTimeSchema.optional(),
  validTo: DateTimeSchema.optional(),
  totalAmount: z.number().optional(),
  currency: z.string().optional(),
  discountRate: z.number().optional(),
  isCustom: z.boolean().optional(),
  hasSpecialTerms: z.boolean().optional(),
  opportunityId: IdSchema.nullish(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish()
});

export type QuoteDTO = z.infer<typeof QuoteDTOSchema>;
