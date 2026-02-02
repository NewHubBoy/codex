"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  Form,
  Input,
  Select,
  InputNumber,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useLead, useDeleteLead, useUpdateLead, useSubmitLead } from "@/hooks/useLeads";
import { PageHeader } from "@/components/common/PageHeader";
import { useEffect, useState } from "react";
import { LeadSource, LeadRating, LeadStatus } from "@/services/leads";

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
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const id = params.id as string;
  const operationType = searchParams.get("operationType");

  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  const { data: lead, isLoading, refetch } = useLead(id);
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();
  const submitLead = useSubmitLead();
  const isDraft = lead?.status === "DRAFT";

  // 根据 operationType 自动进入编辑模式
  useEffect(() => {
    if (operationType === "edit" && lead) {
      setIsEditing(true);
      // 清除 URL 参数，避免刷新时重复打开
      router.replace(`/crm/leads/${id}`, { scroll: false });
    }
  }, [operationType, lead, router, id]);

  useEffect(() => {
    if (lead) {
      form.setFieldsValue({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        rating: lead.rating,
        expectedValue: lead.expectedValue,
        description: lead.description,
        ownerId: lead.ownerId,
        status: lead.status === "DRAFT" ? undefined : lead.status,
      });
      if (lead.status === "DRAFT") {
        setIsEditing(true);
      }
    }
  }, [lead, form]);

  const handleDelete = async () => {
    try {
      await deleteLead.mutateAsync(id);
      message.success("删除成功");
      router.push("/crm/leads");
    } catch {
      message.error("删除失败");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!lead) {
        return;
      }
      if (isDraft) {
        await submitLead.mutateAsync({ id, data: values });
        message.success("创建成功");
      } else {
        await updateLead.mutateAsync({ id, data: values });
        message.success("更新成功");
      }
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("保存失败:", error);
    }
  };

  const handleCancelEdit = async () => {
    if (isDraft) {
      try {
        await deleteLead.mutateAsync(id);
      } catch (error) {
        console.error("删除草稿失败:", error);
      }
      router.push("/crm/leads");
      return;
    }
    setIsEditing(false);
    if (lead) {
      form.setFieldsValue({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        rating: lead.rating,
        expectedValue: lead.expectedValue,
        description: lead.description,
        ownerId: lead.ownerId,
        status: lead.status === "DRAFT" ? undefined : lead.status,
      });
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
        title={lead.name || "新建线索"}
        extra={[
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            返回
          </Button>,
          ...(isEditing
            ? [
                <Button key="cancel" onClick={handleCancelEdit}>
                  取消
                </Button>,
                <Button
                  key="save"
                  type="primary"
                  loading={submitLead.isPending || updateLead.isPending}
                  onClick={handleSave}
                >
                  保存
                </Button>,
              ]
            : [
                <Button
                  key="edit"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
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
              ]),
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
          {isEditing ? (
            <Form form={form} layout="vertical" requiredMark="optional">
              <Form.Item
                name="name"
                label="线索名称"
                rules={[{ required: true, message: "请输入线索名称" }]}
              >
                <Input placeholder="请输入线索名称" />
              </Form.Item>

              <Form.Item name="company" label="公司">
                <Input placeholder="请输入公司名称" />
              </Form.Item>

              <Space style={{ width: "100%" }} size={16}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  style={{ flex: 1 }}
                  rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
                >
                  <Input placeholder="请输入邮箱" />
                </Form.Item>

                <Form.Item name="phone" label="电话" style={{ flex: 1 }}>
                  <Input placeholder="请输入电话" />
                </Form.Item>
              </Space>

              <Space style={{ width: "100%" }} size={16}>
                <Form.Item name="source" label="来源" style={{ flex: 1 }}>
                  <Select
                    placeholder="请选择来源"
                    options={Object.entries(LeadSource).map(([key, value]) => ({
                      label: key.replace("_", " "),
                      value,
                    }))}
                  />
                </Form.Item>

                <Form.Item name="rating" label="优先级" style={{ flex: 1 }}>
                  <Select
                    placeholder="请选择优先级"
                    options={Object.entries(LeadRating).map(([key, value]) => ({
                      label: key,
                      value,
                    }))}
                  />
                </Form.Item>
              </Space>

              <Form.Item name="expectedValue" label="预期金额">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="请输入预期金额"
                  min={0}
                  precision={2}
                  prefix="¥"
                />
              </Form.Item>

              <Form.Item name="status" label="状态">
                <Select
                  allowClear
                  placeholder="请选择状态"
                  options={Object.entries(LeadStatus)
                    .filter(([key]) => key !== "DRAFT")
                    .map(([key, value]) => ({
                      label: key,
                      value,
                    }))}
                />
              </Form.Item>

              <Form.Item name="description" label="描述">
                <Input.TextArea rows={4} placeholder="请输入线索描述" />
              </Form.Item>
            </Form>
          ) : (
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
          )}
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
            <Descriptions.Item label="编号" span={2}>
              {lead.serialId}
            </Descriptions.Item>
            <Descriptions.Item label="ID" span={2}>
              <Text copyable style={{ fontFamily: "monospace" }}>
                {lead.id}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
}
