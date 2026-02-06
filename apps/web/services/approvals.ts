import { api } from "./api";
import type { PaginatedResponse } from "./types";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type ApprovalTaskStatus = ApprovalStatus | "WAITING";

export interface ApprovalInstance {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  ruleId?: string | null;
  status: ApprovalStatus;
  currentGroup?: number | null;
  payload?: Record<string, unknown> | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRuleSummary {
  id: string;
  name: string;
  entityType: string;
}

export interface ApprovalLog {
  id: string;
  instanceId: string;
  actorId?: string | null;
  action: string;
  note?: string | null;
  createdAt: string;
}

export interface ApprovalNode {
  id: string;
  instanceId: string;
  groupIndex: number;
  status: ApprovalTaskStatus;
  startedAt?: string | null;
  decidedAt?: string | null;
  createdAt?: string;
  tasks?: ApprovalTask[];
}

export interface ApprovalInstanceDetail extends ApprovalInstance {
  rule?: ApprovalRuleSummary | null;
  nodes?: ApprovalNode[];
  logs?: ApprovalLog[];
}

export interface ApprovalTask {
  id: string;
  instanceId: string;
  nodeId: string;
  roleCode: string;
  status: ApprovalTaskStatus;
  assigneeId?: string | null;
  decidedAt?: string | null;
  note?: string | null;
  createdAt: string;
  instance?: ApprovalInstance;
  node?: { id: string; groupIndex: number; status: ApprovalTaskStatus };
}

export type ApprovalInstanceList = PaginatedResponse<ApprovalInstance>;
export type ApprovalTaskList = PaginatedResponse<ApprovalTask>;

export const approvals = {
  listInstances: async (params?: {
    page?: number;
    pageSize?: number;
    status?: ApprovalStatus;
    entityType?: string;
    entityId?: string;
  }): Promise<ApprovalInstanceList> => {
    return api.get("/approvals", { params });
  },

  getInstance: async (id: string): Promise<ApprovalInstanceDetail> => {
    return api.get(`/approvals/${id}`);
  },

  listTasks: async (params?: {
    page?: number;
    pageSize?: number;
    status?: ApprovalTaskStatus;
    entityType?: string;
    entityId?: string;
    roleCode?: string;
  }): Promise<ApprovalTaskList> => {
    return api.get("/approval-tasks", { params });
  },

  approveTask: async (id: string, note?: string): Promise<ApprovalInstance> => {
    return api.post(`/approval-tasks/${id}/approve`, { note });
  },

  rejectTask: async (id: string, note?: string): Promise<ApprovalInstance> => {
    return api.post(`/approval-tasks/${id}/reject`, { note });
  }
};
