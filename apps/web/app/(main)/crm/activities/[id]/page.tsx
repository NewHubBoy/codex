'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, Typography, Button, Space, Tag, Descriptions, Spin, App, Upload, Table, Popconfirm } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { useActivity } from '@/hooks/useActivities';
import { useAttachmentConfig, useAttachments, useDeleteAttachment, useUploadAttachment } from '@/hooks/useAttachments';
import type { Attachment } from '@/services/attachments';
import { useState } from 'react';
import { DEFAULT_ALLOWED_MIME_TYPES, DEFAULT_MAX_ATTACHMENT_SIZE_BYTES } from '@/config/attachments';

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

const fallbackAllowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES;

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes)) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const id = params.id as string;
  const [attachmentPage, setAttachmentPage] = useState(1);
  const [attachmentPageSize, setAttachmentPageSize] = useState(5);

  const { data: activity, isLoading } = useActivity(id);
  const { data: attachmentConfig } = useAttachmentConfig();
  const { data: attachmentData, isLoading: isAttachmentsLoading } = useAttachments({
    page: attachmentPage,
    pageSize: attachmentPageSize,
    relatedType: 'Activity',
    relatedId: id,
    sort: 'createdAt:desc',
  });
  const deleteAttachment = useDeleteAttachment();
  const uploadAttachment = useUploadAttachment();
  const effectiveAllowedMimeTypes = attachmentConfig?.allowedMimeTypes?.length ? attachmentConfig.allowedMimeTypes : fallbackAllowedMimeTypes;
  const maxAttachmentSizeBytes = attachmentConfig?.maxSizeBytes ?? DEFAULT_MAX_ATTACHMENT_SIZE_BYTES;

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachment.mutateAsync(attachmentId);
      message.success('删除成功');
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const uploadProps = {
    showUploadList: false,
    multiple: false,
    accept: effectiveAllowedMimeTypes.join(','),
    beforeUpload: (file: File) => {
      if (file.size > maxAttachmentSizeBytes) {
        message.error('附件大小不能超过 20MB');
        return Upload.LIST_IGNORE;
      }
      if (effectiveAllowedMimeTypes.length > 0 && file.type && !effectiveAllowedMimeTypes.includes(file.type)) {
        message.error('不支持的文件类型');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: async (options: any) => {
      try {
        const file = options.file as File;
        await uploadAttachment.mutateAsync({
          file,
          relatedType: 'Activity',
          relatedId: id,
        });
        message.success('上传成功');
        options.onSuccess?.({}, file);
      } catch (error) {
        console.error('上传失败:', error);
        message.error('上传失败');
        options.onError?.(error);
      }
    },
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
        <Text type="secondary">未找到该活动</Text>
      </Card>
    );
  }

  const attachmentColumns = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
      render: (text: string, record: Attachment) =>
        (record.mimeType?.startsWith('image/') ? (
          <a href={record.url} target="_blank" rel="noreferrer">
            {text}
          </a>
        ) : (
          text
        )) || '-',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (value: number) => formatFileSize(value),
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value: string) => (value ? new Date(value).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: Attachment) => (
        <Space>
          {record.url ? (
            <Space size={4}>
              <a href={record.url} target="_blank" rel="noreferrer">
                下载
              </a>
            </Space>
          ) : (
            <span>-</span>
          )}
          <Popconfirm title="确认删除" description="确定要删除该附件吗？" onConfirm={() => handleDeleteAttachment(record.id)} okText="确认" cancelText="取消">
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const relatedLabel = activity.relatedType ? relatedTypeLabels[activity.relatedType] || activity.relatedType : '-';

  const relatedDisplay = activity.relatedId ? `${relatedLabel} #${activity.relatedId.slice(0, 8)}` : '-';

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
              <Tag color={statusColors[activity.status] || 'default'}>{statusLabels[activity.status] || activity.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="关联对象">{renderRelated()}</Descriptions.Item>
            <Descriptions.Item label="截止时间">{activity.dueAt ? new Date(activity.dueAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
            <Descriptions.Item label="完成时间">{activity.completedAt ? new Date(activity.completedAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
            <Descriptions.Item label="结果" span={2}>
              {activity.outcome || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title="附件"
          extra={
            <Upload {...uploadProps} disabled={uploadAttachment.isPending}>
              <Button icon={<UploadOutlined />} loading={uploadAttachment.isPending}>
                上传附件
              </Button>
            </Upload>
          }
        >
          <Table
            columns={attachmentColumns}
            dataSource={attachmentData?.data}
            rowKey="id"
            loading={isAttachmentsLoading}
            pagination={{
              current: attachmentPage,
              pageSize: attachmentPageSize,
              total: attachmentData?.total || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            onChange={(pagination) => {
              setAttachmentPage(pagination.current || 1);
              setAttachmentPageSize(pagination.pageSize || 5);
            }}
          />
        </Card>

        <Card title="系统信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="创建时间">{new Date(activity.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
            <Descriptions.Item label="最后更新时间">{new Date(activity.updatedAt).toLocaleString('zh-CN')}</Descriptions.Item>
            <Descriptions.Item label="编号" span={2}>
              {activity.serialId}
            </Descriptions.Item>
            <Descriptions.Item label="ID" span={2}>
              <Text copyable style={{ fontFamily: 'monospace' }}>
                {activity.id}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
}
