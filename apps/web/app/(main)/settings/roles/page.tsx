"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Card, Modal, message, Checkbox } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useRoles, usePermissions, useCreateRole, useDeleteRole } from "@/hooks/useSystem";

export default function RolesPage() {
  const { data: roles, isLoading } = useRoles();
  const { data: permissions } = usePermissions();
  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const columns = [
    {
      title: "角色名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <a href={`/settings/roles/${record.id}`}>{text}</a>
      ),
    },
    {
      title: "角色编码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "用户数",
      dataIndex: "user_count",
      key: "user_count",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "success" : "default"}>
          {status === "ACTIVE" ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => {
              setSelectedRole(record);
              setPermissionModalOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => message.info("编辑功能开发中")}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: "确认删除",
                content: `确定要删除角色 ${record.name} 吗？`,
                onOk: () => deleteRole.mutateAsync(record.id),
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
        title="角色权限"
        description="管理角色和权限配置"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            新建角色
          </Button>
        }
      />

      <Card>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </Card>

      <Modal
        title={`权限配置 - ${selectedRole?.name}`}
        open={permissionModalOpen}
        onCancel={() => setPermissionModalOpen(false)}
        footer={null}
        width={600}
      >
        <div style={{ maxHeight: 400, overflow: "auto" }}>
          {permissions?.map((group: any) => (
            <div key={group.module} style={{ marginBottom: 16 }}>
              <h4>{group.module}</h4>
              <Checkbox.Group
                options={group.permissions.map((p: any) => ({
                  label: p.description,
                  value: p.code,
                }))}
                defaultValue={selectedRole?.permissions?.map((p: any) => p.code)}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
