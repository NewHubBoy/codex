import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accounts } from "@/services/accounts";
import type { Account } from "@/services/accounts";

export function useAccounts(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  owner_id?: string;
}) {
  return useQuery({
    queryKey: ["accounts", params],
    queryFn: () => accounts.list(params),
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ["account", id],
    queryFn: () => accounts.get(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<Account>) => accounts.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Account> }) =>
      accounts.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account", id] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accounts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
