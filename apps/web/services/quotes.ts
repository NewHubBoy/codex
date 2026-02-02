import type { QuoteDTO, CreateQuoteInput, UpdateQuoteInput } from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

export type Quote = QuoteDTO & {
  account?: { id: string; name: string };
  opportunity?: { id: string; name: string };
  owner?: { id: string; name: string; email: string };
};

export type QuoteListResponse = PaginatedResponse<Quote>;

export const quotes = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    accountId?: string;
    opportunityId?: string;
    ownerId?: string;
    orgUnitId?: string;
  }): Promise<QuoteListResponse> => {
    return api.get("/quotes", { params });
  },

  get: async (id: string): Promise<Quote> => {
    return api.get(`/quotes/${id}`);
  },

  create: async (body: CreateQuoteInput): Promise<Quote> => {
    return api.post("/quotes", body);
  },

  update: async (id: string, body: UpdateQuoteInput): Promise<Quote> => {
    return api.patch(`/quotes/${id}`, body);
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
