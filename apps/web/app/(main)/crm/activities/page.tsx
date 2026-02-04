"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { useActivities } from "@/hooks/useActivities";
import type { Activity, ActivityStatusType } from "@/services/activities";
import { ActivityStatus } from "@/services/activities";
import { useI18n } from "@/i18n/provider";

const { Search } = Input;

const statusColors: Record<string, string> = {
  OPEN: "blue",
  COMPLETED: "green",
  CANCELLED: "red"
};

const relatedRoutes: Record<string, string> = {
  Lead: "/crm/leads",
  Opportunity: "/crm/opportunities",
  Account: "/crm/accounts",
  Contact: "/crm/contacts",
  Ticket: "/crm/tickets",
  Quote: "/crm/quotes",
  Order: "/crm/orders",
  Delivery: "/crm/deliveries",
  Product: "/crm/products"
};

export default function ActivitiesPage() {
  const { t, locale } = useI18n();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ActivityStatusType | undefined>(undefined);

  const statusLabels: Record<string, string> = {
    OPEN: t("activity.status.open"),
    COMPLETED: t("activity.status.completed"),
    CANCELLED: t("activity.status.cancelled")
  };

  const relatedTypeLabels: Record<string, string> = {
    Lead: t("related.lead"),
    Opportunity: t("related.opportunity"),
    Account: t("related.account"),
    Contact: t("related.contact"),
    Ticket: t("related.ticket"),
    Quote: t("related.quote"),
    Order: t("related.order"),
    Delivery: t("related.delivery"),
    Product: t("related.product")
  };

  const { data, isLoading } = useActivities({
    page,
    pageSize,
    q: q || undefined,
    status
  });

  const columns = [
    {
      title: t("common.serial_id"),
      dataIndex: "serialId",
      key: "serialId",
      width: 80
    },
    {
      title: t("activity.fields.subject"),
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      render: (text: string, record: Activity) => (
        <Link href={`/crm/activities/${record.id}`}>{text || "-"}</Link>
      )
    },
    {
      title: t("common.type"),
      dataIndex: "type",
      key: "type",
      render: (text: string) => text || "-"
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <Tag color={statusColors[value] || "default"}>
          {statusLabels[value] || value}
        </Tag>
      )
    },
    {
      title: t("activity.fields.related"),
      key: "related",
      render: (_: unknown, record: Activity) => {
        if (!record.relatedType || !record.relatedId) return "-";
        const label = relatedTypeLabels[record.relatedType] || record.relatedType;
        const shortId = record.relatedId.slice(0, 8);
        const baseRoute = relatedRoutes[record.relatedType];
        if (baseRoute) {
          return (
            <Link href={`${baseRoute}/${record.relatedId}`}>{`${label} #${shortId}`}</Link>
          );
        }
        return `${label} #${shortId}`;
      }
    },
    {
      title: t("common.due_at"),
      dataIndex: "dueAt",
      key: "dueAt",
      render: (value: string) => (value ? new Date(value).toLocaleString(locale) : "-")
    },
    {
      title: t("common.completed_at"),
      dataIndex: "completedAt",
      key: "completedAt",
      render: (value: string) => (value ? new Date(value).toLocaleString(locale) : "-")
    }
  ];

  return (
    <div>
      <PageHeader
        title={t("activities.page.title")}
        description={t("activities.page.description")}
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            {t("activities.actions.create")}
          </Button>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder={t("activities.filters.search_placeholder")}
            allowClear
            style={{ width: 200 }}
            onSearch={setQ}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder={t("activities.filters.status_placeholder")}
            allowClear
            style={{ width: 140 }}
            value={status}
            onChange={setStatus}
            options={Object.entries(ActivityStatus).map(([key, value]) => ({
              label: statusLabels[key] || key,
              value
            }))}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t("common.total_count", { total })
          }}
          onChange={(pagination) => {
            setPage(pagination.current || 1);
            setPageSize(pagination.pageSize || 20);
          }}
        />
      </Card>
    </div>
  );
}
