import { z } from "zod";
import { IdSchema } from "../base";

export const AddOrgMemberInputSchema = z.object({
  userId: IdSchema,
  roleInOrg: z.string().optional()
});

export type AddOrgMemberInput = z.infer<typeof AddOrgMemberInputSchema>;
