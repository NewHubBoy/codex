import { api } from "./api";

// 类型定义
export interface Ticket {
  id: string;
  tenant_id: string;
  org_unit_id: string;
  owner_id: string;
  account_id?: string;
  status: string;
  priority: string;
  code: string;
  title: string;
  description?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  account?: { id: string; name: string };
  owner?: { id: string; name: string; email: string };
}

export interface TicketListResponse {
  list: Ticket[];
  total: number;
  page: number;
  pageSize: number;
}

export const tickets = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    priority?: string;
    account_id?: string;
    owner_id?: string;
  }): Promise<TicketListResponse> => {
    const { data } = await api.get("/tickets", { params });
    return data;
  },

  get: async (id: string): Promise<Ticket> => {
    const { data } = await api.get(`/tickets/${id}`);
    return data;
  },

  create: async (body: Partial<Ticket>): Promise<Ticket> => {
    const { data } = await api.post("/tickets", body);
    return data;
  },

  update: async (id: string, body: Partial<Ticket>): Promise<Ticket> => {
    const { data } = await api.put(`/tickets/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tickets/${id}`);
  },

  // 分配
  assign: async (id: string, owner_id: string): Promise<Ticket> => {
    const { data } = await api.post(`/tickets/${id}/assign`, { owner_id });
    return data;
  },

  // 解决
  resolve: async (id: string): Promise<Ticket> => {
    const { data } = await api.post(`/tickets/${id}/resolve`);
    return data;
  },

  // 关闭
  close: async (id: string): Promise<Ticket> => {
    const { data } = await api.post(`/tickets/${id}/close`);
    return data;
  },
};
