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
import { useTicket } from "@/hooks/useTickets";
import { PageHeader } from "@/components/common/PageHeader";
import { AttachmentTable } from "@/components/business/AttachmentTable";
import { ActivityTable } from "@/components/business/ActivityTable";
import Link from "next/link";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  NEW: "blue",
  ASSIGNED: "cyan",
  IN_PROGRESS: "processing",
  WAITING_CUSTOMER: "gold",
  RESOLVED: "green",
  CLOSED: "default",
  CANCELLED: "red",
};

const priorityColors: Record<string, string> = {
  LOW: "default",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: ticket, isLoading } = useTicket(id);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <Card>
        <Text type="secondary">未找到该工单</Text>
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
            {ticket.owner?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="负责人邮箱">
            {ticket.owner?.email || "-"}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "activity",
      label: "活动记录",
      children: <ActivityTable relatedType="Ticket" relatedId={id} />,
    },
    {
      key: "attachments",
      label: "附件",
      children: <AttachmentTable relatedType="Ticket" relatedId={id} />,
    },
    {
      key: "system",
      label: "系统信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="创建时间">
            {new Date(ticket.createdAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            {new Date(ticket.updatedAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="编号" span={2}>
            {ticket.serialId}
          </Descriptions.Item>
          <Descriptions.Item label="ID" span={2}>
            <Text copyable style={{ fontFamily: "monospace" }}>
              {ticket.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={ticket.subject || ticket.number || "工单详情"}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            返回
          </Button>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title="基本信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="工单号">
              {ticket.number || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="标题">
              {ticket.subject || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              {ticket.type || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={priorityColors[ticket.priority || ""] || "default"}>
                {ticket.priority || "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[ticket.status] || "default"}>{ticket.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="SLA 截止">
              {ticket.slaDueAt ? new Date(ticket.slaDueAt).toLocaleString("zh-CN") : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="客户ID">
              {ticket.accountId ? (
                <Link href={`/crm/accounts/${ticket.accountId}`}>
                  {ticket.account?.name || ticket.accountId}
                </Link>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="联系人ID">
              {ticket.contactId ? (
                <Link href={`/crm/contacts/${ticket.contactId}`}>
                  {ticket.contactId}
                </Link>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="订单ID" span={2}>
              {ticket.orderId ? (
                <Link href={`/crm/orders/${ticket.orderId}`}>
                  {ticket.orderId}
                </Link>
              ) : (
                "-"
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Tabs items={tabItems} />
      </Space>
    </div>
  );
}
