import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateContactInput, UpdateContactInput } from "@crm/shared";
import { contacts } from "@/services/contacts";

export function useContacts(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  accountId?: string;
  status?: string;
  ownerId?: string;
  orgUnitId?: string;
}) {
  return useQuery({
    queryKey: ["contacts", params],
    queryFn: () => contacts.list(params),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ["contact", id],
    queryFn: () => contacts.get(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateContactInput) => contacts.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateContactInput }) =>
      contacts.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact", id] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contacts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
