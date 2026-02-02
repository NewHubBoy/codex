"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useOpportunities } from "@/hooks/useOpportunities";

const { Search } = Input;

const statusColors: Record<string, string> = {
  QUALIFICATION: "blue",
  NEEDS_ANALYSIS: "cyan",
  PROPOSAL: "green",
  NEGOTIATION: "purple",
  WON: "gold",
  LOST: "red",
};

export default function OpportunitiesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading, refetch } = useOpportunities({
    page,
    pageSize,
    q: q || undefined,
    status: status || undefined,
  });

  const columns = [
    {
      title: "商机名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <a href={`/crm/opportunities/${record.id}`}>{text}</a>
      ),
    },
    {
      title: "客户",
      dataIndex: "accountId",
      key: "accountId",
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `¥${val?.toLocaleString() || 0}`,
    },
    {
      title: "阶段",
      dataIndex: "stage",
      key: "stage",
      render: (stage: string) => (
        <Tag color={statusColors[stage] || "default"}>{stage}</Tag>
      ),
    },
    {
      title: "预计成交日期",
      dataIndex: "expectedCloseDate",
      key: "expectedCloseDate",
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
        title="商机管理"
        description="管理和跟踪销售商机"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            新建商机
          </Button>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索商机"
            allowClear
            style={{ width: 200 }}
            onSearch={setQ}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 150 }}
            value={status || undefined}
            onChange={setStatus}
            options={[
              { label: "初步接触", value: "QUALIFICATION" },
              { label: "需求分析", value: "NEEDS_ANALYSIS" },
              { label: "方案报价", value: "PROPOSAL" },
              { label: "商务谈判", value: "NEGOTIATION" },
              { label: "赢单", value: "WON" },
              { label: "输单", value: "LOST" },
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
