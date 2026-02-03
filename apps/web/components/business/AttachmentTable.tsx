"use client";

import { useMemo, useState } from "react";
import { App, Button, Popconfirm, Space, Table, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import { UploadOutlined } from "@ant-design/icons";
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

interface AttachmentTableProps {
  relatedType: string;
  relatedId: string;
  pageSize?: number;
  showUpload?: boolean;
}

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function AttachmentTable({
  relatedType,
  relatedId,
  pageSize = 5,
  showUpload = true,
}: AttachmentTableProps) {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const { data: attachmentConfig } = useAttachmentConfig();
  const { data: attachmentData, isLoading } = useAttachments({
    page,
    pageSize: currentPageSize,
    relatedType,
    relatedId,
    sort: "createdAt:desc",
  });
  const deleteAttachment = useDeleteAttachment();
  const uploadAttachment = useUploadAttachment();

  const allowedMimeTypes = useMemo(() => {
    if (attachmentConfig?.allowedMimeTypes?.length) {
      return attachmentConfig.allowedMimeTypes;
    }
    return DEFAULT_ALLOWED_MIME_TYPES;
  }, [attachmentConfig?.allowedMimeTypes]);

  const maxAttachmentSizeBytes =
    attachmentConfig?.maxSizeBytes ?? DEFAULT_MAX_ATTACHMENT_SIZE_BYTES;

  const handleDelete = async (attachmentId: string) => {
    try {
      await deleteAttachment.mutateAsync(attachmentId);
      message.success("删除成功");
    } catch (error) {
      console.error("删除失败:", error);
      message.error("删除失败");
    }
  };

  const uploadProps = {
    showUploadList: false,
    multiple: false,
    accept: allowedMimeTypes.join(","),
    beforeUpload: (file: File) => {
      if (file.size > maxAttachmentSizeBytes) {
        message.error("附件大小不能超过 20MB");
        return Upload.LIST_IGNORE;
      }
      if (allowedMimeTypes.length > 0 && file.type && !allowedMimeTypes.includes(file.type)) {
        message.error("不支持的文件类型");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: async (options: UploadRequestOption) => {
      try {
        const file = options.file as File;
        await uploadAttachment.mutateAsync({
          file,
          relatedType,
          relatedId,
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

  const columns: ColumnsType<Attachment> = [
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
      render: (value: string) => (value ? new Date(value).toLocaleString("zh-CN") : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 160,
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
            onConfirm={() => handleDelete(record.id)}
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

  return (
    <div>
      {showUpload && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <Upload {...uploadProps} disabled={uploadAttachment.isPending}>
            <Button icon={<UploadOutlined />} loading={uploadAttachment.isPending}>
              上传附件
            </Button>
          </Upload>
        </div>
      )}
      <Table
        columns={columns}
        dataSource={attachmentData?.data}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: currentPageSize,
          total: attachmentData?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={(pagination) => {
          setPage(pagination.current || 1);
          setCurrentPageSize(pagination.pageSize || pageSize);
        }}
      />
    </div>
  );
}
