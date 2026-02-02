import { api } from "./api";

// 类型定义
export interface Contact {
  id: string;
  tenant_id: string;
  org_unit_id: string;
  owner_id: string;
  account_id: string;
  status: string;
  name: string;
  job_title?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  account?: { id: string; name: string };
  owner?: { id: string; name: string; email: string };
}

export interface ContactListResponse {
  list: Contact[];
  total: number;
  page: number;
  pageSize: number;
}

export const contacts = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    account_id?: string;
    status?: string;
    owner_id?: string;
  }): Promise<ContactListResponse> => {
    const { data } = await api.get("/contacts", { params });
    return data;
  },

  get: async (id: string): Promise<Contact> => {
    const { data } = await api.get(`/contacts/${id}`);
    return data;
  },

  create: async (body: Partial<Contact>): Promise<Contact> => {
    const { data } = await api.post("/contacts", body);
    return data;
  },

  update: async (id: string, body: Partial<Contact>): Promise<Contact> => {
    const { data } = await api.put(`/contacts/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },

  batchDelete: async (ids: string[]): Promise<void> => {
    await api.post("/contacts/batch-delete", { ids });
  },
};
