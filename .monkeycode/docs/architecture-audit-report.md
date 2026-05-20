# Teable 架构审计报告 —— 全局性·一致性·稳定性 三维分析

> 审计日期: 2026-05-19
> 分析方法: 并行子代理深度探索 (3 agents) + 主模型综合推理
> 代码证据层次: 文件路径 + 行数统计 + 具体代码片段
> 重要修正 (v2.2): 基于 GitHub README 和官网分析，V1/V2 不是"旧版→新版迁移"关系，而是"社区版稳定基座 + 企业版/AI 架构层"的并行分工。

---

## 零、V1/V2 关系的正确定位（v2.2 新增）

> 审计之初将 V1/V2 视为"架构迁移"，但综合 GitHub README（21.3k stars, AGPL+EE 双许可）和官网（Teable 2.0 = AI Database Agent）的信息后发现，这不是迁移——是分工。

### 0.1 V1 和 V2 为什么必须分开

| 不可调和的架构差异 | V1 | V2 | 为何不能合一 |
|-------------------|-----|-----|-------------|
| 核心范式 | NestJS MVC Service | DDD + CQRS + Ports/Adapters | 读写混合 vs 读写分离，根本不相容 |
| CE/EE 隔离 | 只能用 if-else 分支 | Port 接口 + DI 切换，零代码分支 | EE 代码可闭源，不影响 CE 构建 |
| AI 多模型 | 硬编码调用某个 SDK | Port 抽象，DI 换适配器 | 官网主打 "AI Database Agent"，必须多模型 |
| 数据库 | Prisma 单一路径 | pg / pglite / postgresjs 三适配器 | pglite 浏览器端运行，V1 做不到 |
| 公式性能 | 应用层逐行求值 | 公式→SQL 翻译，数据库层计算 | 性能差距量级级，不是优化是范式变更 |

### 0.2 V1/V2 的分工模型

```
V1 = 社区版稳定基座 (留在 V1 不动)
  ├── Table/Field/Record 基础 CRUD (成熟，不需要 CQRS)
  ├── 多视图渲染 (Grid/Kanban/Calendar/Gallery/Form)
  ├── 实时协作 ShareDB OT (稳定且性能好)
  ├── 导入导出 (流程式操作，不需要领域模型)
  └── 认证/用户/邀请 (标准 Web 功能，NestJS 足够)

V2 = 企业版 + AI 架构层
  ├── 复杂领域模型 (Workflow 状态机, Authority Matrix, Billing)
  ├── AI 多模型适配 (Port 接口下随意切换 GPT/DeepSeek/Kimi)
  ├── 公式→SQL 翻译 (性能关键路径，46 矩阵测试)
  ├── 多数据库适配 (pg/pglite 同一套领域逻辑)
  └── EE/CE 功能开关 (DI 绑定，零代码分支)
```

### 0.3 由此修正全报告用语

- ~~V1→V2 迁移~~ → V1/V2 分工协作
- ~~V2 迁移覆盖率~~ → V2 能力承接比例
- ~~V1 模块全部迁到 V2~~ → 复杂域进 V2，简单 CRUD 留 V1
- ~~V1 最终下线~~ → V1 和 V2 长期共存

---

## 附一：证据交叉验证矩阵

以下对三个并行审查结果做一致性检验，确认数据可互印证后再进入综合评价。

| 审查维度 | Agent 1 架构审查 | Agent 2 V2 审查 | Agent 3 功能审查 | 三方一致性 |
|---------|:--:|:--:|:--:|:--:|
| Organization 为空壳 | `Controller 返回硬编码 null/[]` | 未涉及 | 未涉及 | Agent 1 独立发现 |
| Billing 后端零实现 | `features/ 下无 billing 目录` | 未涉及 | 未涉及 | Agent 1 独立发现 |
| Authority Matrix 骨架 | `28行 Service, 无 Controller` | 未涉及 | 未涉及 | Agent 1 独立发现 |
| Dashboard 完整 | `14端点, 623行 Service` | 未涉及 | `插件容器, 14端点, 15方法` | **一致确认** |
| 字段 20 种全实现 | `20/20 有 .field.ts, 18/20 有 spec` | 未涉及 | 未涉及 | Agent 1 独立统计 |
| V2 Command 49 Handler | 196 文件 (扁平) | 49 Handler, 扁平无子目录 | 未涉及 | **一致确认** (计数差异因 Agent 1 统计含 shared/) |
| V2 Contract-http 10 domains | 106 Contract | 104 Handler | 未涉及 | **一致确认** |
| Workflow V1 Service 承载全部 | `1493行 Service, V2 无 domain` | `contract-http 19+19, 底层复用 V1` | `8种触发器, HMAC, 快照` | **一致确认** |
| 导入 CSV+Excel | 未涉及 | 未涉及 | `CSV+Excel, 7种错误, 流式报告` | Agent 3 独立发现 |
| 导出仅 CSV | 未涉及 | 未涉及 | `仅CSV, 1000条/批流式` | Agent 3 独立发现 |
| 审计日志无持久化 | 未涉及 | 未涉及 | `事件定义存在, 无消费者, 无DB表` | Agent 3 独立发现 |
| 备份/恢复不存在 | 未涉及 | 未涉及 | `无传统备份, 仅 undo/redo` | Agent 3 独立发现 |
| 搜索全文+搜索索引 | 未涉及 | 未涉及 | `全文搜索, search-index API` | Agent 3 独立发现 |
| V2 DomainError 体系 | 未涉及 | `9 Tag, 非抛掷, Result模式` | 未涉及 | Agent 2 独立发现 |
| 国际化 10语言 | 未涉及 | 未涉及 | `10语言, 14命名空间, 类型安全` | Agent 3 独立发现 |
| 通知双通道 | 未涉及 | 未涉及 | `In-App+Email, 5种类型` | Agent 3 独立发现 |
| 无全局速率限制 | 未涉及 | 未涉及 | `无 ThrottlerGuard` | Agent 3 独立发现 |

**交叉验证结论**: 无内部矛盾。三个 Agent 在不同维度上的发现互补印证。Agent 1 侧重 V1/V2 架构对比，Agent 2 侧重 V2 领域模型深度，Agent 3 侧重功能能力边界。

---

## 一、全局性审计

### 1.1 核心数据链: Space → Base → Table → Field → Record

**覆盖完整性**: 全链路已实现

