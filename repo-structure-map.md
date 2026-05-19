# Repo Structure Map

> 文档分层：历史辅助输入。
> 
> 这份文档保留早期全仓扫描得到的结构地图，当前主要用于给正式盘点提供背景上下文，不作为最终能力结论或当前执行标准。

## 1. 仓库总体分层

| 顶层目录 | 职责 | 运行时角色 |
|----------|------|-----------|
| `apps/nestjs-backend` | NestJS 后端服务 | API + SSR 代理 + WebSocket + BullMQ 队列 |
| `apps/nextjs-app` | Next.js 前端应用 | SSR/CSR 页面渲染 + Published App API 路由 |
| `packages/core` | V1 共享核心 | 类型/模型/公式/op-builder/权限/查询语言 |
| `packages/openapi` | V1 API 契约层 | Zod schema + registerRoute + OpenAPI 生成 + Axios client |
| `packages/sdk` | 前端 SDK | React hooks + Context + Grid 组件 + Plugin bridge |
| `packages/db-main-prisma` | Prisma ORM 层 | schema.prisma + migrations + Prisma Client 生成 |
| `packages/formula` | 公式解析器 | ANTLR4 lexer/parser/visitor |
| `packages/common-i18n` | 国际化资源 | 多语言 JSON + namespace 类型 |
| `packages/i18n-keys` | i18n key 常量 | 表格验证/字段标题的翻译 key 定义 |
| `packages/ui-lib` | UI 组件库 | shadcn/ui + 基础组件 + icons |
| `packages/eslint-config-bases` | ESLint 配置 | 共享 lint 规则 |
| `packages/v2/*` (39 包) | v2 新架构层 | DDD core + CQRS + Ports/Adapters + HTTP contract + DI container |
| `plugins` | 插件独立应用 | sheet-form-view (Univer) + plugin-bridge 通信 |
| `dockers` | Docker 配置 | standalone/cluster/docker-swarm 部署模板 |

运行时关系：
- `nestjs-backend` 启动时自动拉起 `nextjs-app`（通过 next.controller 代理）
- 前端通过 `packages/openapi` + `packages/sdk` 调用后端 API
- 后端依赖 `packages/core` + `packages/openapi` + `packages/db-main-prisma` + 多个 v2 包
- v2 HTTP 路由通过 `v2-contract-http-express` 挂载到 NestJS Express app
- 插件独立部署 (port 3002)，通过 penpal plugin-bridge 与宿主通信

---

## 2. 主要应用

### apps/nextjs-app

- **主要职责**: 全栈前端应用，负责 SSR 页面渲染、CSR 交互、实时协作 UI、Published App 运行时和 API 路由代理
- **关键页面域**:

| 页面域 | 路由前缀 | 核心页面组件 | 职责 |
|--------|---------|-------------|------|
| 认证 | `/auth/*` | LoginPage, ForgetPasswordPage, ResetPasswordPage | 登录/注册/密码重置/社交登录 |
| 空间 | `/space/*` | SpacePage, SpaceInnerPage, SharedBasePage | 空间列表/详情/设置/回收站 |
| Base | `/base/[baseId]/*` | BaseNodePageSwitch → Table/Dashboard/Workflow/App/Base | Base 资源路由分发 |
| 分享 | `/share/[shareId]/*` | ShareViewPage, BaseShareAuthPage | View/Base 分享公开访问 |
| 设置 | `/setting/*` | PersonAccessTokenPage, OAuthAppPage, PluginPage | PAT/OAuth App/插件管理 |
| 管理员 | `/admin/*` | SettingPage, TemplatePage | 全局设置/模板管理 |
| 开发者 | `/developer/tool/*` | QueryBuilder | 查询构建器 |
| 模板 | `/t/[identifier]` | TemplatePage | 短链接跳转模板 |

- **关键运行时域**:

| 运行时域 | 目录 | 职责 |
|----------|------|------|
| blocks | `features/app/blocks/` | 20+ 功能区块（admin/base/chart/dashboard/import/share/space/table/view/trash 等） |
| published-app | `features/app/published-app/` | 5 种 Shell + manifest/navigation/runtime/preview/pwa |
| automation | `features/app/automation/` | Workflow 面板 + 节点编辑 + 运行历史 |
| layouts | `features/app/layouts/` | 11 种 Layout 容器 + Provider 嵌套 |
| components | `features/app/components/` | 20+ 跨 blocks 共享 UI 子组件 |
| context | `features/app/context/` | ShareContext + StaticTextRegistryProvider |
| hooks | `features/app/hooks/` | 20+ 跨模块 hooks (AI/billing/brand/env/setting 等) |

- **关键共享能力**:

| 能力 | 来源 |
|------|------|
| 6 种视图 | blocks/view/ → grid/form/kanban/gallery/calendar/plugin |
| ER 关系图 | blocks/erd/ (ReactFlow) |
| 字段依赖图 | blocks/graph/ |
| 附件上传/下载 | components/download-attachments/, upload-progress-panel/ |
| Chart (ECharts) | components/Chart/ |
| 字段设置 | components/field-setting/ (含 AI 配置) |
| 评论 | components/collaborator/ |
| 通知 | components/notifications/ |
| 插件面板 | components/plugin-panel/, plugin-context-menu/ |
| 计费 | components/billing/ |

