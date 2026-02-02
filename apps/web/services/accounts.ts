import { api } from "./api";

// 类型定义
export interface Account {
  id: string;
  tenant_id: string;
  org_unit_id: string;
  owner_id: string;
  status: string;
  name: string;
  industry?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  owner?: { id: string; name: string; email: string };
}

export interface AccountListResponse {
  list: Account[];
  total: number;
  page: number;
  pageSize: number;
}

export const accounts = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    owner_id?: string;
  }): Promise<AccountListResponse> => {
    const { data } = await api.get("/accounts", { params });
    return data;
  },

  get: async (id: string): Promise<Account> => {
    const { data } = await api.get(`/accounts/${id}`);
    return data;
  },

  create: async (body: Partial<Account>): Promise<Account> => {
    const { data } = await api.post("/accounts", body);
    return data;
  },

  update: async (id: string, body: Partial<Account>): Promise<Account> => {
    const { data } = await api.put(`/accounts/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },

  batchDelete: async (ids: string[]): Promise<void> => {
    await api.post("/accounts/batch-delete", { ids });
  },
};
