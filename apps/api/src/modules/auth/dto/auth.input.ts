import { z } from "zod";

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const RefreshInputSchema = z.object({
  userId: z.string().min(1),
  refreshToken: z.string().min(1)
});

export const SetPasswordInputSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(8)
});

export type LoginInput = z.infer<typeof LoginInputSchema>;
export type RefreshInput = z.infer<typeof RefreshInputSchema>;
export type SetPasswordInput = z.infer<typeof SetPasswordInputSchema>;
