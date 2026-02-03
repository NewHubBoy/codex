# 现代化 CRM（对标 SAP C4C）优化版计划 v1.1

## 0. 项目进度（自动记录）
### 已完成
- M2 主对象：Products / Quotes / Orders / Deliveries / Tickets（模型 + CRUD + 分页 + Swagger + 审计/Outbox + 编号）
- QuoteItem / OrderItem：单条 + 批量写入（append/replace）、校验 & lineTotal 自动计算
- Quote/Order 总额自动汇总（items 变化、主表更新不传 totalAmount 时）
- 状态枚举与校验（shared zod + 服务端状态流校验）
- 状态必填字段校验（Lead/Opportunity/Quote/Order/Delivery/Ticket/Activity）
- Swagger 必填说明已补充
- 批量状态接口：Lead / Ticket（含 dryRun）
- 最小回归脚本：`pnpm -C apps/api status:regress`
- 详情页统一布局（基本信息 + Tabs），覆盖主菜单各对象详情页

### 待完成（可选）
- 扩展批量状态到其他对象（Opportunity/Quote/Order/Delivery/Activity）
- 状态流与流程配置联动（基于 ProcessDefinition/Transition 动态校验）
- 更完整回归脚本 / 测试

### TODO（后续补细节）
- 状态流校验规则进一步细化（按业务配置、支持可配置流程）
- 状态变更的必填字段校验补齐（如 Quote/Order/Delivery/Ticket 各阶段）
- 统一状态常量与前后端共享（避免魔法字符串）
- 统一业务对象 Draft 流程（前端先建草稿拿 UUID；提交时校验必填并转正式；列表默认不含草稿；可定期清理草稿）

## 1. 目标与范围
- 定位：面向 B2B 的现代化 CRM + 轻量 ERP 前端系统
- 目标：覆盖线索→商机→报价→订单→交付→售后全流程，保证可审计、可追溯、可扩展
- 对标：SAP Cloud for Customer（C4C）核心业务流和数据模型，保持更轻量、可定制
- 核心原则：流程完整但可裁剪；数据模型稳定；多租户/多组织/多角色；关键流程可追溯
- 主要模块（首期）：用户与权限、线索、商机、客户/账号、联系人、活动/跟进、报价单、订单、交付、售后工单、产品管理
- 次要/可选模块：审批流、报表与仪表盘、邮件/日历集成、导入导出、移动端/PWA

## 2. 推荐技术栈（已确认走“前后端分离”）
### 前端
- Next.js (App Router) + TypeScript（React 家族，现代化、适合企业后台）
- 数据层：TanStack Query + Zod
- 表格/表单：TanStack Table + React Hook Form
- UI：Ant Design（更接近企业 CRM 风格，默认推荐）

### 后端
- TypeScript + NestJS（模块化强、适合复杂业务与集成）
- API：REST + OpenAPI（后期可加 GraphQL）
- ORM：Prisma（默认）或 TypeORM（与 NestJS 深度集成）
- 鉴权：JWT + Refresh Token + RBAC
- 异步任务：BullMQ + Redis（审批/通知/集成任务）
- 事件机制：Outbox Pattern（v1 落地，保证一致性）

### 数据库
- PostgreSQL（强一致性、复杂关系、报表分析友好）
- MySQL 可选，但对复杂报表/审计/分析不如 PG

### 架构形态
- Monorepo（推荐）：apps/web(Next.js) + apps/api(NestJS) + packages/shared
- 或双仓：若团队较大/部署独立

## 3. 业务对象与关系（初版）
- User / Role / Permission
- Lead（线索）
- Opportunity（商机）
- Account（客户/公司）
- Contact（联系人）
- Product（产品）
- Quote（报价单）
- Order（订单）
- Delivery（交付，可用“交付单/交付记录”建模）
- Ticket（售后工单）
- Activity（跟进记录/日志）
- Attachment（附件/文件，S3 存储）
- Org Unit / Territory（组织/区域，支持父子层级与成员分配）

典型关系：
- Lead → Opportunity → Quote → Order → Delivery → Ticket
- Quote / Order 关联 Product
- Lead/Account 关联 Contact

## 4. 核心流程（首期）
1) 创建线索（Lead）→ 线索分配/跟进
2) 线索合格 → 转换为商机（Opportunity）并关联账号/联系人
3) 商机阶段推进 → 生成报价单（Quote，支持版本）
4) 报价单确认/审批 → 生成订单（Order）
5) 订单交付 → 生成交付记录（Delivery）
6) 售后 → 工单（Ticket，可从订单/客户发起）
7) 付款/发票（Payment/Invoice，v1 只建表）

