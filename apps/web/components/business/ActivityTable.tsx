"use client";

import { useState } from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useActivities } from "@/hooks/useActivities";
import type { Activity } from "@/services/activities";
import { useI18n } from "@/i18n/provider";

interface ActivityTableProps {
  relatedType: string;
  relatedId: string;
  pageSize?: number;
  selectedActivityId?: string;
  onSelectActivity?: (activity: Activity) => void;
}

const statusColors: Record<string, string> = {
  OPEN: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
};

export function ActivityTable({
  relatedType,
  relatedId,
  pageSize = 5,
  selectedActivityId,
  onSelectActivity,
}: ActivityTableProps) {
  const { t, locale } = useI18n();
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const { data: activityData, isLoading } = useActivities({
    page,
    pageSize: currentPageSize,
    relatedType,
    relatedId,
    sort: "createdAt:asc",
  });

  const statusLabels: Record<string, string> = {
    OPEN: t("activity.status.open"),
    COMPLETED: t("activity.status.completed"),
    CANCELLED: t("activity.status.cancelled"),
  };

  const columns: ColumnsType<Activity> = [
    {
      title: t("activity.fields.subject"),
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      render: (text: string, record: Activity) => (
        <Link href={`/crm/activities/${record.id}`}>{text || "-"}</Link>
      ),
    },
    {
      title: t("common.type"),
      dataIndex: "type",
      key: "type",
      render: (text: string) => text || "-",
    },
    {
      title: t("activity.fields.content"),
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (text: string | undefined, record) => text || record.outcome || "-",
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <Tag color={statusColors[value] || "default"}>
          {statusLabels[value] || value}
        </Tag>
      ),
    },
    {
      title: t("common.due_at"),
      dataIndex: "dueAt",
      key: "dueAt",
      render: (value: string) => (value ? new Date(value).toLocaleString(locale) : "-"),
    },
    {
      title: t("common.completed_at"),
      dataIndex: "completedAt",
      key: "completedAt",
      render: (value: string) => (value ? new Date(value).toLocaleString(locale) : "-"),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={activityData?.data}
      rowKey="id"
      loading={isLoading}
      rowClassName={(record) =>
        selectedActivityId && record.id === selectedActivityId ? "ant-table-row-selected" : ""
      }
      onRow={(record) => ({
        onClick: () => onSelectActivity?.(record),
      })}
      pagination={{
        current: page,
        pageSize: currentPageSize,
          total: activityData?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => t("common.total_count", { total }),
        }}
      onChange={(pagination) => {
        setPage(pagination.current || 1);
        setCurrentPageSize(pagination.pageSize || pageSize);
      }}
    />
  );
}
