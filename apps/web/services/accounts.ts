import type { AccountDTO, CreateAccountInput, UpdateAccountInput } from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

export type Account = AccountDTO & {
  owner?: { id: string; name: string; email: string };
};

export type AccountListResponse = PaginatedResponse<Account>;

export const accounts = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    ownerId?: string;
    orgUnitId?: string;
  }): Promise<AccountListResponse> => {
    return api.get("/accounts", { params });
  },

  get: async (id: string): Promise<Account> => {
    return api.get(`/accounts/${id}`);
  },

  create: async (body: CreateAccountInput): Promise<Account> => {
    return api.post("/accounts", body);
  },

  update: async (id: string, body: UpdateAccountInput): Promise<Account> => {
    return api.patch(`/accounts/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/accounts/${id}`);
  },

  batchDelete: async (ids: string[]): Promise<void> => {
    return api.post("/accounts/batch-delete", { ids });
  },
};
