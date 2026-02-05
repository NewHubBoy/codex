"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useQuotes } from "@/hooks/useQuotes";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import type { Quote } from "@/services/quotes";

const { Search } = Input;

const statusColors: Record<string, string> = {
  DRAFT: "default",
  IN_REVIEW: "processing",
  APPROVED: "success",
  SENT: "blue",
  ACCEPTED: "green",
  REJECTED: "error",
  EXPIRED: "warning",
};

export default function QuotesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuotes({
    page,
    pageSize,
    q: q || undefined,
    status: status || undefined,
  });

  const statusMap: Record<string, string> = {
    DRAFT: "草稿",
    IN_REVIEW: "审核中",
    APPROVED: "已审批",
    SENT: "已发送",
    ACCEPTED: "已接受",
    REJECTED: "已拒绝",
    EXPIRED: "已过期",
  };

  const columns: ColumnsType<Quote> = [
    {
      title: "编号",
      dataIndex: "serialId",
      key: "serialId",
      width: 80,
    },
    {
      title: "报价单号",
      dataIndex: "number",
      key: "number",
      render: (text: string, record) => (
        <Link href={`/crm/quotes/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "客户",
      dataIndex: "accountId",
      key: "accountId",
    },
    {
      title: "商机",
      dataIndex: "opportunityId",
      key: "opportunityId",
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
      title: "有效日期",
      dataIndex: "validTo",
      key: "validTo",
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
        title="报价单管理"
        description="管理销售报价单"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            新建报价
          </Button>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索编号/报价单"
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
              { label: "审核中", value: "IN_REVIEW" },
              { label: "已审批", value: "APPROVED" },
              { label: "已发送", value: "SENT" },
              { label: "已接受", value: "ACCEPTED" },
              { label: "已拒绝", value: "REJECTED" },
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