---

### apps/nestjs-backend

- **主要职责**: NestJS 后端 API 服务，提供全部 V1/V2 HTTP 端点、WebSocket 实时协作、BullMQ 异步任务、邮件发送、OAuth2 Server/Client
- **关键 feature 模块 (50 个)**:

| 类别 | 模块 | Controller 路由 | 关键 Service |
|------|------|----------------|-------------|
| **认证** | auth | `api/auth` | auth.service, local-auth, permission, session, turnstile |
| | oauth | `/api/oauth` + `/api/oauth/client` | oauth-server, oauth.service, pkce |
| **组织/空间** | space | `api/space/` | space.service, template-space.init |
| | organization | `api/organization` | (依赖注入) |
| | collaborator | `collaborator` | collaborator.service |
| | invitation | `api/invitation` | invitation.service |
| **Base** | base | `api/base/` | base.service, base-duplicate, base-export, base-import, db-connection |
| | base-node | `api/base/:baseId/node` + `/node/folder` | base-node.service, base-node-folder.service |
| | base-share | `api/base/:baseId/share` + `api/share` | base-share.service, base-share-auth.service |
| **表格/字段/记录** | table | `api/base/:baseId/table` | table.service, table-duplicate, table-index, table-permission |
| | field | `api/table/:tableId/field` | field.service, field-converting, field-creating, field-deleting, formula-field, link-field-query |
| | record | `api/table/:tableId/record` | record.service, record-query, record-query-builder, record-permission, computed-orchestrator |
| **视图** | view | `api/table/:tableId/view` | view.service, view-open-api |
| | aggregation | `api/table/:tableId/aggregation` | aggregation.service |
| | selection | `api/table/:tableId/selection` | selection.service |
| **分享** | share | `api/share` | share.service, share-auth, share-socket |
| **自动化** | workflow | `api/base/:baseId/workflow` | workflow.service, workflow-runner, workflow-capability, workflow-ai, script-runtime |
| **AI** | ai | `api/:baseId/ai` | ai.service |
| **导入导出** | import | `api/import` | import-open-api, import-open-api-v2 |
| | export | `api/export` | export-open-api |
| **评论/通知** | comment | `api/comment/:tableId` | comment-open-api.service |
| | notification | `api/notifications` | notification.service |
| **插件** | plugin | `api/plugin` + `api/plugin/chart` | plugin.service, plugin-auth, plugin-chart |
| | plugin-panel | `api/table/:tableId/plugin-panel` | plugin-panel.service |
| | plugin-context-menu | `api/table/:tableId/plugin-context-menu` | plugin-context-menu.service |
| **仪表盘** | dashboard | `api/base/:baseId/dashboard` | dashboard.service |
| **权限** | authority-matrix | 无 controller | authority-policy.service |
| **附件** | attachments | `api/attachments` | attachments.service, attachments-storage, attachments-table |
| **其他** | access-token | `api/access-token` | access-token.service |
| | undo-redo | `api/table/:tableId/undo-redo` | undo-redo.service, undo-redo-operation, undo-redo-stack |
| | trash | `api/trash/` | trash.service, v2-record-trash, v2-table-trash |
| | template | `api/template` | template-open-api, template-permalink |
| | setting | `api/admin/setting` + `api/admin` | setting.service, admin-open-api |
| | pin | `api/pin` | pin.service |
| | mail-sender | `api/mail-sender` | mail-sender.service |
| | user | `api/user` + `api/user/last-visit` | user.service, last-visit, delete-user |
| | health | `health` | health.service |
| | integrity | `api/integrity` + `api/v2/integrity` | foreign-key, link-field, link-integrity, unique-index, integrity-v2 |
| | chat | `api/chart` | chat.service |
| | canary | 无 controller | canary.service |
| **内部服务** | calculation | 无 controller | field-calculation, batch, link, reference, system-field |
| | data-loader | 无 controller | data-loader, field-loader, table-loader, view-loader |
| | base-sql-executor | 无 controller | base-sql-executor.service |
| | database-view | 无 controller | database-view.service |
| | graph | 无 controller | graph.service |
| | model | 无 controller 无 service | (NestJS Module 容器) |
| | builtin-assets-init | 无 controller | builtin-assets-init.service |
| | table-domain | 无 controller | table-domain-query.service |
| | next | `/` | next.service (SSR 代理桥接) |
| **v2 桥接** | v2 | `api/v2` | v2-container, v2-action-trigger, v2-base-node-compat, v2-record-history, v2-view-compat, v2-field-delete-compat, v2-user-rename-propagation |

- **关键 API 域**:

