"use client";

import { useEffect } from "react";
import { Drawer, Form, Input, Select, InputNumber, Button, Space, message } from "antd";
import { useCreateLead, useUpdateLead } from "@/hooks/useLeads";
import type { Lead, LeadStatus } from "@/services/leads";
import { LeadSource, LeadRating } from "@/services/leads";

interface LeadDrawerProps {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function LeadDrawer({ open, lead, onClose, onSuccess }: LeadDrawerProps) {
  const [form] = Form.useForm();
  const isEditing = !!lead;

  // 创建线索
  const createLead = useCreateLead();
  // 更新线索
  const updateLead = useUpdateLead();

  // 加载编辑数据
  useEffect(() => {
    if (lead && open) {
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
      });
    } else if (open) {
      form.resetFields();
    }
  }, [lead, open, form]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing) {
        await updateLead.mutateAsync({
          id: lead.id,
          data: values,
        });
        message.success("更新成功");
      } else {
        await createLead.mutateAsync(values);
        message.success("创建成功");
      }

      onSuccess();
    } catch (error) {
      console.error("提交失败:", error);
    }
  };

  return (
    <Drawer
      title={isEditing ? "编辑线索" : "新建线索"}
      width={600}
      open={open}
      onClose={onClose}
      footer={
        <Space style={{ float: "right" }}>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            loading={createLead.isPending || updateLead.isPending}
            onClick={handleSubmit}
          >
            {isEditing ? "更新" : "创建"}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
      >
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
            rules={[
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="电话"
            style={{ flex: 1 }}
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
        </Space>

        <Space style={{ width: "100%" }} size={16}>
          <Form.Item
            name="source"
            label="来源"
            style={{ flex: 1 }}
          >
            <Select
              placeholder="请选择来源"
              options={Object.entries(LeadSource).map(([key, value]) => ({
                label: key.replace("_", " "),
                value,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="rating"
            label="优先级"
            style={{ flex: 1 }}
          >
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

        <Form.Item name="description" label="描述">
          <Input.TextArea
            rows={4}
            placeholder="请输入线索描述"
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
