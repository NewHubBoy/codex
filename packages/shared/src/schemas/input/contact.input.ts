import { z } from "zod";
import { IdSchema } from "../base";

export const CreateContactInputSchema = z.object({
  accountId: IdSchema,
  name: z.string().min(1),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  bpId: IdSchema.nullish()
});

export const UpdateContactInputSchema = CreateContactInputSchema.partial();

export type CreateContactInput = z.infer<typeof CreateContactInputSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactInputSchema>;
