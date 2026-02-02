import { z } from "zod";
import { IdSchema } from "../base";
import { TICKET_STATUSES } from "../../statuses";

export const BulkTicketStatusInputSchema = z.object({
  ids: z.array(IdSchema).min(1),
  status: z.enum(TICKET_STATUSES),
  dryRun: z.boolean().optional()
});

export type BulkTicketStatusInput = z.infer<typeof BulkTicketStatusInputSchema>;
