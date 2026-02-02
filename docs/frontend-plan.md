# CRM 前端架构规划 (Ant Design + Next.js)

> 基于 Next.js 15 App Router + Ant Design 5 的企业级 CRM 前端方案

---

## 一、技术栈确认

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | Next.js 15 (App Router) | SSR/SSG 支持，路由能力强 |
| UI 组件库 | Ant Design 5 | 企业级组件，设计规范统一 |
| 状态管理 | TanStack Query (React Query) | 服务端状态缓存、同步 |
| 表单 | React Hook Form + Zod | 高性能表单 + Schema 校验 |
| 表格 | TanStack Table (React Table v8) | 灵活的数据表格 |
| 图表 | Ant Design Charts (ECharts) | 仪表盘、报表 |
| HTTP 客户端 | Axios / Fetch (封装) | 请求拦截、错误处理 |
| 国际化 | react-intl / next-i18n | 预留，支持多语言 |
| 样式 | CSS Modules + Ant Design Token | 主题定制、组件覆盖 |

---

## 二、推荐项目结构

```
apps/web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证路由组（无 Layout）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # 登录页专用 Layout
│   │
│   ├── (main)/                   # 主应用路由组
│   │   ├── layout.tsx            # 主 Layout（含 Sidebar/Header）
│   │   ├── page.tsx              # 工作台 / 仪表盘
│   │   │
│   │   ├── crm/                  # CRM 业务模块
│   │   │   ├── leads/            # 线索管理
│   │   │   │   ├── page.tsx      # 列表页
│   │   │   │   ├── [id]/         # 详情页
│   │   │   │   │   └── page.tsx
│   │   │   │   └── create/       # 新建页
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── opportunities/    # 商机管理
│   │   │   ├── accounts/         # 客户管理
│   │   │   ├── contacts/         # 联系人管理
│   │   │   ├── quotes/           # 报价单
│   │   │   ├── orders/           # 订单管理
│   │   │   ├── deliveries/       # 交付管理
│   │   │   └── tickets/          # 工单管理
│   │   │
│   │   ├── products/             # 产品管理
│   │   ├── activities/           # 跟进记录
│   │   │
│   │   ├── settings/             # 系统配置
│   │   │   ├── users/            # 用户管理
│   │   │   ├── roles/            # 角色权限
│   │   │   ├── org-units/        # 组织架构
│   │   │   └── fields/           # 自定义字段
│   │   │
│   │   └── reports/              # 报表分析
│   │
│   ├── api/                      # API 代理（可选）
│   │   └── [...route]/
│   │       └── route.ts
│   │
│   ├── globals.css
│   ├── layout.tsx                # 根 Layout
│   └── page.tsx                  # 重定向到 /crm/leads 或 /dashboard
│
├── components/                   # 公共组件
│   ├── common/                   # 通用组件
│   │   ├── PageHeader.tsx
│   │   ├── DeleteConfirm.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSpinner.tsx
│   │
│   ├── business/                 # 业务组件
│   │   ├── LeadCard.tsx
│   │   ├── OpportunityStage.tsx
│   │   ├── QuoteTotal.tsx
│   │   ├── CustomerSelect.tsx
│   │   ├── ProductSelect.tsx
│   │   ├── StatusTag.tsx
│   │   └── Timeline.tsx
│   │
│   ├── form/                     # 表单组件
│   │   ├── BaseForm.tsx
│   │   ├── CustomerForm.tsx
│   │   ├── ProductForm.tsx
│   │   └── ActivityForm.tsx
│   │
│   ├── table/                    # 表格组件
│   │   ├── BaseTable.tsx
│   │   ├── LeadTable.tsx
│   │   ├── OpportunityTable.tsx
│   │   ├── OrderTable.tsx
│   │   └── TableToolbar.tsx
│   │
│   └── layout/                   # 布局组件
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── Breadcrumb.tsx
│       └── Footer.tsx
│
├── hooks/                        # 自定义 Hooks
│   ├── useAuth.ts
│   ├── usePermission.ts
│   ├── useTable.ts
│   ├── useForm.ts
│   ├── useLeads.ts
│   ├── useOpportunities.ts
│   └── ...
│
├── services/                     # API 服务层
│   ├── api.ts                    # Axios 实例、全局配置
│   ├── auth.ts                   # 登录、登出、Token 管理
│   ├── leads.ts
│   ├── opportunities.ts
│   ├── accounts.ts
│   ├── contacts.ts
│   ├── quotes.ts
│   ├── orders.ts
│   ├── products.ts
│   └── ...
│
├── stores/                       # 客户端状态（可选）
│   ├── useUserStore.ts
│   └── useAppStore.ts
│
├── types/                        # 类型定义
│   ├── api.ts                    # API 响应类型
│   ├── lead.ts
│   ├── opportunity.ts
│   └── ...
│
├── utils/                        # 工具函数
│   ├── format.ts                 # 日期、金额格式化
│   ├── validators.ts             # 自定义校验
│   └── constants.ts
│
├── .env.local
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 三、核心设计决策

### 3.1 目录路由约定

- **列表页**: `/crm/{entity}` → `page.tsx`
- **详情页**: `/crm/{entity}/{id}` → `[id]/page.tsx`
- **新建页**: `/crm/{entity}/create` → `create/page.tsx`
- **编辑页**: `/crm/{entity}/{id}/edit` → `[id]/edit/page.tsx`

### 3.2 组件拆分原则

| 类型 | 命名 | 职责 |
|------|------|------|
| 页面 | `page.tsx` | 数据获取、路由参数、布局组合 |
| 业务组件 | `{Entity}{Feature}.tsx` | 特定业务逻辑、状态 |
| 通用组件 | `Base{X}.tsx` | 可复用的 UI 逻辑 |
| 表单组件 | `{Entity}Form.tsx` | 编辑/新建表单 |
| 表格组件 | `{Entity}Table.tsx` | 列表表格 |

### 3.3 数据获取策略

```typescript
// 推荐模式：Server Component 获取初始数据，Client Component 负责交互

