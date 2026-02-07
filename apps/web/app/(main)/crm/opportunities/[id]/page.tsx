"use client";

import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { App, Card, Typography, Button, Space, Tag, Tabs, Descriptions, Spin, Modal, Table } from "antd";
import { ArrowLeftOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useOpportunity, useOpportunityAssignees, useAssignOpportunityOwner } from "@/hooks/useOpportunities";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { DETAIL_TABS_MIN_HEIGHT } from "@/config/ui";
import { getErrorMessage } from "@/utils/error";
import { useAuth } from "@/hooks/useAuth";
import { PermissionButton } from "@/components/auth/PermissionButton";

const { Text } = Typography;

const EntityOwnerTab = dynamic(
  () => import("@/components/entity-tabs/EntityOwnerTab").then((mod) => mod.EntityOwnerTab),
  {
    loading: () => <Spin size="small" />,
  }
);

const OpportunityActivitiesTab = dynamic(
  () =>
    import("@/components/opportunities/OpportunityActivitiesTab").then(
      (mod) => mod.OpportunityActivitiesTab
    ),
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
  const { message } = App.useApp();
  const { t, locale } = useI18n();
  const { hasPermission } = useAuth();
  const canWriteOpportunity = hasPermission("opportunity:write");
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("activity");
  const [assignOwnerOpen, setAssignOwnerOpen] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | undefined>(undefined);

  const { data: opportunity, isLoading } = useOpportunity(id);
  const assignOwner = useAssignOpportunityOwner();
  const { data: assignees = [], isLoading: assigneesLoading } = useOpportunityAssignees(
    undefined,
    { enabled: assignOwnerOpen && canWriteOpportunity }
  );

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

  const openAssignOwnerDialog = () => {
    setSelectedOwnerId(opportunity?.ownerId ?? undefined);
    setAssignOwnerOpen(true);
  };

  const handleAssignOwner = async () => {
    try {
      if (!selectedOwnerId) {
        message.warning(t("opportunity.assign.validation.owner_required"));
        return;
      }
      await assignOwner.mutateAsync({ id, ownerId: selectedOwnerId });
      message.success(t("opportunity.assign.messages.success"));
      setAssignOwnerOpen(false);
    } catch (error) {
      message.error(getErrorMessage(error, t("opportunity.assign.messages.failed")));
    }
  };

  const assigneeColumns = useMemo(
    () => [
      {
        title: t("common.owner_name"),
        dataIndex: "name",
        key: "name",
        render: (value: string) => value || "-",
      },
      {
        title: t("common.owner_email"),
        dataIndex: "email",
        key: "email",
        render: (value: string) => value || "-",
      },
    ],
    [t]
  );

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
            <OpportunityActivitiesTab opportunityId={id} />
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
          </Button>,
          <PermissionButton
            key="assign-owner"
            permission="opportunity:write"
            icon={<UserSwitchOutlined />}
            onClick={openAssignOwnerDialog}
          >
            {t("opportunity.actions.assign_owner")}
          </PermissionButton>,
        ]}
      />

      <Modal
        title={t("opportunity.assign.dialog_title")}
        open={assignOwnerOpen}
        onCancel={() => {
          setAssignOwnerOpen(false);
          setSelectedOwnerId(undefined);
        }}
        onOk={handleAssignOwner}
        confirmLoading={assignOwner.isPending}
        destroyOnHidden
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
      >
        <Table
          rowKey="id"
          loading={assigneesLoading}
          columns={assigneeColumns}
          dataSource={assignees}
          pagination={false}
          size="small"
          rowSelection={{
            type: "radio",
            selectedRowKeys: selectedOwnerId ? [selectedOwnerId] : [],
            onChange: (selectedRowKeys) => {
              setSelectedOwnerId(selectedRowKeys[0] as string | undefined);
            },
          }}
          onRow={(record) => ({
            onClick: () => setSelectedOwnerId(record.id),
          })}
        />
        {!assigneesLoading && assignees.length === 0 ? (
          <Text type="secondary">{t("opportunity.assign.messages.no_candidates")}</Text>
        ) : null}
      </Modal>

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
