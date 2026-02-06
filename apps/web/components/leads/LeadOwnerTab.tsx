'use client';

import { Descriptions } from 'antd';
import { useI18n } from '@/i18n/provider';

interface LeadOwnerTabProps {
  owner?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export function LeadOwnerTab({ owner }: LeadOwnerTabProps) {
  const { t } = useI18n();

  return (
    <Descriptions column={2} bordered>
      <Descriptions.Item label={t('common.owner_name')}>
        {owner?.name || '-'}
      </Descriptions.Item>
      <Descriptions.Item label={t('common.owner_email')}>
        {owner?.email || '-'}
      </Descriptions.Item>
    </Descriptions>
  );
}
