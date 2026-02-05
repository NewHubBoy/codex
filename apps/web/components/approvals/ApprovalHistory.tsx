"use client";

import { Card, Table, Tag } from "antd";
import { useApprovalInstances } from "@/hooks/useApprovals";
import type { ColumnsType } from "antd/es/table";

const statusColors: Record<string, string> = {
  PENDING: "processing",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "default",
};

interface ApprovalHistoryProps {
  entityType: string;
  entityId: string;
  title?: string;
}

export function ApprovalHistory({ entityType, entityId, title = "审批记录" }: ApprovalHistoryProps) {
  const { data, isLoading } = useApprovalInstances({
    page: 1,
    pageSize: 20,
    entityType,
    entityId,
  });

  const columns: ColumnsType<{ id: string; status: string; currentGroup?: number; createdAt: string }> = [
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={statusColors[status] || "default"}>{status}</Tag>,
    },
    {
      title: "当前节点",
      dataIndex: "currentGroup",
      key: "currentGroup",
      render: (value?: number) => (value === undefined || value === null ? "-" : value + 1),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => new Date(value).toLocaleString("zh-CN"),
    },
  ];

  return (
    <Card title={title} loading={isLoading}>
      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        pagination={false}
      />
    </Card>
  );
}
