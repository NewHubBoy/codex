"use client";

import { useEffect, useState } from "react";
import { Card, Form, InputNumber, Select, Button, Space, App, Typography } from "antd";
import { PageHeader } from "@/components/common/PageHeader";
import { useAlertSettings, useUpdateAlertSettings } from "@/hooks/useAlerts";

const { Text } = Typography;

export default function AlertSettingsPage() {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { data, isLoading } = useAlertSettings();
  const updateSettings = useUpdateAlertSettings();
  const [hasOrgUnit, setHasOrgUnit] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgUnitId = localStorage.getItem("orgUnitId");
      setHasOrgUnit(!!orgUnitId);
    }
  }, []);

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        scopeType: data.scopeType === "DEFAULT" ? "TENANT" : data.scopeType,
        inactiveDays: data.inactiveDays,
        staleDays: data.staleDays,
      });
    }
  }, [data, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await updateSettings.mutateAsync(values);
      message.success("预警阈值已更新");
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="预警阈值设置"
        description="配置线索停滞与商机停滞的阈值（按用户/组织/租户生效）"
      />

      <Card loading={isLoading}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="生效范围"
            name="scopeType"
            rules={[{ required: true, message: "请选择生效范围" }]}
          >
            <Select
              options={[
                { label: "当前用户", value: "USER" },
                { label: "当前组织", value: "ORG_UNIT", disabled: !hasOrgUnit },
                { label: "全租户", value: "TENANT" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="线索停滞天数"
            name="inactiveDays"
            rules={[{ required: true, message: "请输入线索停滞天数" }]}
          >
            <InputNumber min={1} max={365} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            label="商机停滞天数"
            name="staleDays"
            rules={[{ required: true, message: "请输入商机停滞天数" }]}
          >
            <InputNumber min={1} max={365} style={{ width: 200 }} />
          </Form.Item>
        </Form>

        <Space>
          <Button type="primary" onClick={handleSave} loading={updateSettings.isPending}>
            保存
          </Button>
          <Text type="secondary">
            默认优先级：用户 &gt; 组织 &gt; 租户 &gt; 默认值（7 天）
          </Text>
        </Space>
      </Card>
    </div>
  );
}
