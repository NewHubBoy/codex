"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Card,
  Typography,
  App,
  Popconfirm,
  Drawer,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useLeads, useDeleteLead } from "@/hooks/useLeads";
import type { Lead, LeadListParams } from "@/services/leads";
import { LeadStatus, LeadSource, LeadRating } from "@/services/leads";
import { PageHeader } from "@/components/common/PageHeader";
import { LeadDrawer } from "@/components/business/LeadDrawer";

const { Title, Text } = Typography;

export default function LeadsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<Partial<LeadListParams>>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const { message } = App.useApp();

  // 查询线索列表
  const { data, isLoading, refetch } = useLeads({
    ...filters,
    page: pagination.current,
    pageSize: pagination.pageSize,
    q: searchText,
  });

  // 删除线索
  const deleteLead = useDeleteLead();

  // 处理表格变化
  const handleTableChange = (pagination: any) => {
    setPagination({ current: pagination.current || 1, pageSize: pagination.pageSize || 20 });
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  // 处理筛选
  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
    setPagination({ ...pagination, current: 1 });
  };

  // 处理新建
  const handleCreate = () => {
    setEditingLead(null);
    setDrawerOpen(true);
  };

  // 处理编辑
  const handleEdit = (record: Lead) => {
    setEditingLead(record);
    setDrawerOpen(true);
  };

  // 处理查看详情
  const handleView = (id: string) => {
    router.push(`/crm/leads/${id}`);
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await deleteLead.mutateAsync(id);
      message.success("删除成功");
    } catch (error) {
      message.error("删除失败");
    }
  };

  // 状态标签颜色
  const statusColors: Record<string, string> = {
    NEW: "blue",
    ASSIGNED: "cyan",
    WORKING: "green",
    QUALIFIED: "purple",
    CONVERTED: "gold",
    DISQUALIFIED: "red",
  };

  // 优先级颜色
  const ratingColors: Record<string, string> = {
    HOT: "red",
    WARM: "orange",
    COLD: "blue",
  };

  // 表格列配置
  const columns = [
    {
      title: "线索名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Lead) => (
        <a onClick={() => handleView(record.id)}>{text}</a>
      ),
    },
    {
      title: "公司",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "联系方式",
      key: "contact",
      render: (_: unknown, record: Lead) => (
        <Space direction="vertical" size={0}>
          <Text>{record.email}</Text>
          <Text type="secondary">{record.phone}</Text>
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status]}>{status}</Tag>
      ),
    },
    {
      title: "优先级",
      dataIndex: "rating",
      key: "rating",
      render: (rating: string) => (
        <Tag color={ratingColors[rating]}>{rating}</Tag>
      ),
    },
    {
      title: "预期金额",
      dataIndex: "expectedValue",
      key: "expectedValue",
      render: (value: number) =>
        value ? `¥${value.toLocaleString()}` : "-",
    },
    {
      title: "来源",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: Lead) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确认删除"
            description="确定要删除这条线索吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="线索管理"
        description="管理和跟进销售线索"
        extra={[
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新建线索
          </Button>,
        ]}
      />

      <Card>
        {/* 筛选栏 */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="搜索线索名称"
            allowClear
            style={{ width: 200 }}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
          />
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange("status", value)}
            options={Object.entries(LeadStatus).map(([key, value]) => ({
              label: key,
              value,
            }))}
          />
          <Select
            placeholder="优先级"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange("rating", value)}
            options={Object.entries(LeadRating).map(([key, value]) => ({
              label: key,
              value,
            }))}
          />
          <Select
            placeholder="来源"
            allowClear
            style={{ width: 140 }}
            onChange={(value) => handleFilterChange("source", value)}
            options={Object.entries(LeadSource).map(([key, value]) => ({
              label: key.replace("_", " "),
              value,
            }))}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
          >
            刷新
          </Button>
        </Space>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 新建/编辑 Drawer */}
      <LeadDrawer
        open={drawerOpen}
        lead={editingLead}
        onClose={() => {
          setDrawerOpen(false);
          setEditingLead(null);
        }}
        onSuccess={() => {
          setDrawerOpen(false);
          setEditingLead(null);
          refetch();
        }}
      />
    </div>
  );
}
