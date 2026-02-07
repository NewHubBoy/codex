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
import { PageHeader } from "@/components/common/PageHeader";
import { useAccount } from "@/hooks/useAccounts";
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
  PROSPECT: "blue",
  CUSTOMER: "gold",
};

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("activity");

  const { data: account, isLoading } = useAccount(id);

  const tabItems = useMemo(() => {
    if (!account) {
      return [];
    }
    return [
      {
        key: "owner",
        label: "负责人信息",
        children:
          activeTab === "owner" ? (
            <EntityOwnerTab
              owner={account.owner}
              labels={{ name: "负责人", email: "负责人邮箱" }}
            />
          ) : null,
      },
      {
        key: "activity",
        label: "活动记录",
        children:
          activeTab === "activity" ? (
            <EntityActivitiesTab relatedType="Account" relatedId={id} />
          ) : null,
      },
      {
        key: "attachments",
        label: "附件",
        children:
          activeTab === "attachments" ? (
            <EntityAttachmentsTab relatedType="Account" relatedId={id} />
          ) : null,
      },
      {
        key: "system",
        label: "系统信息",
        children:
          activeTab === "system" ? (
            <EntitySystemTab
              entity={{
                id: account.id,
                serialId: account.serialId,
                createdAt: account.createdAt,
                updatedAt: account.updatedAt,
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
  }, [account, activeTab, id]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!account) {
    return (
      <Card>
        <Text type="secondary">未找到该客户</Text>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={account.name || "客户详情"}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            返回
          </Button>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title="基本信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="客户名称">{account.name}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[account.status] || "default"}>
                {account.status || "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="类型">{account.type || "-"}</Descriptions.Item>
            <Descriptions.Item label="行业">{account.industry || "-"}</Descriptions.Item>
            <Descriptions.Item label="客户等级">{account.rating || "-"}</Descriptions.Item>
            <Descriptions.Item label="生命周期">{account.lifecycleStatus || "-"}</Descriptions.Item>
            <Descriptions.Item label="上级客户">{account.parentId || "-"}</Descriptions.Item>
            <Descriptions.Item label="BP ID">{account.bpId || "-"}</Descriptions.Item>
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
