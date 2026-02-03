"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useActivities } from "@/hooks/useActivities";
import type { Activity } from "@/services/activities";
import { ActivityStatus } from "@/services/activities";

const { Search } = Input;

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

const relatedTypeLabels: Record<string, string> = {
  Lead: "线索",
  Opportunity: "商机",
  Account: "客户",
  Contact: "联系人",
};

export default function ActivitiesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const { data, isLoading } = useActivities({
    page,
    pageSize,
    q: q || undefined,
    status,
  });

  const columns = [
    {
      title: "编号",
      dataIndex: "serialId",
      key: "serialId",
      width: 80,
    },
    {
      title: "主题",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      render: (text: string, record: Activity) => (
        <a href={`/crm/activities/${record.id}`}>{text || "-"}</a>
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
      title: "关联对象",
      key: "related",
      render: (_: unknown, record: Activity) => {
        if (!record.relatedType || !record.relatedId) return "-";
        const label = relatedTypeLabels[record.relatedType] || record.relatedType;
        const shortId = record.relatedId.slice(0, 8);
        if (record.relatedType === "Lead") {
          return <a href={`/crm/leads/${record.relatedId}`}>{`${label} #${shortId}`}</a>;
        }
        return `${label} #${shortId}`;
      },
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
    <div>
      <PageHeader
        title="活动管理"
        description="记录并跟踪客户互动"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            新建活动
          </Button>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索主题/类型"
            allowClear
            style={{ width: 200 }}
            onSearch={setQ}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 140 }}
            value={status}
            onChange={setStatus}
            options={Object.entries(ActivityStatus).map(([key, value]) => ({
              label: statusLabels[key] || key,
              value,
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
            showTotal: (total) => `共 ${total} 条`,
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
