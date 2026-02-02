import { api } from "./api";

// 类型定义
export interface Order {
  id: string;
  tenant_id: string;
  org_unit_id: string;
  owner_id: string;
  account_id: string;
  quote_id?: string;
  status: string;
  code: string;
  total_amount?: number;
  order_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  account?: { id: string; name: string };
  quote?: { id: string; code: string };
  owner?: { id: string; name: string; email: string };
}

export interface OrderListResponse {
  list: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export const orders = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    account_id?: string;
    quote_id?: string;
    owner_id?: string;
  }): Promise<OrderListResponse> => {
    return api.get("/orders", { params });
  },

  get: async (id: string): Promise<Order> => {
    return api.get(`/orders/${id}`);
  },

  create: async (body: Partial<Order>): Promise<Order> => {
    return api.post("/orders", body);
  },

  update: async (id: string, body: Partial<Order>): Promise<Order> => {
    return api.put(`/orders/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/orders/${id}`);
  },

  // 发货
  ship: async (id: string): Promise<Order> => {
    return api.post(`/orders/${id}/ship`);
  },

  // 取消
  cancel: async (id: string, reason?: string): Promise<Order> => {
    return api.post(`/orders/${id}/cancel`, { reason });
  },
};
