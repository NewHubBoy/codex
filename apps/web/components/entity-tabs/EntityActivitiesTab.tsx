'use client';

import { useState } from 'react';
import { Space, Typography } from 'antd';
import { ActivityTable } from '@/components/business/ActivityTable';
import { AttachmentTable } from '@/components/business/AttachmentTable';
import type { Activity } from '@/services/activities';
import { useI18n } from '@/i18n/provider';

interface EntityActivitiesTabProps {
  relatedType: string;
  relatedId: string;
}

export function EntityActivitiesTab({ relatedType, relatedId }: EntityActivitiesTabProps) {
  const { t } = useI18n();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <ActivityTable relatedType={relatedType} relatedId={relatedId} selectedActivityId={selectedActivity?.id} onSelectActivity={setSelectedActivity} />
      {/* <Card
        title={t("common.attachments")}
        extra={
          selectedActivity?.subject ? (
            <Typography.Text type="secondary">{selectedActivity.subject}</Typography.Text>
          ) : null
        }
      >
        
      </Card> */}
      {selectedActivity ? (
        (selectedActivity.attachmentCount ?? 0) > 0 ? (
          <AttachmentTable relatedType="Activity" relatedId={selectedActivity.id} showUpload={false} />
        ) : (
          <Typography.Text type="secondary">{t('activities.no_attachments')}</Typography.Text>
        )
      ) : null}
    </Space>
  );
}
