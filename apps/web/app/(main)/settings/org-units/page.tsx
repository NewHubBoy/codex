'use client';

import { useState } from 'react';
import { Tree, Button, Space, Card, Modal, Form, Input, App, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { PageHeader } from '@/components/common/PageHeader';
import { useOrgUnits } from '@/hooks/useSystem';
import type { DataNode } from 'antd/es/tree';
import type { OrgUnit, OrgUnitListResponse } from '@/services/system';

type OrgUnitTreeNode = DataNode & OrgUnit & { children: OrgUnitTreeNode[] };

export default function OrgUnitsPage() {
  const { data: orgUnits } = useOrgUnits();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<OrgUnitTreeNode | null>(null);
  const { message } = App.useApp();

  // 构建树形数据
  const buildTreeData = (items: OrgUnitListResponse): OrgUnitTreeNode[] => {
    const map = new Map<string, OrgUnitTreeNode>();
    const roots: OrgUnitTreeNode[] = [];
    const source = items.data ?? [];

    source.forEach((item) => {
      map.set(item.id, { ...item, key: item.id, title: item.name, children: [] });
    });

    source.forEach((item) => {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)?.children.push(map.get(item.id) as OrgUnitTreeNode);
      } else {
        roots.push(map.get(item.id) as OrgUnitTreeNode);
      }
    });

    return roots;
  };

  const treeData = orgUnits ? buildTreeData(orgUnits) : [];

  const handleAdd = () => {
    setEditingNode(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (node: OrgUnitTreeNode) => {
    setEditingNode(node);
    form.setFieldsValue({
      name: node.name,
      code: node.code,
      type: node.type,
      parent_id: node.parent_id,
    });
    setModalOpen(true);
  };

  const handleDelete = (node: OrgUnitTreeNode) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除部门 ${node.name} 吗？子部门也将被删除。`,
      onOk: () => message.success('删除成功'),
    });
  };

  const handleSubmit = async () => {
    await form.validateFields();
    message.success('保存成功');
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="组织架构"
        description="管理公司组织结构和部门"
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建部门
          </Button>
        }
      />

      <Card>
        <Tree
          treeData={treeData}
          showIcon
          defaultExpandAll
          titleRender={(nodeData: OrgUnitTreeNode) => (
            <Space>
              <span>{nodeData.title}</span>
              {nodeData.serialId ? <Tag color="blue">ID {nodeData.serialId}</Tag> : null}
              <Tag>{nodeData.type}</Tag>
              <Space size="small">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingNode(nodeData);
                    form.setFieldsValue({ parent_id: nodeData.id });
                    setModalOpen(true);
                  }}
                />
                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(nodeData)} />
                <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(nodeData)} />
              </Space>
            </Space>
          )}
          icon={() => <TeamOutlined />}
        />
      </Card>

      <Modal title={editingNode ? '编辑部门' : '新建部门'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSubmit}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="部门编码" rules={[{ required: true, message: '请输入部门编码' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="部门类型" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '公司', value: 'company' },
                { label: '事业部', value: 'division' },
                { label: '部门', value: 'department' },
                { label: '团队', value: 'team' },
              ]}
            />
          </Form.Item>
          <Form.Item name="parent_id" label="上级部门">
            <Select
              placeholder="选择上级部门（留空为顶级）"
              allowClear
              options={orgUnits?.data?.map((item: OrgUnit) => ({
                label: item.name,
                value: item.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
