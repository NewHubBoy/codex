import { z } from "zod";
import { BaseEntitySchema, DateTimeSchema } from "../base";

export const ActivityDTOSchema = BaseEntitySchema.extend({
  type: z.string().optional(),
  subject: z.string().optional(),
  content: z.string().optional(),
  relatedType: z.string().optional(),
  relatedId: z.string().optional(),
  dueAt: DateTimeSchema.optional(),
  completedAt: DateTimeSchema.optional(),
  outcome: z.string().optional(),
  nextFollowUpAt: DateTimeSchema.optional()
});

export type ActivityDTO = z.infer<typeof ActivityDTOSchema>;
