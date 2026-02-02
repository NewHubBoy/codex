import type { OrderDTO, CreateOrderInput, UpdateOrderInput } from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

export type Order = OrderDTO & {
  account?: { id: string; name: string };
  owner?: { id: string; name: string; email: string };
};

export type OrderListResponse = PaginatedResponse<Order>;

export const orders = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    accountId?: string;
    opportunityId?: string;
    ownerId?: string;
    orgUnitId?: string;
  }): Promise<OrderListResponse> => {
    return api.get("/orders", { params });
  },

  get: async (id: string): Promise<Order> => {
    return api.get(`/orders/${id}`);
  },

  create: async (body: CreateOrderInput): Promise<Order> => {
    return api.post("/orders", body);
  },

  update: async (id: string, body: UpdateOrderInput): Promise<Order> => {
    return api.patch(`/orders/${id}`, body);
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
