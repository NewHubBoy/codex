"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Table,
  Tabs,
  Upload,
  Descriptions,
  Spin,
  App,
  Popconfirm,
  Form,
  Input,
  Select,
  InputNumber,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useLead, useDeleteLead, useUpdateLead, useSubmitLead } from "@/hooks/useLeads";
import { PageHeader } from "@/components/common/PageHeader";
import { useEffect, useState } from "react";
import { LeadSource, LeadRating, LeadStatus } from "@/services/leads";
import { useActivities } from "@/hooks/useActivities";
import {
  useAttachmentConfig,
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from "@/hooks/useAttachments";
import type { Attachment } from "@/services/attachments";
import {
  DEFAULT_ALLOWED_MIME_TYPES,
  DEFAULT_MAX_ATTACHMENT_SIZE_BYTES,
} from "@/config/attachments";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  NEW: "blue",
  ASSIGNED: "cyan",
  WORKING: "green",
  QUALIFIED: "purple",
  CONVERTED: "gold",
  DISQUALIFIED: "red",
};

const ratingColors: Record<string, string> = {
  HOT: "red",
  WARM: "orange",
  COLD: "blue",
};

const sourceLabels: Record<string, string> = {
  WEBSITE: "官网",
  REFERRAL: "推荐",
  COLD_CALL: "冷访",
  TRADE_SHOW: "展会",
  SOCIAL_MEDIA: "社交媒体",
  OTHER: "其他",
};

const fallbackAllowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES;

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const activityStatusColors: Record<string, string> = {
  OPEN: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
};

