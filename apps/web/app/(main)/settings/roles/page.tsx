"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, Space, Tag, Card, Modal, App, Drawer, Form, Input, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useRoles, useDeleteRole, useCreateRole, useUpdateRole, usePermissions, useRolePermissions } from "@/hooks/useSystem";
import type { ColumnsType } from "antd/es/table";
import { roles as roleService, type Permission, type Role } from "@/services/system";
import { PermissionButton } from "@/components/auth/PermissionButton";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/i18n/provider";

interface RoleFormValues {
  code: string;
  name: string;
  dataScope: "SELF" | "TEAM" | "SUBTREE" | "ALL";
  status: "ACTIVE" | "INACTIVE";
  permissionIds: string[];
}

type TranslateFn = (
  key: string,
  params?: Record<string, string | number | boolean | null | undefined>
) => string;

const KNOWN_PERMISSION_GROUPS = new Set([
  "crm",
  "user",
  "rbac",
  "orgunit",
  "numberrange",
  "config",
  "alert",
  "approval",
  "account",
  "contact",
  "lead",
  "opportunity",
  "activity",
  "attachment",
  "product",
  "quote",
  "order",
  "delivery",
  "ticket",
  "other",
]);

const KNOWN_PERMISSION_SUBJECTS = new Set([
  "crm",
  "user",
  "user_role",
  "rbac_role",
  "rbac_permission",
  "orgunit",
  "orgunit_member",
  "numberrange",
  "config_workflow",
  "config_field",
  "config_approval",
  "alert",
  "approval",
  "account",
  "contact",
  "lead",
  "opportunity",
  "activity",
  "attachment",
  "product",
  "quote",
  "order",
  "delivery",
  "ticket",
]);

const KNOWN_PERMISSION_ACTIONS = new Set(["read", "write", "full_access"]);

function toPermissionGroupLabel(permission: Permission, t: TranslateFn): string {
  const group = permission.code.includes(":")
    ? permission.code.split(":")[0].toLowerCase()
    : "other";
  if (!KNOWN_PERMISSION_GROUPS.has(group)) {
    return group.toUpperCase();
  }
  return t(`settings.roles.permission_group.${group}`);
}

function toPermissionOptionLabel(permission: Permission, t: TranslateFn): string {
  const parts = permission.code.toLowerCase().split(":").filter(Boolean);
  if (parts.length >= 2) {
    const action = parts[parts.length - 1];
    const subject = parts.slice(0, -1).join("_");
    if (KNOWN_PERMISSION_SUBJECTS.has(subject) && KNOWN_PERMISSION_ACTIONS.has(action)) {
      const subjectLabel = t(`settings.roles.permission_subject.${subject}`);
      const actionLabel = t(`settings.roles.permission_action.${action}`);
      return `${subjectLabel} - ${actionLabel}`;
    }
  }
  return permission.name;
}

function getDataScopeLabel(value: string | undefined, t: TranslateFn): string {
  if (value === "SELF") {
    return t("settings.roles.data_scope.self");
  }
  if (value === "TEAM") {
    return t("settings.roles.data_scope.team");
  }
  if (value === "SUBTREE") {
    return t("settings.roles.data_scope.subtree");
  }
  if (value === "ALL") {
    return t("settings.roles.data_scope.all");
  }
  return value || "-";
}

function getRoleStatusLabel(value: string | undefined, t: TranslateFn): string {
  if (value === "ACTIVE") {
    return t("settings.roles.status.active");
  }
  if (value === "INACTIVE") {
    return t("settings.roles.status.inactive");
  }
  return value || "-";
}

