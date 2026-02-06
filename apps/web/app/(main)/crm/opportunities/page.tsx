"use client";

import { useEffect, useState } from "react";
import { Table, Space, Tag, Input, Select, Card, type TablePaginationConfig } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useOpportunities } from "@/hooks/useOpportunities";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import type { Opportunity } from "@/services/opportunities";
import { useAlertSettings } from "@/hooks/useAlerts";
import { useSearchParams } from "next/navigation";
import { PermissionButton } from "@/components/auth/PermissionButton";

const { Search } = Input;

const statusColors: Record<string, string> = {
  QUALIFICATION: "blue",
  NEEDS_ANALYSIS: "cyan",
  PROPOSAL: "green",
  NEGOTIATION: "purple",
  WON: "gold",
  LOST: "red"
};

export default function OpportunitiesPage() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [staleDays, setStaleDays] = useState<number | undefined>(undefined);
  const { data: alertSettings } = useAlertSettings();

  useEffect(() => {
    if (!searchParams) {
      return;
    }
    const stale = searchParams.get("staleDays");
    const parsed = stale ? Number.parseInt(stale, 10) : undefined;
    if (parsed && parsed > 0) {
      setStaleDays(parsed);
    }
  }, [searchParams]);

  const { data, isLoading } = useOpportunities({
    page,
    pageSize,
    q: q || undefined,
    status: status || undefined,
    staleDays
  });

  const stageLabels: Record<string, string> = {
    QUALIFICATION: t("opportunity.stage.qualification"),
    NEEDS_ANALYSIS: t("opportunity.stage.needs_analysis"),
    PROPOSAL: t("opportunity.stage.proposal"),
    NEGOTIATION: t("opportunity.stage.negotiation"),
    WON: t("opportunity.stage.won"),
    LOST: t("opportunity.stage.lost")
  };

  const columns = [
    {
      title: t("common.serial_id"),
      dataIndex: "serialId",
      key: "serialId",
      width: 80
    },
    {
      title: t("opportunities.table.name"),
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Opportunity) => (
        <Link href={`/crm/opportunities/${record.id}`}>{text}</Link>
      )
    },
    {
      title: t("opportunities.table.account"),
      dataIndex: "accountId",
      key: "accountId"
    },
    {
      title: t("opportunities.table.amount"),
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `¥${val?.toLocaleString(locale) || 0}`
    },
    {
      title: t("opportunities.table.stage"),
      dataIndex: "stage",
      key: "stage",
      render: (stage: string) => (
        <Tag color={statusColors[stage] || "default"}>
          {stageLabels[stage] || stage}
        </Tag>
      )
    },
    {
      title: t("opportunities.table.alert"),
      key: "alert",
      render: (_: unknown, record: Opportunity) => {
        const threshold = staleDays ?? alertSettings?.staleDays ?? 7;
        if (!record.lastStageChangedAt) {
          return "-";
        }
        if (record.status === "WON" || record.status === "LOST") {
          return "-";
        }
        const isStale =
          new Date(record.lastStageChangedAt).getTime() <
          Date.now() - threshold * 24 * 60 * 60 * 1000;
        return isStale ? (
          <Tag color="red">{t("opportunities.alert.stale", { days: threshold })}</Tag>
        ) : (
          "-"
        );
      }
    },
    {
      title: t("opportunities.table.expected_close_date"),
      dataIndex: "expectedCloseDate",
      key: "expectedCloseDate",
      render: (value: string) => (value ? new Date(value).toLocaleDateString(locale) : "-")
    },
    {
      title: t("opportunities.table.owner"),
      dataIndex: "ownerId",
      key: "ownerId"
    },
    {
      title: t("common.created_at"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => (value ? new Date(value).toLocaleString(locale) : "-")
    }
  ];

  return (
    <div>
      <PageHeader
        title={t("opportunities.page.title")}
        description={t("opportunities.page.description")}
        action={
          <PermissionButton permission="opportunity:write" type="primary" icon={<PlusOutlined />}>
            {t("opportunities.actions.create")}
          </PermissionButton>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder={t("opportunities.filters.search_placeholder")}
            allowClear
            style={{ width: 200 }}
            onSearch={setQ}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder={t("opportunities.filters.status_placeholder")}
            allowClear
            style={{ width: 150 }}
            value={status || undefined}
            onChange={setStatus}
            options={[
              { label: stageLabels.QUALIFICATION, value: "QUALIFICATION" },
              { label: stageLabels.NEEDS_ANALYSIS, value: "NEEDS_ANALYSIS" },
              { label: stageLabels.PROPOSAL, value: "PROPOSAL" },
              { label: stageLabels.NEGOTIATION, value: "NEGOTIATION" },
              { label: stageLabels.WON, value: "WON" },
              { label: stageLabels.LOST, value: "LOST" }
            ]}
          />
          <Select
            placeholder={t("opportunities.filters.stale_placeholder")}
            allowClear
            style={{ width: 160 }}
            value={staleDays}
            onChange={(value) => setStaleDays(value)}
            options={[
              { label: t("opportunities.filters.stale_days", { days: 7 }), value: 7 },
              { label: t("opportunities.filters.stale_days", { days: 14 }), value: 14 },
              { label: t("opportunities.filters.stale_days", { days: 30 }), value: 30 }
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
            showTotal: (total) => t("common.total_count", { total })
          }}
          onChange={(pagination: TablePaginationConfig) => {
            setPage(pagination.current || 1);
            setPageSize(pagination.pageSize || 20);
          }}
        />
      </Card>
    </div>
  );
}
