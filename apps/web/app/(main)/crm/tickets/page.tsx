"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useTickets } from "@/hooks/useTickets";

const { Search } = Input;

const statusColors: Record<string, string> = {
  NEW: "blue",
  ASSIGNED: "cyan",
  IN_PROGRESS: "processing",
  RESOLVED: "success",
  CLOSED: "default",
};

const priorityColors: Record<string, string> = {
  LOW: "default",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

const statusMap: Record<string, string> = {
  NEW: "新建",
  ASSIGNED: "已分配",
  IN_PROGRESS: "处理中",
  RESOLVED: "已解决",
  CLOSED: "已关闭",
};

const priorityMap: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "紧急",
};

export default function TicketsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const { data, isLoading } = useTickets({
    page,
    pageSize,
    q: q || undefined,
    status: status || undefined,
    priority: priority || undefined,
  });

  const columns = [
    {
      title: "工单号",
      dataIndex: "code",
      key: "code",
      render: (text: string, record: any) => (
        <a href={`/crm/tickets/${record.id}`}>{text}</a>
      ),
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "客户",
      dataIndex: ["account", "name"],
      key: "account",
    },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => (
        <Tag color={priorityColors[priority] || "default"}>
          {priorityMap[priority] || priority}
        </Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>
          {statusMap[status] || status}
        </Tag>
      ),
    },
    {
      title: "负责人",
      dataIndex: ["owner", "name"],
      key: "owner",
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
    },
  ];

  return (
    <div>
      <PageHeader
        title="工单管理"
        description="管理和跟踪客户服务工单"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            新建工单
          </Button>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索工单"
            allowClear
            style={{ width: 200 }}
            onSearch={setQ}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 120 }}
            value={status || undefined}
            onChange={setStatus}
            options={[
              { label: "新建", value: "NEW" },
              { label: "已分配", value: "ASSIGNED" },
              { label: "处理中", value: "IN_PROGRESS" },
              { label: "已解决", value: "RESOLVED" },
              { label: "已关闭", value: "CLOSED" },
            ]}
          />
          <Select
            placeholder="优先级筛选"
            allowClear
            style={{ width: 120 }}
            value={priority || undefined}
            onChange={setPriority}
            options={[
              { label: "低", value: "LOW" },
              { label: "中", value: "MEDIUM" },
              { label: "高", value: "HIGH" },
              { label: "紧急", value: "URGENT" },
            ]}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={data?.list}
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
