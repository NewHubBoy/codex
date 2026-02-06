"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography
} from "antd";
import type { ColumnsType, TableRowSelection } from "antd/es/table";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useApproveApprovalTask,
  useApprovalInstance,
  useApprovalTasks,
  useRejectApprovalTask
} from "@/hooks/useApprovals";
import type { ApprovalTask, ApprovalTaskStatus } from "@/services/approvals";
import { useI18n } from "@/i18n/provider";
import { useRoles } from "@/hooks/useSystem";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { approvals } from "@/services/approvals";

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
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<string | undefined>("PENDING");
  const [entityType, setEntityType] = useState<string | undefined>(undefined);
  const [entityId, setEntityId] = useState("");
  const [roleCode, setRoleCode] = useState<string | undefined>(undefined);
  const [actionTask, setActionTask] = useState<ApprovalTask | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [batchAction, setBatchAction] = useState<"approve" | "reject" | null>(null);
  const [batchNote, setBatchNote] = useState("");
  const [batchLoading, setBatchLoading] = useState(false);
  const [detailInstanceId, setDetailInstanceId] = useState<string | null>(null);

  const { data, isLoading } = useApprovalTasks({
    page,
    pageSize,
    status: status as ApprovalTaskStatus | undefined,
    entityType,
    entityId: entityId || undefined,
    roleCode,
  });
  const { data: rolesData } = useRoles({ page: 1, pageSize: 200 });
  const { data: detailInstance, isLoading: detailLoading } = useApprovalInstance(
    detailInstanceId ?? ""
  );
  const approveTask = useApproveApprovalTask();
  const rejectTask = useRejectApprovalTask();

  const roleOptions = useMemo(
    () =>
      rolesData?.data?.map((role) => ({
        label: `${role.name} (${role.code})`,
        value: role.code,
      })) ?? [],
    [rolesData]
  );

  const handleAction = useCallback((task: ApprovalTask, type: "approve" | "reject") => {
    setActionTask(task);
    setActionType(type);
    setNote("");
  }, []);

  const handleOpenDetail = useCallback((instanceId: string) => {
    setDetailInstanceId(instanceId);
  }, []);

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
      setNote("");
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const selectedTasks = useMemo(() => {
    if (!data?.data?.length || selectedRowKeys.length === 0) {
      return [];
    }
    const selectedSet = new Set(selectedRowKeys);
    return data.data.filter((task) => selectedSet.has(task.id) && task.status === "PENDING");
  }, [data, selectedRowKeys]);

  const rowSelection = useMemo<TableRowSelection<ApprovalTask>>(
    () => ({
      selectedRowKeys,
      onChange: (keys) => setSelectedRowKeys(keys as string[]),
      getCheckboxProps: (record) => ({
        disabled: record.status !== "PENDING",
      }),
    }),
    [selectedRowKeys]
  );

  const handleBatchAction = useCallback(
    (type: "approve" | "reject") => {
      if (!selectedTasks.length) {
        message.warning("请先选择待审批任务");
        return;
      }
      setBatchAction(type);
      setBatchNote("");
    },
    [message, selectedTasks.length]
  );

  const handleBatchConfirm = async () => {
    if (!batchAction || selectedTasks.length === 0) {
      setBatchAction(null);
      return;
    }
    setBatchLoading(true);
    try {
      const action =
        batchAction === "approve" ? approvals.approveTask : approvals.rejectTask;
      await Promise.all(
        selectedTasks.map((task) => action(task.id, batchNote || undefined))
      );
      message.success(
        `已${batchAction === "approve" ? "通过" : "拒绝"} ${selectedTasks.length} 条审批`
      );
      setSelectedRowKeys([]);
      setBatchAction(null);
      setBatchNote("");
      queryClient.invalidateQueries({ queryKey: ["approval-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("批量操作失败");
      }
    } finally {
      setBatchLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSelectedRowKeys([]);
  }, [status, entityType, entityId, roleCode]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [page, pageSize]);

  const detailTaskColumns = useMemo<ColumnsType<ApprovalTask>>(
    () => [
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
        title: "审批人",
        dataIndex: "assigneeId",
        key: "assigneeId",
        render: (value?: string | null) => (value ? `${value.slice(0, 8)}...` : "-"),
      },
      {
        title: "处理时间",
        dataIndex: "decidedAt",
        key: "decidedAt",
        render: (value?: string | null) =>
          value ? new Date(value).toLocaleString("zh-CN") : "-",
      },
      {
        title: "备注",
        dataIndex: "note",
        key: "note",
        render: (value?: string | null) => value || "-",
      },
    ],
    []
  );

  const sortedNodes = useMemo(() => {
    const nodes = detailInstance?.nodes ?? [];
    return [...nodes].sort((a, b) => a.groupIndex - b.groupIndex);
  }, [detailInstance]);

  const sortedLogs = useMemo(() => {
    const logs = detailInstance?.logs ?? [];
    return [...logs].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }, [detailInstance]);

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
        title: "节点",
        dataIndex: ["node", "groupIndex"],
        key: "groupIndex",
        render: (value?: number) => (value === undefined || value === null ? "-" : value + 1),
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
              onClick={() => handleOpenDetail(record.instanceId)}
              disabled={!record.instanceId}
            >
              详情
            </Button>
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
    [handleAction, handleOpenDetail]
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
              { label: "待处理", value: "WAITING" },
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
          <Select
            placeholder="审批角色"
            style={{ width: 200 }}
            allowClear
            value={roleCode}
            onChange={(value) => setRoleCode(value || undefined)}
            options={roleOptions}
          />
          <Input
            placeholder={t("approvals.filters.entity_id")}
            style={{ width: 240 }}
            value={entityId}
            onChange={(event) => setEntityId(event.target.value)}
          />
        </Space>
        <Space wrap style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            disabled={selectedTasks.length === 0}
            onClick={() => handleBatchAction("approve")}
          >
            批量通过
          </Button>
          <Button
            danger
            disabled={selectedTasks.length === 0}
            onClick={() => handleBatchAction("reject")}
          >
            批量拒绝
          </Button>
          <Button
            disabled={selectedRowKeys.length === 0}
            onClick={() => setSelectedRowKeys([])}
          >
            清空选择
          </Button>
          <Text type="secondary">
            已选择 {selectedRowKeys.length} 条
          </Text>
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          rowSelection={rowSelection}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(pagination) => {
            setPage(pagination.current || 1);
            setPageSize(pagination.pageSize || 20);
          }}
        />
      </Card>

      <Modal
        open={!!actionTask && !!actionType}
        title={actionType === "approve" ? "审批通过" : "审批拒绝"}
        onCancel={() => {
          setActionTask(null);
          setActionType(null);
          setNote("");
        }}
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

      <Modal
        open={!!batchAction}
        title={batchAction === "approve" ? "批量通过" : "批量拒绝"}
        onCancel={() => setBatchAction(null)}
        onOk={handleBatchConfirm}
        confirmLoading={batchLoading}
      >
        <Form layout="vertical">
          <Form.Item label="备注">
            <Input.TextArea
              value={batchNote}
              onChange={(event) => setBatchNote(event.target.value)}
              placeholder="可选"
              rows={3}
            />
          </Form.Item>
          <Text type="secondary">将处理 {selectedTasks.length} 条待审批任务。</Text>
        </Form>
      </Modal>

      <Drawer
        open={!!detailInstanceId}
        title="审批详情"
        width={720}
        onClose={() => setDetailInstanceId(null)}
      >
        {detailLoading && <Text type="secondary">加载中...</Text>}
        {!detailLoading && !detailInstance && (
          <Text type="secondary">暂无审批信息</Text>
        )}
        {!detailLoading && detailInstance && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="对象">
                {entityLabels[detailInstance.entityType] || detailInstance.entityType}
              </Descriptions.Item>
              <Descriptions.Item label="对象ID">
                {detailInstance.entityType === "Quote" ? (
                  <Link href={`/crm/quotes/${detailInstance.entityId}`}>
                    {detailInstance.entityId}
                  </Link>
                ) : detailInstance.entityType === "Order" ? (
                  <Link href={`/crm/orders/${detailInstance.entityId}`}>
                    {detailInstance.entityId}
                  </Link>
                ) : (
                  detailInstance.entityId
                )}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColors[detailInstance.status] || "default"}>
                  {detailInstance.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前节点">
                {detailInstance.currentGroup === null ||
                detailInstance.currentGroup === undefined
                  ? "-"
                  : detailInstance.currentGroup + 1}
              </Descriptions.Item>
              <Descriptions.Item label="规则">
                {detailInstance.rule?.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(detailInstance.createdAt).toLocaleString("zh-CN")}
              </Descriptions.Item>
            </Descriptions>

            <Divider>审批节点</Divider>
            {sortedNodes.length === 0 && <Text type="secondary">暂无审批节点</Text>}
            {sortedNodes.map((node) => (
              <Card
                key={node.id}
                size="small"
                title={`节点 ${node.groupIndex + 1}`}
                extra={<Tag color={statusColors[node.status] || "default"}>{node.status}</Tag>}
              >
                <Table
                  columns={detailTaskColumns}
                  dataSource={node.tasks || []}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            ))}

            <Divider>审批日志</Divider>
            {sortedLogs.length === 0 && <Text type="secondary">暂无审批日志</Text>}
            {sortedLogs.length > 0 && (
              <Timeline
                items={sortedLogs.map((log) => ({
                  color: log.action.includes("rejected") ? "red" : "green",
                  children: (
                    <Space direction="vertical" size={0}>
                      <Text>
                        {log.action} {log.actorId ? `(${log.actorId.slice(0, 8)}...)` : ""}
                      </Text>
                      <Text type="secondary">
                        {new Date(log.createdAt).toLocaleString("zh-CN")}
                      </Text>
                      {log.note && <Text type="secondary">备注：{log.note}</Text>}
                    </Space>
                  ),
                }))}
              />
            )}
          </Space>
        )}
      </Drawer>
    </div>
  );
}