// app/crm/leads/page.tsx (Server Component)
import { LeadsTable } from '@/components/table/LeadTable';
import { getLeads } from '@/services/leads';

export default async function LeadsPage() {
  const initialData = await getLeads({ page: 1, pageSize: 20 });
  return <LeadsTable initialData={initialData} />;
}

// components/table/LeadTable.tsx (Client Component)
"use client";
import { useQuery } from '@tanstack/react-query';
import { Table } from 'antd';

export function LeadsTable({ initialData }: { initialData: LeadListResponse }) {
  const { data, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadService.list(),
    initialData,  // 复用 Server Component 数据
  });

  return <Table dataSource={data.list} loading={isLoading} ... />;
}
```

### 3.4 状态管理方案

| 状态类型 | 方案 | 场景 |
|----------|------|------|
| 服务端状态 | TanStack Query | 列表数据、缓存、乐观更新 |
| 用户状态 | Zustand / Context | 用户信息、主题、语言 |
| UI 状态 | useState / useReducer | 展开/折叠、Modal 显示 |
| 表单状态 | React Hook Form | 表单值、校验 |

### 3.5 表单最佳实践

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, LeadFormData } from '@crm/shared/schemas';

// 通用表单组件
function BaseForm<T extends z.ZodType>({
  schema,
  onSubmit,
  defaultValues,
}: {
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void>;
  defaultValues?: z.infer<T>;
}) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return <Form form={form} onSubmit={onSubmit} />;
}
```

### 3.6 表格封装

```typescript
// 通用表格高阶组件
function withTable<T>(
  TableComponent: React.ComponentType<{ data: T[] }>
) {
  return function WrappedTable({
    fetchParams,
    columns,
  }: {
    fetchParams: Record<string, unknown>;
    columns: ColumnsType<T>;
  }) {
    const { data, isLoading } = useQuery({
      queryKey: [TableComponent.name, fetchParams],
      queryFn: () => fetchData(fetchParams),
    });

    return (
      <Table
        columns={columns}
        dataSource={data?.list}
        loading={isLoading}
        pagination={{
          total: data?.total,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    );
  };
}
```

---

## 四、权限与菜单

### 4.1 动态菜单

