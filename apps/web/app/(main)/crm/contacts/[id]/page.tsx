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
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { useContact } from "@/hooks/useContacts";
import { AttachmentTable } from "@/components/business/AttachmentTable";
import { ActivityTable } from "@/components/business/ActivityTable";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  ACTIVE: "green",
  INACTIVE: "red",
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: contact, isLoading } = useContact(id);

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

  const accountDisplay = contact.account?.name || contact.accountId || "-";

  const tabItems = [
    {
      key: "owner",
      label: "负责人信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="负责人">
            {contact.owner?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="负责人邮箱">
            {contact.owner?.email || "-"}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "activity",
      label: "活动记录",
      children: <ActivityTable relatedType="Contact" relatedId={id} />,
    },
    {
      key: "attachments",
      label: "附件",
      children: <AttachmentTable relatedType="Contact" relatedId={id} />,
    },
    {
      key: "system",
      label: "系统信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="创建时间">
            {new Date(contact.createdAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            {new Date(contact.updatedAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="编号" span={2}>
            {contact.serialId}
          </Descriptions.Item>
          <Descriptions.Item label="ID" span={2}>
            <Text copyable style={{ fontFamily: "monospace" }}>
              {contact.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

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

        <Tabs items={tabItems} />
      </Space>
    </div>
  );
}
