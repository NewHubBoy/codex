import { api } from "./api";

// 类型定义
export interface Opportunity {
  id: string;
  tenant_id: string;
  org_unit_id: string;
  owner_id: string;
  account_id: string;
  lead_id?: string;
  status: string;
  stage: string;
  name: string;
  amount?: number;
  expected_close_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  account?: { id: string; name: string };
  lead?: { id: string; name: string };
  owner?: { id: string; name: string; email: string };
}

export interface OpportunityListResponse {
  list: Opportunity[];
  total: number;
  page: number;
  pageSize: number;
}

export const opportunities = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    account_id?: string;
    lead_id?: string;
    owner_id?: string;
  }): Promise<OpportunityListResponse> => {
    return api.get("/opportunities", { params });
  },

  get: async (id: string): Promise<Opportunity> => {
    return api.get(`/opportunities/${id}`);
  },

  create: async (body: Partial<Opportunity>): Promise<Opportunity> => {
    return api.post("/opportunities", body);
  },

  update: async (id: string, body: Partial<Opportunity>): Promise<Opportunity> => {
    return api.put(`/opportunities/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/opportunities/${id}`);
  },

  batchStatus: async (
    ids: string[],
    status: string,
    dryRun?: boolean
  ): Promise<{ success: boolean; message: string }> => {
    return api.post("/opportunities/bulk-status", {
      ids,
      status,
      dryRun,
    });
  },

  // 阶段更新（拖拽）
  updateStage: async (
    id: string,
    stage: string
  ): Promise<Opportunity> => {
    return api.patch(`/opportunities/${id}/stage`, { stage });
  },
};
