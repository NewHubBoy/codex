"use client";

import { Card, Row, Col, Statistic, Table, DatePicker, Select, Space, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import type { ColumnsType } from "antd/es/table";

const { RangePicker } = DatePicker;
const { Text } = Typography;

// 模拟数据
const mockSalesData = [
  { month: "1月", amount: 125000, count: 45 },
  { month: "2月", amount: 148000, count: 52 },
  { month: "3月", amount: 186000, count: 68 },
  { month: "4月", amount: 210000, count: 75 },
  { month: "5月", amount: 195000, count: 71 },
  { month: "6月", amount: 245000, count: 89 },
];

const mockPipelineData = [
  { stage: "初步接触", amount: 500000, count: 25 },
  { stage: "需求分析", amount: 350000, count: 18 },
  { stage: "方案报价", amount: 280000, count: 12 },
  { stage: "商务谈判", amount: 180000, count: 8 },
  { stage: "赢单", amount: 150000, count: 6 },
];

const mockTopProducts = [
  { name: "企业版许可证", amount: 85000, count: 17 },
  { name: "专业服务包", amount: 62000, count: 12 },
  { name: "技术支持", amount: 48000, count: 24 },
  { name: "培训服务", amount: 35000, count: 7 },
  { name: "定制开发", amount: 28000, count: 4 },
];

type SalesRow = {
  month: string;
  amount: number;
  count: number;
};

type PipelineRow = {
  stage: string;
  amount: number;
  count: number;
};

type TopProductRow = {
  name: string;
  amount: number;
  count: number;
};

export default function ReportsPage() {
  const columns: ColumnsType<SalesRow> = [
    {
      title: "月份",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "销售额",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `¥${val.toLocaleString()}`,
    },
    {
      title: "订单数",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "环比",
      key: "growth",
      render: (_value, record, index) => {
        if (index === 0) return "-";
        const prev = mockSalesData[index - 1].amount;
        const growth = ((record.amount - prev) / prev) * 100;
        return (
          <Text type={growth > 0 ? "success" : "danger"}>
            {growth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(growth).toFixed(1)}%
          </Text>
        );
      },
    },
  ];

  const pipelineColumns: ColumnsType<PipelineRow> = [
    {
      title: "阶段",
      dataIndex: "stage",
      key: "stage",
    },
    {
      title: "商机金额",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `¥${val.toLocaleString()}`,
    },
    {
      title: "商机数",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "占比",
      key: "percentage",
      render: (_value, record) => {
        const total = mockPipelineData.reduce((sum, item) => sum + item.amount, 0);
        const pct = ((record.amount / total) * 100).toFixed(1);
        return `${pct}%`;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="报表分析"
        description="销售数据分析和业务报表"
      />

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <RangePicker />
          <Select
            placeholder="部门筛选"
            allowClear
            style={{ width: 150 }}
            options={[
              { label: "销售一部", value: "1" },
              { label: "销售二部", value: "2" },
            ]}
          />
        </Space>
      </Card>

      {/* 关键指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总销售额"
              value={1139000}
              precision={0}
              prefix="¥"
              valueStyle={{ color: "#3f8600" }}
            />
            <Text type="success">
              <ArrowUpOutlined /> 12.5%
            </Text>
            <Text type="secondary"> 较上月</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={320}
              valueStyle={{ color: "#1677ff" }}
            />
            <Text type="success">
              <ArrowUpOutlined /> 8.3%
            </Text>
            <Text type="secondary"> 较上月</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均客单价"
              value={3559}
              precision={0}
              prefix="¥"
            />
            <Text type="success">
              <ArrowUpOutlined /> 3.2%
            </Text>
            <Text type="secondary"> 较上月</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="转化率"
              value={24.5}
              precision={1}
              suffix="%"
              valueStyle={{ color: "#cf1322" }}
            />
            <Text type="danger">
              <ArrowDownOutlined /> 1.2%
            </Text>
            <Text type="secondary"> 较上月</Text>
          </Card>
        </Col>
      </Row>

      {/* 销售趋势 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="销售趋势">
            <Table
              columns={columns}
              dataSource={mockSalesData}
              rowKey="month"
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="销售漏斗">
            <Table
              columns={pipelineColumns}
              dataSource={mockPipelineData}
              rowKey="stage"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 产品排行 */}
      <Card title="热销产品 TOP5">
        <Table
          columns={
            [
              { title: "排名", key: "rank", render: (_value, _record, index) => index + 1 },
              { title: "产品名称", dataIndex: "name", key: "name" },
              { title: "销售额", dataIndex: "amount", key: "amount", render: (val: number) => `¥${val.toLocaleString()}` },
              { title: "销售数量", dataIndex: "count", key: "count" }
            ] satisfies ColumnsType<TopProductRow>
          }
          dataSource={mockTopProducts}
          rowKey="name"
          pagination={false}
        />
      </Card>
    </div>
  );
}
