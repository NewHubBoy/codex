"use client";

import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Card, Typography, Button, Space, Tag, Tabs, Descriptions, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useOpportunity } from "@/hooks/useOpportunities";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { DETAIL_TABS_MIN_HEIGHT } from "@/config/ui";

const { Text } = Typography;

const EntityOwnerTab = dynamic(
  () => import("@/components/entity-tabs/EntityOwnerTab").then((mod) => mod.EntityOwnerTab),
  {
    loading: () => <Spin size="small" />,
  }
);

const EntityActivitiesTab = dynamic(
  () =>
    import("@/components/entity-tabs/EntityActivitiesTab").then((mod) => mod.EntityActivitiesTab),
  {
    loading: () => <Spin size="small" />,
  }
);

const EntityAttachmentsTab = dynamic(
  () =>
    import("@/components/entity-tabs/EntityAttachmentsTab").then(
      (mod) => mod.EntityAttachmentsTab
    ),
  {
    loading: () => <Spin size="small" />,
  }
);

const EntitySystemTab = dynamic(
  () => import("@/components/entity-tabs/EntitySystemTab").then((mod) => mod.EntitySystemTab),
  {
    loading: () => <Spin size="small" />,
  }
);

const statusColors: Record<string, string> = {
  QUALIFICATION: "blue",
  NEEDS_ANALYSIS: "cyan",
  PROPOSAL: "green",
  NEGOTIATION: "purple",
  WON: "gold",
  LOST: "red"
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("activity");

  const { data: opportunity, isLoading } = useOpportunity(id);

  const stageLabels: Record<string, string> = {
    QUALIFICATION: t("opportunity.stage.qualification"),
    NEEDS_ANALYSIS: t("opportunity.stage.needs_analysis"),
    PROPOSAL: t("opportunity.stage.proposal"),
    NEGOTIATION: t("opportunity.stage.negotiation"),
    WON: t("opportunity.stage.won"),
    LOST: t("opportunity.stage.lost")
  };

  const formatAmount = (amount?: number, currency?: string) => {
    if (amount === undefined || amount === null) return "-";
    const formatted = amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return currency ? `${formatted} ${currency}` : formatted;
  };

  const tabItems = useMemo(() => {
    if (!opportunity) {
      return [];
    }
    return [
      {
        key: "owner",
        label: t("common.owner_info"),
        children:
          activeTab === "owner" ? (
            <EntityOwnerTab
              owner={opportunity.owner}
              labels={{
                name: t("common.owner_name"),
                email: t("common.owner_email"),
              }}
            />
          ) : null,
      },
      {
        key: "activity",
        label: t("common.activities"),
        children:
          activeTab === "activity" ? (
            <EntityActivitiesTab relatedType="Opportunity" relatedId={id} />
          ) : null,
      },
      {
        key: "attachments",
        label: t("common.attachments"),
        children:
          activeTab === "attachments" ? (
            <EntityAttachmentsTab relatedType="Opportunity" relatedId={id} />
          ) : null,
      },
      {
        key: "system",
        label: t("common.system_info"),
        children:
          activeTab === "system" ? (
            <EntitySystemTab
              entity={{
                id: opportunity.id,
                serialId: opportunity.serialId,
                createdAt: opportunity.createdAt,
                updatedAt: opportunity.updatedAt,
              }}
              locale={locale}
              labels={{
                createdAt: t("common.created_at"),
                updatedAt: t("common.updated_at"),
                serialId: t("common.serial_id"),
                id: t("common.id"),
              }}
            />
          ) : null,
      },
    ];
  }, [activeTab, id, locale, opportunity, t]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <Card>
        <Text type="secondary">{t("opportunity.messages.not_found")}</Text>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={opportunity.name || t("opportunity.detail.title")}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            {t("common.back")}
          </Button>
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title={t("common.basic_info")}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label={t("opportunity.fields.name")}>
              {opportunity.name}
            </Descriptions.Item>
            <Descriptions.Item label={t("opportunity.fields.stage")}>
              <Tag color={statusColors[opportunity.stage] || "default"}>
                {stageLabels[opportunity.stage] || opportunity.stage || "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("opportunity.fields.amount")}>
              {formatAmount(opportunity.amount, opportunity.currency)}
            </Descriptions.Item>
            <Descriptions.Item label={t("opportunity.fields.probability")}>
              {opportunity.probability !== undefined && opportunity.probability !== null
                ? `${opportunity.probability}%`
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("opportunity.fields.expected_close_date")}>
              {opportunity.expectedCloseDate
                ? new Date(opportunity.expectedCloseDate).toLocaleString(locale)
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("opportunity.fields.status")}>
              <Tag color="default">{opportunity.status || "-"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("opportunity.fields.account")}>
              {opportunity.accountId ? (
                <Link href={`/crm/accounts/${opportunity.accountId}`}>
                  {opportunity.account?.name || opportunity.accountId}
                </Link>
              ) : (
                opportunity.account?.name || "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t("opportunity.fields.lead")}>
              {opportunity.leadId ? (
                <Link href={`/crm/leads/${opportunity.leadId}`}>
                  {opportunity.lead?.name || opportunity.leadId}
                </Link>
              ) : (
                opportunity.lead?.name || "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t("opportunity.fields.contact")}>
              {opportunity.contactId ? (
                <Link href={`/crm/contacts/${opportunity.contactId}`}>
                  {opportunity.contactId}
                </Link>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t("opportunity.fields.reason_lost")}>
              {opportunity.reasonLost || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Tabs
          items={tabItems}
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ minHeight: DETAIL_TABS_MIN_HEIGHT }}
          destroyOnHidden
        />
      </Space>
    </div>
  );
}
