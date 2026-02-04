import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateUserInput, UpdateUserInput } from "@crm/shared";
import { users, roles, orgUnits } from "@/services/system";
import type { Role } from "@/services/system";

// Users
export function useUsers(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  orgUnitId?: string;
  roleId?: string;
}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => users.list(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => users.get(id),
    enabled: !!id,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => users.me(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateUserInput) => users.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserInput }) =>
      users.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => users.resetPassword(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Roles
export function useRoles(params?: { page?: number; pageSize?: number; q?: string }) {
  return useQuery({
    queryKey: ["roles", params],
    queryFn: () => roles.list(params),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => roles.get(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<Role>) => roles.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Role> }) =>
      roles.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", id] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function usePermissions(params?: { page?: number; pageSize?: number; q?: string }) {
  return useQuery({
    queryKey: ["permissions", params],
    queryFn: () => roles.getPermissions(params),
  });
}

// OrgUnits
export function useOrgUnits() {
  return useQuery({
    queryKey: ["orgUnits"],
    queryFn: () => orgUnits.list(),
  });
}

export function useOrgUnit(id: string) {
  return useQuery({
    queryKey: ["orgUnit", id],
    queryFn: () => orgUnits.get(id),
    enabled: !!id,
  });
}

export function useCreateOrgUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: any) => orgUnits.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgUnits"] });
    },
  });
}

export function useUpdateOrgUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      orgUnits.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["orgUnits"] });
      queryClient.invalidateQueries({ queryKey: ["orgUnit", id] });
    },
  });
}

export function useDeleteOrgUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orgUnits.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgUnits"] });
    },
  });
}
