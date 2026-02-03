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
import { useOrder } from "@/hooks/useOrders";
import { AttachmentTable } from "@/components/business/AttachmentTable";
import { ActivityTable } from "@/components/business/ActivityTable";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  DRAFT: "default",
  CONFIRMED: "blue",
  IN_FULFILLMENT: "processing",
  DELIVERED: "green",
  CLOSED: "gold",
  CANCELLED: "red",
};

const formatAmount = (amount?: number, currency?: string) => {
  if (amount === undefined || amount === null) return "-";
  const formatted = amount.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card>
        <Text type="secondary">未找到该订单</Text>
      </Card>
    );
  }

  const accountDisplay = order.account?.name || order.accountId || "-";

  const tabItems = [
    {
      key: "owner",
      label: "负责人信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="负责人">
            {order.owner?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="负责人邮箱">
            {order.owner?.email || "-"}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "activity",
      label: "活动记录",
      children: <ActivityTable relatedType="Order" relatedId={id} />,
    },
    {
      key: "attachments",
      label: "附件",
      children: <AttachmentTable relatedType="Order" relatedId={id} />,
    },
    {
      key: "system",
      label: "系统信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="创建时间">
            {new Date(order.createdAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            {new Date(order.updatedAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="编号" span={2}>
            {order.serialId}
          </Descriptions.Item>
          <Descriptions.Item label="ID" span={2}>
            <Text copyable style={{ fontFamily: "monospace" }}>
              {order.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={order.number || "订单详情"}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            返回
          </Button>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title="基本信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="订单号">{order.number || "-"}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[order.status] || "default"}>
                {order.status || "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="订单日期">
              {order.orderDate ? new Date(order.orderDate).toLocaleString("zh-CN") : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="金额">
              {formatAmount(order.totalAmount, order.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="客户">
              {order.accountId ? (
                <Link href={`/crm/accounts/${order.accountId}`}>{accountDisplay}</Link>
              ) : (
                accountDisplay
              )}
            </Descriptions.Item>
            <Descriptions.Item label="联系人">{order.contactId || "-"}</Descriptions.Item>
            <Descriptions.Item label="商机">
              {order.opportunityId ? (
                <Link href={`/crm/opportunities/${order.opportunityId}`}>
                  {order.opportunityId}
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
