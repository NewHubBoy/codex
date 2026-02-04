export interface ListQuery {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  q?: string;
  status?: string;
  ownerId?: string;
  orgUnitId?: string;
  relatedType?: string;
  relatedId?: string;
  sort?: string;
  overdueFirstFollowUp?: boolean;
  overdueNextFollowUp?: boolean;
  inactiveDays?: number;
  staleDays?: number;
}

export function parseListQuery(query: Record<string, unknown>): ListQuery {
  const page = Math.max(1, Number.parseInt(String(query.page ?? "1"), 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(String(query.pageSize ?? "20"), 10) || 20)
  );
  const q = typeof query.q === "string" && query.q.trim() ? query.q.trim() : undefined;
  const status =
    typeof query.status === "string" && query.status.trim() ? query.status.trim() : undefined;
  const ownerId =
    typeof query.ownerId === "string" && query.ownerId.trim() ? query.ownerId.trim() : undefined;
  const orgUnitId =
    typeof query.orgUnitId === "string" && query.orgUnitId.trim()
      ? query.orgUnitId.trim()
      : undefined;
  const relatedType =
    typeof query.relatedType === "string" && query.relatedType.trim()
      ? query.relatedType.trim()
      : undefined;
  const relatedId =
    typeof query.relatedId === "string" && query.relatedId.trim()
      ? query.relatedId.trim()
      : undefined;
  const sort = typeof query.sort === "string" && query.sort.trim() ? query.sort.trim() : undefined;
  const overdueFirstFollowUp =
    query.overdueFirstFollowUp === "true" ||
    query.overdueFirstFollowUp === "1" ||
    query.overdueFirstFollowUp === true;
  const overdueNextFollowUp =
    query.overdueNextFollowUp === "true" ||
    query.overdueNextFollowUp === "1" ||
    query.overdueNextFollowUp === true;
  const inactiveDaysRaw = Number.parseInt(String(query.inactiveDays ?? ""), 10);
  const inactiveDays = Number.isFinite(inactiveDaysRaw) && inactiveDaysRaw > 0 ? inactiveDaysRaw : undefined;
  const staleDaysRaw = Number.parseInt(String(query.staleDays ?? ""), 10);
  const staleDays = Number.isFinite(staleDaysRaw) && staleDaysRaw > 0 ? staleDaysRaw : undefined;
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
    q,
    status,
    ownerId,
    orgUnitId,
    relatedType,
    relatedId,
    sort,
    overdueFirstFollowUp,
    overdueNextFollowUp,
    inactiveDays,
    staleDays
  };
}

export function parseSerialId(q: string | undefined): number | undefined {
  if (!q) {
    return undefined;
  }
  const trimmed = q.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return undefined;
  }
  const value = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(value) ? value : undefined;
}

export function parseSort(
  sort: string | undefined,
  allowed: string[],
  defaultField: string = "createdAt"
): Record<string, "asc" | "desc"> {
  if (sort) {
    const [field, direction] = sort.split(":");
    if (field && allowed.includes(field)) {
      return { [field]: direction === "asc" ? "asc" : "desc" };
    }
  }
  return { [defaultField]: "desc" };
}
