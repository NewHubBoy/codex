import { api } from "./api";

// 类型定义
export interface User {
  id: string;
  tenant_id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  org_unit_id?: string;
  role_id?: string;
  avatar?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  org_unit?: { id: string; name: string };
  role?: { id: string; name: string; code: string };
}

export interface UserListResponse {
  list: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  permissions: any[];
  user_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export const users = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    org_unit_id?: string;
    role_id?: string;
  }): Promise<UserListResponse> => {
    const { data } = await api.get("/users", { params });
    return data;
  },

  get: async (id: string): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (body: Partial<User>): Promise<User> => {
    const { data } = await api.post("/users", body);
    return data;
  },

  update: async (id: string, body: Partial<User>): Promise<User> => {
    const { data } = await api.put(`/users/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // 获取当前用户信息
  me: async (): Promise<User> => {
    const { data } = await api.get("/users/me");
    return data;
  },

  // 修改密码
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post("/users/change-password", { oldPassword, newPassword });
  },

  // 重置密码
  resetPassword: async (id: string): Promise<{ tempPassword: string }> => {
    const { data } = await api.post(`/users/${id}/reset-password`);
    return data;
  },
};

export const roles = {
  list: async (): Promise<Role[]> => {
    const { data } = await api.get("/rbac/roles");
    return data;
  },

  get: async (id: string): Promise<Role> => {
    const { data } = await api.get(`/rbac/roles/${id}`);
    return data;
  },

  create: async (body: Partial<Role>): Promise<Role> => {
    const { data } = await api.post("/rbac/roles", body);
    return data;
  },

  update: async (id: string, body: Partial<Role>): Promise<Role> => {
    const { data } = await api.put(`/rbac/roles/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/rbac/roles/${id}`);
  },

  // 获取所有权限
  getPermissions: async (): Promise<Permission[]> => {
    const { data } = await api.get("/rbac/permissions");
    return data;
  },
};

export const orgUnits = {
  list: async (): Promise<any[]> => {
    const { data } = await api.get("/org-units");
    return data;
  },

  get: async (id: string): Promise<any> => {
    const { data } = await api.get(`/org-units/${id}`);
    return data;
  },

  create: async (body: Partial<any>): Promise<any> => {
    const { data } = await api.post("/org-units", body);
    return data;
  },

  update: async (id: string, body: Partial<any>): Promise<any> => {
    const { data } = await api.put(`/org-units/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/org-units/${id}`);
  },
};
