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
    return api.get("/contacts", { params });
  },

  get: async (id: string): Promise<Contact> => {
    return api.get(`/contacts/${id}`);
  },

  create: async (body: Partial<Contact>): Promise<Contact> => {
    return api.post("/contacts", body);
  },

  update: async (id: string, body: Partial<Contact>): Promise<Contact> => {
    return api.put(`/contacts/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/contacts/${id}`);
  },

  batchDelete: async (ids: string[]): Promise<void> => {
    return api.post("/contacts/batch-delete", { ids });
  },
};
