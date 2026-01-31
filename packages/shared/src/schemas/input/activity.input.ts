import { z } from "zod";
import { DateTimeSchema } from "../base";

export const CreateActivityInputSchema = z.object({
  type: z.string().optional(),
  subject: z.string().optional(),
  relatedType: z.string().optional(),
  relatedId: z.string().optional(),
  dueAt: DateTimeSchema.optional(),
  completedAt: DateTimeSchema.optional(),
  outcome: z.string().optional()
});

export const UpdateActivityInputSchema = CreateActivityInputSchema.partial();

export type CreateActivityInput = z.infer<typeof CreateActivityInputSchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivityInputSchema>;