### 4.1 前期规划（Lead → Customer/Contact → Opportunity）
**目标**：把「来源线索」沉淀为结构化客户、联系人与可推进的商机。

**Lead（线索）采集字段（v1 必备）**
- 来源（source）
- 初步需求（initial_need）
- 联系方式（contact_name / phone / email）
- 负责人（owner）
- 公司主体（company_name，可先写在 Lead.company）
- 备注/描述（description）

**验证需求 / 跟进（Activity 驱动）**
- 每次电话/邮件/拜访/备注 = Activity 记录（relatedType=Lead, relatedId=leadId）
- Lead 状态流：New → Assigned → Working → Qualified（有意向）→ Converted
- 进入 Qualified 的基本条件：已完成至少 1 次有效跟进 + 需求明确

**转化规则（Lead → Customer/Contact/Opportunity）**
- 创建 Customer（Account）：公司主体 + 行业/规模/等级（可从 Lead 或补录）
- 创建 Contact：至少 1 个（决策人/影响人/使用人/付款人等角色）
- 创建 Opportunity：初始金额、阶段、成交概率、预计成交时间
- Lead 设为 CONVERTED，并回写关联的 accountId / contactId / opportunityId（若已有）

**可选补充**
- Lead 转化前可允许“半结构化”数据；转化时补齐关键字段
- 转化失败原因（Disqualified）需记录原因与标签

### 4.2 详情页布局规范（v1）
- 统一详情页结构：上方「基本信息」Card，下方 Tabs 切换模块
- Tabs 基础项：活动记录 / 附件 / 系统信息（按对象增加负责人信息等）
- 附件与活动：统一组件与接口，支持跨对象复用

## 5. 功能清单（MVP）
- 用户登录、角色权限管理（RBAC）
- 线索管理（状态、来源、分配、跟进）
- 商机管理（阶段、金额、预计成交日期、赢率）
- 客户/联系人管理（主数据、层级/关联）
- 报价单管理（报价明细、审批、版本/历史、差异对比预留）
- 订单管理（订单状态、交付、回款字段预留）
- 交付管理（支持部分/多次交付）
- 售后工单管理（工单状态、处理人、SLA字段预留）
- 产品管理（产品、规格、价格）
- 活动/跟进记录（电话、邮件、拜访、备注）
- 附件管理（S3 存储、支持挂载到任意对象）
- 基础审计日志（操作记录）
- 编号中心（NumberRange，报价/订单/交付/工单）
- 事件机制（Outbox 写入 + 异步投递）

## 6. API 模块规划（示例）
- /auth: 登录、刷新、登出
- /users /roles /permissions
- /leads
- /opportunities
- /accounts
- /contacts
- /quotes
- /orders
- /deliveries
- /tickets
- /products
- /activities
- /attachments
- /price-books
- /number-ranges
- /record-shares
- /audit-logs

## 7. 非功能性要求
- 审计日志 + 变更历史
- 可扩展字段（管理员后台配置 + 动态表单渲染）
- 多租户：租户级数据隔离（Tenant）
- 多租户模型：共享数据库 + tenant_id 逻辑隔离
- 数据隔离：租户内按销售组织（Sales Org）隔离，接口层强制过滤
- 权限：RBAC + 页面级权限（路由/组件级访问控制）+ 数据权限（按角色与组织）
- 共享机制：RecordShare（跨组织共享：只读/协作/拥有）
- 状态/阶段可配置：管理员可维护流程、阶段、转移规则与展示名称
- 导入导出（CSV/Excel）
- 报表与仪表盘（后期）
- 任务/消息队列（异步处理、对接 SAP/ERP）
- 流程可扩展（业务流程编排/状态机）
- 附件存储：S3（v1 暂时公共读写；后期切换私有桶 + 预签名上传/下载）

## 8. C4C 对齐要点（先做设计基线）
- 销售流程：Lead → Opportunity → Quote → Order → Delivery → Service
- 关键主数据：Account/Contact/Org/Territory
- 过程对象：Activity、Quote 版本、审批记录、变更历史
- 统一状态机：线索状态/商机阶段/报价状态/订单状态/工单状态
- 审计与追溯：字段级变更历史（重点对象）
- 多租户与组织隔离：Tenant → Sales Org → Team/Owner（层级隔离）

## 9. 标准状态流（可扩展，参考 C4C 常见做法）
### Lead（线索）
- New → Assigned → Working → Qualified → Converted
- 分支：Working → Disqualified（原因/标签可配置）

### Opportunity（商机阶段）
- Qualification → Needs Analysis → Proposal → Negotiation → Won/Lost
- 阶段与赢率映射可配置

