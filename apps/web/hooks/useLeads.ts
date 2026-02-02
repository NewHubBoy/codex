"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  bulkUpdateStatus,
  LeadListParams,
  Lead,
  CreateLeadParams,
  UpdateLeadParams,
} from "@/services/leads";

// 查询键
export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (params: LeadListParams) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
};

// 获取线索列表
export function useLeads(params: LeadListParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => getLeads(params),
  });
}

// 获取线索详情
export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => getLead(id),
    enabled: !!id,
  });
}

// 创建线索
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadParams) => createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    },
  });
}

// 更新线索
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadParams }) =>
      updateLead(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
    },
  });
}

// 删除线索
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    },
  });
}

// 批量更新状态
export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    },
  });
}
