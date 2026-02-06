"use client";

import { useState } from "react";
import { Table, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useAccounts } from "@/hooks/useAccounts";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import type { Account } from "@/services/accounts";
import { PermissionButton } from "@/components/auth/PermissionButton";

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

  const columns: ColumnsType<Account> = [
    {
      title: "编号",
      dataIndex: "serialId",
      key: "serialId",
      width: 80,
    },
    {
      title: "客户名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record) => (
        <Link href={`/crm/accounts/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "行业",
      dataIndex: "industry",
      key: "industry",
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "生命周期",
      dataIndex: "lifecycleStatus",
      key: "lifecycleStatus",
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
        title="客户管理"
        description="管理客户信息和档案"
        action={
          <PermissionButton permission="account:write" type="primary" icon={<PlusOutlined />}>
            新建客户
          </PermissionButton>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索编号/客户"
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