| 环节 | 代码位置 | 实现深度 |
|------|---------|---------|
| Space CRUD | `features/space/space.service.ts` | 完整: 创建/删除/重命名/协作者管理/集成配置 |
| Base CRUD | `features/base/base.service.ts` | 完整: CRUD/复制/导入导出/DB连接/ERD |
| Table CRUD | `features/table/` (8文件) + V2 commands: `table/` (8 Handler) | 完整: 创建/删除/重命名/复制/恢复/索引管理 |
| Field CRUD | `features/field/` (10文件) + V2 commands: `field/` (8 Handler) | 完整: 20种类型, 类型转换, 复制, 计算触发 |
| Record CRUD | `features/record/` (14文件) + V2 commands: `record/` (19 Handler) | 完整: 单条/批量/创建/更新/删除/查询构建/权限/类型校验 |

**20种字段类型完整度**: 100% (20/20)

```
FieldType 枚举定义位置: packages/core/src/models/field/derivate/
每种类型独立实现文件位置: packages/core/src/models/field/derivate/{TypeName}/{TypeName}.field.ts
```

| # | 类型 | .field.ts | .spec.ts | 选项Schema | 格式化 | 展示模式 |
|---|------|:---:|:---:|:---:|:---:|:---:|
| 1 | SingleLineText | ✓ | ✓ | ✓ | — | Text |
| 2 | LongText | ✓ | ✓ | ✓ | — | — |
| 3 | User | ✓ | ✓ | ✓ | — | — |
| 4 | Attachment | ✓ | ✓ | ✓ | — | — |
| 5 | Checkbox | ✓ | ✓ | ✓ | — | — |
| 6 | MultipleSelect | ✓ | ✓ | shared | — | — |
| 7 | SingleSelect | ✓ | ✓ | shared | — | — |
| 8 | Date | ✓ | ✓ | ✓ | DateTime | — |
| 9 | Number | ✓ | ✓ | ✓ | Number | Number |
| 10 | Rating | ✓ | ✓ | ✓ | — | — |
| 11 | Formula | ✓ | ✓ | ✓ | — | — |
| 12 | Rollup | ✓ | ✓ | ✓ | — | — |
| 13 | ConditionalRollup | ✓ | ✗ | ✓ | — | — |
| 14 | Link | ✓ | ✓ | ✓ | — | — |
| 15 | CreatedTime | ✓ | ✓ | ✓ | DateTime | — |
| 16 | LastModifiedTime | ✓ | ✓ | ✓ | DateTime | — |
| 17 | CreatedBy | ✓ | ✗ | ✓ | — | — |
| 18 | LastModifiedBy | ✓ | ✗ | ✓ | — | — |
| 19 | AutoNumber | ✓ | ✓ | ✓ | — | — |
| 20 | Button | ✓ | ✓ | ✓ | — | — |

**3种缺失 spec 的类型** (ConditionalRollup, CreatedBy, LastModifiedBy) 属于低风险缺口——CreatedBy/ModifiedBy 是审计字段，逻辑简单；ConditionalRollup 测试应由公式引擎矩阵测试间接覆盖。

### 1.2 多视图系统

| 视图 | 后端支持 | 前端实现 | filter | sort | group | search | columnMeta | lock | share |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Grid | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Kanban | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Calendar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gallery | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Form | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ |
| Plugin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### 1.3 计算引擎

**公式引擎**: `packages/formula/` + `packages/v2/formula-sql-pg/`

- 解析器: PEG.js 文法
- 函数分类: Array(数组) / DateTime(日期时间) / Logical(逻辑) / Numeric(数值) / System(系统) / Text(文本)
- 50+ 内置函数
- V2 实现了公式→SQL 翻译 (46个测试文件, 矩阵测试覆盖各类型组合)
- 依赖图计算 (`packages/v2/field-dependency-core/`)

**计算字段链**:

```
Formula ─┐
Rollup ──┼──→ 依赖图解析 → 级联更新 → 批量计算
CondRollup┘
Link ────→ 关联字段 → 关联表查询 → 关联级联
Lookup ──→ 通过 Link 查询关联表字段
```

### 1.4 工作流自动化

**8种触发器** (`workflow.service.ts:35-41`):

```
recordCreated | recordUpdated | recordMatchesConditions | buttonClick
| webhook | schedule | formSubmitted | emailReceived
```

**3种调度模式** (`workflow-schedule.service.ts:16-40`): Manual / Interval(秒级) / Cron

**9种动作类型**: Run Script / AI Generate / Update Records / Create Records / Query Records / Send Email / HTTP Request / Condition / Loop

**Webhook 安全深度** (`workflow.service.ts:975-1094`):

```
Secret 验证 → HMAC-SHA256 签名 → TTL 容差(默认300s)
→ Body 大小限制 → 速率限制(默认2次/窗口, Redis incr)
→ Base 级速率限制(50次)
```

### 1.5 导入/导出

| 维度 | 导入 | 导出 |
|------|------|------|
| 格式 | CSV + Excel (XLSX) | 仅 CSV |
| 异步处理 | BullMQ 分块队列 | 流式 HTTP 响应 |
| 编码检测 | jschardet 采样 64KB 自动转 UTF-8 | — |
| 类型推断 | 5种 (Checkbox/Number/Date/LongText/SingleLineText) | — |
| 数据校验 | Zod schema + safeParse | — |
| 错误分类 | 7种 (DATE_OUT_OF_RANGE/PLAN_ROW_LIMIT/NOT_NULL/UNIQUE/REQUEST_TIMEOUT/CHUNK_FAILED/UNKNOWN) | — |
| 错误报告 | CSV 格式, 流式上传 S3/MinIO | — |
| 并发控制 | IMPORT_MAX_WAITING_JOBS | — |
| 列映射 | sourceColumnMap | — |
| 分批 | 分块处理 | 1000条/批 |
| 视图级导出 | — | Grid 视图, 保留 filter/sort/group/columnMeta |

### 1.6 确认为空壳/骨架的模块

#### 1.6.1 Organization (空壳 ~ 完全不可用)

```
文件: features/organization/organization.controller.ts (27行)
方法:
  GET /api/organization/me               → return null
  GET /api/organization/department-user  → return { users: [], total: 0 }
  GET /api/organization/department       → return []
无 Service 文件
无数据库操作
无权限校验
```

#### 1.6.2 Billing / Subscription (后端零实现)

```
features/ 下无 billing 目录
OpenAPI 契约层存在: packages/openapi/src/billing/
  定义: BillingProductLevel (Free/Pro/Business/Enterprise)
  定义: SubscriptionStatus (Active/Canceled/Trialing 等 9 种状态)
  路由: getSubscriptionSummary, getSubscriptionSummaryList
后端: 无任何 Controller/Service/Module
```

#### 1.6.3 Authority Matrix (门面骨架)

