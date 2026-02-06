"use client";

import { useEffect, useState } from "react";
import { Card, Form, InputNumber, Select, Space, App, Typography } from "antd";
import { PageHeader } from "@/components/common/PageHeader";
import { useAlertSettings, useUpdateAlertSettings } from "@/hooks/useAlerts";
import { useI18n } from "@/i18n/provider";
import { PermissionButton } from "@/components/auth/PermissionButton";

const { Text } = Typography;

export default function AlertSettingsPage() {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { data, isLoading } = useAlertSettings();
  const updateSettings = useUpdateAlertSettings();
  const { t } = useI18n();
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
      message.success(t("alerts.settings.updated"));
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  return (
    <div>
      <PageHeader
        title={t("alerts.settings.title")}
        description={t("alerts.settings.description")}
      />

      <Card loading={isLoading}>
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("alerts.settings.scope_label")}
            name="scopeType"
            rules={[{ required: true, message: t("alerts.settings.scope_required") }]}
          >
            <Select
              options={[
                { label: t("alerts.settings.scope_user"), value: "USER" },
                { label: t("alerts.settings.scope_org"), value: "ORG_UNIT", disabled: !hasOrgUnit },
                { label: t("alerts.settings.scope_tenant"), value: "TENANT" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={t("alerts.settings.inactive_label")}
            name="inactiveDays"
            rules={[{ required: true, message: t("alerts.settings.inactive_required") }]}
          >
            <InputNumber min={1} max={365} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            label={t("alerts.settings.stale_label")}
            name="staleDays"
            rules={[{ required: true, message: t("alerts.settings.stale_required") }]}
          >
            <InputNumber min={1} max={365} style={{ width: 200 }} />
          </Form.Item>
        </Form>

        <Space>
          <PermissionButton permission="alert:write" type="primary" onClick={handleSave} loading={updateSettings.isPending}>
            {t("common.save")}
          </PermissionButton>
          <Text type="secondary">
            {t("alerts.settings.priority_hint")}
          </Text>
        </Space>
      </Card>
    </div>
  );
}
