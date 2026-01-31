import { z } from "zod";
export declare const ActivityDTOSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    orgUnitId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ownerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    type: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    relatedType: z.ZodOptional<z.ZodString>;
    relatedId: z.ZodOptional<z.ZodString>;
    dueAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    outcome: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    type?: string | undefined;
    subject?: string | undefined;
    relatedType?: string | undefined;
    relatedId?: string | undefined;
    dueAt?: string | undefined;
    completedAt?: string | undefined;
    outcome?: string | undefined;
}, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    type?: string | undefined;
    subject?: string | undefined;
    relatedType?: string | undefined;
    relatedId?: string | undefined;
    dueAt?: string | undefined;
    completedAt?: string | undefined;
    outcome?: string | undefined;
}>;
export type ActivityDTO = z.infer<typeof ActivityDTOSchema>;
