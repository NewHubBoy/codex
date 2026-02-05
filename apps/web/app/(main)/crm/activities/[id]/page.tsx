'use client';

import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, Typography, Button, Space, Tag, Descriptions, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { useActivity } from '@/hooks/useActivities';
import { useI18n } from '@/i18n/provider';

const { Text } = Typography;

const AttachmentTable = dynamic(
  () => import('@/components/business/AttachmentTable').then((mod) => mod.AttachmentTable),
  {
    loading: () => <Spin size="small" />,
  }
);

const statusColors: Record<string, string> = {
  OPEN: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  const id = params.id as string;

  const { data: activity, isLoading } = useActivity(id);

  const statusLabels: Record<string, string> = {
    OPEN: t('activity.status.open'),
    COMPLETED: t('activity.status.completed'),
    CANCELLED: t('activity.status.cancelled'),
  };

  const relatedTypeLabels: Record<string, string> = {
    Lead: t('related.lead'),
    Opportunity: t('related.opportunity'),
    Account: t('related.account'),
    Contact: t('related.contact'),
    Ticket: t('related.ticket'),
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!activity) {
    return (
      <Card>
        <Text type="secondary">{t('activity.messages.not_found')}</Text>
      </Card>
    );
  }

  const relatedLabel = activity.relatedType
    ? relatedTypeLabels[activity.relatedType] || activity.relatedType
    : '-';

  const relatedDisplay = activity.relatedId
    ? `${relatedLabel} #${activity.relatedId.slice(0, 8)}`
    : '-';

  const renderRelated = () => {
    if (!activity.relatedType || !activity.relatedId) {
      return '-';
    }
    if (activity.relatedType === 'Lead') {
      return <Link href={`/crm/leads/${activity.relatedId}`}>{relatedDisplay}</Link>;
    }
    if (activity.relatedType === 'Ticket') {
      return <Link href={`/crm/tickets/${activity.relatedId}`}>{relatedDisplay}</Link>;
    }
    if (activity.relatedType === 'Opportunity') {
      return <Link href={`/crm/opportunities/${activity.relatedId}`}>{relatedDisplay}</Link>;
    }
    if (activity.relatedType === 'Account') {
      return <Link href={`/crm/accounts/${activity.relatedId}`}>{relatedDisplay}</Link>;
    }
    if (activity.relatedType === 'Contact') {
      return <Link href={`/crm/contacts/${activity.relatedId}`}>{relatedDisplay}</Link>;
    }
    return relatedDisplay;
  };

  const tabItems = [
    {
      key: 'owner',
      label: t('common.owner_info'),
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label={t('common.owner_name')}>
            {activity.owner?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.owner_email')}>
            {activity.owner?.email || '-'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'attachments',
      label: t('common.attachments'),
      children: <AttachmentTable relatedType="Activity" relatedId={id} />,
    },
    {
      key: 'system',
      label: t('common.system_info'),
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label={t('common.created_at')}>
            {new Date(activity.createdAt).toLocaleString(locale)}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.updated_at')}>
            {new Date(activity.updatedAt).toLocaleString(locale)}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.serial_id')} span={2}>
            {activity.serialId}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.id')} span={2}>
            <Text copyable style={{ fontFamily: 'monospace' }}>
              {activity.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={activity.subject || t('activities.detail.title')}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            {t('common.back')}
          </Button>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card title={t('common.basic_info')}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label={t('activity.fields.subject')}>
              {activity.subject || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('common.type')}>
              {activity.type || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('common.status')}>
              <Tag color={statusColors[activity.status] || 'default'}>
                {statusLabels[activity.status] || activity.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('activity.fields.related')}>
              {renderRelated()}
            </Descriptions.Item>
            <Descriptions.Item label={t('common.due_at')}>
              {activity.dueAt ? new Date(activity.dueAt).toLocaleString(locale) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('common.completed_at')}>
              {activity.completedAt ? new Date(activity.completedAt).toLocaleString(locale) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('activity.fields.outcome')} span={2}>
              {activity.outcome || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Tabs items={tabItems} />
      </Space>
    </div>
  );
}
