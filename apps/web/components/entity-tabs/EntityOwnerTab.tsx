"use client";

import { Descriptions } from "antd";

interface EntityOwnerTabProps {
  owner?: {
    name?: string | null;
    email?: string | null;
  } | null;
  labels?: {
    name?: string;
    email?: string;
  };
}

export function EntityOwnerTab({ owner, labels }: EntityOwnerTabProps) {
  return (
    <Descriptions column={2} bordered>
      <Descriptions.Item label={labels?.name ?? "负责人"}>
        {owner?.name || "-"}
      </Descriptions.Item>
      <Descriptions.Item label={labels?.email ?? "负责人邮箱"}>
        {owner?.email || "-"}
      </Descriptions.Item>
    </Descriptions>
  );
}