### Quote（报价）
- Draft → In Review → Approved → Sent → Accepted/Rejected → Expired

### Order（订单）
- Draft → Confirmed → In Fulfillment → Partially Delivered → Delivered → Closed/Cancelled

### Delivery（交付）
- Planned → In Transit → Delivered → Completed

### Ticket（售后工单）
- New → Assigned → In Progress → Waiting for Customer → Resolved → Closed/Cancelled

## 10. 数据模型（v1，C4C 对标 + 可扩展）
### 10.1 通用字段（所有业务表）
- id, tenant_id, org_unit_id, owner_id, status, created_at, updated_at, created_by, updated_by, is_deleted

### 10.2 租户与组织
- Tenant: name, code, timezone, locale, base_currency, status
- OrgUnit: tenant_id, parent_id, name, code, type, path, manager_id, status
- User: tenant_id, email, name, status
- UserOrgMembership: user_id, org_unit_id, role_in_org

### 10.3 权限与配置
- Role, Permission, RolePermission, UserRole
- PagePermission（前端路由/菜单权限映射）

### 10.4 主数据（以 BusinessPartner 为底层基座）
- BusinessPartner (BP): id(UUID), tenant_id, type(person/company), name, email, phone, status
- BPAccount: bp_id, account_id, type, industry, rating, lifecycle_status, parent_id
- BPContact: bp_id, contact_id, account_id, title, role, status
- BPEmployee: bp_id, employee_id, org_unit_id, position, status
- Account: name, type, industry, rating, lifecycle_status, parent_id
- Contact: account_id, name, title, email, phone, role
- Employee: org_unit_id, user_id, employee_no, position, status
- Product: sku, name, category, list_price, currency, status

### 10.5 销售与服务对象
- Lead: source, status, rating, expected_value, account_id, contact_id, converted_opportunity_id
  - 规划补充字段（v1 目标）：initial_need, company_name, contact_name, phone, email
- Opportunity: stage, amount, currency, expected_close_date, probability, primary_quote_id, reason_lost
- Quote: number, version, status, valid_from, valid_to, total_amount, opportunity_id, account_id, contact_id
- QuoteItem: quote_id, product_id, qty, unit_price, discount, tax, line_total
- Order: number, status, order_date, total_amount, account_id, contact_id, opportunity_id
- OrderItem: order_id, product_id, qty, unit_price, discount, tax, line_total
- Delivery: order_id, status, delivered_at, delivery_notes, delivered_qty
- Ticket: number, type, priority, status, sla_due_at, account_id, contact_id, order_id
- Activity: type, subject, related_type, related_id, due_at, completed_at, outcome

### 10.6 价格、回款与发票（v1 建表）
- PriceBook: name, type, currency, valid_from, valid_to, scope
- PriceBookItem: price_book_id, product_id, price, currency
- PaymentSchedule: order_id, amount, currency, due_date, status
- Invoice: order_id, number, amount, currency, status, issued_at

### 10.7 附件（跨对象挂载）
- Attachment: id(UUID), file_name, mime_type, size, checksum_sha256, storage_provider(S3), bucket, object_key, url(optional), metadata(json)
- AttachmentLink: attachment_id, related_type, related_id, note(optional)
- 说明：
  - Attachment 只存文件元数据与存储指针；AttachmentLink 支持挂载到任意对象（Lead/Account/Contact/Opportunity/Quote/Order/Delivery/Ticket/Activity/…）
  - 允许同一附件挂载到多个对象
  - 允许同名文件，所有引用以附件 UUID 为准
  - v1 需校验文件类型/大小；病毒扫描后续补

### 10.7 编号与共享
- NumberRange: object_type, prefix, current_value, format, reset_rule
- RecordShare: object_type, object_id, org_unit_id, user_id, access_level

### 10.8 审计与历史
- AuditLog: tenant_id, actor_id, action, object_type, object_id, summary, created_at
- ChangeHistory: object_type, object_id, field_name, before_value, after_value, actor_id, created_at
- Snapshot: object_type, object_id, version, payload_json, created_at
- OutboxEvent: aggregate_type, aggregate_id, event_type, payload_json, status, created_at

## 11. 可配置流程与动态字段
### 11.1 流程/状态机配置（管理员维护）
- ProcessDefinition: entity_type, name, is_active
- ProcessState: process_id, state_key, display_name, category, sort_order
- ProcessTransition: process_id, from_state, to_state, condition_expr, required_roles
- OpportunityStageRule: stage_key, probability, forecast_category
### 11.2 状态机执行原则
- 后端强校验（禁止绕过）
- Transition Guard：角色校验、必填字段、条件表达式
- Side Effects：写审计、发事件、自动动作（编号、派生对象）

