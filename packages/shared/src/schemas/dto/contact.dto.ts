import { z } from "zod";
import { BaseEntitySchema, IdSchema } from "../base";

export const ContactDTOSchema = BaseEntitySchema.extend({
  accountId: IdSchema,
  name: z.string().min(1),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  bpId: IdSchema.nullish()
});

export type ContactDTO = z.infer<typeof ContactDTOSchema>;
