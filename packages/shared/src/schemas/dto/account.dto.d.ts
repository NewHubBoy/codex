import { z } from "zod";
export declare const AccountDTOSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    orgUnitId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ownerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    name: z.ZodString;
    type: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodString>;
    lifecycleStatus: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bpId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    type?: string | undefined;
    industry?: string | undefined;
    rating?: string | undefined;
    lifecycleStatus?: string | undefined;
    parentId?: string | null | undefined;
    bpId?: string | null | undefined;
}, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    type?: string | undefined;
    industry?: string | undefined;
    rating?: string | undefined;
    lifecycleStatus?: string | undefined;
    parentId?: string | null | undefined;
    bpId?: string | null | undefined;
}>;
export type AccountDTO = z.infer<typeof AccountDTOSchema>;
