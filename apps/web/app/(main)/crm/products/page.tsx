"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useProducts } from "@/hooks/useProducts";

const { Search } = Input;

const statusColors: Record<string, string> = {
  ACTIVE: "success",
  INACTIVE: "default",
  DISCONTINUED: "red",
};

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const { data, isLoading } = useProducts({
    page,
    pageSize,
    q: q || undefined,
    category: category || undefined,
  });

  const columns = [
    {
      title: "产品编码",
      dataIndex: "sku",
      key: "sku",
      render: (text: string, record: any) => (
        <a href={`/crm/products/${record.id}`}>{text}</a>
      ),
    },
    {
      title: "产品名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "单价",
      dataIndex: "listPrice",
      key: "listPrice",
      render: (val: number) => `¥${val?.toLocaleString() || 0}`,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>
          {status === "ACTIVE" ? "在售" : status === "INACTIVE" ? "停售" : "停产"}
        </Tag>
      ),
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
        title="产品管理"
        description="管理产品目录和价格"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            新建产品
          </Button>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索产品"
            allowClear
            style={{ width: 200 }}
            onSearch={setQ}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="分类筛选"
            allowClear
            style={{ width: 150 }}
            value={category || undefined}
            onChange={setCategory}
            options={[
              { label: "硬件", value: "hardware" },
              { label: "软件", value: "software" },
              { label: "服务", value: "service" },
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
