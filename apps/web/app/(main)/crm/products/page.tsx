"use client";

import { useState } from "react";
import { Table, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useProducts } from "@/hooks/useProducts";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import type { Product } from "@/services/products";
import { PermissionButton } from "@/components/auth/PermissionButton";

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

  const columns: ColumnsType<Product> = [
    {
      title: "编号",
      dataIndex: "serialId",
      key: "serialId",
      width: 80,
    },
    {
      title: "产品编码",
      dataIndex: "sku",
      key: "sku",
      render: (text: string, record) => (
        <Link href={`/crm/products/${record.id}`}>{text}</Link>
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
          <PermissionButton permission="product:write" type="primary" icon={<PlusOutlined />}>
            新建产品
          </PermissionButton>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索编号/产品"
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
