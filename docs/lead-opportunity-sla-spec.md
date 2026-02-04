# 线索→商机（SLA/预警）独立说明

## 1. 表结构草图（核心字段摘要）

### 1.1 Lead
- 关联：`accountId?` `contactId?` `convertedOpportunityId?`
- 核心：`name` `status` `source` `rating?` `expectedValue?`
- 关系信息：`companyName` `contactName` `phone?` `email?`
- 跟进：`firstFollowUpDueAt` `lastActivityAt?` `nextFollowUpAt?`
- 转化：`disqualifyReason?` `disqualifyNote?`
- 审计：`tenantId` `orgUnitId?` `ownerId?` `createdAt` `updatedAt`

### 1.2 Opportunity
- 关联：`accountId` `contactId?` `leadId?`
- 核心：`name` `stage` `status` `amount?` `expectedCloseDate?` `probability?`
- 停滞：`lastStageChangedAt`
- 审计：`tenantId` `orgUnitId?` `ownerId?` `createdAt` `updatedAt`

### 1.3 Activity
- 关联：`relatedType` `relatedId`
- 核心：`type` `subject` `content` `outcome`
- SLA：`nextFollowUpAt?`（写回 Lead）
- 审计：`tenantId` `orgUnitId?` `ownerId?` `createdAt` `updatedAt`

### 1.4 Account / Contact
- 由 Lead 转化时自动生成并关联（至少 1 Contact）

---

## 2. 接口清单（本阶段）

### 2.1 Leads
- `GET /leads`
  - 支持：`q` `status` `ownerId` `orgUnitId` `overdueFirstFollowUp` `overdueNextFollowUp` `inactiveDays`
- `POST /leads`（创建）
- `POST /leads/draft`（创建草稿）
- `POST /leads/:id/submit`（提交草稿）
- `PATCH /leads/:id`（更新）
- `POST /leads/bulk/status`（含 dryRun）
- `GET /leads/:id`
- `DELETE /leads/:id`

### 2.2 Opportunities
- `GET /opportunities`
  - 支持：`q` `status` `ownerId` `orgUnitId` `staleDays`
- `POST /opportunities`
- `PATCH /opportunities/:id`
- `GET /opportunities/:id`
- `DELETE /opportunities/:id`

### 2.3 Activities
- `POST /activities`（写入 Lead 活动时回写 `lastActivityAt`/`nextFollowUpAt`）
- `GET /activities`

### 2.4 Alerts
- `GET /alerts/summary?inactiveDays=&staleDays=`
- `GET /alerts/settings`（获取生效阈值，按用户>组织>租户>默认）
- `PUT /alerts/settings`（配置阈值，支持 scopeType=USER/ORG_UNIT/TENANT）

---

## 3. 任务拆解（可执行）

### 3.1 前端实测验收
- Dashboard 预警汇总卡片数值一致性
- Leads 列表预警筛选 + 标签展示
- Opportunities 列表停滞筛选 + 标签展示

### 3.2 Bug 修复与回归
- 修复验收过程发现的问题
- 回归：Lead 更新/提交、活动写入、预警筛选一致性

### 3.3 可选增强（后续）
- 预警阈值可配置（组织/用户级）
- 预警汇总卡片支持点击跳转到对应筛选列表
- SLA 超时自动提醒（定时任务/消息）