| API 前缀 | 对应模块 | 覆盖能力 |
|----------|---------|---------|
| `api/auth` | auth + local-auth + social | 登录/注册/密码管理/社交认证 |
| `api/space` | space | Space CRUD + 协作者 + 邀请 + 集成 |
| `api/base` | base + base-node + base-share | Base CRUD + 节点树 + Base 分享 |
| `api/base/:baseId/table` | table | 表 CRUD + 索引 + 权限 |
| `api/table/:tableId/field` | field | 字段 CRUD + 转换 + AI 填充 |
| `api/table/:tableId/record` | record | 记录 CRUD + 历史 + 附件 + 表单 + AI |
| `api/table/:tableId/view` | view | 视图 CRUD + 筛选/排序/分组 + 分享开关 + 插件 |
| `api/table/:tableId/aggregation` | aggregation | 聚合 + 行计数 + 分组 + 搜索 |
| `api/table/:tableId/selection` | selection | 选区复制/粘贴/清除/删除/流式操作 |
| `api/table/:tableId/undo-redo` | undo-redo | 撤销/重做 + 操作历史 SSE |
| `api/share` | share + base-share | View 分享 + Base 分享（公开访问） |
| `api/base/:baseId/workflow` | workflow | 工作流 CRUD + 运行 + AI 草稿 + 能力查询 |
| `api/:baseId/ai` | ai | AI 流式生成 + 配置 + 禁用动作 |
| `api/import` | import | 文件导入 |
| `api/export` | export | CSV 导出 |
| `api/notifications` | notification | 通知查询/状态更新 |
| `api/comment/:tableId` | comment | 评论 CRUD + 表情 + 订阅 |
| `api/plugin` | plugin | 插件管理 + 图表查询 |
| `api/attachments` | attachments | 附件上传/存储/裁剪 |
| `api/base/:baseId/dashboard` | dashboard | 仪表盘 CRUD + 插件 |
| `api/access-token` | access-token | PAT CRUD |
| `api/oauth/client` | oauth | OAuth App 管理 |
| `api/trash` | trash | 回收站恢复/永久删除 |
| `api/template` | template | 模板管理 + 永久链接 |
| `api/v2` | v2 | v2 新版 API (tables CRUD) |
| `api/v2/integrity` | integrity-v2 | v2 数据完整性 |

- **关键基础设施能力**:

| 能力 | 实现位置 |
|------|---------|
| 实时协作 (ShareDB) | `nestjs-backend/src/global/sharedb/` + `share-socket.service` |
| WebSocket (SockJS) | `nestjs-backend/src/global/` |
| BullMQ 队列 | `nestjs-backend/src/features/*/` 各模块内 Job/Processor |
| OpenTelemetry | `nestjs-backend/src/` (OTLP exporter + NestJS/Express/PG/Pino instrumentation) |
| Sentry | `nestjs-backend/src/` (错误追踪 + profiling) |
| Prisma Client | `packages/db-main-prisma/` (48 模型) |
| 邮件发送 | `nestjs-backend/src/features/mail-sender/` (NestJS mailer + template merge) |
| Session (express-session) | `nestjs-backend/src/features/auth/session/` |
| 权限守卫 | `nestjs-backend/src/features/auth/guard/` (7 种 strategy) |
| 数据完整性 | `nestjs-backend/src/features/integrity/` (FK + link + unique + v2) |
| 字段计算引擎 | `nestjs-backend/src/features/calculation/` (公式/引用/链接) |
| 记录计算编排 | `nestjs-backend/src/features/record/computed-orchestrator/` (computed update) |

---

## 3. 共享包与支撑层

### packages/core (@teable/core)

- **职责**: V1 共享核心层——定义全部数据模型类型、字段类型枚举、权限角色、公式引擎类型、OT 操作构建器、查询语言解析器
- **关键导出**: types, array, asserts, convert, models (Field/Record/Table/View/Aggregation DTO), op-builder (ShareDB OT), formula (AST visitor), query (ANTLR4 JSON filter), auth (角色/权限/OAuth/机器人), errors, utils
- **输出物**: TypeScript 类型定义 + Zod schema + 函数/工具
- **被谁依赖**: openapi, sdk, nestjs-backend, nextjs-app, v2-core, formula, db-main-prisma

### packages/openapi (@teable/openapi)

- **职责**: V1 API 契约层——用 Zod 定义全部 V1 HTTP API 的路由/schema/client，生成 OpenAPI 文档
- **关键导出**: 45 个业务子域 (auth/ai/aggregation/base/base-node/base-share/comment/dashboard/field/import/export/integrity/notification/oauth/plugin/record/selection/share/space/table/template/undo-redo/view/workflow 等)，每个子域包含 registerRoute + Zod DTO + URL 常量
- **输出物**: Zod schema + OpenAPI spec + 类型安全的 Axios client 方法
- **被谁依赖**: sdk, nestjs-backend, nextjs-app

### packages/sdk (@teable/sdk)

- **职责**: 前端 SDK 层——提供 React hooks + Context + Grid 组件 + Plugin bridge，封装 openapi 调用和 core 类型
- **关键导出**: 55 个 hooks (use-field/use-record/use-table/use-view/use-permission/use-connection 等), 16 个 Context (app/base/table/field/view/record/session/aggregation/notification 等), 31 个组件目录 (grid/filter/sort/editor/cell-value/search/comment/billing 等), model (Base/Field/Record/Table/View 客户端模型), plugin-bridge (penpal 通信), store (Zustand)
- **输出物**: React UI 组件 + hooks + Context + 类型安全的数据操作封装
- **被谁依赖**: nextjs-app, plugins

