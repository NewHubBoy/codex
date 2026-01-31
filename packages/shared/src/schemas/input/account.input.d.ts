import { z } from "zod";
export declare const CreateAccountInputSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodString>;
    lifecycleStatus: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bpId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type?: string | undefined;
    industry?: string | undefined;
    rating?: string | undefined;
    lifecycleStatus?: string | undefined;
    parentId?: string | null | undefined;
    bpId?: string | null | undefined;
}, {
    name: string;
    type?: string | undefined;
    industry?: string | undefined;
    rating?: string | undefined;
    lifecycleStatus?: string | undefined;
    parentId?: string | null | undefined;
    bpId?: string | null | undefined;
}>;
export declare const UpdateAccountInputSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    industry: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    rating: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lifecycleStatus: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    parentId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    bpId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    type?: string | undefined;
    name?: string | undefined;
    industry?: string | undefined;
    rating?: string | undefined;
    lifecycleStatus?: string | undefined;
    parentId?: string | null | undefined;
    bpId?: string | null | undefined;
}, {
    type?: string | undefined;
    name?: string | undefined;
    industry?: string | undefined;
    rating?: string | undefined;
    lifecycleStatus?: string | undefined;
    parentId?: string | null | undefined;
    bpId?: string | null | undefined;
}>;
export type CreateAccountInput = z.infer<typeof CreateAccountInputSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountInputSchema>;
