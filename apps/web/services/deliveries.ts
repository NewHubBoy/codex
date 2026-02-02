import { api } from "./api";

// 类型定义
export interface Delivery {
  id: string;
  tenant_id: string;
  org_unit_id: string;
  owner_id: string;
  order_id: string;
  status: string;
  code: string;
  carrier?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order?: { id: string; code: string };
  account?: { id: string; name: string };
  owner?: { id: string; name: string; email: string };
}

export interface DeliveryListResponse {
  list: Delivery[];
  total: number;
  page: number;
  pageSize: number;
}

export const deliveries = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    order_id?: string;
    owner_id?: string;
  }): Promise<DeliveryListResponse> => {
    const { data } = await api.get("/deliveries", { params });
    return data;
  },

  get: async (id: string): Promise<Delivery> => {
    const { data } = await api.get(`/deliveries/${id}`);
    return data;
  },

  create: async (body: Partial<Delivery>): Promise<Delivery> => {
    const { data } = await api.post("/deliveries", body);
    return data;
  },

  update: async (id: string, body: Partial<Delivery>): Promise<Delivery> => {
    const { data } = await api.put(`/deliveries/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/deliveries/${id}`);
  },

  // 开始发货
  start: async (id: string): Promise<Delivery> => {
    const { data } = await api.post(`/deliveries/${id}/start`);
    return data;
  },

  // 完成
  complete: async (id: string): Promise<Delivery> => {
    const { data } = await api.post(`/deliveries/${id}/complete`);
    return data;
  },
};
