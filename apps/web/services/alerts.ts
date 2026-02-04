import { api } from "./api";

export interface AlertSummary {
  leadFirstFollowUpOverdue: number;
  leadNextFollowUpOverdue: number;
  leadInactive: number;
  opportunityStale: number;
  inactiveDays: number;
  staleDays: number;
}

export interface AlertSetting {
  inactiveDays: number;
  staleDays: number;
  scopeType: string;
  scopeId?: string;
}

export async function getAlertSummary(params?: {
  inactiveDays?: number;
  staleDays?: number;
}): Promise<AlertSummary> {
  return api.get("/alerts/summary", { params });
}

export async function getAlertSettings(): Promise<AlertSetting> {
  return api.get("/alerts/settings");
}

export async function updateAlertSettings(payload: {
  scopeType: "USER" | "ORG_UNIT" | "TENANT";
  inactiveDays?: number;
  staleDays?: number;
}): Promise<AlertSetting> {
  return api.put("/alerts/settings", payload);
}
