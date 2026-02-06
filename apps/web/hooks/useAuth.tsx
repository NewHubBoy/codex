"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  login as loginApi,
  logout as logoutApi,
  getCurrentUser,
  setToken,
  clearToken,
  getAccessToken,
  type AuthUser,
  type LoginParams,
} from "@/services/auth";
import {
  canAccessRoute as checkRouteAccess,
  createPermissionLookup,
  hasPermission as checkPermission,
  resolveDefaultRoute,
  type PermissionMode,
  type PermissionRequirement,
} from "@/utils/permissions";

type User = AuthUser;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (params: LoginParams) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  permissionCodes: string[];
  hasPermission: (required: PermissionRequirement, mode?: PermissionMode) => boolean;
  canAccessRoute: (pathname: string) => boolean;
  defaultRoute: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function collectPermissionCodes(user: User | null): string[] {
  if (!user) {
    return [];
  }
  const directPermissions = Array.isArray(user.permissions) ? user.permissions : [];
  const rolePermissions = Array.isArray(user.roles)
    ? user.roles.flatMap((role) =>
        "permissions" in role && Array.isArray(role.permissions) ? role.permissions : []
      )
    : [];

  return Array.from(new Set([...directPermissions, ...rolePermissions]));
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
    let user: AuthUser | null = response.user ?? null;

    if (!user?.id || !Array.isArray(user.permissions)) {
      try {
        user = await getCurrentUser();
      } catch {
        // Ignore fallback failure, keep login response payload.
      }
    }

    if (!user?.id) {
      throw new Error("登录成功但未获取到用户信息");
    }

    setState({ user, isAuthenticated: true, isLoading: false });
    return user;
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

  const permissionCodes = useMemo(() => collectPermissionCodes(state.user), [state.user]);
  const permissionLookup = useMemo(
    () => createPermissionLookup(permissionCodes),
    [permissionCodes]
  );
  const hasPermission = useCallback(
    (required: PermissionRequirement, mode: PermissionMode = "all") =>
      checkPermission(permissionLookup, required, mode),
    [permissionLookup]
  );
  const canAccessRoute = useCallback(
    (pathname: string) => checkRouteAccess(pathname, permissionLookup),
    [permissionLookup]
  );
  const defaultRoute = useMemo(
    () => resolveDefaultRoute(permissionLookup),
    [permissionLookup]
  );

  const contextValue: AuthContextValue = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login: loginFn,
    logout: logoutFn,
    refreshUser: refreshUserFn,
    permissionCodes,
    hasPermission,
    canAccessRoute,
    defaultRoute,
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
