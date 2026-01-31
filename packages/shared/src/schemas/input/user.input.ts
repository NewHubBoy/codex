import { z } from "zod";

const UserStatusSchema = z.enum(["ACTIVE", "INACTIVE", "INVITED"]);

export const CreateUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  status: UserStatusSchema.optional()
});

export const UpdateUserInputSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().min(1).optional(),
    password: z.string().min(8).optional(),
    status: UserStatusSchema.optional()
  })
  .partial();

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