### packages/db-main-prisma (@teable/db-main-prisma)

- **职责**: Prisma ORM 层——定义 V1 全部数据库模型 (48 个)，提供 migrations 和 Prisma Client 生成
- **关键模型**: Space, Base, BaseNode, BaseNodeFolder, BaseShare, TableMeta, Field, View, Ops, Reference, ComputedUpdateOutbox/Seed/DeadLetter/PauseScope, RecordHistory, Trash/TableTrash/RecordTrash, User, Account, AccessToken, Collaborator, Invitation/Record, Notification, Comment/Subscription, OAuthApp/Authorized/Secret/Token, Plugin/Install, Dashboard, Workflow/Node/Snapshot/Run/RunStep, Integration, PluginPanel/ContextMenu, Setting, Template/Category, Task/Run/Reference, Waitlist, UserLastVisit, PinResource, Attachments/AttachmentsTable
- **输出物**: Prisma Client + migration SQL
- **被谁依赖**: nestjs-backend

### packages/v2/* (39 包)

分层架构:

| 层级 | 包 | 职责 | 依赖方向 |
|------|---|------|---------|
| 0 基础 | v2-di, v2-postgres-schema, v2-tsdown-config | DI 容器 + PG schema 类型 + 构建配置 | 无 v2 依赖 |
| 1 核心 | v2-core | DDD 核心: 全部领域实体 + CQRS (60+ command/handler + query/handler) + Port 抽象接口 + DI token | → v2-di |
| 2 领域 | v2-field-dependency-core, v2-formula-sql-pg, v2-mock-records, v2-table-templates, v2-utils | 字段依赖图 + formula→PG SQL + mock 数据 + 10 种模板 + 调试工具 | → v2-core |
| 3 adapter | v2-adapter-db-postgres-{shared,pg,pglite,postgresjs}, v2-adapter-repository-postgres, v2-adapter-table-repository-postgres, v2-adapter-logger-{console,pino}, v2-adapter-realtime-{sharedb,broadcastchannel}, v2-adapter-csv-parser-papaparse, v2-adapter-undo-redo-keyv | 对 core Port 的具体实现 (PG 驱动/Kysely DDL/ShareDB/BroadcastChannel/PapaParse/Keyv/Pino) | → v2-core + v2-di |
| 4 contract | v2-contract-http | 全部 v2 HTTP API 路由契约 + DTO schema + 错误映射 | → v2-core |
| 5 contract 实现 | v2-contract-http-implementation, v2-contract-http-openapi, v2-contract-http-client | 契约→handler 桥接 + OpenAPI 文档生成 + 类型安全 client | → contract-http + core |
| 6 HTTP adapter | v2-contract-http-express/fastify/hono | 各框架的 thin router adapter | → contract-http 系列 |
| 5 domain 工具 | v2-command-explain, v2-debug-data, v2-dottea, v2-import | 命令解释/调试/导入包解析/文件导入 | → core + adapter |
| 5 container | v2-container-browser/node/node-test | DI 容器编排 (浏览器/生产/测试) | → 多 adapter + core |
| 7 dev | v2-devtools, v2-e2e, v2-benchmark-node | CLI 工具 + E2E 测试 + 框架性能对比 | → 几乎所有包 |

- **输出物**: v2-core 导出 CQRS + 领域 + Port; contract-http 导出路由契约; adapter 导出 DI 注册函数; container 导出 DI 组装函数
- **被谁依赖**: nestjs-backend (via v2-contract-http-express + v2-container-node + v2-core)

### plugins (@teable/plugin)

- **职责**: 插件独立 Next.js 应用——目前包含 sheet-form-view (基于 Univer 的表格视图插件)
- **关键导出**: Next.js App (pages/sheet-form-view), I18nProvider, QueryClientProvider, EnvProvider, plugin-bridge hooks
- **输出物**: 独立 Next.js 应用 (port 3002)
- **被谁依赖**: 无 (独立部署)

---

## 4. 关键功能域地图

### 认证与身份域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| 本地登录/注册 | backend: `features/auth/local-auth/`, frontend: `features/auth/pages/LoginPage.tsx`, openapi: `src/auth/signin.ts,signup.ts` | `local-auth.controller.ts`, `LoginPage.tsx` | auth.service, session, turnstile, permission |
| 社交登录 | backend: `features/auth/social/{github,google,oidc}/`, frontend: `features/auth/components/SocialAuth.tsx` | `github.controller.ts`, `google.controller.ts`, `oidc.controller.ts` | Passport strategies, auth.service |
| 密码管理 | backend: `features/auth/local-auth/`, openapi: `src/auth/change-password.ts,reset-password.ts` | `local-auth.controller.ts` (PATCH change-password, POST send-reset-password-email) | mail-sender |
| OAuth2 Server/Client | backend: `features/oauth/`, frontend: `blocks/setting/oauth-app/`, openapi: `src/oauth/` | `oauth.controller.ts`, `oauth-server.controller.ts`, `OAuthAppPage.tsx` | pkce.service |
| PAT 管理 | backend: `features/access-token/`, frontend: `blocks/setting/access-token/`, openapi: `src/access-token/` | `access-token.controller.ts`, `PersonAccessTokenPage.tsx` | auth.service |
| Waitlist | backend: `features/auth/local-auth/`, frontend: `features/app/waitlist/`, openapi: `src/auth/waitlist/` | `local-auth.controller.ts` (POST join-waitlist), `WaitlistPage.tsx` | auth.service |

