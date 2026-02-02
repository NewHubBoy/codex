import type { TicketDTO, CreateTicketInput, UpdateTicketInput } from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

export type Ticket = TicketDTO & {
  account?: { id: string; name: string };
  owner?: { id: string; name: string; email: string };
};

export type TicketListResponse = PaginatedResponse<Ticket>;

export const tickets = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    priority?: string;
    accountId?: string;
    ownerId?: string;
    orgUnitId?: string;
  }): Promise<TicketListResponse> => {
    return api.get("/tickets", { params });
  },

  get: async (id: string): Promise<Ticket> => {
    return api.get(`/tickets/${id}`);
  },

  create: async (body: CreateTicketInput): Promise<Ticket> => {
    return api.post("/tickets", body);
  },

  update: async (id: string, body: UpdateTicketInput): Promise<Ticket> => {
    return api.patch(`/tickets/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/tickets/${id}`);
  },

  // 分配
  assign: async (id: string, ownerId: string): Promise<Ticket> => {
    return api.post(`/tickets/${id}/assign`, { ownerId });
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
