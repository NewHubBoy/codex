"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  login as loginApi,
  logout as logoutApi,
  getCurrentUser,
  setToken,
  clearToken,
  getAccessToken,
  type LoginParams,
} from "@/services/auth";

interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  locale?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (params: LoginParams) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const user = await getCurrentUser();
          setState({ user, isAuthenticated: true, isLoading: false });
        } catch {
          clearToken();
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };
    initAuth();
  }, []);

  const loginFn = useCallback(async (params: LoginParams) => {
    const response = await loginApi(params);
    setToken(response.accessToken, response.refreshToken);
    setState({ user: response.user, isAuthenticated: true, isLoading: false });
    return response.user;
  }, []);

  const logoutFn = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      clearToken();
      setState({ user: null, isAuthenticated: false, isLoading: false });
      router.push("/login");
    }
  }, [router]);

  const refreshUserFn = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setState((prev) => ({ ...prev, user }));
    } catch (error) {
      console.error("刷新用户信息失败:", error);
    }
  }, []);

  const contextValue: AuthContextValue = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login: loginFn,
    logout: logoutFn,
    refreshUser: refreshUserFn,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必须在 AuthProvider 中使用");
  }
  return context;
}
