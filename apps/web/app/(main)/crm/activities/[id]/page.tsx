'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, Typography, Button, Space, Tag, Descriptions, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { useActivity } from '@/hooks/useActivities';
import { AttachmentTable } from '@/components/business/AttachmentTable';

const { Text } = Typography;

const statusColors: Record<string, string> = {
  OPEN: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const statusLabels: Record<string, string> = {
  OPEN: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

const relatedTypeLabels: Record<string, string> = {
  Lead: '线索',
  Opportunity: '商机',
  Account: '客户',
  Contact: '联系人',
  Ticket: '工单',
};

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: activity, isLoading } = useActivity(id);

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
        <Text type="secondary">未找到该活动</Text>
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
    return relatedDisplay;
  };

  const tabItems = [
    {
      key: 'attachments',
      label: '附件',
      children: <AttachmentTable relatedType="Activity" relatedId={id} />,
    },
    {
      key: 'system',
      label: '系统信息',
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="创建时间">
            {new Date(activity.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            {new Date(activity.updatedAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="编号" span={2}>
            {activity.serialId}
          </Descriptions.Item>
          <Descriptions.Item label="ID" span={2}>
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
        title={activity.subject || '活动详情'}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            返回
          </Button>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card title="基本信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="主题">{activity.subject || '-'}</Descriptions.Item>
            <Descriptions.Item label="类型">{activity.type || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[activity.status] || 'default'}>
                {statusLabels[activity.status] || activity.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="关联对象">{renderRelated()}</Descriptions.Item>
            <Descriptions.Item label="截止时间">
              {activity.dueAt ? new Date(activity.dueAt).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="完成时间">
              {activity.completedAt ? new Date(activity.completedAt).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="结果" span={2}>
              {activity.outcome || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Tabs items={tabItems} />
      </Space>
    </div>
  );
}
