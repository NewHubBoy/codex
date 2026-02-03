"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Tabs,
  Descriptions,
  Spin,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useProduct } from "@/hooks/useProducts";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  ACTIVE: "success",
  INACTIVE: "default",
  DISCONTINUED: "red",
};

const formatAmount = (amount?: number, currency?: string) => {
  if (amount === undefined || amount === null) return "-";
  const formatted = amount.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card>
        <Text type="secondary">未找到该产品</Text>
      </Card>
    );
  }

  const tabItems = [
    {
      key: "system",
      label: "系统信息",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="创建时间">
            {new Date(product.createdAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            {new Date(product.updatedAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
          <Descriptions.Item label="编号" span={2}>
            {product.serialId}
          </Descriptions.Item>
          <Descriptions.Item label="ID" span={2}>
            <Text copyable style={{ fontFamily: "monospace" }}>
              {product.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={product.name || "产品详情"}
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            返回
          </Button>,
        ]}
      />

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title="基本信息">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="产品名称">{product.name}</Descriptions.Item>
            <Descriptions.Item label="产品编码">{product.sku || "-"}</Descriptions.Item>
            <Descriptions.Item label="分类">{product.category || "-"}</Descriptions.Item>
            <Descriptions.Item label="单价">
              {formatAmount(product.listPrice, product.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[product.status] || "default"}>
                {product.status || "-"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Tabs items={tabItems} />
      </Space>
    </div>
  );
}
