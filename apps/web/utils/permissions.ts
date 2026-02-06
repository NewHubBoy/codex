import type { PermissionCode } from "@crm/shared";

export type PermissionInput = PermissionCode | string;
export type PermissionRequirement = PermissionInput | PermissionInput[];
export type PermissionMode = "all" | "any";

export interface RoutePermissionRule {
  prefix: string;
  permission: PermissionRequirement;
  mode?: PermissionMode;
}

const GLOBAL_ACCESS = "crm:full_access";

const routePermissionRules: RoutePermissionRule[] = [
  { prefix: "/crm/leads", permission: "lead:read" },
  { prefix: "/crm/activities", permission: "activity:read" },
  { prefix: "/crm/opportunities", permission: "opportunity:read" },
  { prefix: "/crm/accounts", permission: "account:read" },
  { prefix: "/crm/contacts", permission: "contact:read" },
  { prefix: "/crm/quotes", permission: "quote:read" },
  { prefix: "/crm/orders", permission: "order:read" },
  { prefix: "/crm/deliveries", permission: "delivery:read" },
  { prefix: "/crm/tickets", permission: "ticket:read" },
  { prefix: "/crm/products", permission: "product:read" },
  { prefix: "/approvals", permission: "approval:read" },
  { prefix: "/settings/users", permission: "user:read" },
  { prefix: "/settings/roles", permission: "rbac:role:read" },
  { prefix: "/settings/org-units", permission: "orgunit:read" },
  { prefix: "/settings/alerts", permission: ["lead:read", "opportunity:read"], mode: "all" },
  { prefix: "/settings/approval-rules", permission: "config:approval:read" },
];

const defaultRouteCandidates = [
  "/crm/leads",
  "/crm/opportunities",
  "/crm/accounts",
  "/crm/contacts",
  "/crm/quotes",
  "/crm/orders",
  "/crm/deliveries",
  "/crm/tickets",
  "/crm/products",
  "/approvals",
  "/settings/users",
  "/settings/roles",
  "/settings/org-units",
  "/settings/alerts",
  "/settings/approval-rules",
  "/dashboard",
  "/reports",
  "/profile",
];

const toCanonicalPermission = (value: PermissionInput): string => {
  const normalized = String(value).trim().toLowerCase();
  if (!normalized.includes(":") && normalized.includes("_")) {
    return normalized.replace(/_/g, ":");
  }
  return normalized;
};

const toLegacyPermission = (value: string): string => value.replace(/:/g, "_");

const expandPermissionAliases = (value: PermissionInput): string[] => {
  const canonical = toCanonicalPermission(value);
  const legacy = toLegacyPermission(canonical);
  return canonical === legacy ? [canonical] : [canonical, legacy];
};

const matchPrefix = (pathname: string, prefix: string): boolean => {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
};

export function createPermissionLookup(grantedPermissions: PermissionInput[] = []): Set<string> {
  const lookup = new Set<string>();
  for (const permission of grantedPermissions) {
    for (const alias of expandPermissionAliases(permission)) {
      lookup.add(alias);
    }
  }
  return lookup;
}

export function hasPermission(
  lookup: Set<string>,
  required: PermissionRequirement,
  mode: PermissionMode = "all"
): boolean {
  if (lookup.has(GLOBAL_ACCESS)) {
    return true;
  }

  const requiredList = Array.isArray(required) ? required : [required];
  if (!requiredList.length) {
    return true;
  }

  const isGranted = (permission: PermissionInput): boolean =>
    expandPermissionAliases(permission).some((alias) => lookup.has(alias));

  if (mode === "any") {
    return requiredList.some(isGranted);
  }
  return requiredList.every(isGranted);
}

export function getRoutePermissionRule(pathname: string): RoutePermissionRule | undefined {
  const normalizedPathname = pathname.trim();
  return [...routePermissionRules]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((rule) => matchPrefix(normalizedPathname, rule.prefix));
}

export function canAccessRoute(pathname: string, lookup: Set<string>): boolean {
  const rule = getRoutePermissionRule(pathname);
  if (!rule) {
    return true;
  }
  return hasPermission(lookup, rule.permission, rule.mode ?? "all");
}

export function resolveDefaultRoute(lookup: Set<string>): string {
  const matched = defaultRouteCandidates.find((route) => canAccessRoute(route, lookup));
  return matched ?? "/dashboard";
}
