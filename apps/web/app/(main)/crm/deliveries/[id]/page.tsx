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
import { useDelivery } from "@/hooks/useDeliveries";
import { AttachmentTable } from "@/components/business/AttachmentTable";
import { ActivityTable } from "@/components/business/ActivityTable";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  PLANNED: "default",
  IN_TRANSIT: "processing",
  DELIVERED: "success",
  COMPLETED: "green",
};

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: delivery, isLoading } = useDelivery(id);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!delivery) {
    return (
      <Card>
        <Text type="secondary">未找到该交付单</Text>
      </Card>
    );
  }

  const orderDisplay = delivery.order?.number || delivery.orderId || "-";

  const tabItems = [
    {
      key: "owner",
      label: "负责人信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="负责人">
            {delivery.owner?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="负责人邮箱">
            {delivery.owner?.email || "-"}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "activity",
      label: "活动记录",
      children: <ActivityTable relatedType="Delivery" relatedId={id} />,
    },
    {
      key: "attachments",
      label: "附件",
      children: <AttachmentTable relatedType="Delivery" relatedId={id} />,
    },
    {
      key: "system",
      label: "系统信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="创建时间">
            {new Date(delivery.createdAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            {new Date(delivery.updatedAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="编号" span={2}>
            {delivery.serialId}
          </Descriptions.Item>
          <Descriptions.Item label="ID" span={2}>
            <Text copyable style={{ fontFamily: "monospace" }}>
              {delivery.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={delivery.number || "交付详情"}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            返回
          </Button>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title="基本信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="交付单号">
              {delivery.number || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[delivery.status] || "default"}>
                {delivery.status || "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="订单">
              {delivery.orderId ? (
                <Link href={`/crm/orders/${delivery.orderId}`}>{orderDisplay}</Link>
              ) : (
                orderDisplay
              )}
            </Descriptions.Item>
            <Descriptions.Item label="送达时间">
              {delivery.deliveredAt
                ? new Date(delivery.deliveredAt).toLocaleString("zh-CN")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="送达数量">
              {delivery.deliveredQty ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="备注">
              {delivery.deliveryNotes || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Tabs items={tabItems} />
      </Space>
    </div>
  );
}
