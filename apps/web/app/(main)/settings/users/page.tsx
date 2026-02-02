"use client";

import { useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Card, Modal, App } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useUsers, useCreateUser, useDeleteUser } from "@/hooks/useSystem";

const { Search } = Input;

const statusColors: Record<string, string> = {
  ACTIVE: "success",
  INACTIVE: "error",
  PENDING: "warning",
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const { message } = App.useApp();

  const { data, isLoading } = useUsers({
    page,
    pageSize,
    q: q || undefined,
  });

  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const columns = [
    {
      title: "编号",
      dataIndex: "serialId",
      key: "serialId",
      width: 80,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      render: (text: string, record: any) => (
        <a href={`/settings/users/${record.id}`}>{text}</a>
      ),
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "手机",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "角色",
      dataIndex: ["role", "name"],
      key: "role",
    },
    {
      title: "部门",
      dataIndex: ["org_unit", "name"],
      key: "org_unit",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>
          {status === "ACTIVE" ? "启用" : status === "INACTIVE" ? "禁用" : "待激活"}
        </Tag>
      ),
    },
    {
      title: "最后登录",
      dataIndex: "last_login",
      key: "last_login",
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
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
                content: `确定要删除用户 ${record.name} 吗？`,
                onOk: () => deleteUser.mutateAsync(record.id),
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
        title="用户管理"
        description="管理系统用户账号"
        action={
          <Button type="primary" icon={<PlusOutlined />}>
            新建用户
          </Button>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索编号/用户"
            allowClear
            style={{ width: 200 }}
            onSearch={setQ}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 120 }}
            options={[
              { label: "启用", value: "ACTIVE" },
              { label: "禁用", value: "INACTIVE" },
            ]}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data}
          rowKey="id"
          loading={isLoading}
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
    </div>
  );
}
