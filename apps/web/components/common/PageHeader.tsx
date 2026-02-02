"use client";

import { Card, Typography, Space } from "antd";
import { ReactNode } from "react";

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: ReactNode[];
  action?: ReactNode;
}

export function PageHeader({ title, description, extra, action }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Space direction="vertical" size={4}>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {description && (
          <Text type="secondary">{description}</Text>
        )}
      </Space>
      {(extra || action) && (
        <div style={{ marginTop: 8 }}>{extra || action}</div>
      )}
    </div>
  );
}
