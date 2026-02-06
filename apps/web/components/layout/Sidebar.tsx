'use client';

import { Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
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
import { useMemo, type ReactNode } from 'react';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/hooks/useAuth';
import type { PermissionMode, PermissionRequirement } from '@/utils/permissions';

const { Sider: AntSider } = Layout;
const { Title } = Typography;

// 菜单项类型
interface MenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  children?: MenuItem[];
  permission?: PermissionRequirement;
  permissionMode?: PermissionMode;
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
    permission: 'lead:read',
  },
  {
    key: '/crm/activities',
    label: t('menu.activities'),
    icon: <ClockCircleOutlined />,
    permission: 'activity:read',
  },
  {
    key: '/crm/opportunities',
    label: t('menu.opportunities'),
    icon: <ShoppingCartOutlined />,
    permission: 'opportunity:read',
  },
  {
    key: '/crm/accounts',
    label: t('menu.accounts'),
    icon: <ShopOutlined />,
    permission: 'account:read',
  },
  {
    key: '/crm/contacts',
    label: t('menu.contacts'),
    icon: <ContactsOutlined />,
    permission: 'contact:read',
  },
  {
    key: '/crm/quotes',
    label: t('menu.quotes'),
    icon: <FileTextOutlined />,
    permission: 'quote:read',
  },
  {
    key: '/crm/orders',
    label: t('menu.orders'),
    icon: <FileProtectOutlined />,
    permission: 'order:read',
  },
  {
    key: '/crm/deliveries',
    label: t('menu.deliveries'),
    icon: <CalendarOutlined />,
    permission: 'delivery:read',
  },
  {
    key: '/crm/tickets',
    label: t('menu.tickets'),
    icon: <AlertOutlined />,
    permission: 'ticket:read',
  },
];

const productMenuItems = (t: (key: string) => string): MenuItem[] => [
  {
    key: '/crm/products',
    label: t('menu.products'),
    icon: <ExperimentOutlined />,
    permission: 'product:read',
  },
];

const reportMenuItems = (t: (key: string) => string): MenuItem[] => [
  {
    key: '/reports',
    label: t('menu.reports'),
    icon: <BarChartOutlined />,
  },
];

const approvalMenuItems = (t: (key: string) => string): MenuItem[] => [
  {
    key: '/approvals',
    label: t('menu.approvals'),
    icon: <FileProtectOutlined />,
    permission: 'approval:read',
  },
];

const settingsMenuItems = (t: (key: string) => string): MenuItem[] => [
  {
    key: '/settings/users',
    label: t('menu.users'),
    icon: <TeamOutlined />,
    permission: 'user:read',
  },
  {
    key: '/settings/roles',
    label: t('menu.roles'),
    icon: <SettingOutlined />,
    permission: 'rbac:role:read',
  },
  {
    key: '/settings/org-units',
    label: t('menu.org_units'),
    icon: <TeamOutlined />,
    permission: 'orgunit:read',
  },
  {
    key: '/settings/alerts',
    label: t('menu.alerts'),
    icon: <AlertOutlined />,
    permission: ['lead:read', 'opportunity:read'],
    permissionMode: 'all',
  },
  {
    key: '/settings/approval-rules',
    label: t('menu.approval_rules'),
    icon: <SettingOutlined />,
    permission: 'config:approval:read',
  },
];

const filterMenuItems = (
  items: MenuItem[],
  canAccess: (required: PermissionRequirement, mode?: PermissionMode) => boolean
): MenuItem[] =>
  items.reduce<MenuItem[]>((result, item) => {
    if (item.permission && !canAccess(item.permission, item.permissionMode ?? 'all')) {
      return result;
    }

    const children = item.children ? filterMenuItems(item.children, canAccess) : undefined;
    if (item.children && (!children || children.length === 0)) {
      return result;
    }

    result.push({ ...item, children });
    return result;
  }, []);

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { hasPermission } = useAuth();

  const allMenuItems = useMemo(
    () => [
      ...crmMenuItems(t),
      ...productMenuItems(t),
      ...reportMenuItems(t),
      ...approvalMenuItems(t),
      ...settingsMenuItems(t),
    ],
    [t]
  );
  const visibleMenuItems = useMemo(
    () => filterMenuItems(allMenuItems, hasPermission),
    [allMenuItems, hasPermission]
  );

  const toMenuItems = (items: MenuItem[]): MenuProps["items"] =>
    items.map((item) => ({
      key: item.key,
      label: item.label,
      icon: item.icon,
      children: item.children ? toMenuItems(item.children) : undefined,
    }));

  const findSelectedKey = (path: string): string => {
    const match = visibleMenuItems.find(
      (item) => path === item.key || path.startsWith(`${item.key}/`)
    );
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
        items={toMenuItems(visibleMenuItems)}
        onClick={handleMenuClick}
        style={{ background: '#001529', borderRight: 0 }}
      />
    </AntSider>
  );
}
