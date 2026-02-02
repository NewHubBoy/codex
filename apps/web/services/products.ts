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
    const { data } = await api.get("/products", { params });
    return data;
  },

  get: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  create: async (body: Partial<Product>): Promise<Product> => {
    const { data } = await api.post("/products", body);
    return data;
  },

  update: async (id: string, body: Partial<Product>): Promise<Product> => {
    const { data } = await api.put(`/products/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // 获取价格
  getPrice: async (id: string, quantity?: number): Promise<{ price: number }> => {
    const { data } = await api.get(`/products/${id}/price`, {
      params: { quantity },
    });
    return data;
  },
};
