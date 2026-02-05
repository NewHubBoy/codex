import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approvals } from "@/services/approvals";
import type { ApprovalStatus } from "@/services/approvals";

export function useApprovalInstances(params?: {
  page?: number;
  pageSize?: number;
  status?: ApprovalStatus;
  entityType?: string;
  entityId?: string;
}) {
  return useQuery({
    queryKey: ["approvals", params],
    queryFn: () => approvals.listInstances(params)
  });
}

export function useApprovalInstance(id: string) {
  return useQuery({
    queryKey: ["approvals", id],
    queryFn: () => approvals.getInstance(id),
    enabled: !!id
  });
}

export function useApprovalTasks(params?: {
  page?: number;
  pageSize?: number;
  status?: ApprovalStatus;
  entityType?: string;
  entityId?: string;
}) {
  return useQuery({
    queryKey: ["approval-tasks", params],
    queryFn: () => approvals.listTasks(params)
  });
}

export function useApproveApprovalTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => approvals.approveTask(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    }
  });
}

export function useRejectApprovalTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => approvals.rejectTask(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    }
  });
}
