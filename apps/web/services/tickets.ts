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
    return api.get("/tickets", { params });
  },

  get: async (id: string): Promise<Ticket> => {
    return api.get(`/tickets/${id}`);
  },

  create: async (body: Partial<Ticket>): Promise<Ticket> => {
    return api.post("/tickets", body);
  },

  update: async (id: string, body: Partial<Ticket>): Promise<Ticket> => {
    return api.put(`/tickets/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/tickets/${id}`);
  },

  // 分配
  assign: async (id: string, owner_id: string): Promise<Ticket> => {
    return api.post(`/tickets/${id}/assign`, { owner_id });
  },

  // 解决
  resolve: async (id: string): Promise<Ticket> => {
    return api.post(`/tickets/${id}/resolve`);
  },

  // 关闭
  close: async (id: string): Promise<Ticket> => {
    return api.post(`/tickets/${id}/close`);
  },
};
