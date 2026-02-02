"use client";

import { Layout, Menu, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  FileProtectOutlined,
  AlertOutlined,
  SettingOutlined,
  BarChartOutlined,
  RocketOutlined,
  ContactsOutlined,
  ShopOutlined,
  CalendarOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";

const { Sider: AntSider } = Layout;
const { Title } = Typography;

// 菜单项类型
interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  permission?: string;
}

// CRM 菜单配置
const crmMenuItems: MenuItem[] = [
  {
    key: "/dashboard",
    label: "工作台",
    icon: <DashboardOutlined />,
  },
  {
    key: "/crm/leads",
    label: "线索管理",
    icon: <RocketOutlined />,
    permission: "LEAD_READ",
  },
  {
    key: "/crm/opportunities",
    label: "商机管理",
    icon: <ShoppingCartOutlined />,
    permission: "OPPORTUNITY_READ",
  },
  {
    key: "/crm/accounts",
    label: "客户管理",
    icon: <ShopOutlined />,
    permission: "ACCOUNT_READ",
  },
  {
    key: "/crm/contacts",
    label: "联系人",
    icon: <ContactsOutlined />,
    permission: "CONTACT_READ",
  },
  {
    key: "/crm/quotes",
    label: "报价单",
    icon: <FileTextOutlined />,
    permission: "QUOTE_READ",
  },
  {
    key: "/crm/orders",
    label: "订单管理",
    icon: <FileProtectOutlined />,
    permission: "ORDER_READ",
  },
  {
    key: "/crm/deliveries",
    label: "交付管理",
    icon: <CalendarOutlined />,
    permission: "DELIVERY_READ",
  },
  {
    key: "/crm/tickets",
    label: "工单管理",
    icon: <AlertOutlined />,
    permission: "TICKET_READ",
  },
];

const productMenuItems: MenuItem[] = [
  {
    key: "/crm/products",
    label: "产品管理",
    icon: <ExperimentOutlined />,
    permission: "PRODUCT_READ",
  },
];

const reportMenuItems: MenuItem[] = [
  {
    key: "/reports",
    label: "报表分析",
    icon: <BarChartOutlined />,
    permission: "REPORT_READ",
  },
];

const settingsMenuItems: MenuItem[] = [
  {
    key: "/settings/users",
    label: "用户管理",
    icon: <TeamOutlined />,
    permission: "USER_READ",
  },
  {
    key: "/settings/roles",
    label: "角色权限",
    icon: <SettingOutlined />,
    permission: "RBAC_READ",
  },
  {
    key: "/settings/org-units",
    label: "组织架构",
    icon: <TeamOutlined />,
    permission: "ORG_UNIT_READ",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // 收集所有菜单项
  const allMenuItems: MenuItem[] = [
    ...crmMenuItems,
    ...productMenuItems,
    ...reportMenuItems,
    ...settingsMenuItems,
  ];

  // 查找父菜单以确定展开项
  const findOpenKeys = (path: string): string[] => {
    const crmPaths = ["/crm/leads", "/crm/opportunities", "/crm/accounts"];
    const productPaths = ["/crm/products"];
    const reportPaths = ["/reports"];
    const settingsPaths = ["/settings"];

    if (crmPaths.some((p) => path.startsWith(p))) return ["/crm"];
    if (productPaths.some((p) => path.startsWith(p))) return ["/crm"];
    if (reportPaths.some((p) => path.startsWith(p))) return ["/reports"];
    if (settingsPaths.some((p) => path.startsWith(p))) return ["/settings"];
    return [];
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  return (
    <AntSider
      width={240}
      style={{
        background: "#001529",
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {/* Logo 区域 */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Title
          level={4}
          style={{
            color: "#fff",
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          CRM System
        </Title>
      </div>

      {/* 菜单 */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        defaultOpenKeys={findOpenKeys(pathname)}
        items={allMenuItems as any}
        onClick={handleMenuClick}
        style={{ background: "#001529", borderRight: 0 }}
      />
    </AntSider>
  );
}
