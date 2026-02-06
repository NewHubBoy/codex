'use client';

import { useState } from 'react';
import { App, Button, Card, DatePicker, Form, Input, Select, Space } from 'antd';
import { ActivityTable } from '@/components/business/ActivityTable';
import { useCreateActivity } from '@/hooks/useActivities';
import { ActivityStatus } from '@/services/activities';
import { useI18n } from '@/i18n/provider';
import { getErrorMessage } from '@/utils/error';

interface LeadActivitiesTabProps {
  leadId: string;
}

export function LeadActivitiesTab({ leadId }: LeadActivitiesTabProps) {
  const { t } = useI18n();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const createActivity = useCreateActivity();
  const [submitting, setSubmitting] = useState(false);

  const statusOptions = Object.entries(ActivityStatus).map(([key, value]) => ({
    label: t(`activity.status.${key.toLowerCase()}`) || value,
    value,
  }));

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await createActivity.mutateAsync({
        relatedType: 'Lead',
        relatedId: leadId,
        subject: values.subject?.trim() || undefined,
        type: values.type?.trim() || undefined,
        status: values.status || 'OPEN',
        dueAt: values.dueAt ? values.dueAt.toISOString() : undefined,
        outcome: values.outcome?.trim() || undefined,
      });
      message.success(t('activities.messages.create_success'));
      form.resetFields();
      form.setFieldsValue({ status: 'OPEN' });
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      message.error(getErrorMessage(error, t('activities.messages.create_failed')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card title={t('activities.actions.create')}>
        <Form form={form} layout="vertical" initialValues={{ status: 'OPEN' }}>
          <Space wrap style={{ width: '100%' }} size={16}>
            <Form.Item
              label={t('activity.fields.subject')}
              name="subject"
              rules={[{ required: true, message: t('common.required') }]}
              style={{ minWidth: 240, flex: 1 }}
            >
              <Input placeholder={t('activity.fields.subject')} />
            </Form.Item>
            <Form.Item
              label={t('common.type')}
              name="type"
              style={{ minWidth: 200, flex: 1 }}
            >
              <Input placeholder={t('common.type')} />
            </Form.Item>
            <Form.Item
              label={t('common.status')}
              name="status"
              style={{ minWidth: 200, flex: 1 }}
            >
              <Select options={statusOptions} />
            </Form.Item>
            <Form.Item
              label={t('common.due_at')}
              name="dueAt"
              style={{ minWidth: 240, flex: 1 }}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item label={t('activity.fields.outcome')} name="outcome">
            <Input.TextArea rows={3} placeholder={t('activity.fields.outcome')} />
          </Form.Item>
          <Button
            type="primary"
            loading={submitting || createActivity.isPending}
            onClick={handleSubmit}
          >
            {t('common.save')}
          </Button>
        </Form>
      </Card>

      <ActivityTable relatedType="Lead" relatedId={leadId} />
    </Space>
  );
}
