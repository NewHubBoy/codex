import {
  ACTIVITY_STATUSES,
  type ActivityDTO,
  type CreateActivityInput,
  type UpdateActivityInput,
  type ActivityStatus as SharedActivityStatus
} from "@crm/shared";
import { api } from "./api";
import type { PaginatedResponse } from "./types";

export const ActivityStatus = ACTIVITY_STATUSES.reduce(
  (acc, status) => {
    acc[status] = status;
    return acc;
  },
  {} as Record<SharedActivityStatus, SharedActivityStatus>
);

export type ActivityStatusType = SharedActivityStatus;

export interface ActivityListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  q?: string;
  status?: ActivityStatusType;
  ownerId?: string;
  orgUnitId?: string;
  relatedType?: string;
  relatedId?: string;
}

export type ActivityAttachmentPreview = {
  id: string;
  fileName: string;
  url?: string | null;
  mimeType?: string;
};

export type Activity = ActivityDTO & {
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  attachmentCount?: number;
  attachmentsPreview?: ActivityAttachmentPreview[];
};

export type ActivityListResponse = PaginatedResponse<Activity>;

export async function getActivities(params: ActivityListParams): Promise<ActivityListResponse> {
  return api.get("/activities", { params });
}

export async function getActivity(id: string): Promise<Activity> {
  return api.get(`/activities/${id}`);
}

export async function createActivity(data: CreateActivityInput): Promise<Activity> {
  return api.post("/activities", data);
}

export async function updateActivity(id: string, data: UpdateActivityInput): Promise<Activity> {
  return api.patch(`/activities/${id}`, data);
}

export async function deleteActivity(id: string): Promise<void> {
  return api.delete(`/activities/${id}`);
}
