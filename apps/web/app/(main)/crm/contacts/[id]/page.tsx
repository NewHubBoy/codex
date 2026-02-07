"use client";

import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Tabs,
  Descriptions,
  Spin,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { useContact } from "@/hooks/useContacts";
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
  ACTIVE: "green",
  INACTIVE: "red",
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("activity");

  const { data: contact, isLoading } = useContact(id);
  const accountDisplay = contact?.account?.name || contact?.accountId || "-";
  const tabItems = useMemo(() => {
    if (!contact) {
      return [];
    }
    return [
      {
        key: "owner",
        label: "负责人信息",
        children:
          activeTab === "owner" ? (
            <EntityOwnerTab
              owner={contact.owner}
              labels={{ name: "负责人", email: "负责人邮箱" }}
            />
          ) : null,
      },
      {
        key: "activity",
        label: "活动记录",
        children:
          activeTab === "activity" ? (
            <EntityActivitiesTab relatedType="Contact" relatedId={id} />
          ) : null,
      },
      {
        key: "attachments",
        label: "附件",
        children:
          activeTab === "attachments" ? (
            <EntityAttachmentsTab relatedType="Contact" relatedId={id} />
          ) : null,
      },
      {
        key: "system",
        label: "系统信息",
        children:
          activeTab === "system" ? (
            <EntitySystemTab
              entity={{
                id: contact.id,
                serialId: contact.serialId,
                createdAt: contact.createdAt,
                updatedAt: contact.updatedAt,
              }}
              locale="zh-CN"
              labels={{
                createdAt: "创建时间",
                updatedAt: "最后更新时间",
                serialId: "编号",
                id: "ID",
              }}
            />
          ) : null,
      },
    ];
  }, [activeTab, contact, id]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!contact) {
    return (
      <Card>
        <Text type="secondary">未找到该联系人</Text>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={contact.name || "联系人详情"}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            返回
          </Button>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title="基本信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="姓名">{contact.name}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[contact.status] || "default"}>
                {contact.status || "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="职位">{contact.title || "-"}</Descriptions.Item>
            <Descriptions.Item label="角色">{contact.role || "-"}</Descriptions.Item>
            <Descriptions.Item label="电话">{contact.phone || "-"}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{contact.email || "-"}</Descriptions.Item>
            <Descriptions.Item label="所属客户">
              {contact.accountId ? (
                <Link href={`/crm/accounts/${contact.accountId}`}>{accountDisplay}</Link>
              ) : (
                accountDisplay
              )}
            </Descriptions.Item>
            <Descriptions.Item label="BP ID">{contact.bpId || "-"}</Descriptions.Item>
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
