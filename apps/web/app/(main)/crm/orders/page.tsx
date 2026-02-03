"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useOrders } from "@/hooks/useOrders";
import Link from "next/link";

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
      title: "编号",
      dataIndex: "serialId",
      key: "serialId",
      width: 80,
    },
    {
      title: "订单号",
      dataIndex: "number",
      key: "number",
      render: (text: string, record: any) => (
        <Link href={`/crm/orders/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "客户",
      dataIndex: "accountId",
      key: "accountId",
    },
    {
      title: "金额",
      dataIndex: "totalAmount",
      key: "totalAmount",
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
      dataIndex: "orderDate",
      key: "orderDate",
    },
    {
      title: "负责人",
      dataIndex: "ownerId",
      key: "ownerId",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
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
            placeholder="搜索编号/订单"
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
