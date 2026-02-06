"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, Space, Tag, Input, Select, Card, Modal, App, Drawer, Form } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useUsers,
  useDeleteUser,
  useCreateUser,
  useUpdateUser,
  useRoles,
  useUserRoles,
} from "@/hooks/useSystem";
import type { ColumnsType } from "antd/es/table";
import { users as userService, type User } from "@/services/system";
import { PermissionButton } from "@/components/auth/PermissionButton";
import { useI18n } from "@/i18n/provider";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface UserFormValues {
  email: string;
  name: string;
  password?: string;
  status: "ACTIVE" | "INACTIVE" | "INVITED";
  roleIds: string[];
}

function getUserStatusLabel(status: string | undefined, t: (key: string) => string): string {
  if (status === "ACTIVE") {
    return t("settings.users.status.active");
  }
  if (status === "INACTIVE") {
    return t("settings.users.status.inactive");
  }
  if (status === "INVITED" || status === "PENDING") {
    return t("settings.users.status.invited");
  }
  return status || "-";
}

function getUserStatusColor(status: string | undefined): string {
  if (status === "ACTIVE") {
    return "success";
  }
  if (status === "INACTIVE") {
    return "error";
  }
  if (status === "INVITED" || status === "PENDING") {
    return "warning";
  }
  return "default";
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { hasPermission } = useAuth();
  const [form] = Form.useForm<UserFormValues>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { message } = App.useApp();
  const canWriteUser = hasPermission("user:write");
  const canAssignRole = hasPermission("user:role:write");

  const { data, isLoading } = useUsers({
    page,
    pageSize,
    q: q || undefined,
    status,
  });
  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    page: 1,
    pageSize: 500,
  });
  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const editingUserId = drawerOpen && editingUser?.id ? editingUser.id : undefined;
  const { data: userRolesData, isLoading: userRolesLoading } = useUserRoles(editingUserId, {
    enabled: !!editingUserId && canAssignRole,
  });

  const assignedRoleIds = useMemo(
    () => userRolesData?.map((item) => item.roleId).filter(Boolean) ?? [],
    [userRolesData]
  );
  const roleOptions = useMemo(
    () =>
      (rolesData?.data ?? [])
        .map((role) => ({
          label: `${role.name} (${role.code})`,
          value: role.id,
        }))
        .sort((left, right) => left.label.localeCompare(right.label)),
    [rolesData]
  );
  const statusOptions = useMemo(
    () => [
      { label: t("settings.users.status.active"), value: "ACTIVE" },
      { label: t("settings.users.status.inactive"), value: "INACTIVE" },
      { label: t("settings.users.status.invited"), value: "INVITED" },
    ],
    [t]
  );

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    if (!editingUser) {
      form.setFieldsValue({
        email: "",
        name: "",
        password: "",
        status: "ACTIVE",
        roleIds: [],
      });
      return;
    }

    form.setFieldsValue({
      email: editingUser.email || "",
      name: editingUser.name || "",
      password: "",
      status: (editingUser.status as UserFormValues["status"]) || "ACTIVE",
      roleIds: canAssignRole ? assignedRoleIds : [],
    });
  }, [assignedRoleIds, canAssignRole, drawerOpen, editingUser, form]);

  const openCreateDrawer = () => {
    setEditingUser(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (user: User) => {
    setEditingUser(user);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    if (saving) {
      return;
    }
    setDrawerOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    if (!canWriteUser) {
      return;
    }

    try {
      const values = await form.validateFields();
      setSaving(true);

      const email = values.email.trim();
      const name = values.name.trim();
      const password = values.password?.trim();
      const nextRoleIds = values.roleIds ?? [];

      let userId: string;
      if (editingUser?.id) {
        userId = editingUser.id;
        await updateUser.mutateAsync({
          id: userId,
          body: {
            email,
            name,
            status: values.status,
            ...(password ? { password } : {}),
          },
        });
      } else {
        const created = await createUser.mutateAsync({
          email,
          name,
          password: password as string,
          status: values.status,
        });
        userId = created.id;
      }

      if (canAssignRole) {
        const prevIds = new Set(editingUser ? assignedRoleIds : []);
        const nextIds = new Set(nextRoleIds);
        const addIds = Array.from(nextIds).filter((roleId) => !prevIds.has(roleId));
        const removeIds = Array.from(prevIds).filter((roleId) => !nextIds.has(roleId));

        await Promise.all([
          ...addIds.map((roleId) => userService.assignRole(userId, roleId)),
          ...removeIds.map((roleId) => userService.removeRole(userId, roleId)),
        ]);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["user", userId] }),
        queryClient.invalidateQueries({ queryKey: ["user-roles", userId] }),
      ]);

      message.success(
        editingUser
          ? t("settings.users.messages.update_success")
          : t("settings.users.messages.create_success")
      );
      handleDrawerClose();
    } catch (error) {
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

  const columns: ColumnsType<User> = [
    {
      title: t("common.serial_id"),
      dataIndex: "serialId",
      key: "serialId",
      width: 80,
      render: (value: number | undefined) => value || "-",
    },
    {
      title: t("settings.users.columns.name"),
      dataIndex: "name",
      key: "name",
      render: (value: string, record) => (
        <span
          onClick={() => openEditDrawer(record)}
          style={{ color: "#1677ff", cursor: "pointer" }}
        >
          {value || "-"}
        </span>
      ),
    },
    {
      title: t("settings.users.columns.email"),
      dataIndex: "email",
      key: "email",
      render: (value: string) => value || "-",
    },
    {
      title: t("settings.users.columns.role"),
      key: "role",
      render: (_value, record) => record.role?.name || "-",
    },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <Tag color={getUserStatusColor(value)}>
          {getUserStatusLabel(value, t)}
        </Tag>
      ),
    },
    {
      title: t("common.updated_at"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value: string | undefined, record) => value || record.updated_at || "-",
    },
    {
      title: t("common.actions"),
      key: "action",
      render: (_value, record) => (
        <Space>
          <PermissionButton
            permission="user:write"
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditDrawer(record)}
          />
          <PermissionButton
            permission="user:write"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: t("common.delete_confirm_title"),
                content: t("settings.users.messages.delete_confirm", { name: record.name }),
                onOk: async () => {
                  await deleteUser.mutateAsync(record.id);
                  message.success(t("settings.users.messages.delete_success"));
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
        title={t("settings.users.page.title")}
        description={t("settings.users.page.description")}
        action={
          <PermissionButton
            permission="user:write"
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateDrawer}
          >
            {t("settings.users.actions.create")}
          </PermissionButton>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search
            placeholder={t("settings.users.search_placeholder")}
            allowClear
            style={{ width: 260 }}
            onSearch={(value) => {
              setQ(value.trim());
              setPage(1);
            }}
          />
          <Select
            placeholder={t("settings.users.filters.status_placeholder")}
            allowClear
            style={{ width: 180 }}
            options={statusOptions}
            value={status}
            onChange={(value) => {
              setStatus(value);
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
        title={editingUser ? t("settings.users.drawer.edit_title") : t("settings.users.drawer.create_title")}
        width={560}
        open={drawerOpen}
        onClose={handleDrawerClose}
        destroyOnHidden
        extra={
          <Space>
            <PermissionButton permission="user:write" onClick={handleDrawerClose}>
              {t("common.cancel")}
            </PermissionButton>
            <PermissionButton permission="user:write" type="primary" loading={saving} onClick={handleSubmit}>
              {t("common.save")}
            </PermissionButton>
          </Space>
        }
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            status: "ACTIVE",
            roleIds: [],
          }}
        >
          <Form.Item
            label={t("settings.users.form.email")}
            name="email"
            rules={[
              { required: true, message: t("settings.users.validation.email_required") },
              { type: "email", message: t("settings.users.validation.email_invalid") },
            ]}
          >
            <Input placeholder={t("settings.users.placeholder.email")} />
          </Form.Item>

          <Form.Item
            label={t("settings.users.form.name")}
            name="name"
            rules={[{ required: true, message: t("settings.users.validation.name_required") }]}
          >
            <Input placeholder={t("settings.users.placeholder.name")} maxLength={100} />
          </Form.Item>

          <Form.Item
            label={t("settings.users.form.password")}
            name="password"
            rules={[
              {
                validator: async (_rule, value: string | undefined) => {
                  const normalized = value?.trim() || "";
                  if (!editingUser && !normalized) {
                    throw new Error(t("settings.users.validation.password_required"));
                  }
                  if (normalized && normalized.length < 8) {
                    throw new Error(t("settings.users.validation.password_min"));
                  }
                },
              },
            ]}
            extra={editingUser ? t("settings.users.form.password_optional") : undefined}
          >
            <Input.Password placeholder={t("settings.users.placeholder.password")} />
          </Form.Item>

          <Form.Item label={t("settings.users.form.status")} name="status">
            <Select options={statusOptions} />
          </Form.Item>

          {canAssignRole ? (
            <Form.Item
              label={t("settings.users.form.roles")}
              name="roleIds"
              extra={
                rolesData && rolesData.total > (rolesData.data?.length || 0)
                  ? t("settings.users.form.roles_loaded", {
                      loaded: rolesData.data.length,
                      total: rolesData.total,
                    })
                  : undefined
              }
            >
              <Select
                mode="multiple"
                showSearch
                allowClear
                placeholder={t("settings.users.form.roles_placeholder")}
                optionFilterProp="label"
                options={roleOptions}
                maxTagCount="responsive"
                loading={rolesLoading || (!!editingUser && userRolesLoading)}
              />
            </Form.Item>
          ) : null}
        </Form>
      </Drawer>
    </div>
  );
}
