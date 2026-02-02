import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

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

// 请求拦截器 - 添加认证 Token
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
    // 错误处理
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token 过期或无效，清除并跳转登录
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }
          break;

        case 403:
          message.error("您没有权限执行此操作");
          break;

        case 404:
          message.error("请求的资源不存在");
          break;

        case 422:
          // 业务验证错误
          if (data && typeof data === "object" && "message" in data) {
            message.error((data as { message: string }).message);
          }
          break;

        case 500:
          message.error("服务器错误，请稍后重试");
          break;
      }
    } else if (error.request) {
      message.error("网络连接失败，请检查网络");
    }

    return Promise.reject(error);
  }
);

// 简化消息提示（需要 Ant Design 的 message）
let message: { error: (msg: string) => void; success: (msg: string) => void; warning: (msg: string) => void } = {
  error: (msg) => console.error(msg),
  success: (msg) => console.log(msg),
  warning: (msg) => console.warn(msg),
};

// 设置 message（避免循环依赖）
if (typeof window !== "undefined") {
  import("antd").then(({ message: antdMessage }) => {
    message = antdMessage;
  });
}

export { api, message };
export default api;
