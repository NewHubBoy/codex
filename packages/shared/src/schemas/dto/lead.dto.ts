import { z } from "zod";
import { BaseEntitySchema, IdSchema } from "../base";

export const LeadDTOSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  source: z.string().optional(),
  rating: z.string().optional(),
  expectedValue: z.number().optional(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish(),
  description: z.string().optional()
});

export type LeadDTO = z.infer<typeof LeadDTOSchema>;
