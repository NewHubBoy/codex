"use client";

import { useState } from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useActivities } from "@/hooks/useActivities";
import type { Activity } from "@/services/activities";

interface ActivityTableProps {
  relatedType: string;
  relatedId: string;
  pageSize?: number;
}

const statusColors: Record<string, string> = {
  OPEN: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
};

const statusLabels: Record<string, string> = {
  OPEN: "进行中",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

export function ActivityTable({ relatedType, relatedId, pageSize = 5 }: ActivityTableProps) {
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const { data: activityData, isLoading } = useActivities({
    page,
    pageSize: currentPageSize,
    relatedType,
    relatedId,
    sort: "createdAt:desc",
  });

  const columns: ColumnsType<Activity> = [
    {
      title: "主题",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      render: (text: string, record: Activity) => (
        <Link href={`/crm/activities/${record.id}`}>{text || "-"}</Link>
      ),
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
        <Tag color={statusColors[value] || "default"}>
          {statusLabels[value] || value}
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

  return (
    <Table
      columns={columns}
      dataSource={activityData?.data}
      rowKey="id"
      loading={isLoading}
      pagination={{
        current: page,
        pageSize: currentPageSize,
        total: activityData?.total || 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
      onChange={(pagination) => {
        setPage(pagination.current || 1);
        setCurrentPageSize(pagination.pageSize || pageSize);
      }}
    />
  );
}
