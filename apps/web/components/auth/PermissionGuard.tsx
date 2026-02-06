"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { PermissionMode, PermissionRequirement } from "@/utils/permissions";

interface PermissionGuardProps {
  permission: PermissionRequirement;
  mode?: PermissionMode;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  permission,
  mode = "all",
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission, mode)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
