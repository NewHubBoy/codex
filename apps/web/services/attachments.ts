import {
  ATTACHMENT_STATUSES,
  type AttachmentDTO,
  type CreateAttachmentInput,
  type UpdateAttachmentInput,
  type CreateAttachmentLinkInput,
  type DeleteAttachmentLinkInput,
  type AttachmentLinkDTO,
  type AttachmentStatus as SharedAttachmentStatus
} from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

export const AttachmentStatus = ATTACHMENT_STATUSES.reduce(
  (acc, status) => {
    acc[status] = status;
    return acc;
  },
  {} as Record<SharedAttachmentStatus, SharedAttachmentStatus>
);

export type AttachmentStatusType = SharedAttachmentStatus;

export interface AttachmentListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  q?: string;
  status?: AttachmentStatusType;
  ownerId?: string;
  orgUnitId?: string;
  relatedType?: string;
  relatedId?: string;
}

export type Attachment = AttachmentDTO;
export type AttachmentLink = AttachmentLinkDTO;
export type AttachmentListResponse = PaginatedResponse<Attachment>;
export type AttachmentConfig = {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
};

export async function getAttachments(params: AttachmentListParams): Promise<AttachmentListResponse> {
  return api.get("/attachments", { params });
}

export async function getAttachmentConfig(): Promise<AttachmentConfig> {
  return api.get("/attachments/config");
}

export async function getAttachment(id: string): Promise<Attachment> {
  return api.get(`/attachments/${id}`);
}

export async function createAttachment(data: CreateAttachmentInput): Promise<Attachment> {
  return api.post("/attachments", data);
}

export async function uploadAttachment(
  file: File,
  options?: {
    relatedType?: string;
    relatedId?: string;
    note?: string;
  }
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  if (options?.relatedType) {
    formData.append("relatedType", options.relatedType);
  }
  if (options?.relatedId) {
    formData.append("relatedId", options.relatedId);
  }
  if (options?.note) {
    formData.append("note", options.note);
  }
  return api.post("/attachments/upload", formData);
}

export async function updateAttachment(id: string, data: UpdateAttachmentInput): Promise<Attachment> {
  return api.patch(`/attachments/${id}`, data);
}

export async function deleteAttachment(id: string): Promise<void> {
  return api.delete(`/attachments/${id}`);
}

export async function addAttachmentLink(
  id: string,
  data: CreateAttachmentLinkInput
): Promise<AttachmentLink> {
  return api.post(`/attachments/${id}/links`, data);
}

export async function removeAttachmentLink(
  id: string,
  params: DeleteAttachmentLinkInput
): Promise<AttachmentLink> {
  return api.delete(`/attachments/${id}/links`, { params });
}
