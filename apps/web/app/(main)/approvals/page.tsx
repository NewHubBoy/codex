"use client";

import { useMemo, useState } from "react";
import { App, Button, Card, Form, Input, Modal, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/common/PageHeader";
import { useApproveApprovalTask, useApprovalTasks, useRejectApprovalTask } from "@/hooks/useApprovals";
import type { ApprovalTask } from "@/services/approvals";
import { useI18n } from "@/i18n/provider";
import Link from "next/link";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  PENDING: "processing",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "default",
  WAITING: "default",
};

const entityLabels: Record<string, string> = {
  Quote: "报价单",
  Order: "订单",
};

export default function ApprovalsPage() {
  const { t } = useI18n();
  const { message } = App.useApp();
  const [status, setStatus] = useState<string | undefined>("PENDING");
  const [entityType, setEntityType] = useState<string | undefined>(undefined);
  const [entityId, setEntityId] = useState("");
  const [actionTask, setActionTask] = useState<ApprovalTask | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");

  const { data, isLoading } = useApprovalTasks({
    page: 1,
    pageSize: 20,
    status: status as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | undefined,
    entityType,
    entityId: entityId || undefined,
  });
  const approveTask = useApproveApprovalTask();
  const rejectTask = useRejectApprovalTask();

  const handleAction = (task: ApprovalTask, type: "approve" | "reject") => {
    setActionTask(task);
    setActionType(type);
    setNote("");
  };

  const handleConfirm = async () => {
    if (!actionTask || !actionType) return;
    try {
      if (actionType === "approve") {
        await approveTask.mutateAsync({ id: actionTask.id, note: note || undefined });
        message.success("审批已通过");
      } else {
        await rejectTask.mutateAsync({ id: actionTask.id, note: note || undefined });
        message.success("审批已拒绝");
      }
      setActionTask(null);
      setActionType(null);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const columns = useMemo<ColumnsType<ApprovalTask>>(
    () => [
      {
        title: "对象",
        dataIndex: ["instance", "entityType"],
        key: "entityType",
        render: (_value, record) =>
          entityLabels[record.instance?.entityType || ""] || record.instance?.entityType || "-",
      },
      {
        title: "对象ID",
        dataIndex: ["instance", "entityId"],
        key: "entityId",
        render: (_value, record) => {
          const entityId = record.instance?.entityId;
          const entityType = record.instance?.entityType;
          if (!entityId || !entityType) return "-";
          const href =
            entityType === "Quote"
              ? `/crm/quotes/${entityId}`
              : entityType === "Order"
                ? `/crm/orders/${entityId}`
                : undefined;
          return href ? <Link href={href}>{entityId.slice(0, 8)}...</Link> : entityId;
        },
      },
      {
        title: "角色",
        dataIndex: "roleCode",
        key: "roleCode",
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: (value: string) => <Tag color={statusColors[value] || "default"}>{value}</Tag>,
      },
      {
        title: "创建时间",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (value: string) => new Date(value).toLocaleString("zh-CN"),
      },
      {
        title: "操作",
        key: "actions",
        render: (_value, record) => (
          <Space>
            <Button
              size="small"
              type="primary"
              disabled={record.status !== "PENDING"}
              onClick={() => handleAction(record, "approve")}
            >
              通过
            </Button>
            <Button
              size="small"
              danger
              disabled={record.status !== "PENDING"}
              onClick={() => handleAction(record, "reject")}
            >
              拒绝
            </Button>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader title={t("approvals.page.title")} description={t("approvals.page.description")} />

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            placeholder={t("approvals.filters.status")}
            style={{ width: 160 }}
            allowClear
            value={status}
            onChange={(value) => setStatus(value || undefined)}
            options={[
              { label: "待审批", value: "PENDING" },
              { label: "已通过", value: "APPROVED" },
              { label: "已拒绝", value: "REJECTED" },
              { label: "已取消", value: "CANCELLED" },
            ]}
          />
          <Select
            placeholder={t("approvals.filters.entity")}
            style={{ width: 160 }}
            allowClear
            value={entityType}
            onChange={(value) => setEntityType(value || undefined)}
            options={[
              { label: "报价单", value: "Quote" },
              { label: "订单", value: "Order" },
            ]}
          />
          <Input
            placeholder={t("approvals.filters.entity_id")}
            style={{ width: 240 }}
            value={entityId}
            onChange={(event) => setEntityId(event.target.value)}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </Card>

      <Modal
        open={!!actionTask && !!actionType}
        title={actionType === "approve" ? "审批通过" : "审批拒绝"}
        onCancel={() => setActionTask(null)}
        onOk={handleConfirm}
        confirmLoading={approveTask.isPending || rejectTask.isPending}
      >
        <Form layout="vertical">
          <Form.Item label="备注">
            <Input.TextArea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="可选"
              rows={3}
            />
          </Form.Item>
          <Text type="secondary">提交后将无法撤销。</Text>
        </Form>
      </Modal>
    </div>
  );
}
