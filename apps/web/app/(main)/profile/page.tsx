"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions } from "antd";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n/provider";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [orgUnitId, setOrgUnitId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrgUnitId(localStorage.getItem("orgUnitId"));
    }
  }, []);

  return (
    <div>
      <PageHeader title={t("profile.title")} description={t("profile.description")} />
      <Card>
        <Descriptions column={1} bordered>
          <Descriptions.Item label={t("profile.fields.name")}>{user?.name || "-"}</Descriptions.Item>
          <Descriptions.Item label={t("profile.fields.email")}>{user?.email || "-"}</Descriptions.Item>
          <Descriptions.Item label={t("profile.fields.locale")}>{user?.locale || "-"}</Descriptions.Item>
          <Descriptions.Item label={t("profile.fields.tenant")}>{user?.tenantId || "-"}</Descriptions.Item>
          <Descriptions.Item label={t("profile.fields.org_unit")}>{orgUnitId || "-"}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
