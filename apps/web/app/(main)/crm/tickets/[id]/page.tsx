"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Descriptions,
  Spin,
  App,
  Upload,
  Table,
} from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { useTicket } from "@/hooks/useTickets";
import { useAttachments, useUploadAttachment } from "@/hooks/useAttachments";
import type { Attachment } from "@/services/attachments";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  NEW: "blue",
  ASSIGNED: "cyan",
  IN_PROGRESS: "processing",
  WAITING_CUSTOMER: "gold",
  RESOLVED: "green",
  CLOSED: "default",
  CANCELLED: "red",
};

const priorityColors: Record<string, string> = {
  LOW: "default",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;
const DEFAULT_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const allowedMimeTypes = (process.env.NEXT_PUBLIC_ATTACHMENT_ALLOWED_MIME_TYPES || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const effectiveAllowedMimeTypes =
  allowedMimeTypes.length > 0 ? allowedMimeTypes : DEFAULT_ALLOWED_MIME_TYPES;

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const id = params.id as string;
  const [attachmentPage, setAttachmentPage] = useState(1);
  const [attachmentPageSize, setAttachmentPageSize] = useState(5);

  const { data: ticket, isLoading } = useTicket(id);
  const { data: attachmentData, isLoading: isAttachmentsLoading } = useAttachments({
    page: attachmentPage,
    pageSize: attachmentPageSize,
    relatedType: "Ticket",
    relatedId: id,
    sort: "createdAt:desc",
  });
  const uploadAttachment = useUploadAttachment();

  const uploadProps = {
    showUploadList: false,
    multiple: false,
    accept: effectiveAllowedMimeTypes.join(","),
    beforeUpload: (file: File) => {
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
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
          relatedType: "Ticket",
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

  if (!ticket) {
    return (
      <Card>
        <Text type="secondary">未找到该工单</Text>
      </Card>
    );
  }

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
      width: 100,
      render: (_: unknown, record: Attachment) =>
        record.url ? (
          <a href={record.url} target="_blank" rel="noreferrer">
            下载
          </a>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={ticket.subject || ticket.number || "工单详情"}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            返回
          </Button>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title="基本信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="工单号">
              {ticket.number || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="标题">
              {ticket.subject || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              {ticket.type || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={priorityColors[ticket.priority || ""] || "default"}>
                {ticket.priority || "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[ticket.status] || "default"}>{ticket.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="SLA 截止">
              {ticket.slaDueAt ? new Date(ticket.slaDueAt).toLocaleString("zh-CN") : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="客户ID">
              {ticket.accountId || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="联系人ID">
              {ticket.contactId || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="订单ID" span={2}>
              {ticket.orderId || "-"}
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
            <Descriptions.Item label="创建时间">
              {new Date(ticket.createdAt).toLocaleString("zh-CN")}
            </Descriptions.Item>
            <Descriptions.Item label="最后更新时间">
              {new Date(ticket.updatedAt).toLocaleString("zh-CN")}
            </Descriptions.Item>
            <Descriptions.Item label="编号" span={2}>
              {ticket.serialId}
            </Descriptions.Item>
            <Descriptions.Item label="ID" span={2}>
              <Text copyable style={{ fontFamily: "monospace" }}>
                {ticket.id}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
}
