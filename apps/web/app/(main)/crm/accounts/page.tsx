"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useAccounts } from "@/hooks/useAccounts";

const { Search } = Input;

const statusColors: Record<string, string> = {
  ACTIVE: "green",
  INACTIVE: "red",
  PROSPECT: "blue",
  CUSTOMER: "gold",
};

export default function AccountsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useAccounts({
    page,
    pageSize,
    q: q || undefined,
    status: status || undefined,
  });

  const columns = [
    {
      title: "客户名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <a href={`/crm/accounts/${record.id}`}>{text}</a>
      ),
    },
    {
      title: "行业",
      dataIndex: "industry",
      key: "industry",
    },
    {
      title: "联系人",
      dataIndex: "contact_name",
      key: "contact_name",
    },
    {
      title: "电话",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>
          {status === "ACTIVE" ? "活跃" : status === "INACTIVE" ? "非活跃" : status === "PROSPECT" ? "潜在" : "客户"}
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
        title="客户管理"
        description="管理客户信息和档案"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            新建客户
          </Button>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索客户"
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
              { label: "活跃", value: "ACTIVE" },
              { label: "非活跃", value: "INACTIVE" },
              { label: "潜在客户", value: "PROSPECT" },
              { label: "正式客户", value: "CUSTOMER" },
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