### 组织与空间域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| Space CRUD | backend: `features/space/`, frontend: `blocks/space/`, openapi: `src/space/` | `space.controller.ts`, `SpacePage.tsx` | collaborator, invitation, integration |
| 组织信息 | backend: `features/organization/`, openapi: `src/organization/` | `organization.controller.ts` | user |
| 协作者管理 | backend: `features/collaborator/`, openapi: `src/base/collaborator-*.ts,src/space/collaborator-*.ts` | `collaborator.controller.ts` | invitation, auth/permission |
| 邀请链接/邮件 | backend: `features/invitation/`, frontend: `pages/invite/`, openapi: `src/invitation/accept.ts,src/base/invitation-*.ts` | `invitation.controller.ts`, `accept.ts` | mail-sender, collaborator |
| 集成管理 | backend: `features/space/` (integration 相关), openapi: `src/space/integration-*.ts` | `space.controller.ts` | AI provider (LLM test) |

### Base / Table / Field / Record 数据核心域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| Base CRUD | backend: `features/base/`, frontend: `blocks/base/`, openapi: `src/base/` | `base.controller.ts`, `BasePageRouter.tsx` | base-node, base-share, base-import/export |
| BaseNode 树 | backend: `features/base-node/`, frontend: `base-node/BaseNodePageSwitch.tsx`, openapi: `src/base-node/` | `base-node.controller.ts`, `BaseNodePageSwitch.tsx` | base |
| Table CRUD | backend: `features/table/`, openapi: `src/table/` | `table-open-api.controller.ts` | field, view, record |
| 字段 CRUD + 转换 | backend: `features/field/`, frontend: `components/field-setting/`, openapi: `src/field/` | `field-open-api.controller.ts`, `FieldSetting.tsx` | calculation, formula, ai |
| 记录 CRUD + 历史 | backend: `features/record/`, frontend: `sdk/hooks/use-record*`, openapi: `src/record/` | `record-open-api.controller.ts` | computed, attachment, ai |
| 字段计算引擎 | backend: `features/calculation/`, packages: `formula/`, `v2-formula-sql-pg/` | `field-calculation.service.ts`, `parse-formula.ts` | field, record |
| 数据完整性 | backend: `features/integrity/`, openapi: `src/integrity/` | `integrity.controller.ts`, `integrity-v2.controller.ts` | link-field, unique-index, foreign-key |

### 视图与页面表现域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| 视图 CRUD + 配置 | backend: `features/view/`, frontend: `blocks/view/`, openapi: `src/view/` | `view-open-api.controller.ts`, `View.tsx` | aggregation, selection, plugin |
| Grid 视图 | frontend: `blocks/view/grid/` | `GridView.tsx` | sdk/components/grid |
| Form 视图 | frontend: `blocks/view/form/` | `FormView.tsx` | record/form-submit, share |
| Kanban 视图 | frontend: `blocks/view/kanban/` | `KanbanView.tsx` | field, aggregation |
| Gallery 视图 | frontend: `blocks/view/gallery/` | `GalleryView.tsx` | attachment |
| Calendar 视图 | frontend: `blocks/view/calendar/` | `CalendarView.tsx` | date-fns |
| 聚合/统计 | backend: `features/aggregation/`, openapi: `src/aggregation/` | `aggregation-open-api.controller.ts` | view, record |
| 选区操作 | backend: `features/selection/`, openapi: `src/selection/` | `selection.controller.ts` | record, field |
| ER 关系图 | frontend: `blocks/erd/` | `BaseErd.tsx` (ReactFlow) | field, reference |
| 字段依赖图 | frontend: `blocks/graph/` | `FieldGraph.tsx` | calculation |
| Dashboard | backend: `features/dashboard/`, frontend: `dashboard/`, openapi: `src/dashboard/` | `dashboard.controller.ts`, `DashboardPage.tsx` | plugin |

