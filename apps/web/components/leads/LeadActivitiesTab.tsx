'use client';

import { useMemo, useState } from 'react';
import { App, Button, DatePicker, Form, Input, Modal, Select, Space, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ActivityTable } from '@/components/business/ActivityTable';
import { useCreateActivity } from '@/hooks/useActivities';
import { ActivityStatus } from '@/services/activities';
import { useAttachmentConfig, useUploadAttachment } from '@/hooks/useAttachments';
import {
  DEFAULT_ALLOWED_MIME_TYPES,
  DEFAULT_MAX_ATTACHMENT_SIZE_BYTES,
} from '@/config/attachments';
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
  const uploadAttachment = useUploadAttachment();
  const { data: attachmentConfig } = useAttachmentConfig();
  const [submitting, setSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const statusOptions = useMemo(
    () =>
      Object.entries(ActivityStatus).map(([key, value]) => ({
        label: t(`activity.status.${key.toLowerCase()}`) || value,
        value,
      })),
    [t]
  );

  const allowedMimeTypes = useMemo(() => {
    if (attachmentConfig?.allowedMimeTypes?.length) {
      return attachmentConfig.allowedMimeTypes;
    }
    return DEFAULT_ALLOWED_MIME_TYPES;
  }, [attachmentConfig?.allowedMimeTypes]);

  const maxAttachmentSizeBytes =
    attachmentConfig?.maxSizeBytes ?? DEFAULT_MAX_ATTACHMENT_SIZE_BYTES;

  const resetDialog = () => {
    form.resetFields();
    form.setFieldsValue({ status: 'OPEN' });
    setFileList([]);
    setCreateOpen(false);
  };

  const uploadProps: UploadProps = {
    multiple: true,
    accept: allowedMimeTypes.join(','),
    fileList,
    beforeUpload: (file) => {
      if (file.size > maxAttachmentSizeBytes) {
        message.error(t('attachments.messages.max_size_exceeded'));
        return Upload.LIST_IGNORE;
      }
      if (allowedMimeTypes.length > 0 && file.type && !allowedMimeTypes.includes(file.type)) {
        message.error(t('attachments.messages.invalid_type'));
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ fileList: nextFileList }) => {
      setFileList(nextFileList);
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
      return true;
    },
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const activity = await createActivity.mutateAsync({
        relatedType: 'Lead',
        relatedId: leadId,
        subject: values.subject?.trim() || undefined,
        type: values.type?.trim() || undefined,
        status: values.status || 'OPEN',
        dueAt: values.dueAt ? values.dueAt.toISOString() : undefined,
        outcome: values.outcome?.trim() || undefined,
      });

      const files = fileList
        .map((item) => item.originFileObj)
        .filter(
          (file): file is NonNullable<UploadFile["originFileObj"]> => Boolean(file)
        );

      if (!files.length) {
        message.success(t('activities.messages.create_success'));
        resetDialog();
        return;
      }

      const uploadResults = await Promise.allSettled(
        files.map((file) =>
          uploadAttachment.mutateAsync({
            file,
            relatedType: 'Activity',
            relatedId: activity.id,
          })
        )
      );
      const failedCount = uploadResults.filter((result) => result.status === 'rejected').length;

      if (failedCount === 0) {
        message.success(t('activities.messages.create_with_attachments_success'));
      } else {
        message.warning(
          t('activities.messages.create_with_attachments_partial_failed', {
            failed: failedCount,
          })
        );
      }

      resetDialog();
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
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={() => setCreateOpen(true)}>
          {t('activities.actions.create')}
        </Button>
      </div>

      <Modal
        title={t('activities.dialog.create_title')}
        open={createOpen}
        onCancel={resetDialog}
        onOk={handleSubmit}
        forceRender
        confirmLoading={submitting || createActivity.isPending || uploadAttachment.isPending}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        width={720}
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'OPEN' }}>
          <Space wrap style={{ width: '100%' }} size={12}>
            <Form.Item
              label={t('activity.fields.subject')}
              name="subject"
              rules={[{ required: true, message: t('common.required') }]}
              style={{ minWidth: 260, flex: 1 }}
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
              style={{ minWidth: 160, flex: 1 }}
            >
              <Select options={statusOptions} />
            </Form.Item>
            <Form.Item
              label={t('common.due_at')}
              name="dueAt"
              style={{ minWidth: 220, flex: 1 }}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item label={t('activity.fields.outcome')} name="outcome">
            <Input.TextArea rows={3} placeholder={t('activity.fields.outcome')} />
          </Form.Item>

          <Form.Item label={t('common.attachments')}>
            <Upload {...uploadProps} listType="text">
              <Button icon={<UploadOutlined />}>{t('attachments.actions.select_files')}</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <ActivityTable relatedType="Lead" relatedId={leadId} />
    </Space>
  );
}
