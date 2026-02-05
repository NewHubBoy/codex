"use client";

import { useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { useApprovalRules, useCreateApprovalRule, useTestApprovalRule, useUpdateApprovalRule } from "@/hooks/useApprovalRules";
import { useRoles } from "@/hooks/useSystem";
import type { ApprovalRule } from "@/services/approval-rules";
import { useI18n } from "@/i18n/provider";

const { Text } = Typography;

const fieldOptions = [
  { label: "折扣率", value: "discountRate" },
  { label: "金额", value: "amount" },
  { label: "定制化", value: "isCustom" },
  { label: "特殊条款", value: "hasSpecialTerms" },
];

const operatorOptions = [
  { label: "等于", value: "EQ" },
  { label: "不等于", value: "NEQ" },
  { label: "大于", value: "GT" },
  { label: "大于等于", value: "GTE" },
  { label: "小于", value: "LT" },
  { label: "小于等于", value: "LTE" },
  { label: "包含", value: "IN" },
  { label: "不包含", value: "NOT_IN" },
];

const entityOptions = [
  { label: "报价单", value: "Quote" },
  { label: "订单", value: "Order" },
];

function parseConditionValue(raw?: string) {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return raw;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

function serializeConditionValue(value: unknown) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default function ApprovalRulesPage() {
  const { t } = useI18n();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [testForm] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [testResult, setTestResult] = useState<{
    matched: boolean;
    rule?: ApprovalRule;
    steps?: { roleCode: string; groupIndex?: number; sortOrder?: number }[];
  } | null>(null);

  const { data, isLoading } = useApprovalRules({ page: 1, pageSize: 50 });
  const { data: rolesData } = useRoles({ page: 1, pageSize: 200 });
  const createRule = useCreateApprovalRule();
  const updateRule = useUpdateApprovalRule();
  const testRule = useTestApprovalRule();

  const roleOptions = useMemo(
    () => (rolesData?.data || []).map((role) => ({ label: role.name, value: role.code })),
    [rolesData]
  );

  const columns = useMemo<ColumnsType<ApprovalRule>>(
    () => [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "对象",
        dataIndex: "entityType",
        key: "entityType",
        render: (value: string) => (value === "Quote" ? "报价单" : "订单"),
      },
      {
        title: "优先级",
        dataIndex: "priority",
        key: "priority",
      },
      {
        title: "状态",
        dataIndex: "isActive",
        key: "isActive",
        render: (value: boolean) => (
          <Tag color={value ? "success" : "default"}>{value ? "启用" : "停用"}</Tag>
        ),
      },
      {
        title: "更新时间",
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (value: string) => new Date(value).toLocaleString("zh-CN"),
      },
      {
        title: "操作",
        key: "actions",
        render: (_value, record) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditingRule(record);
                form.setFieldsValue({
                  name: record.name,
                  entityType: record.entityType,
                  priority: record.priority,
                  isActive: record.isActive,
                  effectiveFrom: record.effectiveFrom ? dayjs(record.effectiveFrom) : undefined,
                  effectiveTo: record.effectiveTo ? dayjs(record.effectiveTo) : undefined,
                  conditions: (record.conditions || []).map((item) => ({
                    ...item,
                    value: serializeConditionValue(item.value),
                  })),
                  steps: (record.steps || []).map((step) => ({
                    roleCode: step.roleCode,
                    groupIndex: step.groupIndex ?? 0,
                    sortOrder: step.sortOrder ?? 0,
                  })),
                });
                setDrawerOpen(true);
              }}
            >
              编辑
            </Button>
          </Space>
        ),
      },
    ],
    [form]
  );

  const handleCreate = () => {
    setEditingRule(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, priority: 0, conditions: [], steps: [] });
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        entityType: values.entityType,
        priority: values.priority ?? 0,
        isActive: values.isActive ?? true,
        effectiveFrom: values.effectiveFrom ? values.effectiveFrom.toISOString() : undefined,
        effectiveTo: values.effectiveTo ? values.effectiveTo.toISOString() : undefined,
        conditions: (values.conditions || []).map((item: { field: string; operator: string; value?: string }) => ({
          field: item.field,
          operator: item.operator,
          value: parseConditionValue(item.value),
        })),
        steps: (values.steps || []).map((item: { roleCode: string; groupIndex?: number; sortOrder?: number }) => ({
          roleCode: item.roleCode,
          groupIndex: item.groupIndex ?? 0,
          sortOrder: item.sortOrder ?? 0,
        })),
      };

      if (editingRule) {
        await updateRule.mutateAsync({ id: editingRule.id, body: payload });
        message.success("审批规则已更新");
      } else {
        await createRule.mutateAsync(payload);
        message.success("审批规则已创建");
      }
      setDrawerOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleTest = async () => {
    try {
      const values = await testForm.validateFields();
      const result = await testRule.mutateAsync({
        entityType: values.entityType,
        payload: {
          discountRate: values.discountRate ?? undefined,
          amount: values.amount ?? undefined,
          isCustom: values.isCustom ?? undefined,
          hasSpecialTerms: values.hasSpecialTerms ?? undefined,
        },
      });
      setTestResult(result);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  return (
    <div>
      <PageHeader
        title={t("approval_rules.page.title")}
        description={t("approval_rules.page.description")}
        action={
          <Space>
            <Button onClick={() => setTestOpen(true)}>规则测试</Button>
            <Button type="primary" onClick={handleCreate}>
              新建规则
            </Button>
          </Space>
        }
      />

      <Card loading={isLoading}>
        <Table columns={columns} dataSource={data?.data || []} rowKey="id" pagination={false} />
      </Card>

      <Drawer
        title={editingRule ? "编辑规则" : "新建规则"}
        open={drawerOpen}
        width={720}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={createRule.isPending || updateRule.isPending}>
              保存
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form} initialValues={{ isActive: true, priority: 0 }}>
          <Form.Item label="规则名称" name="name" rules={[{ required: true, message: "请输入规则名称" }]}>
            <Input placeholder="例如：大额报价审批" />
          </Form.Item>
          <Space size="large" wrap>
            <Form.Item label="对象" name="entityType" rules={[{ required: true, message: "请选择对象" }]}>
              <Select options={entityOptions} style={{ width: 160 }} />
            </Form.Item>
            <Form.Item label="优先级" name="priority">
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item label="启用" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>

          <Space size="large" wrap>
            <Form.Item label="生效开始" name="effectiveFrom">
              <DatePicker style={{ width: 180 }} />
            </Form.Item>
            <Form.Item label="生效结束" name="effectiveTo">
              <DatePicker style={{ width: 180 }} />
            </Form.Item>
          </Space>

          <Form.List name="conditions">
            {(fields, { add, remove }) => (
              <Card title="条件" extra={<Button onClick={() => add()}>新增条件</Button>}>
                {fields.length === 0 && <Text type="secondary">未设置条件时表示全部命中。</Text>}
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" style={{ display: "flex", marginBottom: 12 }}>
                    <Form.Item
                      {...field}
                      name={[field.name, "field"]}
                      rules={[{ required: true, message: "请选择字段" }]}
                    >
                      <Select options={fieldOptions} style={{ width: 140 }} placeholder="字段" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, "operator"]}
                      rules={[{ required: true, message: "请选择运算符" }]}
                    >
                      <Select options={operatorOptions} style={{ width: 120 }} placeholder="运算符" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, "value"]}>
                      <Input placeholder="值 (数字/布尔/JSON)" style={{ width: 220 }} />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>
                      删除
                    </Button>
                  </Space>
                ))}
              </Card>
            )}
          </Form.List>

          <Form.List name="steps">
            {(fields, { add, remove }) => (
              <Card
                title="审批节点"
                extra={<Button onClick={() => add()}>新增审批节点</Button>}
                style={{ marginTop: 16 }}
              >
                {fields.length === 0 && (
                  <Text type="secondary">至少配置一个审批节点，支持并行组。</Text>
                )}
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" style={{ display: "flex", marginBottom: 12 }}>
                    <Form.Item
                      {...field}
                      name={[field.name, "roleCode"]}
                      rules={[{ required: true, message: "请选择审批角色" }]}
                    >
                      <Select options={roleOptions} style={{ width: 200 }} placeholder="审批角色" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, "groupIndex"]}>
                      <InputNumber min={0} placeholder="并行组" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, "sortOrder"]}>
                      <InputNumber min={0} placeholder="顺序" />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>
                      删除
                    </Button>
                  </Space>
                ))}
              </Card>
            )}
          </Form.List>
        </Form>
      </Drawer>

      <Modal
        open={testOpen}
        title="规则测试"
        onCancel={() => setTestOpen(false)}
        onOk={handleTest}
        confirmLoading={testRule.isPending}
      >
        <Form layout="vertical" form={testForm} initialValues={{ entityType: "Quote" }}>
          <Form.Item
            label="对象"
            name="entityType"
            rules={[{ required: true, message: "请选择对象" }]}
          >
            <Select options={entityOptions} />
          </Form.Item>
          <Space wrap>
            <Form.Item label="折扣率" name="discountRate">
              <InputNumber min={0} max={100} style={{ width: 160 }} />
            </Form.Item>
            <Form.Item label="金额" name="amount">
              <InputNumber min={0} style={{ width: 200 }} />
            </Form.Item>
          </Space>
          <Space wrap>
            <Form.Item label="定制化" name="isCustom" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="特殊条款" name="hasSpecialTerms" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>

        {testResult && (
          <Card size="small" style={{ marginTop: 12 }}>
            <Space direction="vertical">
              <Tag color={testResult.matched ? "success" : "default"}>
                {testResult.matched ? "命中规则" : "未命中"}
              </Tag>
              {testResult.rule && (
                <Text>
                  规则：{testResult.rule.name}（{testResult.rule.entityType}）
                </Text>
              )}
              {testResult.steps?.length ? (
                <div>
                  <Text>审批节点：</Text>
                  <Space wrap>
                    {testResult.steps.map((step, index) => (
                      <Tag key={`${step.roleCode}-${index}`}>
                        {step.roleCode} / 组{(step.groupIndex ?? 0) + 1}
                      </Tag>
                    ))}
                  </Space>
                </div>
              ) : null}
            </Space>
          </Card>
        )}
      </Modal>
    </div>
  );
}
