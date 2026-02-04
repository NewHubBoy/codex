import { BadRequestException } from "@nestjs/common";
import type { Request } from "express";
import { DEFAULT_LOCALE, normalizeLocale } from "./i18n/locale";

export interface RequestContext {
  tenantId: string;
  orgUnitId?: string;
  userId?: string;
  locale: string;
}

export function getRequestContext(req: Request): RequestContext {
  const tenantId = req.header("x-tenant-id");
  if (!tenantId) {
    throw new BadRequestException("Missing x-tenant-id header");
  }
  const rawLocale = req.header("x-locale") ?? req.header("accept-language");

  return {
    tenantId,
    orgUnitId: req.header("x-org-unit-id") ?? undefined,
    userId: req.header("x-user-id") ?? undefined,
    locale: normalizeLocale(rawLocale ?? DEFAULT_LOCALE)
  };
}
