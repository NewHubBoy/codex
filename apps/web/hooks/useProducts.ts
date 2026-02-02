import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateProductInput, UpdateProductInput } from "@crm/shared";
import { products } from "@/services/products";

export function useProducts(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => products.list(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => products.get(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProductInput) => products.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductInput }) =>
      products.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