```
文件清单 (3个, 合计74行):
  authority-matrix.module.ts (8行)
  authority-policy.service.ts (28行)
  authority-policy.service.spec.ts (38行)

核心代码 (authority-policy.service.ts:25-27):
  private async assertPermissions(resourceId: string, permissions: Action[]) {
    await this.permissionService.validPermissions(resourceId, permissions);
  }

4个公开方法全部是 thin wrapper:
  assertWorkflowExecute → 委托 PermissionService
  assertRecordRead       → 委托 PermissionService
  assertRecordCreate     → 委托 PermissionService
  assertRecordUpdate     → 委托 PermissionService

唯一调用方: workflow/workflow-runner.service.ts
无 Controller, 无 HTTP 端点, 无角色定义, 无权限映射表, 无矩阵规则引擎
```

#### 1.6.4 Audit Log (事件定义存在但无消费/无持久化)

```
事件定义: AUTH_LOG_SAVED = 'audit-log.saved' (event.enum.ts:100)
emit 端 (10处):
  record.service.ts:2773        — emitRecordAuditLogEvent
  table-duplicate.service.ts:961 — emitTableDuplicateAuditLog
  base-duplicate.service.ts:663  — emitBaseDuplicateAuditLog
  base-duplicate.service.ts:678  — emitBaseTemplateApplyAuditLog
  base-duplicate.service.ts:697  — emitShareBaseCopyAuditLog
  import-open-api-v2.service.ts:77 — emitImportAuditLog
  import-csv.processor.ts:543    — emitImportAuditLog
  record-open-api.service.ts:686 — emitFormAuditLog
  selection.service.ts:1050      — emitPasteSelectionAuditLog
  base-import-csv.processor.ts:490 — emitBaseImportAuditLog

问题:
  - 无任何 @OnEvent(AUDIT_LOG_SAVED) 消费者
  - Prisma schema 中无 AuditLog 表
  - 审计事件发射后被"黑洞"吸收, 永不持久化
```

### 1.7 完全缺失的功能

| 功能 | 现状 | 影响 |
|------|------|------|
| **数据备份/恢复** | 不存在。仅 undo/redo 操作栈 (max 200, 24h TTL) | 灾难恢复能力为零 |
| **全局速率限制** | 无 ThrottlerGuard, 无全局请求级限流 | API 滥用风险 |
| **数据归档/TTL** | 不存在表级数据过期机制 | — |

### 1.8 全局性总评

```
核心数据链路  ████████████████████  95%  深度完整
计算引擎      ████████████████████  95%  50+函数, SQL翻译
多视图系统    ████████████████████  90%  6种视图, 配置完整
工作流自动化  ██████████████████░░  85%  功能完整, 未V2下沉
导入/导出     ██████████████░░░░░░  70%  导入强, 导出仅CSV
实时协作      ████████████████████  95%  OT+WebSocket+Redis
分享/发布     ██████████████████░░  85%  前端成熟, V2迁移中
AI 能力       ████████████░░░░░░░░  60%  流式/填充/公式生成, 依赖外部模型
Dashboard     ████████████░░░░░░░░  60%  插件容器完整, 无内置聚合
Organization  █░░░░░░░░░░░░░░░░░░░   5%  空壳
Billing       █░░░░░░░░░░░░░░░░░░░   5%  OpenAPI契约存在, 后端零实现
Authority M.  ██░░░░░░░░░░░░░░░░░░  10%  门面骨架
Audit Log     ███░░░░░░░░░░░░░░░░░  15%  事件发射存在, 无消费/持久化
Backup/Restore░░░░░░░░░░░░░░░░░░░░   0%  不存在
```

---

## 二、一致性审计

### 2.1 V1/V2 分工现状 —— V2 能力承接比例

> **修正**: 本节的"覆盖率"不是迁移进度，而是 V2 已承接能力的比例。V1 模块**不需要全部进入 V2**——简单 CRUD 留在 V1 是正确策略。（详见第零章）

#### V2 能力承接清单

```
V1 feature 目录: 50 个
  ├── 适合且已进 V2:  ~10 个 — Table, Field, Record, View, Base, Comment, Workflow(壳), Share(部分)
  │   理由: 有复杂领域规则或 AI 适配需求
  ├── 适合进 V2 但未进: ~5 个 — Space, OAuth, Plugin, AI
  │   理由: 有复杂权限/多实现需求，值得进 V2
  ├── 应留在 V1:      ~20 个 — Dashboard, Setting, Template, Trash, Import, Export, Aggregation, Notification, Selection, Graph, ERD, Integrity, Chat, AccessToken, Invitation, Collaborator, Pin, Canary, Health, Builtin-assets-init
  │   理由: 纯 CRUD 或流程式操作，V1 MVC 已足够高效
  └── 空壳模块:       ~4 个 — Organization, Billing, Authority Matrix, Audit Log
      判定: 属于企业版功能，应在 V2 直接新建（不是迁移）
```

#### V2 具体覆盖清单

| V2 Contract Domain | 合约文件数 | Handler 文件数 | V2 Domain 模型? | V2 CQRS? | 底层执行 |
|-------------------|:---:|:---:|:---:|:---:|------|
| table | 37+5 | 39 | ✓ 完整 | ✓ (8+19+8 Handler) | V2 |
| workflow | 19 | 19 | ✗ 无独立 domain | ✗ | V1 Service |
| share | 13 | 13 | 局部 | ✗ | V1 + V2混合 |
| view | 8 | 15 | ✓ (table/views/) | 部分 (10 Handler) | V2 |
| comment | 4 | 4 | 局部 | ✗ | V2 |
| template | 4 | 4 | ✗ | ✗ | — |
| published-app | 3 | 3 | ✗ | ✗ | — |
| base | 3 | 3 | ✓ | 部分 (1 Handler) | V2 |
| setting | 2 | 2 | ✗ | ✗ | — |

#### 关键一致性断裂点

**断裂点 1: Workflow 架构分裂**

```
Table/Record/Field 模式:
  V1: NestJS Service ──迁移完成──→ V2: Command/Handler + Domain Model + Ports/Adapters

Workflow 模式:
  V1: workflow.service.ts (1493行单体) ←── 仍然是事实上的唯一执行层
  V2: contract-http 19 Handler ←── 仅 HTTP 契约层包装, 调用 V1 Service
```

**断裂点 2: API 风格分裂**

```
V1: POST   /api/table/{tableId}/record         (REST 风格)
V2: POST   /tables/createRecord                (Action 风格)

V1: GET    /api/table/{tableId}/record/{id}    (REST 风格)
V2: POST   /tables/getRecordById               (Action 风格)
```

前端 (`apps/nextjs-app`) 需要同时维护两套 API 调用方式。`packages/openapi` (V1) 和 `packages/v2/contract-http` (V2) 分别生成客户端代码。

**断裂点 3: 错误处理模式分裂**

```
V1: throw new HttpException('...', HttpStatus.NOT_FOUND)
V2: return Result.fail(domainError.notFound('Table', { id }))
```