### 分享、发布与公开访问域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| View 分享 | backend: `features/share/`, frontend: `blocks/share/view/`, openapi: `src/share/` | `share.controller.ts`, `ShareViewPage.tsx` | view, aggregation, record, auth |
| Base 分享 | backend: `features/base-share/`, frontend: `blocks/share/base/`, openapi: `src/base-share/` | `base-share-open.controller.ts`, `BaseShareAuthPage.tsx` | base, auth |
| Published App Shell | frontend: `published-app/shell/` | `PublishedAppShell.tsx` (DesktopShell/MobileShell/TabletShell/EmbedShell/PwaStandaloneShell) | manifest, navigation, runtime |
| Published App Runtime | frontend: `published-app/runtime/` | `PublishedResourceSwitch.tsx` | context, manifest |
| Published App Manifest | frontend: `published-app/manifest/` | `buildPublishedAppManifest.ts` | base-node, base-share |
| PWA | frontend: `published-app/pwa/` | `PublishedAppPwaMeta.tsx`, `useIsPwaStandalone.ts` | shell |
| Base 发布 | backend: `features/base/`, openapi: `src/base/publish.ts` | `base.controller.ts` (POST publish) | base-share, published-app |

### 自动化与 Workflow 域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| Workflow CRUD + 运行 | backend: `features/workflow/`, frontend: `automation/Pages.tsx`, openapi: `src/automation/workflow/` | `workflow.controller.ts`, `AutomationPage.tsx` | workflow-runner, script-runtime |
| Workflow 能力查询 | backend: `features/workflow/workflow-capability.service.ts`, openapi: `src/automation/workflow/get-capabilities.ts` | `workflow-capability.service.ts` | v2-core, authority-matrix |
| Workflow AI 草稿 | backend: `features/workflow/workflow-ai.service.ts`, openapi: `src/automation/workflow/ai-create-draft.ts` | `workflow-ai.service.ts` | ai.service |
| Script 运行时 | backend: `features/workflow/script-runtime.service.ts` | `script-runtime.service.ts` | workflow-runner |
| Workflow 面板 | frontend: `automation/workflow-panel/` | `WorkFlowPanel.tsx`, `WorkFlowPanelModal.tsx` | automation/Pages.tsx |

### AI 与智能生成域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| AI 流式生成 | backend: `features/ai/`, frontend: `components/field-setting/field-ai-config/`, openapi: `src/ai/generate-stream.ts` | `ai.controller.ts` (POST generate-stream) | 多 AI SDK (OpenAI/Anthropic/Google/DeepSeek/Azure/Bedrock/Cohere/Mistral/xAI/TogetherAI/OpenRouter) |
| AI 字段填充 | backend: `features/record/` (auto-fill), openapi: `src/record/auto-fill-cell.ts,src/field/auto-fill-field.ts` | `record-open-api.controller.ts` (POST auto-fill) | ai.service |
| AI 视图上下文 | openapi: `src/ai/view-context.ts` | `aiViewContextQuerySchema` | ai, view |
| AI 配置管理 | backend: `features/setting/` (admin AI config), frontend: `blocks/admin/setting/components/ai-config/`, openapi: `src/ai/get-config.ts` | `admin-open-api.controller.ts` | setting, ai |
| AI 公式生成 | openapi: `src/formula/ai.ts` | AI formula generation route | formula, ai |
| AI 禁用动作 | openapi: `src/ai/get-ai-disable-actions.ts` | `getAIDisableAIActionsRoute` | ai, workflow |

### 导入、导出与附件域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| CSV 导入 | backend: `features/import/`, frontend: `blocks/import-table/`, openapi: `src/import/` | `import-open-api.controller.ts`, `TableImport.tsx` | field, record |
| CSV 导出 | backend: `features/export/`, openapi: `src/export/` | `export-open-api.controller.ts` | record, field |
| Base 级导入导出 | backend: `features/base/` (import/export), openapi: `src/base/import.ts,export.ts` | `base.controller.ts` | import, export |
| 附件上传/存储 | backend: `features/attachments/`, frontend: `components/upload-progress-panel/,download-attachments/`, openapi: `src/attachment/` | `attachments.controller.ts` | S3/MinIO, base |
| 附件裁剪 | backend: `features/attachments/attachments-crop.module.ts` | (crop module) | attachments-storage |

### 评论、通知与协作反馈域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| 评论 CRUD + 表情 + 订阅 | backend: `features/comment/`, frontend: `sdk/components/comment/`, openapi: `src/comment/` | `comment-open-api.controller.ts` | record, notification, attachment |
| 通知管理 | backend: `features/notification/`, frontend: `components/notifications/`, openapi: `src/notification/` | `notification.controller.ts` | comment, collaborator |
| 实时协作 (ShareDB) | backend: `global/sharedb/` + `features/share/share-socket.service.ts`, frontend: `sdk/context/` | ShareDB WebSocket + SockJS | view, record, field |

### 插件、扩展与二次开发域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| 插件 CRUD + 审核 | backend: `features/plugin/`, openapi: `src/plugin/` | `plugin.controller.ts` | plugin-auth, plugin-chart |
| 插件面板 | backend: `features/plugin-panel/`, frontend: `components/plugin-panel/`, openapi: `src/plugin-panel/` | `plugin-panel.controller.ts` | plugin |
| 插件右键菜单 | backend: `features/plugin-context-menu/`, frontend: `components/plugin-context-menu/`, openapi: `src/plugin-context-menu/` | `plugin-context-menu.controller.ts` | plugin |
| 图表插件 | backend: `features/plugin/official/chart/`, frontend: `components/Chart/`, openapi: `src/plugin/chart/` | `plugin-chart.controller.ts` | dashboard, plugin |
| Plugin Bridge | frontend: `sdk/plugin-bridge/` | `bridge.ts` (penpal) | plugin |
| 独立插件应用 | `plugins/` | Next.js App (sheet-form-view, Univer) | plugin-bridge |