export default function RolesPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const deleteRole = useDeleteRole();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const { message } = App.useApp();
  const [form] = Form.useForm<RoleFormValues>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const canWriteRole = hasPermission("rbac:role:write");
  const dataScopeOptions = useMemo(
    () => [
      { label: t("settings.roles.data_scope.self"), value: "SELF" },
      { label: t("settings.roles.data_scope.team"), value: "TEAM" },
      { label: t("settings.roles.data_scope.subtree"), value: "SUBTREE" },
      { label: t("settings.roles.data_scope.all"), value: "ALL" },
    ],
    [t]
  );
  const roleStatusOptions = useMemo(
    () => [
      { label: t("settings.roles.status.active"), value: "ACTIVE" },
      { label: t("settings.roles.status.inactive"), value: "INACTIVE" },
    ],
    [t]
  );

  const { data, isLoading } = useRoles({
    page,
    pageSize,
    q: q || undefined,
  });
  const { data: permissionsData, isLoading: permissionsLoading } = usePermissions(
    { page: 1, pageSize: 500 },
    { enabled: drawerOpen && canWriteRole }
  );
  const roleIdForPermissions = drawerOpen && canWriteRole && editingRole?.id ? editingRole.id : undefined;
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } = useRolePermissions(roleIdForPermissions);

  const assignedPermissionIds = useMemo(
    () => rolePermissionsData?.map((item) => item.permissionId) ?? [],
    [rolePermissionsData]
  );
  const groupedPermissionOptions = useMemo(() => {
    const groupMap = new Map<string, { label: string; value: string }[]>();
    const permissions = permissionsData?.data ?? [];
    for (const permission of permissions) {
      const group = toPermissionGroupLabel(permission, t);
      const options = groupMap.get(group) ?? [];
      options.push({
        label: `${toPermissionOptionLabel(permission, t)} (${permission.code})`,
        value: permission.id,
      });
      groupMap.set(group, options);
    }

    return Array.from(groupMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([groupLabel, options]) => ({
        label: groupLabel,
        options: options.sort((left, right) => left.label.localeCompare(right.label)),
      }));
  }, [permissionsData, t]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    if (!editingRole) {
      form.setFieldsValue({
        code: "",
        name: "",
        dataScope: "SELF",
        status: "ACTIVE",
        permissionIds: [],
      });
      return;
    }

    form.setFieldsValue({
      code: editingRole.code,
      name: editingRole.name,
      dataScope: (editingRole.dataScope as RoleFormValues["dataScope"]) ?? "SELF",
      status: (editingRole.status as RoleFormValues["status"]) ?? "ACTIVE",
      permissionIds: assignedPermissionIds,
    });
  }, [assignedPermissionIds, drawerOpen, editingRole, form]);

  const openCreateDrawer = () => {
    setEditingRole(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (role: Role) => {
    setEditingRole(role);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    if (saving) {
      return;
    }
    setDrawerOpen(false);
    setEditingRole(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    if (!canWriteRole) {
      return;
    }

    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        code: values.code.trim(),
        name: values.name.trim(),
        dataScope: values.dataScope,
        status: values.status,
      };

      let roleId: string;
      if (editingRole?.id) {
        roleId = editingRole.id;
        await updateRole.mutateAsync({ id: roleId, body: payload });
      } else {
        const createdRole = await createRole.mutateAsync(payload);
        roleId = createdRole.id;
      }

      const nextIds = new Set(values.permissionIds || []);
      const prevIds = new Set(editingRole ? assignedPermissionIds : []);
      const addIds = Array.from(nextIds).filter((id) => !prevIds.has(id));
      const removeIds = Array.from(prevIds).filter((id) => !nextIds.has(id));

      await Promise.all([
        ...addIds.map((permissionId) => roleService.addRolePermission(roleId, permissionId)),
        ...removeIds.map((permissionId) => roleService.removeRolePermission(roleId, permissionId)),
      ]);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["roles"] }),
        queryClient.invalidateQueries({ queryKey: ["role", roleId] }),
        queryClient.invalidateQueries({ queryKey: ["role-permissions", roleId] }),
      ]);

      message.success(
        editingRole
          ? t("settings.roles.messages.update_success")
          : t("settings.roles.messages.create_success")
      );
      handleDrawerClose();
    } catch (error) {
      // Form validation errors are handled by Form itself.
      if (error && typeof error === "object" && "errorFields" in error) {
        return;
      }
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<Role> = [
    {
      title: t("common.serial_id"),
      dataIndex: "serialId",
      key: "serialId",
      width: 80,
    },
    {
      title: t("settings.roles.columns.name"),
      dataIndex: "name",
      key: "name",
      render: (text: string) => text || "-",
    },
    {
      title: t("settings.roles.columns.code"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("settings.roles.columns.description"),
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text?: string) => text || "-",
    },
    {
      title: t("settings.roles.columns.data_scope"),
      dataIndex: "dataScope",
      key: "dataScope",
      render: (value?: string) => getDataScopeLabel(value, t),
    },
    {
      title: t("settings.roles.columns.user_count"),
      dataIndex: "user_count",
      key: "user_count",
      render: (value: number | undefined, record) => value ?? record.userCount ?? "-",
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "success" : "default"}>
          {getRoleStatusLabel(status, t)}
        </Tag>
      ),
    },
    {
      title: t("common.actions"),
      key: "action",
      render: (_value, record) => (
        <Space>
          <PermissionButton
            permission="rbac:role:write"
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditDrawer(record)}
          />
          <PermissionButton
            permission="rbac:role:write"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: t("common.delete_confirm_title"),
                content: t("settings.roles.messages.delete_confirm", { name: record.name }),
                onOk: async () => {
                  await deleteRole.mutateAsync(record.id);
                  message.success(t("settings.roles.messages.delete_success"));
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("settings.roles.page.title")}
        description={t("settings.roles.page.description")}
        action={
          <PermissionButton permission="rbac:role:write" type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
            {t("settings.roles.actions.create")}
          </PermissionButton>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search
            placeholder={t("settings.roles.search_placeholder")}
            allowClear
            style={{ width: 260 }}
            onSearch={(value) => {
              setQ(value.trim());
              setPage(1);
            }}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t("common.total_count", { total }),
          }}
          onChange={(pagination) => {
            setPage(pagination.current || 1);
            setPageSize(pagination.pageSize || 20);
          }}
        />
      </Card>

      <Drawer
        title={editingRole ? t("settings.roles.drawer.edit_title") : t("settings.roles.drawer.create_title")}
        width={720}
        open={drawerOpen}
        onClose={handleDrawerClose}
        destroyOnHidden
        extra={
          <Space>
            <PermissionButton permission="rbac:role:write" onClick={handleDrawerClose}>
              {t("common.cancel")}
            </PermissionButton>
            <PermissionButton permission="rbac:role:write" type="primary" loading={saving} onClick={handleSubmit}>
              {t("common.save")}
            </PermissionButton>
          </Space>
        }
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            dataScope: "SELF",
            status: "ACTIVE",
            permissionIds: [],
          }}
        >
          <Form.Item
            label={t("settings.roles.form.name")}
            name="name"
            rules={[{ required: true, message: t("settings.roles.validation.name_required") }]}
          >
            <Input placeholder={t("settings.roles.placeholder.name")} maxLength={50} />
          </Form.Item>

          <Form.Item
            label={t("settings.roles.form.code")}
            name="code"
            rules={[
              { required: true, message: t("settings.roles.validation.code_required") },
              { pattern: /^[A-Z][A-Z0-9_:-]*$/, message: t("settings.roles.validation.code_pattern") },
            ]}
          >
            <Input placeholder={t("settings.roles.placeholder.code")} maxLength={64} />
          </Form.Item>

          <Space style={{ width: "100%" }} wrap>
            <Form.Item label={t("settings.roles.form.data_scope")} name="dataScope" style={{ minWidth: 240 }}>
              <Select options={dataScopeOptions} />
            </Form.Item>
            <Form.Item label={t("settings.roles.form.status")} name="status" style={{ minWidth: 180 }}>
              <Select options={roleStatusOptions} />
            </Form.Item>
          </Space>

          <Form.Item
            label={t("settings.roles.form.permissions")}
            name="permissionIds"
            extra={
              permissionsData && permissionsData.total > (permissionsData.data?.length || 0)
                ? t("settings.roles.form.permissions_loaded", {
                    loaded: permissionsData.data.length,
                    total: permissionsData.total,
                  })
                : undefined
            }
          >
            <Select
              mode="multiple"
              showSearch
              allowClear
              placeholder={t("settings.roles.form.permissions_placeholder")}
              loading={permissionsLoading || (!!editingRole && rolePermissionsLoading)}
              optionFilterProp="label"
              options={groupedPermissionOptions}
              maxTagCount="responsive"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
