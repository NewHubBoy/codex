import { z } from "zod";
import { BaseEntitySchema, DateTimeSchema, IdSchema } from "../base";

export const LeadDTOSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  source: z.string().optional(),
  rating: z.string().optional(),
  expectedValue: z.number().optional(),
  contactName: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  initialNeed: z.string().optional(),
  firstFollowUpDueAt: DateTimeSchema.optional(),
  lastActivityAt: DateTimeSchema.optional(),
  nextFollowUpAt: DateTimeSchema.optional(),
  disqualifyReason: z.string().optional(),
  disqualifyNote: z.string().optional(),
  accountId: IdSchema.nullish(),
  contactId: IdSchema.nullish(),
  description: z.string().optional()
});

export type LeadDTO = z.infer<typeof LeadDTOSchema>;
