"use client";

import { Descriptions, Typography } from "antd";

const { Text } = Typography;

interface EntitySystemTabProps {
  entity: {
    id: string;
    serialId?: number | null;
    createdAt: string;
    updatedAt: string;
  };
  locale?: string;
  labels?: {
    createdAt?: string;
    updatedAt?: string;
    serialId?: string;
    id?: string;
  };
}

export function EntitySystemTab({ entity, locale = "zh-CN", labels }: EntitySystemTabProps) {
  return (
    <Descriptions column={2} bordered>
      <Descriptions.Item label={labels?.createdAt ?? "创建时间"}>
        {new Date(entity.createdAt).toLocaleString(locale)}
      </Descriptions.Item>
      <Descriptions.Item label={labels?.updatedAt ?? "最后更新时间"}>
        {new Date(entity.updatedAt).toLocaleString(locale)}
      </Descriptions.Item>
      <Descriptions.Item label={labels?.serialId ?? "编号"} span={2}>
        {entity.serialId ?? "-"}
      </Descriptions.Item>
      <Descriptions.Item label={labels?.id ?? "ID"} span={2}>
        <Text copyable style={{ fontFamily: "monospace" }}>
          {entity.id}
        </Text>
      </Descriptions.Item>
    </Descriptions>
  );
}
