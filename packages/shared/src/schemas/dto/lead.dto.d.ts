import { z } from "zod";
export declare const LeadDTOSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    orgUnitId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ownerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    name: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodString>;
    expectedValue: z.ZodOptional<z.ZodNumber>;
    accountId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contactId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    rating?: string | undefined;
    accountId?: string | null | undefined;
    source?: string | undefined;
    expectedValue?: number | undefined;
    contactId?: string | null | undefined;
    description?: string | undefined;
}, {
    id: string;
    tenantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    orgUnitId?: string | null | undefined;
    ownerId?: string | null | undefined;
    rating?: string | undefined;
    accountId?: string | null | undefined;
    source?: string | undefined;
    expectedValue?: number | undefined;
    contactId?: string | null | undefined;
    description?: string | undefined;
}>;
export type LeadDTO = z.infer<typeof LeadDTOSchema>;