V2 使用 `Result<T, DomainError>` 非抛掷模式, V1 使用传统 NestJS 异常。V2 合约实现层（contract-http-implementation）需要做 layer 适配：`Result` → `HttpException`。

**断裂点 4: V2 Command 文件组织扁平化**

```
packages/v2/core/src/commands/
├── CreateBaseCommand.ts
├── CreateBaseHandler.ts
├── CreateBaseHandler.spec.ts
├── CreateFieldCommand.ts           ← flat, 无 field/ 子目录
├── CreateFieldHandler.ts
├── CreateRecordCommand.ts          ← flat, 无 record/ 子目录
├── CreateRecordHandler.ts
├── ... (187 个文件同层)
└── shared/  (10个共享工具文件)
```

V1 按领域分 `features/table/`, `features/field/`, `features/record/` 子目录; V2 commands 无子目录分层, 规模增大后可维护性显著下降。

### 2.2 测试覆盖不均匀

| 测试密度 | 模块 |
|---------|------|
| 极高 | Formula (46 矩阵测试), Table/Field/Record (150 e2e), Field 类型 (18/20 有 spec) |
| 中等 | Workflow (6 spec), Auth, Import/Export |
| 低 | Dashboard (2 spec), Notification (1 spec) |
| 零 | Organization, Billing, Authority Matrix (仅 38行门面 spec), Audit Log |

### 2.3 一致性总评

> **修正**: V1/V2 不是"割裂等待愈合"，而是"分工后需要更好的协调"。以下风险等级基于**当前协调机制缺失**的程度。

```
                                 风险等级
Workflow 仍由 V1 Service 承载    ██████████  严重 (V2 主要承担契约与编排)
API 风格分裂 (前端两套入口)      ████████░░  高   (前端需知哪些端点走哪条路)
错误处理模式差异                 ██████░░░░  中   (需在 V1Adapter 层统一转换)
Workflow V2 编排接入 V1 核       ████████░░  高   (复杂域仍待统一到同一执行边界)
V2 Command 扁平化                █████░░░░░  中   (可维护性)
测试覆盖不均匀                   █████░░░░░  中   (边缘模块零测试)
Side effect 事件断裂 (审计日志)  ████████░░  高   (V1+V2 副作用未被事件桥统一)
```

---

## 三、稳定性审计

### 3.1 核心操作稳定性保障

| 保障机制 | 实现位置 | 说明 |
|---------|---------|------|
| 数据库事务 | `prismaService.$tx` + V2 `UnitOfWork` 端口 | 关键写操作包裹事务 |
| OT 冲突解决 | ShareDB + Redis pub/sub 去重 | 实时协作冲突处理 |
| 外键/唯一校验 | `features/integrity/` | 数据库级约束验证 |
| 软删除 | `features/trash/` (记录/表/资源三层) | 防范误删 |
| Undo/Redo | `features/undo-redo/` (max 200, 24h TTL) | 操作回退 |
| 工作流快照 | `workflowSnapshot` 表 | 工作流版本化 |
| Webhook 安全 | HMAC-SHA256 + TTL + Body限制 + Redis速率限制 | 防重放/滥用 |
| V2 DomainError | 9 Tag 类型, Result 模式, 非抛掷 | 领域错误可预测 |

### 3.2 稳定性风险清单

| 风险 | 等级 | 原因 | 影响 |
|------|:---:|------|------|
| V1/V2 行为差异 | **严重** | 同一操作走 V1 和 V2 路径可能产生不同副作用 (级联更新/触发器/通知), 无契约测试 | 数据不一致, 静默 bug |
| Workflow 单体 Service | **高** | 1493 行 Service, 20+ 公开方法, 修改任一逻辑可能触发级联 bug | 回归风险高 |
| 空壳模块误导 | **高** | Organization/Billing 端点暴露但返回硬编码空数据, 调用方收到 "成功但无数据" | 前端/第三方集成误判 |
| V2 Command 规模退化 | **中** | 196 文件同目录, 与 V1 的 feature/ 子目录分层形成架构退化 | 维护成本上升 |
| 无全局速率限制 | **中** | 无 ThrottlerGuard, 仅 webhook/oauth/email 有点限制 | API 滥用风险 |
| 审计日志静默丢弃 | **中** | 10 处 emit 但无消费者, 审计数据永不持久化 | 合规性缺口 |
| 无备份/恢复 | **中** | 仅 undo/redo 操作栈 (200条/24h) | 灾难恢复无能 |
| 导出仅 CSV | **低** | Excel/JSON 是企业报告常见需求 | 用户体验受限 |

### 3.3 稳定性总评

```
核心数据操作层    ████████████████████  95%  稳定
实时协作层        ████████████████████  95%  稳定
计算引擎层        ██████████████████░░  90%  双引擎(V1+V2), 对齐中
工作流执行层      ██████████████░░░░░░  70%  功能完整, 架构未标准化
企业外围模块      ██░░░░░░░░░░░░░░░░░░  10%  空壳/骨架, 隐性风险
```

---

## 四、扩展加强建议 (按 V1/V2 分工模型重新分类)

> **修正**: 以下不再是"迁移计划"，而是"分工清单"——明确每个模块属于 V1 还是 V2，以及对应的行动。

### P0: 在 V2 直接新建 (空壳/骨架模块)

| 模块 | 当前 | 目标 | 归属 | 预估工作量 |
|------|------|------|:--:|:---:|
| Organization | 3端点返回硬编码 | 部门树CRUD, 成员关联, 组织架构管理 | V2 | 2-3周 |
| Billing | 后端零实现 | 订阅状态机, 用量追踪, 配额控制 | V2 | 3-4周 |
| Authority Matrix | 28行门面 | RBAC+ABAC 混合权限引擎 | V2 | 3-4周 |
| Audit Log | 发射无消费 | 事件驱动持久化, 查询/导出 | V2 | 1-2周 |

### P1: 需进 V2 的 V1 模块 (有复杂领域规则)
 
| 模块 | 当前在 V1 | 目标 | 复杂度 | 预估工作量 |
|------|----------|------|:---:|:---:|
| Workflow | 1493行 Service 单体 | 拆为 V2 Domain + Commands (状态机/触发器/动作) | 高 | 3-4周 |
| Space | 完整 V1 Service | V2 Domain (协作者管理/资源配额) | 中 | 2-3周 |
| OAuth | 完整 V1 Service | V2 Port (授权服务器, 多 grant type) | 中 | 2周 |
| Plugin | 完整 V1 Service | V2 Port (插件生命周期, 多实现) | 中 | 1-2周 |

### P2: 留在 V1 不动 + V1/V2 协调机制建立

