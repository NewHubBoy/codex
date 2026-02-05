import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approvalRules } from "@/services/approval-rules";
import type { CreateApprovalRuleInput, UpdateApprovalRuleInput, TestApprovalRuleInput } from "@crm/shared";

export function useApprovalRules(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  entityType?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ["approval-rules", params],
    queryFn: () => approvalRules.list(params)
  });
}

export function useApprovalRule(id: string) {
  return useQuery({
    queryKey: ["approval-rules", id],
    queryFn: () => approvalRules.get(id),
    enabled: !!id
  });
}

export function useCreateApprovalRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateApprovalRuleInput) => approvalRules.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-rules"] });
    }
  });
}

export function useUpdateApprovalRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateApprovalRuleInput }) =>
      approvalRules.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["approval-rules"] });
      queryClient.invalidateQueries({ queryKey: ["approval-rules", id] });
    }
  });
}

export function useTestApprovalRule() {
  return useMutation({
    mutationFn: (body: TestApprovalRuleInput) => approvalRules.test(body)
  });
}
