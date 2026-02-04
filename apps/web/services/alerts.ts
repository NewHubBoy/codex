import { api } from "./api";

export interface AlertSummary {
  leadFirstFollowUpOverdue: number;
  leadNextFollowUpOverdue: number;
  leadInactive: number;
  opportunityStale: number;
  inactiveDays: number;
  staleDays: number;
}

export async function getAlertSummary(params?: {
  inactiveDays?: number;
  staleDays?: number;
}): Promise<AlertSummary> {
  return api.get("/alerts/summary", { params });
}