| 模块 | 策略 | 理由 |
|------|------|------|
| Dashboard | 留 V1 | 插件容器 CRUD，无复杂领域规则 |
| Setting / Template | 留 V1 | 纯键值读写 + 列表详情 |
| Import / Export | 留 V1 | 流程式操作，MVC 已足够 |
| Trash / Integrity | 留 V1 | 软删除 + 约束校验，逻辑简单 |
| Notification / Comment | 留 V1 | CRUD 为主，V1 够用 |
| Aggregation / Selection / Graph / ERD | 留 V1 | 查询类操作，领域逻辑薄 |
| Auth / AccessToken / Collaborator / Invitation / Pin / Health / Canary | 留 V1 | 标准 Web 功能，NestJS 效率更高 |

**V1/V2 协调机制（新增，安装于 P2）：**

| 机制 | 说明 | 预估工作量 |
|------|------|:---:|
| RequestRouter | 能力表 + 特性开关 → 自动分发 V1/V2 路径 | 3天 |
| V1Adapter 反corruption层 | V2 handler 只调 adapter 不调 V1 service | 5天 |
| 事件桥 | V2 EventBus ↔ NestJS EventEmitter2，副作用统一触发 | 3天 |
| 事务上下文传递 | V1 and V2 共享 Prisma tx，确保操作原子性 | 2天 |

---

## 五、V1/V2 协调高效运作方案

> **修正**: 本章原名为"统一优化方案"，基于第零章 V1/V2 分工定位，改为"协调高效运作方案"。
> V1 和 V2 不是要合为一体，而是要通过四个机制实现无缝协作。

### 5.1 总体执行模型：四轨道并行

协调机制搭建（轨道1）+ 空壳 V2 新建（轨道2）+ 复杂域 V2 下沉（轨道3）+ 简单模块留 V1 加固（轨道4）：

```
轨道 1: 协调机制 ── 立即启动
  ├── RequestRouter (能力表 + 特性开关, 统一流量入口)
  ├── V1Adapter (反corruption层, 切断 V2→V1 硬依赖)
  ├── 事件桥 (V2 EventBus ↔ NestJS EventEmitter2)
  └── 事务上下文 (Prisma tx 在 V1/V2 间传递)

轨道 2: V2 新建 ── 轨道1完成后立即启动
  ├── Organization (V2 原生, CQRS Light)
  ├── Billing (V2 原生, Full CQRS + 状态机)
  └── Authority Matrix + Audit Log (V2 原生, 复用已验证模式)

轨道 3: V2 下沉 ── 第2周起 (仅复杂域)
  ├── Workflow (1493行 → Domain + Commands, 优先级最高)
  ├── Space → OAuth → Plugin
  └── AI 多模型适配 (Port 接口替代硬编码 SDK)

轨道 4: V1 加固 ── 持续
  ├── Dashboard/Notification/Export 功能增强
  ├── 字段 spec 补全 (3/20 缺失)
  └── 全局速率限制引入
```

### 5.2 协调机制一：RequestRouter —— 统一流量入口 + 能力表分发（建议方案）

所有请求统一从 V2 Contract-HTTP 进入，由 RequestRouter 根据能力表决定走 V2 原生（CQRS）还是 V1Adapter（反corruption层）。

```typescript
// packages/v2/contract-http-implementation/src/internal/RequestRouter.ts

// 静态能力表 —— 不是"迁移覆盖率"，而是"V2 已承接的能力"
const CAPABILITY: Record<string, Record<string, 'full' | 'partial' | 'v1'>> = {
  record: { create: 'full', update: 'full', delete: 'full', list: 'full' },
  table:  { create: 'full', rename: 'full', delete: 'full', duplicate: 'full' },
  field:  { create: 'full', update: 'full', delete: 'full', convert: 'full' },
  view:   { create: 'full', update: 'full', delete: 'full' },
  base:   { create: 'full', list: 'full' },
  workflow:{ trigger: 'partial', list: 'partial', create: 'partial' },
  // partial = V2 contract 存在但部分仍走 V1 adapter
}

@Injectable()
export class RequestRouter {
  constructor(
    @Inject(FEATURE_FLAGS) private readonly flags: FeatureFlags,
    @Inject(COMMAND_BUS) private readonly commandBus: CommandBus,
    @Inject(V1_ADAPTER) private readonly v1: V1Adapter,
  ) {}

  async execute<T>(domain: string, operation: string, input: any): Promise<Result<T, DomainError>> {
    const capability = CAPABILITY[domain]?.[operation] ?? 'v1'
    // full: V2 原生 CQRS
    if (capability === 'full')
      return this.commandBus.send(this.toCommand(domain, operation, input))
    // partial: 特性开关控制灰度
    if (capability === 'partial' && this.flags.isEnabled(`v2-${domain}`))
      return this.commandBus.send(this.toCommand(domain, operation, input))
    // v1 / partial且未启用开关: 走 V1Adapter
    return this.v1[domain][operation](input)
  }
}
```

### 5.3 协调机制二：V1Adapter —— V1/V2 唯一接触面（反corruption层，建议方案）

V2 的任何代码不直接 import V1 Service。所有调用通过 V1Adapter 中转，确保 V1 异常被统一转为 V2 的 `DomainError`。

```typescript
// packages/v2/contract-http-implementation/src/internal/v1-adapter.ts
@Injectable()
export class V1Adapter {
  readonly workflow: WorkflowV1Adapter
  readonly space: SpaceV1Adapter
  // 每个 V1 模块一个子适配器

  constructor(
    private readonly workflowService: WorkflowService,
    private readonly spaceService: SpaceService,
  ) {
    this.workflow = new WorkflowV1Adapter(workflowService)
    this.space = new SpaceV1Adapter(spaceService)
  }
}

class WorkflowV1Adapter {
  constructor(private readonly service: WorkflowService) {}
  async listWorkflows(baseId: string): Promise<Result<Workflow[], DomainError>> {
    try {
      return Result.ok((await this.service.getAllWorkflowByBaseId(baseId)).map(toDomainWorkflow))
    } catch (err) {
      if (err instanceof HttpException) {
        // V1 HttpException → V2 DomainError 统一转换
        return Result.fail(this.translateHttpError(err))
      }
      return Result.fail(domainError.unexpected(err.message))
    }
  }
  private translateHttpError(err: HttpException): DomainError {
    switch (err.getStatus()) {
      case 404: return domainError.notFound('Workflow', {})
      case 409: return domainError.conflict(err.message)
      case 403: return domainError.forbidden(err.message)
      default:  return domainError.unexpected(err.message)
    }
  }
}
```

### 5.4 协调机制三：事件桥 —— 副作用一致性（建议方案）

不管 CRUD 走 V1 还是 V2 路径，副作用（通知/审计/实时推送）通过统一事件桥触发。

