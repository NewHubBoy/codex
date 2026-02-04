'use client';

import { Layout, Menu, Typography } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
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
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useEffect } from 'react';
import { useI18n } from '@/i18n/provider';

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
const crmMenuItems = (t: (key: string) => string): MenuItem[] => [
  {
    key: '/dashboard',
    label: t('menu.dashboard'),
    icon: <DashboardOutlined />,
  },
  {
    key: '/crm/leads',
    label: t('menu.leads'),
    icon: <RocketOutlined />,
    permission: 'LEAD_READ',
  },
  {
    key: '/crm/activities',
    label: t('menu.activities'),
    icon: <ClockCircleOutlined />,
    permission: 'ACTIVITY_READ',
  },
  {
    key: '/crm/opportunities',
    label: t('menu.opportunities'),
    icon: <ShoppingCartOutlined />,
    permission: 'OPPORTUNITY_READ',
  },
  {
    key: '/crm/accounts',
    label: t('menu.accounts'),
    icon: <ShopOutlined />,
    permission: 'ACCOUNT_READ',
  },
  {
    key: '/crm/contacts',
    label: t('menu.contacts'),
    icon: <ContactsOutlined />,
    permission: 'CONTACT_READ',
  },
  {
    key: '/crm/quotes',
    label: t('menu.quotes'),
    icon: <FileTextOutlined />,
    permission: 'QUOTE_READ',
  },
  {
    key: '/crm/orders',
    label: t('menu.orders'),
    icon: <FileProtectOutlined />,
    permission: 'ORDER_READ',
  },
  {
    key: '/crm/deliveries',
    label: t('menu.deliveries'),
    icon: <CalendarOutlined />,
    permission: 'DELIVERY_READ',
  },
  {
    key: '/crm/tickets',
    label: t('menu.tickets'),
    icon: <AlertOutlined />,
    permission: 'TICKET_READ',
  },
];

const productMenuItems = (t: (key: string) => string): MenuItem[] => [
  {
    key: '/crm/products',
    label: t('menu.products'),
    icon: <ExperimentOutlined />,
    permission: 'PRODUCT_READ',
  },
];

const reportMenuItems = (t: (key: string) => string): MenuItem[] => [
  {
    key: '/reports',
    label: t('menu.reports'),
    icon: <BarChartOutlined />,
    permission: 'REPORT_READ',
  },
];

const settingsMenuItems = (t: (key: string) => string): MenuItem[] => [
  {
    key: '/settings/users',
    label: t('menu.users'),
    icon: <TeamOutlined />,
    permission: 'USER_READ',
  },
  {
    key: '/settings/roles',
    label: t('menu.roles'),
    icon: <SettingOutlined />,
    permission: 'RBAC_READ',
  },
  {
    key: '/settings/org-units',
    label: t('menu.org_units'),
    icon: <TeamOutlined />,
    permission: 'ORG_UNIT_READ',
  },
  {
    key: '/settings/alerts',
    label: t('menu.alerts'),
    icon: <AlertOutlined />,
    permission: 'ALERT_READ',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  // 收集所有菜单项
  const allMenuItems: MenuItem[] = [
    ...crmMenuItems(t),
    ...productMenuItems(t),
    ...reportMenuItems(t),
    ...settingsMenuItems(t),
  ];

  // 查找父菜单以确定展开项
  const findOpenKeys = (path: string): string[] => {
    const crmPaths = ['/crm/leads', '/crm/activities', '/crm/opportunities', '/crm/accounts'];
    const productPaths = ['/crm/products'];
    const reportPaths = ['/reports'];
    const settingsPaths = ['/settings'];

    if (crmPaths.some((p) => path.startsWith(p))) return ['/crm'];
    if (productPaths.some((p) => path.startsWith(p))) return ['/crm'];
    if (reportPaths.some((p) => path.startsWith(p))) return ['/reports'];
    if (settingsPaths.some((p) => path.startsWith(p))) return ['/settings'];
    return [];
  };

  const findSelectedKey = (path: string): string => {
    const match = allMenuItems.find((item) => path === item.key || path.startsWith(`${item.key}/`));
    return match?.key ?? path;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  return (
    <AntSider
      width={240}
      style={{
        background: '#001529',
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {/* Logo 区域 */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Title
          level={4}
          style={{
            color: '#fff',
            margin: 0,
            whiteSpace: 'nowrap',
          }}
        >
          CRM System
        </Title>
      </div>

      {/* 菜单 */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[findSelectedKey(pathname)]}
        defaultOpenKeys={findOpenKeys(pathname)}
        items={allMenuItems as any}
        onClick={handleMenuClick}
        style={{ background: '#001529', borderRight: 0 }}
      />
    </AntSider>
  );
}
