import { z } from "zod";

export const AlertSettingScopeSchema = z.enum(["TENANT", "ORG_UNIT", "USER"]);

export const UpdateAlertSettingInputSchema = z
  .object({
    scopeType: AlertSettingScopeSchema,
    inactiveDays: z.number().int().min(1).max(365).optional(),
    staleDays: z.number().int().min(1).max(365).optional()
  })
  .refine((data) => data.inactiveDays !== undefined || data.staleDays !== undefined, {
    message: "inactiveDays or staleDays is required."
  });

export type UpdateAlertSettingInput = z.infer<typeof UpdateAlertSettingInputSchema>;
