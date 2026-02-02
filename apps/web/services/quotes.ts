import { api } from "./api";

// 类型定义
export interface Quote {
  id: string;
  tenant_id: string;
  org_unit_id: string;
  owner_id: string;
  account_id: string;
  opportunity_id?: string;
  status: string;
  code: string;
  total_amount?: number;
  valid_until?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  account?: { id: string; name: string };
  opportunity?: { id: string; name: string };
  owner?: { id: string; name: string; email: string };
}

export interface QuoteListResponse {
  list: Quote[];
  total: number;
  page: number;
  pageSize: number;
}

export const quotes = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    account_id?: string;
    opportunity_id?: string;
    owner_id?: string;
  }): Promise<QuoteListResponse> => {
    const { data } = await api.get("/quotes", { params });
    return data;
  },

  get: async (id: string): Promise<Quote> => {
    const { data } = await api.get(`/quotes/${id}`);
    return data;
  },

  create: async (body: Partial<Quote>): Promise<Quote> => {
    const { data } = await api.post("/quotes", body);
    return data;
  },

  update: async (id: string, body: Partial<Quote>): Promise<Quote> => {
    const { data } = await api.put(`/quotes/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/quotes/${id}`);
  },

  // 发送报价
  send: async (id: string): Promise<Quote> => {
    const { data } = await api.post(`/quotes/${id}/send`);
    return data;
  },

  // 审批
  approve: async (id: string): Promise<Quote> => {
    const { data } = await api.post(`/quotes/${id}/approve`);
    return data;
  },

  // 拒绝
  reject: async (id: string, reason?: string): Promise<Quote> => {
    const { data } = await api.post(`/quotes/${id}/reject`, { reason });
    return data;
  },

  // 转为订单
  convertToOrder: async (id: string): Promise<Quote> => {
    const { data } = await api.post(`/quotes/${id}/convert`);
    return data;
  },
};
