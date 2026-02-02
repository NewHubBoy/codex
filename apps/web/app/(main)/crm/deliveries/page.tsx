"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useDeliveries } from "@/hooks/useDeliveries";

const { Search } = Input;

const statusColors: Record<string, string> = {
  PLANNED: "default",
  IN_TRANSIT: "processing",
  DELIVERED: "success",
  COMPLETED: "green",
};

const statusMap: Record<string, string> = {
  PLANNED: "计划中",
  IN_TRANSIT: "运输中",
  DELIVERED: "已送达",
  COMPLETED: "已完成",
};

export default function DeliveriesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useDeliveries({
    page,
    pageSize,
    q: q || undefined,
    status: status || undefined,
  });

  const columns = [
    {
      title: "交付单号",
      dataIndex: "code",
      key: "code",
      render: (text: string, record: any) => (
        <a href={`/crm/deliveries/${record.id}`}>{text}</a>
      ),
    },
    {
      title: "订单",
      dataIndex: ["order", "code"],
      key: "order",
    },
    {
      title: "客户",
      dataIndex: ["account", "name"],
      key: "account",
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
      title: "预计送达",
      dataIndex: "estimated_delivery",
      key: "estimated_delivery",
    },
    {
      title: "实际送达",
      dataIndex: "actual_delivery",
      key: "actual_delivery",
    },
    {
      title: "物流公司",
      dataIndex: "carrier",
      key: "carrier",
    },
    {
      title: "物流单号",
      dataIndex: "tracking_number",
      key: "tracking_number",
    },
    {
      title: "负责人",
      dataIndex: ["owner", "name"],
      key: "owner",
    },
  ];

  return (
    <div>
      <PageHeader
        title="交付管理"
        description="管理订单交付和物流"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            新建交付
          </Button>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索交付单"
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
              { label: "计划中", value: "PLANNED" },
              { label: "运输中", value: "IN_TRANSIT" },
              { label: "已送达", value: "DELIVERED" },
              { label: "已完成", value: "COMPLETED" },
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
