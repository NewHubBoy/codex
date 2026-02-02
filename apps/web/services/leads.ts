import { api } from "./api";

// 线索状态枚举
export const LeadStatus = {
  NEW: "NEW",
  ASSIGNED: "ASSIGNED",
  WORKING: "WORKING",
  QUALIFIED: "QUALIFIED",
  CONVERTED: "CONVERTED",
  DISQUALIFIED: "DISQUALIFIED",
} as const;

export type LeadStatusType = (typeof LeadStatus)[keyof typeof LeadStatus];

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
export interface LeadListResponse {
  list: Lead[];
  total: number;
  page: number;
  pageSize: number;
}

// 线索详情
export interface Lead {
  id: string;
  tenantId: string;
  orgUnitId: string;
  ownerId: string;
  status: LeadStatusType;
  source: LeadSourceType;
  rating: LeadRatingType;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  expectedValue?: number;
  description?: string;
  convertedOpportunityId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

// 创建线索参数
export interface CreateLeadParams {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: LeadSourceType;
  rating?: LeadRatingType;
  expectedValue?: number;
  description?: string;
  ownerId?: string;
}

// 更新线索参数
export interface UpdateLeadParams extends Partial<CreateLeadParams> {
  status?: LeadStatusType;
}

// 批量更新状态参数
export interface BulkUpdateStatusParams {
  ids: string[];
  status: LeadStatusType;
  dryRun?: boolean;
}

// 批量更新状态响应
export interface BulkUpdateStatusResponse {
  success: boolean;
  updated: number;
  skipped: number;
  errors: Array<{ id: string; message: string }>;
  dryRun?: boolean;
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
