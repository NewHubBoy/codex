import { z } from "zod";

const PermissionTypeSchema = z.enum(["PAGE", "ACTION", "DATA"]);

export const CreatePermissionInputSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: PermissionTypeSchema.optional(),
  description: z.string().optional()
});

export const UpdatePermissionInputSchema = CreatePermissionInputSchema.partial();

export type CreatePermissionInput = z.infer<typeof CreatePermissionInputSchema>;
export type UpdatePermissionInput = z.infer<typeof UpdatePermissionInputSchema>;
