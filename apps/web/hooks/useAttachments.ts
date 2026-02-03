"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAttachments,
  getAttachmentConfig,
  getAttachment,
  createAttachment,
  updateAttachment,
  deleteAttachment,
  uploadAttachment,
  addAttachmentLink,
  removeAttachmentLink,
  type AttachmentListParams,
  type Attachment,
  type AttachmentLink,
  type AttachmentConfig
} from "@/services/attachments";
import type {
  CreateAttachmentInput,
  UpdateAttachmentInput,
  CreateAttachmentLinkInput,
  DeleteAttachmentLinkInput
} from "@crm/shared";

export const attachmentKeys = {
  all: ["attachments"] as const,
  lists: () => [...attachmentKeys.all, "list"] as const,
  list: (params: AttachmentListParams) => [...attachmentKeys.lists(), params] as const,
  details: () => [...attachmentKeys.all, "detail"] as const,
  detail: (id: string) => [...attachmentKeys.details(), id] as const,
};

export function useAttachments(params: AttachmentListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: attachmentKeys.list(params),
    queryFn: () => getAttachments(params),
    enabled: options?.enabled ?? true,
  });
}

export function useAttachmentConfig() {
  return useQuery({
    queryKey: ["attachments", "config"],
    queryFn: () => getAttachmentConfig(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAttachment(id: string) {
  return useQuery({
    queryKey: attachmentKeys.detail(id),
    queryFn: () => getAttachment(id),
    enabled: !!id,
  });
}

export function useCreateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttachmentInput) => createAttachment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.lists() });
    },
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      relatedType,
      relatedId,
      note,
    }: {
      file: File;
      relatedType?: string;
      relatedId?: string;
      note?: string;
    }) => uploadAttachment(file, { relatedType, relatedId, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.lists() });
    },
  });
}

export function useUpdateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttachmentInput }) =>
      updateAttachment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attachmentKeys.detail(id) });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.lists() });
    },
  });
}

export function useAddAttachmentLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAttachmentLinkInput }) =>
      addAttachmentLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.lists() });
    },
  });
}

export function useRemoveAttachmentLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: DeleteAttachmentLinkInput }) =>
      removeAttachmentLink(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.lists() });
    },
  });
}

export type { Attachment, AttachmentLink, AttachmentConfig };