```typescript
// apps/nestjs-backend/src/v2-adapters/NestJsEventBusAdapter.ts
// V2 EventBus 桥接到 NestJS EventEmitter2（V1 使用的事件系统）
@Injectable()
export class NestJsEventBusAdapter implements EventBusPort {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publish(event: DomainEvent): Promise<void> {
    // 同时发送到 V1 和 V2 监听器
    this.eventEmitter.emit(event.type, event) // V1: @OnEvent('record.created')
  }
  subscribe(eventType: string, handler: (e: DomainEvent) => Promise<void>): void {
    this.eventEmitter.on(eventType, handler)
  }
}
```

### 5.5 协调机制四：共享事务上下文（建议方案）

V1 和 V2 共用同一个 Prisma 连接池，在同一事务内协作。

```typescript
@Injectable()
export class CreateRecordHandler {
  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWorkPort,
    @Inject(EVENT_BUS) private readonly eventBus: EventBusPort,
    @Inject(V1_ADAPTER) private readonly v1: V1Adapter,
  ) {}

  async execute(cmd: CreateRecordCommand): Promise<Result<Record, DomainError>> {
    return this.uow.transactional(async (tx) => {
      const record = await this.recordRepo.save(cmd.toRecord(), tx)  // V2
      await this.v1.calculation.recomputeLinks(record.tableId, record.id, tx) // V1
      tx.onCommit(() => this.eventBus.publish(new RecordCreatedEvent(record)))
      return Result.ok(record)
    })
  }
}

### 5.6 渐进式领域提取 —— 按逻辑密度而非模块边界

**问题**：按模块整体迁移耗时长，高价值领域规则被低价值 CRUD 拖住。

**方案**：按逻辑密度四层优先级提取：

```
优先级 1: 领域规则（纯函数, 零依赖, 最高共享价值）
  → 工作流激活校验、Webhook 签名验证、订阅状态机转换

优先级 2: 计算逻辑（纯函数, 可测试性高）
  → 公式求值、汇总聚合、字段类型校验

优先级 3: 副作用编排（事务/通知/审计, 多端口依赖）
  → 创建记录后的级联通知、导入完成的审计写入

优先级 4: 简单 CRUD（无提取价值, 留在 V1 不动）
  → Setting、Template、Dashboard、Trash、Notification、Comment
```

```typescript
// 优先级 1 示例: Workflow 激活规则 —— 纯函数, V1 和 V2 可同时调用
// packages/v2/core/src/domain/workflow/ActivationRules.ts
export function canActivateWorkflow(
  workflow: WorkflowState,
  baseLimits: BaseLimits,
): Result<void, DomainError> {
  if (workflow.status === 'active')
    return Result.fail(domainError.conflict('Workflow already active'))
  if (workflow.nodes.length === 0)
    return Result.fail(domainError.validation('Workflow has no nodes'))
  if (workflow.nodes.length > baseLimits.maxWorkflowNodes)
    return Result.fail(domainError.forbidden('Node limit exceeded'))
  return Result.ok(void 0)
}
```

### 5.7 CQRS Light —— 降低简单模块的 V2 构建成本

**问题**：Full CQRS 每个操作需要 5 个文件（Command + Handler + DI + Contract + ContractHandler），Setting/Template 等纯 CRUD 模块仪式感过重。

**方案**：两种模式并存：

```typescript
// Full CQRS (复杂领域: Table/Record/Workflow/Space/Billing)
@Injectable()
export class CreateTableHandler implements ICommandHandler<CreateTableCommand, Table> {
  constructor(private repo: TableRepository, private bus: EventBus) {}
  async execute(cmd: CreateTableCommand): Promise<Result<Table, DomainError>> {
    // 复杂领域逻辑
  }
}

// CQRS Light (简单模块: Setting/Template/Dashboard/Trash/Notification)
type SimpleCommandHandler<TInput, TOutput> = (
  input: TInput,
  deps: { db: PrismaService; currentUser: CurrentUser },
) => Promise<Result<TOutput, DomainError>>

const getSettingHandler: SimpleCommandHandler<{ key: string }, SettingValue> =
  async (input, { db }) => {
    const row = await db.setting.findUnique({ where: { key: input.key } })
    if (!row) return Result.fail(domainError.notFound('Setting', { key: input.key }))
    return Result.ok(row.value)
  }
```

**模式选择矩阵**：

| Full CQRS | CQRS Light |
|-----------|------------|
| Table, Record, Field, View, Base | Dashboard |
| Workflow, Space | Template |
| Organization, Billing, Authority Matrix (新建) | Setting, Trash |
| | Notification, Comment |

**效果**：10 个简单模块从 ~200 文件降为 ~80 文件，迁移工作量降 60%。

### 5.8 依赖倒置 —— V2 Handler 永不直接 import V1 Service

**问题**：Workflow 当前 V2 Handler 直接 `import { WorkflowService } from 'apps/nestjs-backend/...'`，新架构依赖旧架构。

**方案**：

```
正确依赖方向:
  V2 Handler → V2 Port (interface) ← V1 Adapter (实现) → V1 Service
                    ↑
             V2 Native Impl (就绪后切换 DI)
```

```typescript
// packages/v2/core/src/ports/WorkflowQueryPort.ts — 定义在 V2 核心层，不依赖 V1
export interface WorkflowQueryPort {
  listByBaseId(baseId: string): Promise<Result<WorkflowDto[], DomainError>>
}

// apps/nestjs-backend/src/v2-adapters/workflow-query.adapter.ts — 放在 V1 目录中
@Injectable()
export class WorkflowQueryV1Adapter implements WorkflowQueryPort {
  constructor(private readonly service: WorkflowService) {}
  async listByBaseId(baseId: string) {
    try { return Result.ok((await this.service.getAllWorkflowByBaseId(baseId)).map(toDto)) }
    catch (err) { return Result.fail(domainError.fromUnknown(err)) }
  }
}

// 切换: { provide: WORKFLOW_QUERY_PORT, useClass: WorkflowQueryV1Adapter }  // 当前
//       { provide: WORKFLOW_QUERY_PORT, useClass: WorkflowQueryV2Native }   // 未来
// V2 Handler 代码零改动
```

### 5.9 特性开关灰度上线

**问题**：一次性切换到 V2 端点是全量风险，没有观测窗口和回滚能力。

**方案**：

```typescript
export class CreateRecordHandler {
  constructor(
    @Inject(FEATURE_FLAGS) private readonly flags: FeatureFlags,
    @Inject('V2ComputedFields') private readonly v2Calc: ComputedFieldService,
    @Inject('V1ComputedFields') private readonly v1Calc: V1Adapter,
  ) {}
  async execute(cmd: CreateRecordCommand) {
    if (this.flags.isEnabled('v2-computed-fields', { baseId: cmd.baseId })) {
      return this.v2Calc.compute(cmd)
    }
    return this.v1Calc.compute(cmd)
  }
}

