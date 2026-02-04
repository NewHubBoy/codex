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
  Popconfirm,
  InputNumber,
  type TablePaginationConfig
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { useLeads, useDeleteLead, useCreateLeadDraft } from "@/hooks/useLeads";
import type { Lead, LeadListParams } from "@/services/leads";
import { LeadStatus, LeadSource, LeadRating } from "@/services/leads";
import { PageHeader } from "@/components/common/PageHeader";
import { App } from "antd";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { getErrorMessage } from "@/utils/error";

const { Text } = Typography;

export default function LeadsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { t, locale } = useI18n();
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<Partial<LeadListParams>>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [creating, setCreating] = useState(false);
  const [alertFilter, setAlertFilter] = useState<string | undefined>(undefined);
  const [inactiveDays, setInactiveDays] = useState(7);

  // 查询线索列表
  const { data, isLoading, refetch } = useLeads({
    ...filters,
    page: pagination.current,
    pageSize: pagination.pageSize,
    q: searchText
  });

  // 删除线索
  const deleteLead = useDeleteLead();
  // 创建草稿
  const createDraft = useCreateLeadDraft();

  const statusLabels: Record<string, string> = {
    NEW: t("lead.status.new"),
    ASSIGNED: t("lead.status.assigned"),
    WORKING: t("lead.status.working"),
    INTERESTED: t("lead.status.interested"),
    QUALIFIED: t("lead.status.qualified"),
    CONVERTED: t("lead.status.converted"),
    DISQUALIFIED: t("lead.status.disqualified"),
    DRAFT: t("lead.status.draft")
  };

  const ratingLabels: Record<string, string> = {
    HOT: t("lead.rating.hot"),
    WARM: t("lead.rating.warm"),
    COLD: t("lead.rating.cold")
  };

  const sourceLabels: Record<string, string> = {
    WEBSITE: t("lead.source.website"),
    REFERRAL: t("lead.source.referral"),
    COLD_CALL: t("lead.source.cold_call"),
    TRADE_SHOW: t("lead.source.trade_show"),
    SOCIAL_MEDIA: t("lead.source.social_media"),
    OTHER: t("lead.source.other")
  };

  // 处理表格变化
  const handleTableChange = (pagination: TablePaginationConfig) => {
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

  const handleAlertFilterChange = (value?: string) => {
    setAlertFilter(value);
    setFilters((prev) => {
      const next = {
        ...prev,
        overdueFirstFollowUp: undefined,
        overdueNextFollowUp: undefined,
        inactiveDays: undefined
      };
      if (value === "first") {
        next.overdueFirstFollowUp = true;
      } else if (value === "next") {
        next.overdueNextFollowUp = true;
      } else if (value === "inactive") {
        next.inactiveDays = inactiveDays;
      }
      return next;
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleInactiveDaysChange = (value: number | null) => {
    const days = value && value > 0 ? value : 7;
    setInactiveDays(days);
    if (alertFilter === "inactive") {
      setFilters((prev) => ({
        ...prev,
        overdueFirstFollowUp: undefined,
        overdueNextFollowUp: undefined,
        inactiveDays: days
      }));
      setPagination((prev) => ({ ...prev, current: 1 }));
    }
  };

  // 处理新建 - 创建草稿后跳转详情页编辑
  const handleCreate = async () => {
    try {
      setCreating(true);
      const draft = await createDraft.mutateAsync(undefined);
      router.push(`/crm/leads/${draft.id}?operationType=edit`);
    } catch {
      message.error(t("lead.messages.draft_create_failed"));
    } finally {
      setCreating(false);
    }
  };

  // 处理编辑
  const handleEdit = (record: Lead) => {
    router.push(`/crm/leads/${record.id}?operationType=edit`);
  };

  // 处理查看详情
  const handleView = (id: string) => {
    router.push(`/crm/leads/${id}`);
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await deleteLead.mutateAsync(id);
      message.success(t("lead.messages.delete_success"));
    } catch (error) {
      message.error(getErrorMessage(error, t("lead.messages.delete_failed")));
    }
  };

  // 状态标签颜色
  const statusColors: Record<string, string> = {
    NEW: "blue",
    ASSIGNED: "cyan",
    WORKING: "green",
    INTERESTED: "orange",
    QUALIFIED: "purple",
    CONVERTED: "gold",
    DISQUALIFIED: "red"
  };

  // 优先级颜色
  const ratingColors: Record<string, string> = {
    HOT: "red",
    WARM: "orange",
    COLD: "blue"
  };

  const terminalStatuses = new Set(["CONVERTED", "DISQUALIFIED", "DRAFT"]);
  const now = Date.now();
  const staleCutoff = now - inactiveDays * 24 * 60 * 60 * 1000;

  const renderAlertTags = (lead: Lead) => {
    if (terminalStatuses.has(lead.status)) {
      return "-";
    }
    const tags: JSX.Element[] = [];
    const firstFollowUpOverdue =
      !!lead.firstFollowUpDueAt &&
      !lead.lastActivityAt &&
      new Date(lead.firstFollowUpDueAt).getTime() < now;
    const nextFollowUpOverdue =
      !!lead.nextFollowUpAt && new Date(lead.nextFollowUpAt).getTime() < now;
    const inactive =
      (lead.lastActivityAt
        ? new Date(lead.lastActivityAt).getTime() < staleCutoff
        : new Date(lead.createdAt).getTime() < staleCutoff);

    if (firstFollowUpOverdue) {
      tags.push(
        <Tag color="volcano" key="first">
          {t("leads.alert.first_overdue")}
        </Tag>
      );
    }
    if (nextFollowUpOverdue) {
      tags.push(
        <Tag color="orange" key="next">
          {t("leads.alert.next_overdue")}
        </Tag>
      );
    }
    if (inactive) {
      tags.push(
        <Tag color="red" key="inactive">
          {t("leads.alert.inactive", { days: inactiveDays })}
        </Tag>
      );
    }
    return tags.length ? <Space size={4}>{tags}</Space> : "-";
  };

  // 表格列配置
  const columns = [
    {
      title: t("common.serial_id"),
      dataIndex: "serialId",
      key: "serialId",
      width: 80
    },
    {
      title: t("leads.table.name"),
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Lead) => (
        <Link href={`/crm/leads/${record.id}`}>{text}</Link>
      )
    },
    {
      title: t("leads.table.company"),
      dataIndex: "companyName",
      key: "companyName"
    },
    {
      title: t("leads.table.contact"),
      key: "contact",
      render: (_: unknown, record: Lead) => (
        <Space direction="vertical" size={0}>
          <Text>{record.contactName || "-"}</Text>
          <Text type="secondary">{record.email || "-"}</Text>
          <Text type="secondary">{record.phone || "-"}</Text>
        </Space>
      )
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      )
    },
    {
      title: t("leads.table.alert"),
      key: "alert",
      render: (_: unknown, record: Lead) => renderAlertTags(record)
    },
    {
      title: t("leads.table.rating"),
      dataIndex: "rating",
      key: "rating",
      render: (rating: string) => (
        <Tag color={ratingColors[rating]}>{ratingLabels[rating] || rating}</Tag>
      )
    },
    {
      title: t("leads.table.expected_value"),
      dataIndex: "expectedValue",
      key: "expectedValue",
      render: (value: number) => (value ? `¥${value.toLocaleString(locale)}` : "-")
    },
    {
      title: t("leads.table.source"),
      dataIndex: "source",
      key: "source",
      render: (source: string) => sourceLabels[source] || source || "-"
    },
    {
      title: t("common.created_at"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(locale)
    },
    {
      title: t("common.actions"),
      key: "action",
      render: (_: unknown, record: Lead) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
            aria-label={t("common.view")}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            aria-label={t("common.edit")}
          />
          <Popconfirm
            title={t("common.delete_confirm_title")}
            description={t("lead.messages.delete_confirm")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
          >
            <Button type="text" danger icon={<DeleteOutlined />} aria-label={t("common.delete")} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title={t("leads.page.title")}
        description={t("leads.page.description")}
        extra={[
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            loading={creating}
          >
            {t("leads.actions.create")}
          </Button>
        ]}
      />

      <Card>
        {/* 筛选栏 */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder={t("leads.filters.search_placeholder")}
            allowClear
            style={{ width: 200 }}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
          />
          <Select
            placeholder={t("leads.filters.status_placeholder")}
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange("status", value)}
            options={Object.entries(LeadStatus)
              .filter(([key]) => key !== "DRAFT")
              .map(([key, value]) => ({
                label: statusLabels[key] || key,
                value
              }))}
          />
          <Select
            placeholder={t("leads.filters.rating_placeholder")}
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange("rating", value)}
            options={Object.entries(LeadRating).map(([key, value]) => ({
              label: ratingLabels[key] || key,
              value
            }))}
          />
          <Select
            placeholder={t("leads.filters.source_placeholder")}
            allowClear
            style={{ width: 140 }}
            onChange={(value) => handleFilterChange("source", value)}
            options={Object.entries(LeadSource).map(([key, value]) => ({
              label: sourceLabels[key] || key.replace("_", " "),
              value
            }))}
          />
          <Select
            placeholder={t("leads.filters.alert_placeholder")}
            allowClear
            style={{ width: 150 }}
            value={alertFilter}
            onChange={handleAlertFilterChange}
            options={[
              { label: t("leads.alert.first_overdue"), value: "first" },
              { label: t("leads.alert.next_overdue"), value: "next" },
              { label: t("leads.alert.inactive_short"), value: "inactive" }
            ]}
          />
          <InputNumber
            min={1}
            max={365}
            value={inactiveDays}
            onChange={handleInactiveDaysChange}
            disabled={alertFilter !== "inactive"}
            placeholder={t("leads.filters.inactive_days_placeholder")}
            style={{ width: 120 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            {t("common.refresh")}
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
            showTotal: (total) => t("common.total_count", { total })
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
}
