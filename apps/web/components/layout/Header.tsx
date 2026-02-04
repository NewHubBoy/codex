"use client";

import { Layout, Avatar, Dropdown, Space, Typography, Button } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n/provider";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  const handleLogout = async () => {
    await logout();
  };

  const userMenu = [
    {
      key: "profile",
      label: t("header.menu.profile"),
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: t("header.menu.settings"),
      icon: <SettingOutlined />,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      label: t("header.menu.logout"),
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === "profile") {
      router.push("/profile");
      return;
    }
    if (key === "settings") {
      router.push("/settings/users");
      return;
    }
    if (key === "logout") {
      await handleLogout();
    }
  };

  return (
    <AntHeader
      style={{
        background: "#fff",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {/* 右侧用户信息 */}
      <div style={{ marginLeft: "auto" }}>
        <Space size={16}>
          {/* 通知按钮 */}
          <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />

          {/* 用户下拉菜单 */}
          <Dropdown menu={{ items: userMenu, onClick: handleMenuClick }} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar
                style={{ backgroundColor: "#1677ff" }}
                icon={<UserOutlined />}
              />
              <Text strong>{user?.name || t("common.user")}</Text>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
}
