"use client";

import { useParams, useRouter } from "next/navigation";
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
import { AttachmentTable } from "@/components/business/AttachmentTable";
import { ActivityTable } from "@/components/business/ActivityTable";

const { Text } = Typography;

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

  const { data: account, isLoading } = useAccount(id);

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

  const tabItems = [
    {
      key: "owner",
      label: "负责人信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="负责人">
            {account.owner?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="负责人邮箱">
            {account.owner?.email || "-"}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "activity",
      label: "活动记录",
      children: <ActivityTable relatedType="Account" relatedId={id} />,
    },
    {
      key: "attachments",
      label: "附件",
      children: <AttachmentTable relatedType="Account" relatedId={id} />,
    },
    {
      key: "system",
      label: "系统信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="创建时间">
            {new Date(account.createdAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            {new Date(account.updatedAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="编号" span={2}>
            {account.serialId}
          </Descriptions.Item>
          <Descriptions.Item label="ID" span={2}>
            <Text copyable style={{ fontFamily: "monospace" }}>
              {account.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

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

        <Tabs items={tabItems} />
      </Space>
    </div>
  );
}
