import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { opportunities } from "@/services/opportunities";
import type { Opportunity } from "@/services/opportunities";

export function useOpportunities(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  account_id?: string;
  lead_id?: string;
  owner_id?: string;
}) {
  return useQuery({
    queryKey: ["opportunities", params],
    queryFn: () => opportunities.list(params),
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => opportunities.get(id),
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<Opportunity>) => opportunities.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Opportunity> }) =>
      opportunities.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["opportunity", id] });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => opportunities.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });
}

export function useBulkUpdateOpportunityStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ids,
      status,
      dryRun,
    }: {
      ids: string[];
      status: string;
      dryRun?: boolean;
    }) => opportunities.batchStatus(ids, status, dryRun),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });
}

export function useUpdateOpportunityStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      opportunities.updateStage(id, stage),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["opportunity", id] });
    },
  });
}
