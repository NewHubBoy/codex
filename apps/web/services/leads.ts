import {
  LEAD_STATUSES,
  type LeadDTO,
  type CreateLeadInput,
  type UpdateLeadInput,
  type BulkLeadStatusInput,
  type LeadStatus as SharedLeadStatus
} from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

// 线索状态枚举
export const LeadStatus = LEAD_STATUSES.reduce(
  (acc, status) => {
    acc[status] = status;
    return acc;
  },
  {} as Record<SharedLeadStatus, SharedLeadStatus>
);

export type LeadStatusType = SharedLeadStatus;

// 线索来源
export const LeadSource = {
  WEBSITE: "WEBSITE",
  REFERRAL: "REFERRAL",
  COLD_CALL: "COLD_CALL",
  TRADE_SHOW: "TRADE_SHOW",
  SOCIAL_MEDIA: "SOCIAL_MEDIA",
  OTHER: "OTHER",
} as const;

export type LeadSourceType = (typeof LeadSource)[keyof typeof LeadSource];

// 线索优先级
export const LeadRating = {
  HOT: "HOT",
  WARM: "WARM",
  COLD: "COLD",
} as const;

export type LeadRatingType = (typeof LeadRating)[keyof typeof LeadRating];

// 线索列表查询参数
export interface LeadListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  q?: string;
  status?: LeadStatusType;
  source?: LeadSourceType;
  rating?: LeadRatingType;
  ownerId?: string;
  orgUnitId?: string;
  startDate?: string;
  endDate?: string;
}

// 线索列表响应
export type LeadListResponse = PaginatedResponse<Lead>;

// 线索详情
export type Lead = LeadDTO & {
  source?: LeadSourceType;
  rating?: LeadRatingType;
  company?: string;
  email?: string;
  phone?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
};

// 创建线索参数
export type CreateLeadParams = CreateLeadInput & {
  source?: LeadSourceType;
  rating?: LeadRatingType;
  company?: string;
  email?: string;
  phone?: string;
  ownerId?: string;
};

// 更新线索参数
export type UpdateLeadParams = UpdateLeadInput &
  Partial<Pick<CreateLeadParams, "company" | "email" | "phone" | "ownerId">> & {
    status?: LeadStatusType;
    source?: LeadSourceType;
    rating?: LeadRatingType;
  };

// 批量更新状态参数
export type BulkUpdateStatusParams = BulkLeadStatusInput;

// 批量更新状态响应
export interface BulkUpdateStatusResponse {
  updated: number;
  ids: string[];
}

// 线索列表
export async function getLeads(params: LeadListParams): Promise<LeadListResponse> {
  return api.get("/leads", { params });
}

// 获取线索详情
export async function getLead(id: string): Promise<Lead> {
  return api.get(`/leads/${id}`);
}

// 创建线索
export async function createLead(data: CreateLeadParams): Promise<Lead> {
  return api.post("/leads", data);
}

// 更新线索
export async function updateLead(id: string, data: UpdateLeadParams): Promise<Lead> {
  return api.patch(`/leads/${id}`, data);
}

// 删除线索
export async function deleteLead(id: string): Promise<void> {
  return api.delete(`/leads/${id}`);
}

// 批量更新状态
export async function bulkUpdateStatus(data: BulkUpdateStatusParams): Promise<BulkUpdateStatusResponse> {
  return api.post("/leads/bulk/status", data);
}
