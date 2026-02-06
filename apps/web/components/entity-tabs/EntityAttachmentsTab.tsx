"use client";

import { AttachmentTable } from "@/components/business/AttachmentTable";

interface EntityAttachmentsTabProps {
  relatedType: string;
  relatedId: string;
}

export function EntityAttachmentsTab({ relatedType, relatedId }: EntityAttachmentsTabProps) {
  return <AttachmentTable relatedType={relatedType} relatedId={relatedId} />;
}
