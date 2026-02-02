import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateDeliveryInput, UpdateDeliveryInput } from "@crm/shared";
import { deliveries } from "@/services/deliveries";

export function useDeliveries(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  orderId?: string;
  ownerId?: string;
  orgUnitId?: string;
}) {
  return useQuery({
    queryKey: ["deliveries", params],
    queryFn: () => deliveries.list(params),
  });
}

export function useDelivery(id: string) {
  return useQuery({
    queryKey: ["delivery", id],
    queryFn: () => deliveries.get(id),
    enabled: !!id,
  });
}

export function useCreateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateDeliveryInput) => deliveries.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });
}

export function useUpdateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDeliveryInput }) =>
      deliveries.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["delivery", id] });
    },
  });
}

export function useDeleteDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deliveries.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });
}

export function useStartDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deliveries.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["delivery", id] });
    },
  });
}

export function useCompleteDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deliveries.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["delivery", id] });
    },
  });
}
