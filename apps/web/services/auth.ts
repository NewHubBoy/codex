import { api } from "./api";

// 登录参数
export interface LoginParams {
  email: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    tenantId: string;
  };
}

// 刷新 Token 响应
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// 登录
export async function login(data: LoginParams): Promise<LoginResponse> {
  return api.post("/auth/login", data);
}

// 刷新 Token
export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  return api.post("/auth/refresh", { refreshToken });
}

// 登出
export async function logout(): Promise<void> {
  return api.post("/auth/logout");
}

// 获取当前用户信息
export async function getCurrentUser() {
  const response = await api.get("/users/me");
  return response.data;
}

// 设置 Token
export function setToken(accessToken: string, refreshToken: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }
}

// 清除 Token
export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
}

// 获取 Access Token
export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

// 获取 Refresh Token
export function getRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
}
