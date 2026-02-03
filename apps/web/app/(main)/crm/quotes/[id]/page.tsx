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
import { useQuote } from "@/hooks/useQuotes";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  DRAFT: "default",
  IN_REVIEW: "processing",
  APPROVED: "success",
  SENT: "blue",
  ACCEPTED: "green",
  REJECTED: "error",
  EXPIRED: "warning",
};

const formatAmount = (amount?: number, currency?: string) => {
  if (amount === undefined || amount === null) return "-";
  const formatted = amount.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
};

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: quote, isLoading } = useQuote(id);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!quote) {
    return (
      <Card>
        <Text type="secondary">未找到该报价单</Text>
      </Card>
    );
  }

  const accountDisplay = quote.account?.name || quote.accountId || "-";
  const opportunityDisplay = quote.opportunity?.name || quote.opportunityId || "-";

  const tabItems = [
    {
      key: "system",
      label: "系统信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="创建时间">
            {new Date(quote.createdAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            {new Date(quote.updatedAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="编号" span={2}>
            {quote.serialId}
          </Descriptions.Item>
          <Descriptions.Item label="ID" span={2}>
            <Text copyable style={{ fontFamily: "monospace" }}>
              {quote.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={quote.number || "报价单详情"}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            返回
          </Button>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title="基本信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="报价单号">{quote.number || "-"}</Descriptions.Item>
            <Descriptions.Item label="版本">{quote.version ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[quote.status] || "default"}>
                {quote.status || "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="金额">
              {formatAmount(quote.totalAmount, quote.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="有效期开始">
              {quote.validFrom ? new Date(quote.validFrom).toLocaleString("zh-CN") : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="有效期结束">
              {quote.validTo ? new Date(quote.validTo).toLocaleString("zh-CN") : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="客户">
              {quote.accountId ? (
                <Link href={`/crm/accounts/${quote.accountId}`}>{accountDisplay}</Link>
              ) : (
                accountDisplay
              )}
            </Descriptions.Item>
            <Descriptions.Item label="商机">
              {quote.opportunityId ? (
                <Link href={`/crm/opportunities/${quote.opportunityId}`}>
                  {opportunityDisplay}
                </Link>
              ) : (
                opportunityDisplay
              )}
            </Descriptions.Item>
            <Descriptions.Item label="联系人">
              {quote.contactId ? (
                <Link href={`/crm/contacts/${quote.contactId}`}>
                  {quote.contactId}
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