### OpenAPI、SDK 与外部集成域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| V1 OpenAPI 契约 | `packages/openapi/src/` | `index.ts` (45 子域导出), `generate.schema.ts` | backend controllers, frontend sdk |
| V1 API Client | `packages/openapi/src/` + `packages/sdk/src/hooks/` | `urlBuilder.ts`, 各 hooks (use-record/use-field 等) | openapi, core |
| V2 HTTP 契约 | `packages/v2/contract-http/src/` | `contract.ts` (v2Contract ~30 action routes) | v2-core, v2-open-api |
| V2 HTTP Client | `packages/v2/contract-http-client/src/` | `createV2HttpClient` | contract-http |
| V2 OpenAPI 文档 | `packages/v2/contract-http-openapi/src/` | `generate.ts` (OpenAPI spec) | contract-http |
| 查询构建器 | frontend: `blocks/setting/query-builder/` | `QueryBuilderPage.tsx` | openapi |
| AI 配置管理 | frontend: `blocks/admin/setting/components/ai-config/` | `SettingPage.tsx` | setting, ai |

### v2 领域内核与新架构域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| v2 DDD 核心 | `packages/v2/core/src/` | `index.ts` (domains + commands + queries + ports) | v2-di, formula, i18n-keys |
| v2 CQRS Commands | `packages/v2/core/src/commands/` | 60+ 命令 (CreateBase/CreateTable/CreateField/CreateRecord/DeleteRecords/UpdateRecord/Paste/Clear/ImportCsv 等) | domain, ports |
| v2 CQRS Queries | `packages/v2/core/src/queries/` | GetTableById/ListBases/ListTables/ListTableRecords/GetRecordById | domain, ports |
| v2 Domain Model | `packages/v2/core/src/domain/` | base/, table/, formula/, shared/ | schemas, commands |
| v2 Port 接口 | `packages/v2/core/src/ports/` | 30+ Port (ICommandBus/IQueryBus/IEventBus/ITableRepository/ILogger/ICsvParser/IRealtimeEngine/IUndoRedoStore 等) | adapter 实现 |
| v2 DI Container | `packages/v2/container-{browser,node,node-test}/` | `createV2BrowserContainer/createV2NodePgContainer/createV2NodeTestContainer` | 全部 adapter |
| v2 PG Adapter | `packages/v2/adapter-{db-postgres-*,repository-postgres,table-repository-postgres}/` | Kysely + DDL/DML visitors | v2-core ports |
| v2 桥接层 | `apps/nestjs-backend/src/features/v2/` | `v2.controller.ts`, `v2-openapi.controller.ts` | contract-http-express, container-node |
| v2 命令解释 | `packages/v2/command-explain/src/` | `registerCommandExplainModule` | v2-core, adapter-table-repository-postgres |
| v2 调试数据 | `packages/v2/debug-data/src/` | `DebugDataService` | adapter-db, postgres-schema |
| v2 CLI 工具 | `packages/v2/devtools/src/` | Effect-based CLI (computed/explain/mock/underlying/relations) | 几乎所有 v2 包 |

### 数据存储、schema 与持久化域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| V1 Prisma Schema | `packages/db-main-prisma/prisma/postgres/schema.prisma` | 48 模型定义 | nestjs-backend |
| V1 Migrations | `packages/db-main-prisma/prisma/postgres/migrations/` | SQL migration 文件 | Prisma Client |
| V2 PG Schema Types | `packages/v2/postgres-schema/src/` | `V1TeableDatabase` (Kysely 类型) | v2 adapter 包 |
| Prisma Client 生成 | `packages/db-main-prisma/` | `prisma-generate-ci` script | backend |
| 数据库视图 | backend: `features/database-view/` | `database-view.service.ts` | field, view |

### 基础设施与系统运行域

