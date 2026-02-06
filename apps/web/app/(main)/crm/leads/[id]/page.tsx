'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
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
  DatePicker,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import { useLead, useDeleteLead, useUpdateLead, useSubmitLead } from '@/hooks/useLeads';
import { PageHeader } from '@/components/common/PageHeader';
import { useEffect, useMemo, useState } from 'react';
import { LeadSource, LeadRating, LeadStatus } from '@/services/leads';
import { useI18n } from '@/i18n/provider';
import { getErrorMessage } from '@/utils/error';
import dayjs from 'dayjs';

const { Text } = Typography;

const LeadOwnerTab = dynamic(
  () => import('@/components/leads/LeadOwnerTab').then((mod) => mod.LeadOwnerTab),
  { loading: () => <Spin size="small" /> }
);

const LeadActivitiesTab = dynamic(
  () => import('@/components/leads/LeadActivitiesTab').then((mod) => mod.LeadActivitiesTab),
  { loading: () => <Spin size="small" /> }
);

const LeadAttachmentsTab = dynamic(
  () => import('@/components/leads/LeadAttachmentsTab').then((mod) => mod.LeadAttachmentsTab),
  { loading: () => <Spin size="small" /> }
);

const LeadSystemTab = dynamic(
  () => import('@/components/leads/LeadSystemTab').then((mod) => mod.LeadSystemTab),
  { loading: () => <Spin size="small" /> }
);

