import type { CreateOrgUnitInput, CreateUserInput, UpdateOrgUnitInput, UpdateUserInput } from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

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
  created_at?: string;
  updated_at?: string;
  org_unit?: { id: string; name: string };
  role?: { id: string; name: string; code: string };
}

export type UserListResponse = PaginatedResponse<User>;

export interface Role {
  id: string;
  serialId?: number;
  tenantId?: string;
  name: string;
  code: string;
  description?: string;
  dataScope?: "SELF" | "TEAM" | "SUBTREE" | "ALL";
  status: string;
  permissions: Permission[];
  user_count?: number;
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  type?: string;
  module?: string;
  description?: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  createdAt?: string;
  permission: Permission;
}

export interface OrgUnit {
  id: string;
  serialId?: number;
  name: string;
  code?: string;
  type?: string;
  parentId?: string | null;
  parent_id?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OrgUnitListResponse = {
  data: OrgUnit[];
};

export const users = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    orgUnitId?: string;
    roleId?: string;
  }): Promise<UserListResponse> => {
    return api.get("/users", { params });
  },

  get: async (id: string): Promise<User> => {
    return api.get(`/users/${id}`);
  },

  create: async (body: CreateUserInput): Promise<User> => {
    return api.post("/users", body);
  },

  update: async (id: string, body: UpdateUserInput): Promise<User> => {
    return api.patch(`/users/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/users/${id}`);
  },

  // 获取当前用户信息
  me: async (): Promise<User> => {
    return api.get("/users/me");
  },

  // 修改密码
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    return api.post("/users/change-password", { oldPassword, newPassword });
  },

  // 重置密码
  resetPassword: async (id: string): Promise<{ tempPassword: string }> => {
    return api.post(`/users/${id}/reset-password`);
  },
};

export type RoleListResponse = PaginatedResponse<Role>;

export const roles = {
  list: async (params?: { page?: number; pageSize?: number; q?: string }): Promise<RoleListResponse> => {
    return api.get("/rbac/roles", { params });
  },

  get: async (id: string): Promise<Role> => {
    return api.get(`/rbac/roles/${id}`);
  },

  create: async (body: Partial<Role>): Promise<Role> => {
    return api.post("/rbac/roles", body);
  },

  update: async (id: string, body: Partial<Role>): Promise<Role> => {
    return api.patch(`/rbac/roles/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/rbac/roles/${id}`);
  },

  // 获取所有权限
  getPermissions: async (params?: { page?: number; pageSize?: number; q?: string }): Promise<PaginatedResponse<Permission>> => {
    return api.get("/rbac/permissions", { params });
  },

  listRolePermissions: async (id: string): Promise<RolePermission[]> => {
    return api.get(`/rbac/roles/${id}/permissions`);
  },

  addRolePermission: async (id: string, permissionId: string): Promise<RolePermission> => {
    return api.post(`/rbac/roles/${id}/permissions`, { permissionId });
  },

  removeRolePermission: async (id: string, permissionId: string): Promise<void> => {
    return api.delete(`/rbac/roles/${id}/permissions/${permissionId}`);
  },
};

export const orgUnits = {
  list: async (): Promise<OrgUnitListResponse> => {
    return api.get("/org-units");
  },

  get: async (id: string): Promise<OrgUnit> => {
    return api.get(`/org-units/${id}`);
  },

  create: async (body: CreateOrgUnitInput): Promise<OrgUnit> => {
    return api.post("/org-units", body);
  },

  update: async (id: string, body: UpdateOrgUnitInput): Promise<OrgUnit> => {
    return api.patch(`/org-units/${id}`, body);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/org-units/${id}`);
  },
};
