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

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const userMenu = [
    {
      key: "profile",
      label: "个人中心",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "系统设置",
      icon: <SettingOutlined />,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

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
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar
                style={{ backgroundColor: "#1677ff" }}
                icon={<UserOutlined />}
              />
              <Text strong>{user?.name || "用户"}</Text>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
}
