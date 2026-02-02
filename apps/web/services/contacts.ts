import type { ContactDTO, CreateContactInput, UpdateContactInput } from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

export type Contact = ContactDTO & {
  account?: { id: string; name: string };
  owner?: { id: string; name: string; email: string };
};

export type ContactListResponse = PaginatedResponse<Contact>;

export const contacts = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    accountId?: string;
    status?: string;
    ownerId?: string;
    orgUnitId?: string;
  }): Promise<ContactListResponse> => {
    return api.get("/contacts", { params });
  },

  get: async (id: string): Promise<Contact> => {
    return api.get(`/contacts/${id}`);
  },

  create: async (body: CreateContactInput): Promise<Contact> => {
    return api.post("/contacts", body);
  },

  update: async (id: string, body: UpdateContactInput): Promise<Contact> => {
    return api.patch(`/contacts/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/contacts/${id}`);
  },

  batchDelete: async (ids: string[]): Promise<void> => {
    return api.post("/contacts/batch-delete", { ids });
  },
};
