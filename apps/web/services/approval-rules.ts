import { api } from "./api";
import type {
  CreateApprovalRuleInput,
  UpdateApprovalRuleInput,
  TestApprovalRuleInput
} from "@crm/shared";
import type { PaginatedResponse } from "./types";

export interface ApprovalRuleCondition {
  field: string;
  operator: string;
  value: unknown;
}

export interface ApprovalRuleStep {
  roleCode: string;
  groupIndex?: number;
  sortOrder?: number;
}

export interface ApprovalRule {
  id: string;
  tenantId: string;
  entityType: string;
  name: string;
  priority: number;
  isActive: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  conditions?: ApprovalRuleCondition[];
  steps?: ApprovalRuleStep[];
  createdAt: string;
  updatedAt: string;
}

export type ApprovalRuleListResponse = PaginatedResponse<ApprovalRule>;

export const approvalRules = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    entityType?: string;
    isActive?: boolean;
  }): Promise<ApprovalRuleListResponse> => {
    return api.get("/approval-rules", { params });
  },

  get: async (id: string): Promise<ApprovalRule> => {
    return api.get(`/approval-rules/${id}`);
  },

  create: async (body: CreateApprovalRuleInput): Promise<ApprovalRule> => {
    return api.post("/approval-rules", body);
  },

  update: async (id: string, body: UpdateApprovalRuleInput): Promise<ApprovalRule> => {
    return api.put(`/approval-rules/${id}`, body);
  },

  test: async (body: TestApprovalRuleInput): Promise<{ matched: boolean; rule?: ApprovalRule; steps?: ApprovalRuleStep[] }> => {
    return api.post("/approval-rules/test", body);
  }
};