| 功能域 | 对应目录 | 关键入口文件 | 协作模块 |
|--------|---------|-------------|---------|
| 健康检查 | backend: `features/health/` | `health.controller.ts` (NestJS Terminus) | DB, storage |
| 前端 SSR 代理 | backend: `features/next/` | `next.controller.ts` (`/`) | nextjs-app |
| 权限矩阵 | backend: `features/authority-matrix/` | `authority-policy.service.ts` | auth, workflow |
| Undo/Redo | backend: `features/undo-redo/`, frontend: `sdk/hooks/`, openapi: `src/undo-redo/` | `undo-redo.controller.ts` | v2-adapter-undo-redo-keyv |
| 回收站 | backend: `features/trash/`, frontend: `blocks/trash/`, openapi: `src/trash/` | `trash.controller.ts` | table, record |
| 邮件发送 | backend: `features/mail-sender/` | `mail-sender-open-api.controller.ts` | auth (密码重置), invitation |
| 灰度发布 | backend: `features/canary/` | `canary.service.ts` | auth |
| 预置资源初始化 | backend: `features/builtin-assets-init/` | `builtin-assets-init.service.ts` | template |
| 数据预加载 | backend: `features/data-loader/` | `data-loader/table/field/view-loader.services` | field, table, view |
| 模板管理 | backend: `features/template/`, frontend: `blocks/admin/template/`, openapi: `src/template/` | `template-open-api.controller.ts` | base, builtin-assets-init |
| Pin 置顶 | backend: `features/pin/`, openapi: `src/pin/` | `pin.controller.ts` | base |
| 计费 | frontend: `blocks/billing/`, openapi: `src/billing/` | billing hooks + subscription modal | space, plan |
| 用量统计 | openapi: `src/usage/` | space/base/instance usage queries | billing |
| 系统设置 | backend: `features/setting/`, frontend: `blocks/admin/setting/`, openapi: `src/admin/` | `admin-open-api.controller.ts` | AI config, LLM test, enterprise license |
| 国际化 | `packages/common-i18n/`, `packages/i18n-keys/`, frontend: `lib/i18n/` | 多语言 JSON + namespace 类型 | 全应用 |

---

## 5. 后续能力盘点建议

给 DeepSeek 下一步分析提供建议：

### 先看哪些模块

优先分析以下高密度模块（功能丰富、前后端+openapi 三层齐全）：

1. **record** — 最密集的模块：CRUD + 历史 + 附件 + 表单 + AI + 按钮 + computed + 流式操作
2. **field** — 字段全生命周期：CRUD + 转换 + AI 填充 + 链接查询 + 删除引用 + 公式
3. **view** — 视图全配置：CRUD + 筛选 + 排序 + 分组 + 分享 + 插件 + 锁定
4. **base** — Base 全管理：CRUD + 协作者 + 邀请 + 导入导出 + 模板 + ERD + 发布 + 分享
5. **workflow** — 自动化全链路：CRUD + 运行 + AI 草稿 + 能力查询 + 脚本执行
6. **share + base-share** — 分享双系统：View 分享 (20+ 端点) + Base 分享 (auth/数据/复制)
7. **auth + oauth** — 认证双系统：本地 + 社交 + OAuth Server/Client + PAT + Waitlist

### 哪些模块功能密度最高

按功能端点密度排序：

| 模块 | 后端 Controller 方法数 | OpenAPI 路由数 | 前端页面/组件数 | 综合密度 |
|------|---------------------|---------------|---------------|---------|
| record | ~20 | ~18 | 多 (Grid/Form/Detail 等) | 最高 |
| view | ~26 | ~24 | 6 种视图 + 工具栏 | 最高 |
| base | ~26 | ~27 | 多页面 | 最高 |
| share + base-share | ~23 + ~6 | 14 + 10 | 分享页面 | 高 |
| workflow | ~12 | 13 | Automation 页面 | 高 |
| field | ~17 | 12 | 字段设置面板 | 高 |

### 哪些模块需要结合前后端和 openapi 一起看

以下模块必须三层联动分析才能完整理解能力：

1. **record** — 前端 Grid/Form/Detail + SDK hooks + OpenAPI 18 路由 + backend 20 方法
2. **field** — 前端字段设置面板 + SDK field hooks + OpenAPI 12 路由 + backend 17 方法 + calculation engine + formula parser
3. **view** — 前端 6 种视图组件 + SDK view hooks + OpenAPI 24 路由 + backend 26 方法 + aggregation
4. **workflow** — 前端 automation 页面 + SDK hooks + OpenAPI 13 路由 + backend 12 方法 + workflow-runner + script-runtime + authority-matrix
5. **share** — 前端分享页面 + ShareContext + OpenAPI 14 路由 + backend share + base-share 双 controller
6. **auth** — 前端 LoginPage + SocialAuth + OpenAPI 18 路由 + backend 5 个 controller + session + passport strategies
7. **base** — 前端 BasePage + 协作者管理 + OpenAPI 27 路由 + backend 26 方法 + base-node + base-share + import/export
8. **dashboard** — 前端 DashboardPage + ECharts + OpenAPI 13 路由 + backend 11 方法 + plugin 管理
9. **published-app** — 纯前端模块但依赖 manifest (base-node/base-share) + navigation + 5 shell + runtime

### 特别注意

- **V1 vs V2 双轨并行**: record/field/view/table/base 各模块都有 V1 (nestjs feature + openapi Zod) 和 V2 (v2-core CQRS + contract-http + express adapter) 两套实现，需要分别识别
- **权限矩阵 authority-matrix 无 controller**: 它是内部服务层，但影响 workflow 和 record 的权限判断
- **chat.controller 路由是 `api/chart`**: 目录名是 `chat`，路由名是 `chart`，需要结合前端 chart 组件理解
- **selection 的流式操作**: 选区操作有普通版和 stream (SSE) 版两种实现
- **plugin 三层**: 插件 CRUD + 插件面板 + 插件右键菜单 是三个独立 feature