const activityStatusLabels: Record<string, string> = {
  OPEN: "进行中",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const id = params.id as string;
  const operationType = searchParams.get("operationType");

  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  const { data: lead, isLoading, refetch } = useLead(id);
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();
  const submitLead = useSubmitLead();
  const isDraft = lead?.status === "DRAFT";
  const [activityPage, setActivityPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(5);
  const [attachmentPage, setAttachmentPage] = useState(1);
  const [attachmentPageSize, setAttachmentPageSize] = useState(5);

  const { data: activityData, isLoading: isActivitiesLoading } = useActivities({
    page: activityPage,
    pageSize: activityPageSize,
    relatedType: "Lead",
    relatedId: id,
    sort: "createdAt:desc",
  });

  const { data: attachmentConfig } = useAttachmentConfig();
  const { data: attachmentData, isLoading: isAttachmentsLoading } = useAttachments({
    page: attachmentPage,
    pageSize: attachmentPageSize,
    relatedType: "Lead",
    relatedId: id,
    sort: "createdAt:desc",
  });

  const deleteAttachment = useDeleteAttachment();
  const uploadAttachment = useUploadAttachment();
  const effectiveAllowedMimeTypes =
    attachmentConfig?.allowedMimeTypes?.length
      ? attachmentConfig.allowedMimeTypes
      : fallbackAllowedMimeTypes;
  const maxAttachmentSizeBytes =
    attachmentConfig?.maxSizeBytes ?? DEFAULT_MAX_ATTACHMENT_SIZE_BYTES;

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachment.mutateAsync(attachmentId);
      message.success("删除成功");
    } catch (error) {
      console.error("删除失败:", error);
      message.error("删除失败");
    }
  };

  // 根据 operationType 自动进入编辑模式
  useEffect(() => {
    if (operationType === "edit" && lead) {
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
        status: lead.status === "DRAFT" ? undefined : lead.status,
      });
      if (lead.status === "DRAFT") {
        setIsEditing(true);
      }
    }
  }, [lead, form]);

  const handleDelete = async () => {
    try {
      await deleteLead.mutateAsync(id);
      message.success("删除成功");
      router.push("/crm/leads");
    } catch {
      message.error("删除失败");
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
        message.success("创建成功");
      } else {
        await updateLead.mutateAsync({ id, data: values });
        message.success("更新成功");
      }
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("保存失败:", error);
    }
  };

  const handleCancelEdit = async () => {
    if (isDraft) {
      try {
        await deleteLead.mutateAsync(id);
      } catch (error) {
        console.error("删除草稿失败:", error);
      }
      router.push("/crm/leads");
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
        status: lead.status === "DRAFT" ? undefined : lead.status,
      });
    }
  };

  const uploadProps = {
    showUploadList: false,
    multiple: false,
    accept: effectiveAllowedMimeTypes.join(","),
    beforeUpload: (file: File) => {
      if (file.size > maxAttachmentSizeBytes) {
        message.error("附件大小不能超过 20MB");
        return Upload.LIST_IGNORE;
      }
      if (
        effectiveAllowedMimeTypes.length > 0 &&
        file.type &&
        !effectiveAllowedMimeTypes.includes(file.type)
      ) {
        message.error("不支持的文件类型");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: async (options: any) => {
      try {
        const file = options.file as File;
        await uploadAttachment.mutateAsync({
          file,
          relatedType: "Lead",
          relatedId: id,
        });
        message.success("上传成功");
        options.onSuccess?.({}, file);
      } catch (error) {
        console.error("上传失败:", error);
        message.error("上传失败");
        options.onError?.(error);
      }
    },
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lead) {
    return (
      <Card>
        <Text type="secondary">未找到该线索</Text>
      </Card>
    );
  }

  const activityColumns = [
    {
      title: "主题",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      render: (text: string) => text || "-",
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (text: string) => text || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <Tag color={activityStatusColors[value] || "default"}>
          {activityStatusLabels[value] || value}
        </Tag>
      ),
    },
    {
      title: "截止时间",
      dataIndex: "dueAt",
      key: "dueAt",
      render: (value: string) => (value ? new Date(value).toLocaleString("zh-CN") : "-"),
    },
    {
      title: "完成时间",
      dataIndex: "completedAt",
      key: "completedAt",
      render: (value: string) => (value ? new Date(value).toLocaleString("zh-CN") : "-"),
    },
  ];

  const attachmentColumns = [
    {
      title: "文件名",
      dataIndex: "fileName",
      key: "fileName",
      ellipsis: true,
      render: (text: string) => text || "-",
    },
    {
      title: "大小",
      dataIndex: "size",
      key: "size",
      width: 100,
      render: (value: number) => formatFileSize(value),
    },
    {
      title: "上传时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) =>
        value ? new Date(value).toLocaleString("zh-CN") : "-",
    },
    {
      title: "操作",
      key: "action",
      width: 140,
      render: (_: unknown, record: Attachment) => (
        <Space>
          {record.url ? (
            <Space size={4}>
              {record.mimeType?.startsWith("image/") ? (
                <a href={record.url} target="_blank" rel="noreferrer">
                  预览
                </a>
              ) : null}
              <a href={record.url} target="_blank" rel="noreferrer">
                下载
              </a>
            </Space>
          ) : (
            <span>-</span>
          )}
          <Popconfirm
            title="确认删除"
            description="确定要删除该附件吗？"
            onConfirm={() => handleDeleteAttachment(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "owner",
      label: "负责人信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="负责人">
            {lead.owner?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="负责人邮箱">
            {lead.owner?.email || "-"}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "activity",
      label: "活动记录",
      children: (
        <Table
          columns={activityColumns}
          dataSource={activityData?.data}
          rowKey="id"
          loading={isActivitiesLoading}
          pagination={{
            current: activityPage,
            pageSize: activityPageSize,
            total: activityData?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(pagination) => {
            setActivityPage(pagination.current || 1);
            setActivityPageSize(pagination.pageSize || 5);
          }}
        />
      ),
    },
    {
      key: "attachments",
      label: "附件",
      children: (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Upload {...uploadProps} disabled={uploadAttachment.isPending}>
              <Button icon={<UploadOutlined />} loading={uploadAttachment.isPending}>
                上传附件
              </Button>
            </Upload>
          </div>
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
        </div>
      ),
    },
    {
      key: "system",
      label: "系统信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="创建时间">
            {new Date(lead.createdAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            {new Date(lead.updatedAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="编号" span={2}>
            {lead.serialId}
          </Descriptions.Item>
          <Descriptions.Item label="ID" span={2}>
            <Text copyable style={{ fontFamily: "monospace" }}>
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
        title={lead.name || "新建线索"}
        extra={[
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            返回
          </Button>,
          ...(isEditing
            ? [
                <Button key="cancel" onClick={handleCancelEdit}>
                  取消
                </Button>,
                <Button
                  key="save"
                  type="primary"
                  loading={submitLead.isPending || updateLead.isPending}
                  onClick={handleSave}
                >
                  保存
                </Button>,
              ]
            : [
                <Button
                  key="edit"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                >
                  编辑
                </Button>,
                <Button
                  key="convert"
                  icon={<SwapOutlined />}
                  type="primary"
                  disabled={lead.status === "CONVERTED"}
                >
                  转换为客户
                </Button>,
              ]),
          <Popconfirm
            key="delete"
            title="确认删除"
            description="确定要删除这条线索吗？"
            onConfirm={handleDelete}
            okText="确认"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {/* 基本信息 */}
        <Card title="基本信息">
          {isEditing ? (
            <Form form={form} layout="vertical" requiredMark="optional">
              <Form.Item
                name="name"
                label="线索名称"
                rules={[{ required: true, message: "请输入线索名称" }]}
              >
                <Input placeholder="请输入线索名称" />
              </Form.Item>

              <Form.Item name="company" label="公司">
                <Input placeholder="请输入公司名称" />
              </Form.Item>

              <Space style={{ width: "100%" }} size={16}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  style={{ flex: 1 }}
                  rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
                >
                  <Input placeholder="请输入邮箱" />
                </Form.Item>

                <Form.Item name="phone" label="电话" style={{ flex: 1 }}>
                  <Input placeholder="请输入电话" />
                </Form.Item>
              </Space>

              <Space style={{ width: "100%" }} size={16}>
                <Form.Item name="source" label="来源" style={{ flex: 1 }}>
                  <Select
                    placeholder="请选择来源"
                    options={Object.entries(LeadSource).map(([key, value]) => ({
                      label: key.replace("_", " "),
                      value,
                    }))}
                  />
                </Form.Item>

                <Form.Item name="rating" label="优先级" style={{ flex: 1 }}>
                  <Select
                    placeholder="请选择优先级"
                    options={Object.entries(LeadRating).map(([key, value]) => ({
                      label: key,
                      value,
                    }))}
                  />
                </Form.Item>
              </Space>

              <Form.Item name="expectedValue" label="预期金额">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="请输入预期金额"
                  min={0}
                  precision={2}
                  prefix="¥"
                />
              </Form.Item>

              <Form.Item name="status" label="状态">
                <Select
                  allowClear
                  placeholder="请选择状态"
                  options={Object.entries(LeadStatus)
                    .filter(([key]) => key !== "DRAFT")
                    .map(([key, value]) => ({
                      label: key,
                      value,
                    }))}
                />
              </Form.Item>

              <Form.Item name="description" label="描述">
                <Input.TextArea rows={4} placeholder="请输入线索描述" />
              </Form.Item>
            </Form>
          ) : (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="线索名称">{lead.name}</Descriptions.Item>
              <Descriptions.Item label="公司">{lead.company || "-"}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{lead.email || "-"}</Descriptions.Item>
              <Descriptions.Item label="电话">{lead.phone || "-"}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColors[lead.status]}>{lead.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={ratingColors[lead.rating || ""] || "default"}>
                  {lead.rating || "-"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="来源">
                {lead.source ? sourceLabels[lead.source] || lead.source : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="预期金额">
                {lead.expectedValue
                  ? `¥${lead.expectedValue.toLocaleString()}`
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {lead.description || "-"}
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
