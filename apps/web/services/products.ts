import type { ProductDTO, CreateProductInput, UpdateProductInput } from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

export type Product = ProductDTO;

export type ProductListResponse = PaginatedResponse<Product>;

export const products = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    category?: string;
    status?: string;
  }): Promise<ProductListResponse> => {
    return api.get("/products", { params });
  },

  get: async (id: string): Promise<Product> => {
    return api.get(`/products/${id}`);
  },

  create: async (body: CreateProductInput): Promise<Product> => {
    return api.post("/products", body);
  },

  update: async (id: string, body: UpdateProductInput): Promise<Product> => {
    return api.patch(`/products/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/products/${id}`);
  },

  // 获取价格
  getPrice: async (id: string, quantity?: number): Promise<{ price: number }> => {
    return api.get(`/products/${id}/price`, {
      params: { quantity },
    });
  },
};