### 11.3 自定义字段与表单
- FieldDefinition: entity_type, field_key, label, data_type, required, options_json, validation_json
- FieldGroup / FormLayout: entity_type, group_name, sort_order, layout_json
- FieldValue: entity_type, entity_id, field_def_id, value_json

## 12. 权限与数据隔离模型（多租户 + 组织层级）
- tenant_id 强制过滤（所有查询）
- org_unit_id 访问范围：self / team / subtree / all（由角色配置）
- 数据权限：Owner 级别 + 组织层级 + 角色权限叠加
- 页面权限：路由/菜单级别控制（前后端双校验）
- 共享机制：RecordShare 覆盖组织边界的授权访问

## 13. API 设计细化（REST）
- 统一前缀：/api/v1
- 统一查询：分页/排序/过滤/搜索（page, pageSize, sort, q, status, owner_id, org_unit_id）
- 业务接口示例：
  - /leads /opportunities /quotes /orders /deliveries /tickets
  - /accounts /contacts /products /activities
  - /config/workflows /config/fields /config/roles /config/org-units
  - /audit-logs
- 批量操作：批量分配、批量状态更新、导入导出

## 14. 用户体验与效率能力（逐步落地）
- 保存视图（View）
- 批量操作
- 标签（Tag）
- 全局搜索（Account / Opportunity / Order / Ticket）
- 工作台（My Leads / My Deals / My Tasks）

## 15. 扩展与集成预留
- 集成：SAP ERP / 邮件 / 日历（首期仅接口与事件预留）
- 事件机制：Webhook / Outbox / 消息队列
- 文件与附件：报价/订单/工单附件（对象存储）
- 多币种与汇率（Exchange）：金额对象、币种与汇率表（后期实现）
- 工作流与定时任务（Workflow/Cron）：前端可配置（后期实现）

## 16. MVP 必做增强清单（推荐纳入 v1）
1) Outbox 事件机制
2) NumberRange 编号中心
3) PriceBook 最简实现
4) 部分/多次交付模型
5) 主数据去重与合并（BP）
6) RecordShare（跨组织共享）
7) 状态机 Guard + Side Effects
8) 自定义字段可查询策略

## 17. 里程碑（建议）
- M0: 需求细化 + 数据模型确认
- M1: 架构搭建 + 用户/权限
- M2: 线索 + 商机 + 客户/联系人
- M3: 报价单 + PriceBook + 产品
- M4: 订单 + 交付 + 工单
- M5: 审计/搜索/报表 + 集成预留

## 18. 第一阶段可执行任务拆解（M1/M2）
### M1 架构与基础能力
- 建仓与单体仓库结构：apps/web + apps/api + packages/shared
- 后端基础：NestJS 模块划分、Prisma schema、数据库迁移方案
- 认证与鉴权：JWT + Refresh Token、RBAC、页面权限表
- 多租户隔离：tenant_id 注入与中间件过滤
- 组织层级：OrgUnit 树结构 + 成员关系 + 组织范围查询
- 配置能力：流程/状态配置表 + 自定义字段定义表
- 事件机制：Outbox 表 + Worker 基础
- 编号中心：NumberRange 基础服务

### M2 业务对象第一批
- 线索 Lead（含状态流、分配、跟进）
- 商机 Opportunity（阶段、赢率、预测）
- Account/Contact（基于 BusinessPartner）
- Activity（跟进记录）
- 基础列表/详情/创建/编辑页面

## 19. 待细化清单（不阻塞开发）
- 审批流规则与策略
- Quote/Order/Ticket 字段细节（按 C4C 标准逐步对齐）
- 价格表/价目表（Price Book）
- 多币种/汇率模型（Exchange）
- 工作流/定时任务（Workflow/Cron）配置细节
- 邮件/日历集成（API 设计预留）
- 报表与预测分析模型

## 20. 待确认问题
1) 是否需要移动端或 PWA？
2) 报价单审批和订单审批流程是否复杂？
3) 是否需要和 SAP / ERP / 邮件系统集成？（首期先留接口）
4) 数据导入导出、权限颗粒度要求？
5) 你更偏好 Ant Design（企业管理风格）还是更现代的自定义 UI？
6) MVP 必做增强清单是否全部纳入首期？
7) PaymentSchedule/Invoice 是否仅建表（v1）？
8) 里程碑顺序是否保持当前版本？

---
下一步：你确认对象字段与权限范围后，我可以输出“表结构草图 + 接口清单 + 任务拆解”。
