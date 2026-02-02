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
    return api.get("/quotes", { params });
  },

  get: async (id: string): Promise<Quote> => {
    return api.get(`/quotes/${id}`);
  },

  create: async (body: Partial<Quote>): Promise<Quote> => {
    return api.post("/quotes", body);
  },

  update: async (id: string, body: Partial<Quote>): Promise<Quote> => {
    return api.put(`/quotes/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/quotes/${id}`);
  },

  // 发送报价
  send: async (id: string): Promise<Quote> => {
    return api.post(`/quotes/${id}/send`);
  },

  // 审批
  approve: async (id: string): Promise<Quote> => {
    return api.post(`/quotes/${id}/approve`);
  },

  // 拒绝
  reject: async (id: string, reason?: string): Promise<Quote> => {
    return api.post(`/quotes/${id}/reject`, { reason });
  },

  // 转为订单
  convertToOrder: async (id: string): Promise<Quote> => {
    return api.post(`/quotes/${id}/convert`);
  },
};
