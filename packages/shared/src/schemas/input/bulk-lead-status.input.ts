import { z } from "zod";
import { IdSchema } from "../base";
import { LEAD_STATUSES } from "../../statuses";

export const BulkLeadStatusInputSchema = z.object({
  ids: z.array(IdSchema).min(1),
  status: z.enum(LEAD_STATUSES),
  dryRun: z.boolean().optional(),
  accountId: IdSchema.nullish().optional(),
  contactId: IdSchema.nullish().optional()
});

export type BulkLeadStatusInput = z.infer<typeof BulkLeadStatusInputSchema>;
