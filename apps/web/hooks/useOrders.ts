import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateOrderInput, UpdateOrderInput } from "@crm/shared";
import { orders } from "@/services/orders";

export function useOrders(params?: {
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
    queryKey: ["orders", params],
    queryFn: () => orders.list(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orders.get(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateOrderInput) => orders.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateOrderInput }) =>
      orders.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orders.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useShipOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orders.ship(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      orders.cancel(id, reason),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
  });
}
