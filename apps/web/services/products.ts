import { api } from "./api";

// 类型定义
export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  specification?: string;
  price: number;
  unit?: string;
  status: string;
  stock?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  list: Product[];
  total: number;
  page: number;
  pageSize: number;
}

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

  create: async (body: Partial<Product>): Promise<Product> => {
    return api.post("/products", body);
  },

  update: async (id: string, body: Partial<Product>): Promise<Product> => {
    return api.put(`/products/${id}`, body);
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