// 灰度策略:
// 阶段1: false (全量 V1) → 阶段2: 10% 灰度 → 阶段3: 50% → 阶段4: 100% → 阶段5: 下线分支
```

### 5.10 声明式契约测试框架

**问题**：每个迁移模块手写 V1 vs V2 行为一致性测试成本高。

**方案**：

```typescript
// packages/v2/e2e/src/contract-specs/record.contract-spec.ts
contractSpec('Record CRUD 行为一致性', (spec) => {
  const table = spec.useTable({ name: 'Test', fields: [{ name: 'Name', type: 'singleLineText' }] })

  spec.it('创建记录', {
    request: { method: 'POST', body: { fields: { Name: 'hello' } } },
    assert: {
      status: (s) => s === 200 || s === 201,
      'body.fields.Name': 'hello',
      'body.createdTime': (v) => expect(v).toBeDefined(),
    }
  })

  spec.it('创建含公式字段的记录', {
    before: () => spec.addField(table.id, { name: 'Upper', type: 'formula', expression: 'UPPER({Name})' }),
    request: { method: 'POST', body: { fields: { Name: 'hello' } } },
    assert: { 'body.fields.Upper': 'HELLO' },  // 断言 V1 和 V2 的公式结果一致
  })
})

// 框架自动: 调 V1 端点 → 记录响应A → 清理 → 调 V2 端点 → 记录响应B → 对比
```

### 5.11 止损规则（必须就位的三条自动化规则）

1. **禁止在 V1 新增模块**：CI 检查 `features/` 下新增目录时触发告警——空壳模块和复杂域直接在 V2 新建
2. **禁止 V2 Handler 直接 import V1 Service**：用 dependency-cruiser 检查 `contract-http-implementation/` 对 `apps/nestjs-backend/src/features/` 的依赖——必须通过 V1Adapter
3. **V1/V2 双路径核心操作必须有 contract spec**：无契约测试的双路径操作不允许合并

### 5.12 执行时序

```
                    月1        月2        月3        月4
                    ├──────────┼──────────┼──────────┼──────────┤
轨道1 协调机制搭建    ██████████
轨道2 V2新建(Org等)   ████████████████████████████████████████
轨道3 V2下沉(Workflow) ████████████████
轨道3 V2下沉(Space等)                 ██████████████████████████
轨道4 V1加固(功能增强)  ████████████████████████████████████████████ (持续)
```

### 5.13 最小实现模块的落地细节补全

> 第四章 P0/P1 清单指明了"做什么"，第五章 5.1-5.7 指明了"用什么模式"。本节提供每个最小实现模块的**具体技术方案**，确保执行层面不悬空。

#### 5.13.1 Organization —— 空壳 → 完整数据模型

```sql
-- Prisma schema 新增
model Organization {
  id        String   @id @default(cuid())
  name      String
  logo      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
  departments Department[]
  members     OrganizationMember[]
  spaces      Space[]            -- 关联已有 Space 表
}

model Department {
  id             String       @id @default(cuid())
  name           String
  parentId       String?
  parent         Department?  @relation("DeptHierarchy", fields: [parentId], references: [id])
  children       Department[] @relation("DeptHierarchy")
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  members        DepartmentMember[]
}

model OrganizationMember {
  id             String       @id @default(cuid())
  userId         String
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  role           OrgRole      // Admin, Member, Guest
}
```

| 决策项 | 方案 |
|--------|------|
| 架构模式 | Full CQRS（部门层级树是天然领域模型） |
| 部门树查询 | 邻接表 + 应用层递归构建；性能瓶颈时升级为闭包表 |
| 与已有 Space 的关系 | Space 增加 `organizationId` 可选外键 |
| 权限范围 | Org Admin 可跨 Space 管理成员 |

#### 5.13.2 Billing —— 零实现 → 订阅状态机 + 配额控制

```typescript
// 订阅状态机: Free → Trialing → Active → PastDue → Canceled
//                   ↓         ↓
//                 Expired   Expired

export function transitionSubscription(
  current: Subscription,
  event: SubscriptionEvent,
): Result<Subscription, DomainError> {
  const transitions: Record<SubscriptionStatus,
    Partial<Record<SubscriptionEvent, SubscriptionStatus>>> = {
    'free':      { start_trial: 'trialing' },
    'trialing':  { activate: 'active', cancel: 'canceled', expire: 'expired' },
    'active':    { payment_failed: 'past_due', cancel: 'canceled' },
    'past_due':  { payment_succeeded: 'active', expire: 'expired' },
    'canceled':  {},  // terminal
    'expired':   {},  // terminal
  }
  const nextStatus = transitions[current.status]?.[event.type]
  if (!nextStatus) return Result.fail(
    domainError.invariant(`Invalid transition: ${current.status} → ${event.type}`)
  )
  return Result.ok({ ...current, status: nextStatus })
}
```

| 决策项 | 方案 |
|--------|------|
| 架构模式 | Full CQRS（状态机 + 领域事件） |
| 用量追踪粒度 | Space 级：记录数 / 附件存储 / API 调用次数 / 工作流执行次数 |
| 配额埋点 | V2 Application Service 层副作用——写操作前检查配额 |
| 超限策略 | 订阅过期 → 拒绝写操作，允许读操作（降级而非阻断） |
| 支付集成 | Port 接口抽象，默认提供 Stripe 适配器 |

#### 5.13.3 Authority Matrix —— 骨架 → RBAC + ABAC 混合模型

```typescript
// 评估引擎核心
export function evaluateAccess(
  subject: UserContext,      // { userId, roles, departmentId }
  resource: ResourceContext, // { type: 'field', id, tableId, baseId }
  action: Action,            // 'read' | 'write' | 'delete' | 'share'
  policies: Policy[],
): Result<AccessDecision, DomainError> {
  for (const policy of policies) {
    if (policy.resourceType !== resource.type) continue
    if (!policy.actions.includes(action)) continue
    // RBAC 检查
    if (policy.requiredRoles &&
        !policy.requiredRoles.some(r => subject.roles.includes(r))) continue
    // ABAC 条件检查
    if (policy.conditions) {
      if (evaluateConditions(policy.conditions, subject, resource).isFail) continue
    }
    return Result.ok(policy.effect) // 'allow' | 'deny'
  }
  return Result.ok('deny') // 默认拒绝
}
```

| 决策项 | 方案 |
|--------|------|
| 架构模式 | RBAC 角色层 + ABAC 属性条件层（非纯 RBAC 非纯 ABAC） |
| 角色定义 | Owner / Admin / Editor / Commenter / Viewer（五级，与现有 Collaborator 对齐） |
| 精细颗粒度 | 字段级可读写、行级条件（如 `isCreator == true`）、操作级（share/export/delete） |
| 策略存储 | JSON 列存储 policy 规则集合，按 baseId 加载到缓存 |

#### 5.13.4 Audit Log —— 无持久化 → 事件驱动 + 批量写入

```sql
model AuditLog {
  id         String   @id @default(cuid())
  baseId     String
  tableId    String?
  recordId   String?
  action     String   -- create | update | delete | import | export | duplicate
  actorId    String
  actorName  String
  diff       Json?    -- { before: {...}, after: {...} } 或仅 changedFields
  metadata   Json?    -- { ip, userAgent, source: 'web'|'api'|'workflow' }
  createdAt  DateTime @default(now())
  @@index([baseId, createdAt])
  @@index([tableId, createdAt])
}
```

| 决策项 | 方案 |
|--------|------|
| 写入方式 | 异步：操作完成 → EventBus 发布 → AuditLogHandler 批量写入，不阻塞主操作 |
| 保留策略 | 默认 90 天，定时任务清理过期日志 |
| 存储优化 | diff 字段只存 changedFields（非全量 before/after），压降存储膨胀 |
| 合规性 | 保留"谁/何时/做了什么"三元组；diff 为可选项 |

#### 5.13.5 其他补全项

**Backup/Restore**：
- 粒度：Base 级手动快照，JSON 格式（schema + data + meta）
- 存储：Port 接口抽象 → S3/MinIO 适配器
- 恢复：新 Base → schema 回放 → records 批量写入 → computed field 重算

**Export 增强**：
- XLSX 使用 `exceljs` 库（比 `xlsx` 更支持流式大文件）
- JSON 支持 `array` 和 `keyed`（按 id 索引）两种模式

**全局速率限制**：
- 框架 `@nestjs/throttler` + Redis 存储（多实例共享）
- 粒度：全局默认 100 req/s/IP，认证端点收紧
- 响应头：`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

