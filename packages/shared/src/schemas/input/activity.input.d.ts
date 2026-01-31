import { z } from "zod";
export declare const CreateActivityInputSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    relatedType: z.ZodOptional<z.ZodString>;
    relatedId: z.ZodOptional<z.ZodString>;
    dueAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    outcome: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: string | undefined;
    subject?: string | undefined;
    relatedType?: string | undefined;
    relatedId?: string | undefined;
    dueAt?: string | undefined;
    completedAt?: string | undefined;
    outcome?: string | undefined;
}, {
    type?: string | undefined;
    subject?: string | undefined;
    relatedType?: string | undefined;
    relatedId?: string | undefined;
    dueAt?: string | undefined;
    completedAt?: string | undefined;
    outcome?: string | undefined;
}>;
export declare const UpdateActivityInputSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    subject: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    relatedType: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    relatedId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    dueAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    completedAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    outcome: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type?: string | undefined;
    subject?: string | undefined;
    relatedType?: string | undefined;
    relatedId?: string | undefined;
    dueAt?: string | undefined;
    completedAt?: string | undefined;
    outcome?: string | undefined;
}, {
    type?: string | undefined;
    subject?: string | undefined;
    relatedType?: string | undefined;
    relatedId?: string | undefined;
    dueAt?: string | undefined;
    completedAt?: string | undefined;
    outcome?: string | undefined;
}>;
export type CreateActivityInput = z.infer<typeof CreateActivityInputSchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivityInputSchema>;
