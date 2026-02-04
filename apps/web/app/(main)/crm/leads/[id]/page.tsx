'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Tabs,
  Descriptions,
  Spin,
  App,
  Popconfirm,
  Form,
  Input,
  Select,
  InputNumber,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import { useLead, useDeleteLead, useUpdateLead, useSubmitLead } from '@/hooks/useLeads';
import { PageHeader } from '@/components/common/PageHeader';
import { useEffect, useState } from 'react';
import { LeadSource, LeadRating, LeadStatus } from '@/services/leads';
import { AttachmentTable } from '@/components/business/AttachmentTable';
import { ActivityTable } from '@/components/business/ActivityTable';
import { useI18n } from '@/i18n/provider';
import { getErrorMessage } from '@/utils/error';

const { Text } = Typography;

const statusColors: Record<string, string> = {
  NEW: 'blue',
  ASSIGNED: 'cyan',
  WORKING: 'green',
  QUALIFIED: 'purple',
  CONVERTED: 'gold',
  DISQUALIFIED: 'red',
};

const ratingColors: Record<string, string> = {
  HOT: 'red',
  WARM: 'orange',
  COLD: 'blue',
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const { t, locale } = useI18n();
  const id = params.id as string;
  const operationType = searchParams.get('operationType');

  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  const { data: lead, isLoading, refetch } = useLead(id);
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();
  const submitLead = useSubmitLead();
  const isDraft = lead?.status === 'DRAFT';

  const statusLabels: Record<string, string> = {
    NEW: t('lead.status.new'),
    ASSIGNED: t('lead.status.assigned'),
    WORKING: t('lead.status.working'),
    QUALIFIED: t('lead.status.qualified'),
    CONVERTED: t('lead.status.converted'),
    DISQUALIFIED: t('lead.status.disqualified'),
    DRAFT: t('lead.status.draft'),
  };

  const ratingLabels: Record<string, string> = {
    HOT: t('lead.rating.hot'),
    WARM: t('lead.rating.warm'),
    COLD: t('lead.rating.cold'),
  };

  const sourceLabels: Record<string, string> = {
    WEBSITE: t('lead.source.website'),
    REFERRAL: t('lead.source.referral'),
    COLD_CALL: t('lead.source.cold_call'),
    TRADE_SHOW: t('lead.source.trade_show'),
    SOCIAL_MEDIA: t('lead.source.social_media'),
    OTHER: t('lead.source.other'),
  };

  // 根据 operationType 自动进入编辑模式
  useEffect(() => {
    if (operationType === 'edit' && lead) {
      setIsEditing(true);
      // 清除 URL 参数，避免刷新时重复打开
      router.replace(`/crm/leads/${id}`, { scroll: false });
    }
  }, [operationType, lead, router, id]);

  useEffect(() => {
    if (lead) {
      form.setFieldsValue({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        rating: lead.rating,
        expectedValue: lead.expectedValue,
        description: lead.description,
        ownerId: lead.ownerId,
        status: lead.status === 'DRAFT' ? undefined : lead.status,
      });
      if (lead.status === 'DRAFT') {
        setIsEditing(true);
      }
    }
  }, [lead, form]);

  const handleDelete = async () => {
    try {
      await deleteLead.mutateAsync(id);
      message.success(t('lead.messages.delete_success'));
      router.push('/crm/leads');
    } catch (error) {
      message.error(getErrorMessage(error, t('lead.messages.delete_failed')));
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!lead) {
        return;
      }
      if (isDraft) {
        await submitLead.mutateAsync({ id, data: values });
        message.success(t('lead.messages.create_success'));
      } else {
        await updateLead.mutateAsync({ id, data: values });
        message.success(t('lead.messages.update_success'));
      }
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('保存失败:', error);
      message.error(getErrorMessage(error, t('lead.messages.save_failed')));
    }
  };

  const handleCancelEdit = async () => {
    if (isDraft) {
      try {
        await deleteLead.mutateAsync(id);
      } catch (error) {
        console.error('删除草稿失败:', error);
        message.error(getErrorMessage(error, t('lead.messages.delete_draft_failed')));
      }
      router.push('/crm/leads');
      return;
    }
    setIsEditing(false);
    if (lead) {
      form.setFieldsValue({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        rating: lead.rating,
        expectedValue: lead.expectedValue,
        description: lead.description,
        ownerId: lead.ownerId,
        status: lead.status === 'DRAFT' ? undefined : lead.status,
      });
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lead) {
    return (
      <Card>
        <Text type="secondary">{t('lead.messages.not_found')}</Text>
      </Card>
    );
  }

  const tabItems = [
    {
      key: 'owner',
      label: t('common.owner_info'),
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label={t('common.owner_name')}>
            {lead.owner?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.owner_email')}>
            {lead.owner?.email || '-'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'activity',
      label: t('common.activities'),
      children: <ActivityTable relatedType="Lead" relatedId={id} />,
    },
    {
      key: 'attachments',
      label: t('common.attachments'),
      children: <AttachmentTable relatedType="Lead" relatedId={id} />,
    },
    {
      key: 'system',
      label: t('common.system_info'),
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label={t('common.created_at')}>
            {new Date(lead.createdAt).toLocaleString(locale)}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.updated_at')}>
            {new Date(lead.updatedAt).toLocaleString(locale)}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.serial_id')} span={2}>
            {lead.serialId}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.id')} span={2}>
            <Text copyable style={{ fontFamily: 'monospace' }}>
              {lead.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={lead.name || t('leads.detail.new_title')}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            {t('common.back')}
          </Button>,
          ...(isEditing
            ? [
                <Button key="cancel" onClick={handleCancelEdit}>
                  {t('common.cancel')}
                </Button>,
                <Button
                  key="save"
                  type="primary"
                  loading={submitLead.isPending || updateLead.isPending}
                  onClick={handleSave}
                >
                  {t('common.save')}
                </Button>,
              ]
            : [
                <Button key="edit" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                  {t('common.edit')}
                </Button>,
                <Button
                  key="convert"
                  icon={<SwapOutlined />}
                  type="primary"
                  disabled={lead.status === 'CONVERTED'}
                >
                  {t('lead.actions.convert')}
                </Button>,
              ]),
          <Popconfirm
            key="delete"
            title={t('common.delete_confirm_title')}
            description={t('lead.messages.delete_confirm')}
            onConfirm={handleDelete}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
          >
            <Button danger icon={<DeleteOutlined />}>
              {t('common.delete')}
            </Button>
          </Popconfirm>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* 基本信息 */}
        <Card title={t('common.basic_info')}>
          {isEditing ? (
            <Form form={form} layout="vertical" requiredMark="optional">
              <Form.Item name="name" label={t('lead.fields.name')} rules={[{ required: true, message: t('lead.validation.name_required') }]}>
                <Input placeholder={t('lead.placeholders.name')} />
              </Form.Item>

              <Form.Item name="company" label={t('lead.fields.company')}>
                <Input placeholder={t('lead.placeholders.company')} />
              </Form.Item>

              <Space style={{ width: '100%' }} size={16}>
                <Form.Item
                  name="email"
                  label={t('lead.fields.email')}
                  style={{ flex: 1 }}
                  rules={[{ type: 'email', message: t('lead.validation.email_invalid') }]}
                >
                  <Input placeholder={t('lead.placeholders.email')} />
                </Form.Item>

                <Form.Item name="phone" label={t('lead.fields.phone')} style={{ flex: 1 }}>
                  <Input placeholder={t('lead.placeholders.phone')} />
                </Form.Item>
              </Space>

              <Space style={{ width: '100%' }} size={16}>
                <Form.Item name="source" label={t('lead.fields.source')} style={{ flex: 1 }}>
                  <Select
                    placeholder={t('lead.placeholders.source')}
                    options={Object.entries(LeadSource).map(([key, value]) => ({
                      label: sourceLabels[key] || key.replace('_', ' '),
                      value,
                    }))}
                  />
                </Form.Item>

                <Form.Item name="rating" label={t('lead.fields.rating')} style={{ flex: 1 }}>
                  <Select
                    placeholder={t('lead.placeholders.rating')}
                    options={Object.entries(LeadRating).map(([key, value]) => ({
                      label: ratingLabels[key] || key,
                      value,
                    }))}
                  />
                </Form.Item>
              </Space>

              <Form.Item name="expectedValue" label={t('lead.fields.expected_value')}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('lead.placeholders.expected_value')}
                  min={0}
                  precision={2}
                  prefix="¥"
                />
              </Form.Item>

              <Form.Item name="status" label={t('lead.fields.status')}>
                <Select
                  allowClear
                  placeholder={t('lead.placeholders.status')}
                  options={Object.entries(LeadStatus)
                    .filter(([key]) => key !== 'DRAFT')
                    .map(([key, value]) => ({
                      label: statusLabels[key] +  " - " + key || key,
                      value,
                    }))}
                />
              </Form.Item>

              <Form.Item name="description" label={t('lead.fields.description')}>
                <Input.TextArea rows={4} placeholder={t('lead.placeholders.description')} />
              </Form.Item>
            </Form>
          ) : (
            <Descriptions column={2} bordered>
              <Descriptions.Item label={t('lead.fields.name')}>{lead.name}</Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.company')}>{lead.company || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.email')}>{lead.email || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.phone')}>{lead.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.status')}>
                <Tag color={statusColors[lead.status]}>{statusLabels[lead.status] || lead.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.rating')}>
                <Tag color={ratingColors[lead.rating || ''] || 'default'}>
                  {lead.rating ? ratingLabels[lead.rating] || lead.rating : '-'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.source')}>
                {lead.source ? sourceLabels[lead.source] || lead.source : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.expected_value')}>
                {lead.expectedValue ? `¥${lead.expectedValue.toLocaleString(locale)}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.description')} span={2}>
                {lead.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>

        <Card>
          <Tabs items={tabItems} defaultActiveKey="activity" />
        </Card>
      </Space>
    </div>
  );
}
