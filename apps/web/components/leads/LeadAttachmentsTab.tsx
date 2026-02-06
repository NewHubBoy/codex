'use client';

import { AttachmentTable } from '@/components/business/AttachmentTable';

interface LeadAttachmentsTabProps {
  leadId: string;
}

export function LeadAttachmentsTab({ leadId }: LeadAttachmentsTabProps) {
  return <AttachmentTable relatedType="Lead" relatedId={leadId} />;
}
