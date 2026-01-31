import { BadRequestException } from "@nestjs/common";
import type { Request } from "express";

export interface RequestContext {
  tenantId: string;
  orgUnitId?: string;
  userId?: string;
}

export function getRequestContext(req: Request): RequestContext {
  const tenantId = req.header("x-tenant-id");
  if (!tenantId) {
    throw new BadRequestException("Missing x-tenant-id header");
  }

  return {
    tenantId,
    orgUnitId: req.header("x-org-unit-id") ?? undefined,
    userId: req.header("x-user-id") ?? undefined
  };
}
