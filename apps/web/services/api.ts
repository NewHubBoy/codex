import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { DEFAULT_LOCALE, resolveLocale } from "@/i18n/locale";

// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

// 创建 Axios 实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器 - 添加认证 Token 和 Tenant ID
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    // 从 localStorage 获取 token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // 添加 tenant-id（默认租户）
      const tenantId = localStorage.getItem("tenantId") || "00000000-0000-0000-0000-000000000001";
      config.headers["x-tenant-id"] = tenantId;
      const locale = resolveLocale() ?? DEFAULT_LOCALE;
      config.headers["x-locale"] = locale;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 统一响应格式
    return response.data;
  },
  (error: AxiosError) => {
    // Token 过期或无效，清除并跳转登录
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    const data = error.response?.data as
      | { message?: string | { message?: string } | string[] }
      | undefined;
    const nestedMessage =
      typeof data?.message === "string"
        ? data.message
        : Array.isArray(data?.message)
          ? data?.message.join(", ")
          : data?.message?.message;
    if (typeof nestedMessage === "string" && nestedMessage.trim()) {
      error.message = nestedMessage;
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;
