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
import { useQuote } from "@/hooks/useQuotes";
import { useResubmitQuoteApproval, useSubmitQuoteApproval } from "@/hooks/useQuotes";
import { ApprovalHistory } from "@/components/approvals/ApprovalHistory";
import { PermissionButton } from "@/components/auth/PermissionButton";

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
  const { message } = App.useApp();

  const { data: quote, isLoading } = useQuote(id);
  const submitApproval = useSubmitQuoteApproval();
  const resubmitApproval = useResubmitQuoteApproval();

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
    {
      key: "approvals",
      label: "审批记录",
      children: <ApprovalHistory entityType="Quote" entityId={id} />,
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
          quote.status === "DRAFT" ? (
            <PermissionButton
              key="submit"
              permission="quote:write"
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
          quote.status === "REJECTED" ? (
            <PermissionButton
              key="resubmit"
              permission="quote:write"
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
