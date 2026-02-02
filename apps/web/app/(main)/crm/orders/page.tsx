"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useOrders } from "@/hooks/useOrders";

const { Search } = Input;

const statusColors: Record<string, string> = {
  DRAFT: "default",
  CONFIRMED: "blue",
  IN_FULFILLMENT: "processing",
  DELIVERED: "green",
  CLOSED: "gold",
  CANCELLED: "red",
};

const statusMap: Record<string, string> = {
  DRAFT: "草稿",
  CONFIRMED: "已确认",
  IN_FULFILLMENT: "执行中",
  DELIVERED: "已交付",
  CLOSED: "已关闭",
  CANCELLED: "已取消",
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useOrders({
    page,
    pageSize,
    q: q || undefined,
    status: status || undefined,
  });

  const columns = [
    {
      title: "订单号",
      dataIndex: "code",
      key: "code",
      render: (text: string, record: any) => (
        <a href={`/crm/orders/${record.id}`}>{text}</a>
      ),
    },
    {
      title: "客户",
      dataIndex: ["account", "name"],
      key: "account",
    },
    {
      title: "报价单",
      dataIndex: ["quote", "code"],
      key: "quote",
    },
    {
      title: "金额",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (val: number) => `¥${val?.toLocaleString() || 0}`,
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
      title: "订单日期",
      dataIndex: "order_date",
      key: "order_date",
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
        title="订单管理"
        description="管理销售订单"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            新建订单
          </Button>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索订单"
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
              { label: "草稿", value: "DRAFT" },
              { label: "已确认", value: "CONFIRMED" },
              { label: "执行中", value: "IN_FULFILLMENT" },
              { label: "已交付", value: "DELIVERED" },
              { label: "已关闭", value: "CLOSED" },
              { label: "已取消", value: "CANCELLED" },
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
