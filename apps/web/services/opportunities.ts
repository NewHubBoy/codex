import type {
  OpportunityDTO,
  CreateOpportunityInput,
  UpdateOpportunityInput
} from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

export type Opportunity = OpportunityDTO & {
  account?: { id: string; name: string };
  lead?: { id: string; name: string };
  owner?: { id: string; name: string; email: string };
};

export type OpportunityListResponse = PaginatedResponse<Opportunity>;

export const opportunities = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    accountId?: string;
    leadId?: string;
    ownerId?: string;
    orgUnitId?: string;
  }): Promise<OpportunityListResponse> => {
    return api.get("/opportunities", { params });
  },

  get: async (id: string): Promise<Opportunity> => {
    return api.get(`/opportunities/${id}`);
  },

  create: async (body: CreateOpportunityInput): Promise<Opportunity> => {
    return api.post("/opportunities", body);
  },

  update: async (id: string, body: UpdateOpportunityInput): Promise<Opportunity> => {
    return api.patch(`/opportunities/${id}`, body);
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
