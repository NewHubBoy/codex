import { z } from "zod";
import { DateTimeSchema } from "../base";
import { ACTIVITY_STATUSES } from "../../statuses";

const ActivityStatusSchema = z.enum(ACTIVITY_STATUSES);

export const CreateActivityInputSchema = z.object({
  type: z.string().optional(),
  subject: z.string().optional(),
  relatedType: z.string().optional(),
  relatedId: z.string().optional(),
  status: ActivityStatusSchema.optional(),
  dueAt: DateTimeSchema.optional(),
  completedAt: DateTimeSchema.optional(),
  outcome: z.string().optional()
});

export const UpdateActivityInputSchema = CreateActivityInputSchema.partial();

export type CreateActivityInput = z.infer<typeof CreateActivityInputSchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivityInputSchema>;
