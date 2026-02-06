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
  App,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { useOrder } from "@/hooks/useOrders";
import { useResubmitOrderApproval, useSubmitOrderApproval } from "@/hooks/useOrders";
import { ApprovalHistory } from "@/components/approvals/ApprovalHistory";
import { useApprovalInstances } from "@/hooks/useApprovals";
import { PermissionButton } from "@/components/auth/PermissionButton";

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
  const { message } = App.useApp();

  const { data: order, isLoading } = useOrder(id);
  const submitApproval = useSubmitOrderApproval();
  const resubmitApproval = useResubmitOrderApproval();
  const { data: approvalInstances } = useApprovalInstances({
    page: 1,
    pageSize: 1,
    entityType: "Order",
    entityId: id,
  });
  const latestApproval = approvalInstances?.data?.[0];

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
    {
      key: "approvals",
      label: "审批记录",
      children: <ApprovalHistory entityType="Order" entityId={id} />,
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
          order.status === "DRAFT" ? (
            <PermissionButton
              key="submit"
              permission="order:write"
              type="primary"
              loading={submitApproval.isPending}
              onClick={async () => {
                try {
                  await submitApproval.mutateAsync({ id });
                  message.success("已提交审批");
                } catch (error) {
                  if (error instanceof Error) {
                    message.error(error.message);
                  }
                }
              }}
            >
              提交审批
            </PermissionButton>
          ) : null,
          latestApproval?.status === "REJECTED" ? (
            <PermissionButton
              key="resubmit"
              permission="order:write"
              type="primary"
              loading={resubmitApproval.isPending}
              onClick={async () => {
                try {
                  await resubmitApproval.mutateAsync({ id });
                  message.success("已重新提交");
                } catch (error) {
                  if (error instanceof Error) {
                    message.error(error.message);
                  }
                }
              }}
            >
              重新提交
            </PermissionButton>
          ) : null,
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
