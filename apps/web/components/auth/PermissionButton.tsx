"use client";

import { Button, Tooltip } from "antd";
import type { ButtonProps } from "antd";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { PermissionMode, PermissionRequirement } from "@/utils/permissions";

interface PermissionButtonProps extends ButtonProps {
  permission: PermissionRequirement;
  permissionMode?: PermissionMode;
  hideOnDenied?: boolean;
  deniedTooltip?: ReactNode;
}

export function PermissionButton({
  permission,
  permissionMode = "all",
  hideOnDenied = true,
  deniedTooltip = "无权限",
  ...buttonProps
}: PermissionButtonProps) {
  const { hasPermission } = useAuth();
  const allowed = hasPermission(permission, permissionMode);

  if (allowed) {
    return <Button {...buttonProps} />;
  }
  if (hideOnDenied) {
    return null;
  }

  const disabledButton = <Button {...buttonProps} disabled />;
  if (!deniedTooltip) {
    return disabledButton;
  }

  return <Tooltip title={deniedTooltip}>{disabledButton}</Tooltip>;
}
