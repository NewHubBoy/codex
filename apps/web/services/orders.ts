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
    const { data } = await api.get("/orders", { params });
    return data;
  },

  get: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  create: async (body: Partial<Order>): Promise<Order> => {
    const { data } = await api.post("/orders", body);
    return data;
  },

  update: async (id: string, body: Partial<Order>): Promise<Order> => {
    const { data } = await api.put(`/orders/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  // 发货
  ship: async (id: string): Promise<Order> => {
    const { data } = await api.post(`/orders/${id}/ship`);
    return data;
  },

  // 取消
  cancel: async (id: string, reason?: string): Promise<Order> => {
    const { data } = await api.post(`/orders/${id}/cancel`, { reason });
    return data;
  },
};
