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
import { useOpportunity } from "@/hooks/useOpportunities";
import { AttachmentTable } from "@/components/business/AttachmentTable";
import { ActivityTable } from "@/components/business/ActivityTable";

const { Text } = Typography;

const formatAmount = (amount?: number, currency?: string) => {
  if (amount === undefined || amount === null) return "-";
  const formatted = amount.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: opportunity, isLoading } = useOpportunity(id);

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
        <Text type="secondary">未找到该商机</Text>
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
            {opportunity.owner?.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="负责人邮箱">
            {opportunity.owner?.email || "-"}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "activity",
      label: "活动记录",
      children: <ActivityTable relatedType="Opportunity" relatedId={id} />,
    },
    {
      key: "attachments",
      label: "附件",
      children: <AttachmentTable relatedType="Opportunity" relatedId={id} />,
    },
    {
      key: "system",
      label: "系统信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="创建时间">
            {new Date(opportunity.createdAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            {new Date(opportunity.updatedAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="编号" span={2}>
            {opportunity.serialId}
          </Descriptions.Item>
          <Descriptions.Item label="ID" span={2}>
            <Text copyable style={{ fontFamily: "monospace" }}>
              {opportunity.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={opportunity.name || "商机详情"}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            返回
          </Button>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title="基本信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="商机名称">
              {opportunity.name}
            </Descriptions.Item>
            <Descriptions.Item label="阶段">
              <Tag color="blue">{opportunity.stage || "-"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="金额">
              {formatAmount(opportunity.amount, opportunity.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="成交概率">
              {opportunity.probability !== undefined && opportunity.probability !== null
                ? `${opportunity.probability}%`
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="预计成交时间">
              {opportunity.expectedCloseDate
                ? new Date(opportunity.expectedCloseDate).toLocaleString("zh-CN")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color="default">{opportunity.status || "-"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="客户">
              {opportunity.account?.name || opportunity.accountId || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="线索">
              {opportunity.lead?.name || opportunity.leadId || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="联系人">
              {opportunity.contactId || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="丢单原因">
              {opportunity.reasonLost || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Tabs items={tabItems} />
      </Space>
    </div>
  );
}
