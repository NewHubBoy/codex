"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useContacts } from "@/hooks/useContacts";
import Link from "next/link";

const { Search } = Input;

const statusColors: Record<string, string> = {
  ACTIVE: "green",
  INACTIVE: "red",
};

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [accountId, setAccountId] = useState("");

  const { data, isLoading } = useContacts({
    page,
    pageSize,
    q: q || undefined,
    accountId: accountId || undefined,
  });

  const columns = [
    {
      title: "编号",
      dataIndex: "serialId",
      key: "serialId",
      width: 80,
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Link href={`/crm/contacts/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "所属客户",
      dataIndex: "accountId",
      key: "accountId",
    },
    {
      title: "职位",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "电话",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>
          {status === "ACTIVE" ? "活跃" : "非活跃"}
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
        title="联系人管理"
        description="管理客户联系人信息"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            新建联系人
          </Button>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索编号/联系人"
            allowClear
            style={{ width: 200 }}
            onSearch={setQ}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="客户筛选"
            allowClear
            style={{ width: 200 }}
            value={accountId || undefined}
            onChange={setAccountId}
            options={[]}
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
