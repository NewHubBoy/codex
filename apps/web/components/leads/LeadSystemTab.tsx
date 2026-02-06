'use client';

import { Descriptions, Typography } from 'antd';
import { useI18n } from '@/i18n/provider';

const { Text } = Typography;

interface LeadSystemTabProps {
  lead: {
    id: string;
    serialId?: number | null;
    createdAt: string;
    updatedAt: string;
  };
}

export function LeadSystemTab({ lead }: LeadSystemTabProps) {
  const { t, locale } = useI18n();

  return (
    <Descriptions column={2} bordered>
      <Descriptions.Item label={t('common.created_at')}>
        {new Date(lead.createdAt).toLocaleString(locale)}
      </Descriptions.Item>
      <Descriptions.Item label={t('common.updated_at')}>
        {new Date(lead.updatedAt).toLocaleString(locale)}
      </Descriptions.Item>
      <Descriptions.Item label={t('common.serial_id')} span={2}>
        {lead.serialId ?? '-'}
      </Descriptions.Item>
      <Descriptions.Item label={t('common.id')} span={2}>
        <Text copyable style={{ fontFamily: 'monospace' }}>
          {lead.id}
        </Text>
      </Descriptions.Item>
    </Descriptions>
  );
}