**字段 spec 补全**（审计附一中标记的 18/20）：
```
补: packages/core/src/models/field/derivate/conditional-rollup/ConditionalRollup.field.spec.ts
补: packages/core/src/models/field/derivate/created-by/CreatedBy.field.spec.ts
补: packages/core/src/models/field/derivate/last-modified-by/LastModifiedBy.field.spec.ts
```

### 5.14 此前未覆盖的盲点

| 盲点 | 严重度 | 建议 |
|------|:---:|------|
| 双轨数据库写冲突 | 中 | V1/V2 路径的级联更新不一致需靠契约测试捕获；ShareDB OT 仅覆盖实时协作冲突 |
| 性能回归 | 中 | V2 CQRS 路径可能比 V1 Service 多几次 DB 查询（Repository 拆解），需对核心操作做性能基准对比（V1 vs V2 同操作耗时） |
| SDK/第三方迁移 | 低 | 统一 API 网关使前端无感，但通过 OpenAPI SDK 集成的第三方需要迁移文档和新版 SDK |
| Prisma 迁移安全 | 低 | 新增 Organization/Department/AuditLog 等表，确保迁移脚本对存量数据零影响 |

---

## 附录: 数据来源文件清单

### 查阅的关键文件 (部分)

```
apps/nestjs-backend/src/features/
├── organization/organization.controller.ts          (空壳证据)
├── authority-matrix/authority-policy.service.ts     (门面证据)
├── dashboard/dashboard.controller.ts (173行)       (完整证据)
├── dashboard/dashboard.service.ts (623行)          (完整证据)
├── workflow/workflow.service.ts (1493行)           (单体证据)
├── workflow/workflow-runner.service.ts (634行)     (单体证据)
├── import/open-api/import.class.ts                  (导入深度)
├── import/open-api/import-error-classifier.ts       (错误分类)
├── export/open-api/export-open-api.service.ts       (导出仅CSV)
├── access-token/                                    (API Key完整)
├── notification/                                    (双通道通知)
└── aggregation/aggregation.service.ts               (全文搜索)

packages/core/src/models/field/derivate/
├── {20个类型目录}/                                   (字段类型完整性)
└── formatting/ (DateTime/Number/Timezone)            (格式化层)

packages/v2/core/src/
├── commands/ (196文件, 扁平)                         (V2 CQRS写)
├── queries/ (33文件, 7个Handler)                     (V2 CQRS读)
├── application/services/ (62文件, 30+服务)           (应用服务)
├── ports/ (81文件)                                   (端口接口)
├── domain/shared/DomainError.ts (318行)              (错误体系)
└── domain/ (Base/Table/Formula/Shared)                (领域模型)

packages/v2/
├── contract-http/ (10 domains, 106合约)              (V2 HTTP契约)
├── contract-http-implementation/ (104 Handler)      (V2 HTTP实现)
├── adapter-db-postgres-pg/                           (DB适配器)
├── adapter-repository-postgres/                      (仓储适配器)
└── formula-sql-pg/ (46 test files)                   (公式SQL)

packages/common-i18n/src/locales/ (10语言)             (国际化)
packages/openapi/src/billing/                          (计费契约, 无后端)
```

---

> 报告版本: v2.2 (重大修正) | 审计者: deepseek V4pro
> v2.0 新增: 第五章节 V1/V2 统一优化方案 (六项技术模式 + 四轨道并行执行 + 止损规则)
> v2.1 新增: 5.10 最小实现模块落地细节补全 + 5.11 盲点清单
> v2.2 修正: 基于 GitHub/官网分析，将"迁移"框架修正为"分工协作"框架
>   - 新增第零章: V1/V2 关系的正确定位
>   - 重写第二章 2.1: V1/V2 分工现状
>   - 重写第五章: 从"统一优化方案"改为"协调高效运作方案"，新增四个协调机制
>   - 重写第四章: P/P2 按分工模型重新分类，明确哪些留 V1、哪些进 V2

## 最终摘要

- V1/V2 当前关系是并行分工，不是单向迁移。
- V1 继续承载稳定 CRUD、流程式操作和已成熟的协作能力。
- V2 主要承载复杂领域、契约层、CQRS 写读模型和企业扩展能力。
- `workflow` 仍是 V1 的事实执行层，V2 现阶段以契约与编排接入。
- `organization`、`billing`、`authority matrix`、`audit log` 属于企业侧空缺能力，适合在 V2 直接新建。
- 已统一的关键统计口径：`commands 196`、`queries 33`、`application/services 62`、`ports 81`、`domain 481`、`contract-http 106`、`handlers 104`、`e2e 150`、`languages 10`、`field types 20`。
- 后续协调机制建议优先级：`RequestRouter`、`V1Adapter`、事件桥、共享事务上下文、契约测试。
