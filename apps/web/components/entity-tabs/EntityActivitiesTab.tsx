"use client";

import { ActivityTable } from "@/components/business/ActivityTable";

interface EntityActivitiesTabProps {
  relatedType: string;
  relatedId: string;
}

export function EntityActivitiesTab({ relatedType, relatedId }: EntityActivitiesTabProps) {
  return <ActivityTable relatedType={relatedType} relatedId={relatedId} />;
}
