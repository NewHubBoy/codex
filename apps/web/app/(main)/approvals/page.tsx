"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Descriptions,
  Divider,
  Drawer,
  DatePicker,
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
import type { ColumnsType } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useApproveApprovalTask,
  useApprovalInstance,
  useApprovalTasks,
  useAssignApprovalTasks,
  useRejectApprovalTask
} from "@/hooks/useApprovals";
import type { ApprovalTask, ApprovalTaskStatus } from "@/services/approvals";
import { useI18n } from "@/i18n/provider";
import { useRoles, useUsers } from "@/hooks/useSystem";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { approvals } from "@/services/approvals";
import dayjs from "dayjs";
import { PermissionButton } from "@/components/auth/PermissionButton";
import { useAuth } from "@/hooks/useAuth";

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
  const { hasPermission } = useAuth();
  const canWriteApproval = hasPermission("approval:write");
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
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignAssigneeId, setAssignAssigneeId] = useState<string | undefined>(undefined);
  const [exporting, setExporting] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedForm] = Form.useForm();
  const [advancedFilters, setAdvancedFilters] = useState<{
    assigneeId?: string;
    createdFrom?: string;
    createdTo?: string;
  }>({});

  const { data, isLoading } = useApprovalTasks({
    page,
    pageSize,
    status: status as ApprovalTaskStatus | undefined,
    entityType,
    entityId: entityId || undefined,
    roleCode,
    assigneeId: advancedFilters.assigneeId,
    createdFrom: advancedFilters.createdFrom,
    createdTo: advancedFilters.createdTo,
  });
  const { data: rolesData } = useRoles({ page: 1, pageSize: 200 });
  const { data: usersData } = useUsers({ page: 1, pageSize: 200, status: "ACTIVE" });
  const { data: detailInstance, isLoading: detailLoading } = useApprovalInstance(
    detailInstanceId ?? ""
  );
  const approveTask = useApproveApprovalTask();
  const rejectTask = useRejectApprovalTask();
  const assignTasks = useAssignApprovalTasks();

  const roleOptions = useMemo(
    () =>
      rolesData?.data?.map((role) => ({
        label: `${role.name} (${role.code})`,
        value: role.code,
      })) ?? [],
    [rolesData]
  );

  const userOptions = useMemo(
    () =>
      usersData?.data?.map((user) => ({
        label: `${user.name || user.username} (${user.email || user.id.slice(0, 6)})`,
        value: user.id,
      })) ?? [],
    [usersData]
  );

  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    usersData?.data?.forEach((user) => {
      map.set(user.id, user.name || user.username || user.email || user.id);
    });
    return map;
  }, [usersData]);

  const handleAction = useCallback((task: ApprovalTask, type: "approve" | "reject") => {
    if (!canWriteApproval) {
      message.warning("当前账号无审批处理权限");
      return;
    }
    setActionTask(task);
    setActionType(type);
    setNote("");
  }, [canWriteApproval, message]);

  const handleOpenDetail = useCallback((instanceId: string) => {
    setDetailInstanceId(instanceId);
  }, []);

  const handleConfirm = async () => {
    if (!canWriteApproval) {
      return;
    }
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

  const assignableTasks = useMemo(() => {
    if (!data?.data?.length || selectedRowKeys.length === 0) {
      return [];
    }
    const selectedSet = new Set(selectedRowKeys);
    return data.data.filter(
      (task) =>
        selectedSet.has(task.id) && ["PENDING", "WAITING"].includes(task.status)
    );
  }, [data, selectedRowKeys]);

  const rowSelection = useMemo<TableRowSelection<ApprovalTask>>(
    () => ({
      selectedRowKeys,
      onChange: (keys) => setSelectedRowKeys(keys as string[]),
      getCheckboxProps: (record) => ({
        disabled: !canWriteApproval || !["PENDING", "WAITING"].includes(record.status),
      }),
    }),
    [canWriteApproval, selectedRowKeys]
  );

  const handleBatchAction = useCallback(
    (type: "approve" | "reject") => {
      if (!canWriteApproval) {
        message.warning("当前账号无审批处理权限");
        return;
      }
      if (!selectedTasks.length) {
        message.warning("请先选择待审批任务");
        return;
      }
      setBatchAction(type);
      setBatchNote("");
    },
    [canWriteApproval, message, selectedTasks.length]
  );

  const handleBatchConfirm = async () => {
    if (!canWriteApproval) {
      return;
    }
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

  const handleAssignOpen = useCallback(() => {
    if (!canWriteApproval) {
      message.warning("当前账号无审批处理权限");
      return;
    }
    if (!assignableTasks.length) {
      message.warning("请先选择待审批任务");
      return;
    }
    setAssignAssigneeId(undefined);
    setAssignOpen(true);
  }, [assignableTasks.length, canWriteApproval, message]);

  const handleAssignConfirm = async () => {
    if (!canWriteApproval) {
      return;
    }
    if (!assignAssigneeId) {
      message.warning("请选择审批人");
      return;
    }
    try {
      await assignTasks.mutateAsync({
        taskIds: assignableTasks.map((task) => task.id),
        assigneeId: assignAssigneeId,
      });
      message.success("已完成指派");
      setAssignOpen(false);
      setSelectedRowKeys([]);
      setAssignAssigneeId(undefined);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleAdvancedApply = () => {
    const values = advancedForm.getFieldsValue();
    const range = values.createdRange as { startOf: (unit: string) => { toISOString: () => string }; endOf: (unit: string) => { toISOString: () => string } }[] | undefined;
    const createdFrom = Array.isArray(range) && range[0]
      ? range[0].startOf("day").toISOString()
      : undefined;
    const createdTo = Array.isArray(range) && range[1]
      ? range[1].endOf("day").toISOString()
      : undefined;
    setAdvancedFilters({
      assigneeId: values.assigneeId || undefined,
      createdFrom,
      createdTo,
    });
    setAdvancedOpen(false);
  };

  const handleAdvancedReset = () => {
    advancedForm.resetFields();
    setAdvancedFilters({});
    setAdvancedOpen(false);
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const pageSize = 100;
      let currentPage = 1;
      let total = 0;
      const tasks: ApprovalTask[] = [];
      do {
        const response = await approvals.listTasks({
          page: currentPage,
          pageSize,
          status: status as ApprovalTaskStatus | undefined,
          entityType,
          entityId: entityId || undefined,
          roleCode,
          assigneeId: advancedFilters.assigneeId,
          createdFrom: advancedFilters.createdFrom,
          createdTo: advancedFilters.createdTo,
        });
        tasks.push(...(response.data || []));
        total = response.total || 0;
        currentPage += 1;
      } while (tasks.length < total);

      const headers = [
        "对象类型",
        "对象ID",
        "审批角色",
        "节点",
        "状态",
        "审批人",
        "创建时间",
        "处理时间",
      ];
      const escapeCsv = (value: unknown) => {
        const text = value === null || value === undefined ? "" : String(value);
        if (/[\",\n]/.test(text)) {
          return `"${text.replace(/\"/g, "\"\"")}"`;
        }
        return text;
      };
      const rows = tasks.map((task) => [
        entityLabels[task.instance?.entityType || ""] || task.instance?.entityType || "-",
        task.instance?.entityId || "-",
        task.roleCode,
        task.node?.groupIndex === undefined || task.node?.groupIndex === null
          ? "-"
          : task.node.groupIndex + 1,
        task.status,
        task.assigneeId ? userNameMap.get(task.assigneeId) || task.assigneeId : "-",
        task.createdAt ? new Date(task.createdAt).toLocaleString("zh-CN") : "-",
        task.decidedAt ? new Date(task.decidedAt).toLocaleString("zh-CN") : "-",
      ]);
      const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `审批任务_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success("导出完成");
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("导出失败");
      }
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSelectedRowKeys([]);
  }, [status, entityType, entityId, roleCode, advancedFilters]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [page, pageSize]);

  useEffect(() => {
    if (!advancedOpen) return;
    const range =
      advancedFilters.createdFrom && advancedFilters.createdTo
        ? [dayjs(advancedFilters.createdFrom), dayjs(advancedFilters.createdTo)]
        : undefined;
    advancedForm.setFieldsValue({
      assigneeId: advancedFilters.assigneeId,
      createdRange: range,
    });
  }, [advancedFilters, advancedForm, advancedOpen]);

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
        render: (value?: string | null) =>
          value ? userNameMap.get(value) || `${value.slice(0, 8)}...` : "-",
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
    [userNameMap]
  );

  const sortedNodes = useMemo(() => {
    const nodes = detailInstance?.nodes ?? [];
    return [...nodes].sort((a, b) => a.groupIndex - b.groupIndex);
  }, [detailInstance]);

  const sortedLogs = useMemo(() => {
    const logs = detailInstance?.logs ?? [];
    return [...logs].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }, [detailInstance]);

  const hasAdvancedFilters = Boolean(
    advancedFilters.assigneeId || advancedFilters.createdFrom || advancedFilters.createdTo
  );

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
        title: "审批人",
        dataIndex: "assigneeId",
        key: "assigneeId",
        render: (value?: string | null) => {
          if (!value) return "-";
          return userNameMap.get(value) || `${value.slice(0, 8)}...`;
        },
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
            <PermissionButton
              permission="approval:write"
              size="small"
              type="primary"
              disabled={record.status !== "PENDING"}
              onClick={() => handleAction(record, "approve")}
            >
              通过
            </PermissionButton>
            <PermissionButton
              permission="approval:write"
              size="small"
              danger
              disabled={record.status !== "PENDING"}
              onClick={() => handleAction(record, "reject")}
            >
              拒绝
            </PermissionButton>
          </Space>
        ),
      },
    ],
    [handleAction, handleOpenDetail, userNameMap]
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
          <Button onClick={() => setAdvancedOpen(true)}>高级筛选</Button>
          {hasAdvancedFilters && <Tag color="blue">已启用高级筛选</Tag>}
        </Space>
        <Space wrap style={{ marginBottom: 16 }}>
          <PermissionButton
            permission="approval:write"
            type="primary"
            disabled={selectedTasks.length === 0}
            onClick={() => handleBatchAction("approve")}
          >
            批量通过
          </PermissionButton>
          <PermissionButton
            permission="approval:write"
            danger
            disabled={selectedTasks.length === 0}
            onClick={() => handleBatchAction("reject")}
          >
            批量拒绝
          </PermissionButton>
          <PermissionButton
            permission="approval:write"
            disabled={assignableTasks.length === 0}
            onClick={handleAssignOpen}
          >
            批量指派
          </PermissionButton>
          <Button
            disabled={selectedRowKeys.length === 0}
            onClick={() => setSelectedRowKeys([])}
          >
            清空选择
          </Button>
          <Text type="secondary">
            已选择 {selectedRowKeys.length} 条
          </Text>
          <Button loading={exporting} onClick={handleExport}>
            导出CSV
          </Button>
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

      <Modal
        open={assignOpen}
        title="批量指派"
        onCancel={() => setAssignOpen(false)}
        onOk={handleAssignConfirm}
        confirmLoading={assignTasks.isPending}
      >
        <Form layout="vertical">
          <Form.Item label="指派给">
            <Select
              showSearch
              placeholder="选择审批人"
              optionFilterProp="label"
              value={assignAssigneeId}
              onChange={(value) => setAssignAssigneeId(value)}
              options={userOptions}
            />
          </Form.Item>
          <Text type="secondary">将指派 {assignableTasks.length} 条任务。</Text>
        </Form>
      </Modal>

      <Drawer
        open={advancedOpen}
        title="高级筛选"
        width={520}
        onClose={() => setAdvancedOpen(false)}
        footer={
          <Space style={{ justifyContent: "flex-end", width: "100%" }}>
            <Button onClick={handleAdvancedReset}>重置</Button>
            <Button type="primary" onClick={handleAdvancedApply}>
              应用
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={advancedForm}>
          <Form.Item label="创建时间" name="createdRange">
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="审批人" name="assigneeId">
            <Select
              showSearch
              allowClear
              placeholder="选择审批人"
              optionFilterProp="label"
              options={userOptions}
            />
          </Form.Item>
        </Form>
      </Drawer>

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