const statusColors: Record<string, string> = {
  NEW: 'blue',
  ASSIGNED: 'cyan',
  WORKING: 'green',
  INTERESTED: 'orange',
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
  const [activeTab, setActiveTab] = useState('activity');

  const { data: lead, isLoading, refetch } = useLead(id);
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();
  const submitLead = useSubmitLead();
  const isDraft = lead?.status === 'DRAFT';

  const statusLabels: Record<string, string> = {
    NEW: t('lead.status.new'),
    ASSIGNED: t('lead.status.assigned'),
    WORKING: t('lead.status.working'),
    INTERESTED: t('lead.status.interested'),
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
        contactName: lead.contactName,
        companyName: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        rating: lead.rating,
        expectedValue: lead.expectedValue,
        initialNeed: lead.initialNeed,
        firstFollowUpDueAt: lead.firstFollowUpDueAt
          ? dayjs(lead.firstFollowUpDueAt)
          : undefined,
        nextFollowUpAt: lead.nextFollowUpAt ? dayjs(lead.nextFollowUpAt) : undefined,
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
      const payload = {
        ...values,
        email: values.email || undefined,
        phone: values.phone || undefined,
        firstFollowUpDueAt: values.firstFollowUpDueAt
          ? values.firstFollowUpDueAt.toISOString()
          : undefined,
        nextFollowUpAt: values.nextFollowUpAt
          ? values.nextFollowUpAt.toISOString()
          : undefined,
      };
      if (!lead) {
        return;
      }
      if (isDraft) {
        await submitLead.mutateAsync({ id, data: payload });
        message.success(t('lead.messages.create_success'));
      } else {
        await updateLead.mutateAsync({ id, data: payload });
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
        contactName: lead.contactName,
        companyName: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        rating: lead.rating,
        expectedValue: lead.expectedValue,
        initialNeed: lead.initialNeed,
        firstFollowUpDueAt: lead.firstFollowUpDueAt
          ? dayjs(lead.firstFollowUpDueAt)
          : undefined,
        nextFollowUpAt: lead.nextFollowUpAt ? dayjs(lead.nextFollowUpAt) : undefined,
        description: lead.description,
        ownerId: lead.ownerId,
        status: lead.status === 'DRAFT' ? undefined : lead.status,
      });
    }
  };

  const tabItems = useMemo(
    () => {
      if (!lead) {
        return [];
      }
      return [
      {
        key: 'owner',
        label: t('common.owner_info'),
        children: activeTab === 'owner' ? <LeadOwnerTab owner={lead.owner} /> : null,
      },
      {
        key: 'activity',
        label: t('common.activities'),
        children: activeTab === 'activity' ? <LeadActivitiesTab leadId={id} /> : null,
      },
      {
        key: 'attachments',
        label: t('common.attachments'),
        children: activeTab === 'attachments' ? <LeadAttachmentsTab leadId={id} /> : null,
      },
      {
        key: 'system',
        label: t('common.system_info'),
        children: activeTab === 'system' ? (
          <LeadSystemTab
            lead={{ id: lead.id, serialId: lead.serialId, createdAt: lead.createdAt, updatedAt: lead.updatedAt }}
          />
        ) : null,
      },
      ];
    },
    [activeTab, id, lead, t]
  );

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
            <Form form={form} requiredMark="optional">
              <Descriptions column={2} bordered>
                <Descriptions.Item label={t('lead.fields.name')}>
                  <Form.Item
                    name="name"
                    rules={[{ required: true, message: t('lead.validation.name_required') }]}
                    noStyle
                  >
                    <Input placeholder={t('lead.placeholders.name')} />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.contact_name')}>
                  <Form.Item
                    name="contactName"
                    rules={[{ required: true, message: t('lead.validation.contact_name_required') }]}
                    noStyle
                  >
                    <Input placeholder={t('lead.placeholders.contact_name')} />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.company')}>
                  <Form.Item
                    name="companyName"
                    rules={[{ required: true, message: t('lead.validation.company_required') }]}
                    noStyle
                  >
                    <Input placeholder={t('lead.placeholders.company')} />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.email')}>
                  <Form.Item
                    name="email"
                    rules={[
                      { type: 'email', message: t('lead.validation.email_invalid') },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (value || getFieldValue('phone')) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error(t('lead.validation.contact_required')));
                        },
                      }),
                    ]}
                    noStyle
                  >
                    <Input placeholder={t('lead.placeholders.email')} />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.phone')}>
                  <Form.Item
                    name="phone"
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (value || getFieldValue('email')) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error(t('lead.validation.contact_required')));
                        },
                      }),
                    ]}
                    noStyle
                  >
                    <Input placeholder={t('lead.placeholders.phone')} />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.status')}>
                  <Form.Item name="status" noStyle>
                    <Select
                      allowClear
                      placeholder={t('lead.placeholders.status')}
                      options={Object.entries(LeadStatus)
                        .filter(([key]) => key !== 'DRAFT')
                        .map(([key, value]) => ({
                          label: statusLabels[key] + ' - ' + key || key,
                          value,
                        }))}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.rating')}>
                  <Form.Item name="rating" noStyle>
                    <Select
                      placeholder={t('lead.placeholders.rating')}
                      options={Object.entries(LeadRating).map(([key, value]) => ({
                        label: ratingLabels[key] || key,
                        value,
                      }))}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.source')}>
                  <Form.Item
                    name="source"
                    rules={[{ required: true, message: t('lead.validation.source_required') }]}
                    noStyle
                  >
                    <Select
                      placeholder={t('lead.placeholders.source')}
                      options={Object.entries(LeadSource).map(([key, value]) => ({
                        label: sourceLabels[key] || key.replace('_', ' '),
                        value,
                      }))}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.expected_value')}>
                  <Form.Item name="expectedValue" noStyle>
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder={t('lead.placeholders.expected_value')}
                      min={0}
                      precision={2}
                      prefix="¥"
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.first_follow_up_due_at')}>
                  <Form.Item
                    name="firstFollowUpDueAt"
                    rules={[
                      {
                        required: true,
                        message: t('lead.validation.first_follow_up_due_at_required'),
                      },
                    ]}
                    noStyle
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      showTime
                      placeholder={t('lead.placeholders.first_follow_up_due_at')}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.next_follow_up_at')} span={2}>
                  <Form.Item name="nextFollowUpAt" noStyle>
                    <DatePicker
                      style={{ width: '100%' }}
                      showTime
                      placeholder={t('lead.placeholders.next_follow_up_at')}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.initial_need')} span={2}>
                  <Form.Item
                    name="initialNeed"
                    rules={[{ required: true, message: t('lead.validation.initial_need_required') }]}
                    noStyle
                  >
                    <Input.TextArea rows={3} placeholder={t('lead.placeholders.initial_need')} />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={t('lead.fields.description')} span={2}>
                  <Form.Item name="description" noStyle>
                    <Input.TextArea rows={4} placeholder={t('lead.placeholders.description')} />
                  </Form.Item>
                </Descriptions.Item>
              </Descriptions>
            </Form>
          ) : (
            <Descriptions column={2} bordered>
              <Descriptions.Item label={t('lead.fields.name')}>{lead.name}</Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.contact_name')}>
                {lead.contactName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.company')}>
                {lead.companyName || '-'}
              </Descriptions.Item>
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
              <Descriptions.Item label={t('lead.fields.expected_value')} span={2}>
                {lead.expectedValue ? `¥${lead.expectedValue.toLocaleString(locale)}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.initial_need')} span={2}>
                {lead.initialNeed || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.first_follow_up_due_at')}>
                {lead.firstFollowUpDueAt
                  ? new Date(lead.firstFollowUpDueAt).toLocaleString(locale)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.last_activity_at')}>
                {lead.lastActivityAt ? new Date(lead.lastActivityAt).toLocaleString(locale) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.next_follow_up_at')} span={2}>
                {lead.nextFollowUpAt
                  ? new Date(lead.nextFollowUpAt).toLocaleString(locale)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('lead.fields.description')} span={2}>
                {lead.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>

        <Card>
          <Tabs
            items={tabItems}
            activeKey={activeTab}
            onChange={setActiveTab}
            destroyOnHidden
          />
        </Card>
      </Space>
    </div>
  );
}
