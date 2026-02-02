"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Descriptions,
  Spin,
  App,
  Popconfirm,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useLead, useDeleteLead } from "@/hooks/useLeads";
import { PageHeader } from "@/components/common/PageHeader";
import { LeadDrawer } from "@/components/business/LeadDrawer";
import type { Lead } from "@/services/leads";
import { useState } from "react";
import { App } from "antd";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  NEW: "blue",
  ASSIGNED: "cyan",
  WORKING: "green",
  QUALIFIED: "purple",
  CONVERTED: "gold",
  DISQUALIFIED: "red",
};

const ratingColors: Record<string, string> = {
  HOT: "red",
  WARM: "orange",
  COLD: "blue",
};

const sourceLabels: Record<string, string> = {
  WEBSITE: "官网",
  REFERRAL: "推荐",
  COLD_CALL: "冷访",
  TRADE_SHOW: "展会",
  SOCIAL_MEDIA: "社交媒体",
  OTHER: "其他",
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const id = params.id as string;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: lead, isLoading, refetch } = useLead(id);
  const deleteLead = useDeleteLead();

  const handleDelete = async () => {
    try {
      await deleteLead.mutateAsync(id);
      message.success("删除成功");
      router.push("/crm/leads");
    } catch {
      message.error("删除失败");
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lead) {
    return (
      <Card>
        <Text type="secondary">未找到该线索</Text>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={lead.name}
        extra={[
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            返回
          </Button>,
          <Button
            key="edit"
            icon={<EditOutlined />}
            onClick={() => setDrawerOpen(true)}
          >
            编辑
          </Button>,
          <Button
            key="convert"
            icon={<SwapOutlined />}
            type="primary"
            disabled={lead.status === "CONVERTED"}
          >
            转换为客户
          </Button>,
          <Popconfirm
            key="delete"
            title="确认删除"
            description="确定要删除这条线索吗？"
            onConfirm={handleDelete}
            okText="确认"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {/* 基本信息 */}
        <Card title="基本信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="线索名称">{lead.name}</Descriptions.Item>
            <Descriptions.Item label="公司">{lead.company || "-"}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{lead.email || "-"}</Descriptions.Item>
            <Descriptions.Item label="电话">{lead.phone || "-"}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[lead.status]}>{lead.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={ratingColors[lead.rating || ""] || "default"}>
                {lead.rating || "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="来源">
              {lead.source ? sourceLabels[lead.source] || lead.source : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="预期金额">
              {lead.expectedValue
                ? `¥${lead.expectedValue.toLocaleString()}`
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {lead.description || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 负责人信息 */}
        <Card title="负责人信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="负责人">
              {lead.owner?.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="负责人邮箱">
              {lead.owner?.email || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 系统信息 */}
        <Card title="系统信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="创建时间">
              {new Date(lead.createdAt).toLocaleString("zh-CN")}
            </Descriptions.Item>
            <Descriptions.Item label="最后更新时间">
              {new Date(lead.updatedAt).toLocaleString("zh-CN")}
            </Descriptions.Item>
            <Descriptions.Item label="ID" span={2}>
              <Text copyable style={{ fontFamily: "monospace" }}>
                {lead.id}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>

      {/* 编辑 Drawer */}
      <LeadDrawer
        open={drawerOpen}
        lead={lead}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => {
          setDrawerOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
