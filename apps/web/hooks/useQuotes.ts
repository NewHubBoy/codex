import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateQuoteInput, UpdateQuoteInput } from "@crm/shared";
import { quotes } from "@/services/quotes";

export function useQuotes(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  accountId?: string;
  opportunityId?: string;
  ownerId?: string;
  orgUnitId?: string;
}) {
  return useQuery({
    queryKey: ["quotes", params],
    queryFn: () => quotes.list(params),
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ["quote", id],
    queryFn: () => quotes.get(id),
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateQuoteInput) => quotes.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateQuoteInput }) =>
      quotes.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useSendQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotes.send(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
    },
  });
}

export function useApproveQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotes.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
    },
  });
}

export function useRejectQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      quotes.reject(id, reason),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
    },
  });
}

export function useConvertQuoteToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotes.convertToOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
