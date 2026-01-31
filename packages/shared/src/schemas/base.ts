import { z } from "zod";

export const IdSchema = z.string().min(1);
export const DateTimeSchema = z.string().datetime();

export const BaseEntitySchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  orgUnitId: IdSchema.nullish(),
  ownerId: IdSchema.nullish(),
  status: z.string(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema
});
