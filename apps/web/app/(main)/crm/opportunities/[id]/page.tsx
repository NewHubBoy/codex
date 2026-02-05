"use client";

import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, Typography, Button, Space, Tag, Tabs, Descriptions, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useOpportunity } from "@/hooks/useOpportunities";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";

const { Text } = Typography;

const ActivityTable = dynamic(
  () => import("@/components/business/ActivityTable").then((mod) => mod.ActivityTable),
  {
    loading: () => <Spin size="small" />,
  }
);

const AttachmentTable = dynamic(
  () => import("@/components/business/AttachmentTable").then((mod) => mod.AttachmentTable),
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

  const tabItems = [
    {
      key: "owner",
      label: t("common.owner_info"),
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label={t("common.owner_name")}>
            {opportunity.owner?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("common.owner_email")}>
            {opportunity.owner?.email || "-"}
          </Descriptions.Item>
        </Descriptions>
      )
    },
    {
      key: "activity",
      label: t("common.activities"),
      children: <ActivityTable relatedType="Opportunity" relatedId={id} />
    },
    {
      key: "attachments",
      label: t("common.attachments"),
      children: <AttachmentTable relatedType="Opportunity" relatedId={id} />
    },
    {
      key: "system",
      label: t("common.system_info"),
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label={t("common.created_at")}>
            {new Date(opportunity.createdAt).toLocaleString(locale)}
          </Descriptions.Item>
          <Descriptions.Item label={t("common.updated_at")}>
            {new Date(opportunity.updatedAt).toLocaleString(locale)}
          </Descriptions.Item>
          <Descriptions.Item label={t("common.serial_id")} span={2}>
            {opportunity.serialId}
          </Descriptions.Item>
          <Descriptions.Item label={t("common.id")} span={2}>
            <Text copyable style={{ fontFamily: "monospace" }}>
              {opportunity.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      )
    }
  ];

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

        <Tabs items={tabItems} />
      </Space>
    </div>
  );
}
