import type { DeliveryDTO, CreateDeliveryInput, UpdateDeliveryInput } from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

export type Delivery = DeliveryDTO & {
  number?: string;
  order?: { id: string; number: string };
  owner?: { id: string; name: string; email: string };
};

export type DeliveryListResponse = PaginatedResponse<Delivery>;

export const deliveries = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    orderId?: string;
    ownerId?: string;
    orgUnitId?: string;
  }): Promise<DeliveryListResponse> => {
    return api.get("/deliveries", { params });
  },

  get: async (id: string): Promise<Delivery> => {
    return api.get(`/deliveries/${id}`);
  },

  create: async (body: CreateDeliveryInput): Promise<Delivery> => {
    return api.post("/deliveries", body);
  },

  update: async (id: string, body: UpdateDeliveryInput): Promise<Delivery> => {
    return api.patch(`/deliveries/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/deliveries/${id}`);
  },

  // 开始发货
  start: async (id: string): Promise<Delivery> => {
    return api.post(`/deliveries/${id}/start`);
  },

  // 完成
  complete: async (id: string): Promise<Delivery> => {
    return api.post(`/deliveries/${id}/complete`);
  },
};