```typescript
// 根据用户权限动态渲染菜单
const menuItems: MenuItem[] = [
  {
    key: '/crm/leads',
    label: '线索管理',
    permission: 'LEAD_READ',
  },
  {
    key: '/crm/opportunities',
    label: '商机管理',
    permission: 'OPPORTUNITY_READ',
  },
  // ...
];
```

### 4.2 权限守卫

```typescript
// components/auth/PermissionGuard.tsx
"use client";
import { usePermission } from '@/hooks/usePermission';

export function PermissionGuard({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { hasPermission } = usePermission();
  return hasPermission(permission) ? children : null;
}

// 使用
<PermissionGuard permission="LEAD_CREATE">
  <Button onClick={createLead}>新建线索</Button>
</PermissionGuard>
```

---

## 五、API 层设计

### 5.1 Axios 封装

```typescript
// services/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
});

// 请求拦截器 - 添加 Token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      logout();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);
```

### 5.2 服务函数命名

| 操作 | 函数命名 | 示例 |
|------|----------|------|
| 列表 | `list(params)` | `leads.list({ page: 1, status: 'NEW' })` |
| 单个 | `get(id)` | `leads.get('uuid')` |
| 创建 | `create(data)` | `leads.create({ name: 'XX', ... })` |
| 更新 | `update(id, data)` | `leads.update('uuid', { status: 'ASSIGNED' })` |
| 删除 | `delete(id)` | `leads.delete('uuid')` |
| 批量 | `batchUpdate(ids, data)` | `leads.batchUpdate(['id1', 'id2'], { status: 'ASSIGNED' })` |

---

## 六、主题与样式

### 6.1 Ant Design 主题定制

```typescript
// app/theme.ts
import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: '#001529',
      headerBg: '#ffffff',
    },
    Menu: {
      darkItemBg: '#001529',
    },
  },
};
```

### 6.2 全局样式覆盖

```css
/* app/globals.css */
:root {
  --primary-color: #1677ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #ff4d4f;
}

.ant-table-wrapper {
  background: #fff;
  border-radius: 8px;
}
```

---

## 七、目录结构速查

```
apps/web/
├── app/
│   ├── (auth)/login/              # 登录页
│   ├── (main)/                    # 主应用
│   │   ├── layout.tsx             # 含侧边栏
│   │   ├── crm/leads/             # 线索列表
│   │   ├── crm/opportunities/     # 商机列表
│   │   ├── crm/accounts/          # 客户列表
│   │   ├── settings/users/        # 用户管理
│   │   └── page.tsx               # 仪表盘
│   └── globals.css
├── components/
│   ├── common/                    # 通用组件
│   ├── business/                  # 业务组件
│   ├── form/                      # 表单组件
│   ├── table/                     # 表格组件
│   └── layout/                    # 布局组件
├── services/                      # API 服务
├── hooks/                         # Hooks
└── types/                         # 类型定义
```

---

## 八、开发规范

### 8.1 代码风格

- 组件文件使用 PascalCase: `LeadTable.tsx`
- 工具函数使用 camelCase: `formatCurrency.ts`
- 类型定义使用 PascalCase: `LeadType.ts`
- 样式文件使用与组件同名的 CSS Modules

### 8.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| Props | PascalCase | `LeadTableProps` |
| 事件处理 | handle 前缀 | `handleSubmit`, `handleChange` |
| 异步请求 | useQuery/useMutation 后缀 | `useLeads`, `useCreateLead` |
| 常量 | UPPER_SNAKE_CASE | `LEAD_STATUS_NEW` |

---

## 九、下一步行动

1. **初始化项目** - `pnpm dev` 验证基础运行
2. **配置主题** - Ant Design 5 主题定制
3. **搭建 Layout** - 侧边栏 + Header + 面包屑
4. **封装 API** - Axios 实例 + 错误处理
5. **实现列表页** - Leads 列表 + 分页 + 筛选
6. **实现表单页** - Lead 新建/编辑
7. **实现详情页** - Lead 详情 + 操作

---

## 十、参考资源

- [Next.js 15 文档](https://nextjs.org/docs)
- [Ant Design 5](https://ant.design/components/overview)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod 文档](https://zod.dev/)
