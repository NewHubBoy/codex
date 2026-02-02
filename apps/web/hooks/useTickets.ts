import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTicketInput, UpdateTicketInput } from "@crm/shared";
import { tickets } from "@/services/tickets";

export function useTickets(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  priority?: string;
  accountId?: string;
  ownerId?: string;
  orgUnitId?: string;
}) {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: () => tickets.list(params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => tickets.get(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTicketInput) => tickets.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTicketInput }) =>
      tickets.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tickets.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ownerId }: { id: string; ownerId: string }) =>
      tickets.assign(id, ownerId),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    },
  });
}

export function useResolveTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tickets.resolve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    },
  });
}

export function useCloseTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tickets.close(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    },
  });
}
