# Boundary Review Output — DeepSeek V4pro

> 文档分层：正式输出。
>
> 本文是阶段 2 `DeepSeek V4pro` 对阶段 1 `GPT-5.5` 主稿 5 个边界项所做的代码级复核。

## 复核方法

对每个边界项，在以下层级做证据链交叉验证：
1. `packages/v2/contract-http/` — 公开契约定义
2. `packages/v2/contract-http-implementation/` — handler 实现
3. `packages/openapi/` — v1 REST 契约定义
4. `apps/nestjs-backend/src/` — NestJS controller/service 实现

不依赖主稿文档自引，每项结论均附代码路径证据。

---

## Q1: `billing / usage` 是否仍然只能判定为"主仓边界受限项"？

### 证据

**Backend（零实现）：**
- `apps/nestjs-backend/src/` 中不存在任何 `*billing*`、`*subscription*`、`*usage*` 命名文件
- 无 controller、service、module 文件
- 唯一命中是 `threshold.config.ts` 中两个配置项：
  - `billing.automationRunGracePeriod` / `billing.automationRunNotifyInterval`
  - 属于自动化通知的计时参数，不构成计费系统
- `record.service.ts` 仅含 i18n key `httpErrors.billing.exceedMaxRowLimit`

**OpenAPI（仅契约 schema，无后端实现）：**
- `packages/openapi/src/billing/subscription/get-subscription-summary.ts` — `GET /space/{spaceId}/billing/subscription/summary`
- `packages/openapi/src/billing/subscription/get-subscription-summary-list.ts` — `GET /billing/subscription/summary`
- `packages/openapi/src/usage/get-space-usage.ts` — `GET /space/{spaceId}/usage`
- 定义了完整数据模型：`BillingProductLevel`、`SubscriptionStatus`、`UsageFeature`、`UsageFeatureLimit`（约 20+ 种功能限制项）
- 三个路由在 backend 中 **零注册、零引用**

**V2（零定义）：**
- `packages/v2/contract-http/` 中无任何 billing/usage/subscription 端点

**前端（UI 门控已完备，但依赖外部服务）：**
- `apps/nextjs-app/` 中 `UpgradeWrapper` + `useBillingLevel` + `UseageLimitModal` 门控体系完整
- 调用 openapi 客户端函数，但 API 端点由外部服务承载

### 结论

**确认。`billing/usage` 仍是主仓边界受限项。** 主仓只做 API 契约定义（openapi）和前端门控（nextjs-app），不包含后端实现。`billing` 和 `usage` 属于同一个外部服务依赖，应合并为一个边界项，不再分列两项。

**建议修订：** 将 `billing/subscription` 和 `usage` 合并为 `billing & usage`，标注为"外部服务，主仓仅含契约与前端门控"。

---

## Q2: `Aggregation / Search` 当前是否已足以判定为"V2 已有较完整公开层"？

### 证据

**V2 已实现的 4 个核心端点（全链路：contract → handler → router → adapter）：**

| Action | 路径 | Schema | Handler | Router | NestJS Adapter |
|--------|------|--------|---------|--------|----------------|
| getRowCount | `/tables/getRowCount` | `table/getRowCount.ts` | `handlers/tables/getRowCount.ts` | `router.ts:881` | `v2.controller.ts:235` |
| getRecordIndex | `/tables/getRecordIndex` | `table/getRecordIndex.ts` | `handlers/tables/getRecordIndex.ts` | `router.ts:902` | `v2.controller.ts:236` |
| getSearchCount | `/tables/getSearchCount` | `table/getSearchCount.ts` | `handlers/tables/getSearchCount.ts` | `router.ts:921` | `v2.controller.ts:237` |
| getSearchIndex | `/tables/getSearchIndex` | `table/getSearchIndex.ts` | `handlers/tables/getSearchIndex.ts` | `router.ts:940` | `v2.controller.ts:238` |

适配方式：`v2.controller.ts` 直接调用 v1 `AggregationOpenApiService`，不重复实现逻辑。

**V2 Share 侧：**
- `getShareViewAggregations` — 完整
- `getShareViewGroupPoints`、`getShareViewRowCount`、`getShareViewSearchCount`、`getShareViewSearchIndex` — 4 个 stub（标记为需 Nest adapter）

**V1 有但 V2 无对应端点的功能：**

| V1 Endpoint | V2 状态 |
|---|---|
| `GET /aggregation` (多字段统计函数) | **无对应** |
| `GET /aggregation/group-points` | **无对应** (仅 share 侧有 stub) |
| `GET /aggregation/calendar-daily-collection` | **无对应** |
| `GET /aggregation/task-status-collection` | **无对应** |

### 结论

**部分确认，但需细化表述。** 四个基础 aggregation/search 端点（rowCount/recordIndex/searchCount/searchIndex）已实现全链路 v2 契约层。但 v1 的 4 个高级聚合端点（通用多字段统计、分组点、日历聚合、任务状态聚合）在 v2 中尚未定义。这不是"基础功能缺失"，而是 v2 较 v1 的"聚合成熟度差距"。

**建议修订：** 将主稿表述从"已有较完整公开层"细化为："基础 aggregation/search 端点（4/4 已闭环）；高级聚合端点（getAggregation 多字段统计、getGroupPoints、日历/任务聚合）仍仅在 v1 可用，v2 未覆盖。"

---

## Q3: `Undo / Redo` 当前是否已足以判定为"V2 已有较完整公开契约层"？

### 证据

**V2 全链路实现（contract → handler → router → adapter → core → storage → test）：**

| 层级 | 文件 | 状态 |
|------|------|------|
| Contract 端点 | `contract-http/src/table/undo.ts` → `POST /tables/undo` | 完整 |
| Contract 端点 | `contract-http/src/table/redo.ts` → `POST /tables/redo` | 完整 |
| Schema | `undoInputSchema`（zod），`undoOkResponseSchema`（含 redo） | 完整 |
| Handler | `contract-http-implementation/src/handlers/tables/undo.ts` | 完整 |
| Handler | `contract-http-implementation/src/handlers/tables/redo.ts` | 完整 |
| Router | `contract-http-implementation/src/router.ts:943-969` — `Symbol.for('v2.tables.undo')` / `Symbol.for('v2.tables.redo')` | 完整 |
| NestJS Adapter | `v2.controller.ts:321-340` — 适配 `UndoRedoService` | 完整 |
| Core 命令 | `core/src/commands/UndoCommand.ts`, `RedoCommand.ts`, `UndoHandler.ts`, `RedoHandler.ts` | 完整 |
| Core 服务 | `core/src/application/services/UndoRedoStackService.ts` | 完整 |
| 存储 | `adapter-undo-redo-keyv` — 带 TTL 的 Keyv 存储 | 完整 |
| DI 注册 | `v2-container.service.ts:108-111` — `v2CoreTokens.undoRedoStore` | 完整 |
| 测试 | DB 集成 (12 场景) + E2E (16 场景) + 单元测试 | 完整 |

**唯一 V1 有但 V2 无的端点：**
- SSE 流式端点 `undo-stream` / `redo-stream`（仅在 openapi 定义，v2 contract-http 无对应 action）
- OpenAPI REST 路径：`POST /table/{tableId}/undo-redo/undo`, `POST /table/{tableId}/undo-redo/redo`（v1/OpenAPI 路径，v2 使用 action-style `/tables/undo`）

### 结论

**确认。v2 已有完整公开契约层。** 从 contract 定义到 schema 校验、handler 执行、DI 解析、NestJS 适配、核心 UndoRedoStackService 逻辑、存储适配器、测试覆盖，全链路已闭环。仅 SSE 流式 undo/redo 仍仅在 v1/openapi 层定义，不构成 undo/redo 主契约的缺口。

**无需修订主稿。**

---

## Q4: `Share / Published` 当前主稿关于统一语义边界的表述是否稳固？

### 证据

**三套独立的 Share 路径（共享 `base_share` 表但路由空间不同）：**

| 层 | 路由空间 | 数据源 | V2 端点数 | 适配器 | 用途 |
|---|---------|--------|----------|--------|------|
| Share View (视图级) | `/share/*` | `share_view` 表 | 13 个 | `v2.controller.ts` → `ShareService` | 分享视图的读/写/聚合 |
| Published App (base 级) | `/publishedApps/*` | `base_share` 表派生 | 3 个 | `v2.controller.ts` → `V2PublishedAppService` → `BaseShareAuthService` | 运行时 manifest/导航/节点 |
| Base Share (openapi) | `/share/{shareId}/base` | `base_share` 表 | 8 个 | `BaseShareController` | base 级分享 CRUD |

**统一点（已有）：**
- Published App 的 `shareId` = Base Share 的 `shareId` — 同一条 `base_share` 记录
- `defaultUrl` 在两处一致定义：`getBaseShareVoSchema` (openapi) 和 `publishedAppRuntimeManifestSchema` (v2 contract-http)
- `mode` 枚举已定义三态：`authenticated | share | template`

**缺口（与主稿一致 + 实际代码证据补充）：**

1. **`authenticated` mode 未实现** — `v2-published-app.service.ts:44` 硬编码 `mode: 'share'`，authenticated 和 template 路径均未落地
2. **`defaultNodeId` 不一致** — `requirements.md` 用 `defaultActiveNodeId`，`base_share` 表用 `nodeId`，`publishedAppRuntimeManifestSchema` 用 `defaultNodeId`。三个术语指向同一概念，需统一为一个
3. **Template publish 与 base_share 结构独立** — `template.publishInfo` (含 `nodes`, `defaultActiveNodeId`, `includeData`) 与 `base_share` 结构不同，虽共享 `defaultUrl` 语义但数据结构未统一
4. **Share View 和 Published App 完全独立** — 两套 v2 路径无交叉逻辑，无组合场景（如从 published app 内访问特定 share view）

### 结论

**主稿表述基本稳固，但需增补两项细化：**

1. 明确 `authenticated` mode 是 Published App Runtime 的 **已定义但未实现** 路径（不仅是一般性"权限细化"缺口）
2. `defaultNodeId` / `defaultActiveNodeId` / `nodeId` 三个命名需在 v2 层收敛为一个

**建议修订：** 在主稿 Share/Published 部分补充 gap 明细：
- mode 三态中 `authenticated` 和 `template` 未实现（代码硬编码 `'share'`）
- `defaultNodeId` 命名不统一（`nodeId` in base_share、`defaultNodeId` in manifest、`defaultActiveNodeId` in requirements）
- Share View（视图级）和 Published App（base 级）无统一 runtime 访问模型

---

## Q5: 哪些结论需要修订，哪些应保持不变？

### 需修订

| 项 | 主稿当前 | 修订为 |
|---|---------|--------|
| billing & usage 为两项 | 分列 `billing/subscription` 和 `usage` | 合并为 `billing & usage`，标注"外部服务，主仓仅含契约与前端门控" |
| Aggregation/Search 为"已有较完整公开层" | 未区分基础/高级端点 | 细化为"基础 4/4 已闭环；高级聚合（getAggregation/groups/日历/任务）仅 v1 可用" |
| Share/Published 缺口描述 | 较笼统 "permission / mode 语义细化" | 补充具体 gap：`authenticated` mode 未实现、`defaultNodeId` 命名不统一、视图级与 base 级无统一模型 |

### 应保持不变

| 项 | 理由 |
|---|------|
| billing/usage 为边界受限项 | 后端零实现，证据确凿 |
| Undo/Redo 为"V2 已有完整公开契约层" | 全链路闭环，仅 SSE 流未入 v2（不构成主契约缺口） |
| Aggregation/Search v2 核心端点已闭环 | 4 端点全链路实现 |
| Share/Published 三层架构描述 | 三层区分清晰，代码证据支持 |
| Published App Runtime 仍是 P0 未闭环项 | authenticated/template 模式缺失构成核心缺口 |
| V2 从公开入口层到主契约层/主执行层的推进路径正确 | aggregation/search/undo-redo 均已到公开入口层，高级聚合/SSE 流仍需推进 |

---

## 区块总结

| 序号 | 边界项 | 复核结果 | 修订建议 |
|------|--------|---------|---------|
| 1 | billing / usage | **确认边界受限** | 合并为一项，删去独立 usage 项 |
| 2 | Aggregation / Search | **确认 V2 基础层完整** | 区分基础端点（已闭环）和高级聚合（仅 v1） |
| 3 | Undo / Redo | **确认 V2 完整** | 无需修订 |
| 4 | Share / Published 语义边界 | **确认三层架构稳固** | 补充 mode 未实现、命名不统一、无统一模型三个具体 gap |
| 5 | 整体稳定性 | **确认主稿三线 P0 方向正确** | 仅修正上述 4 处表述细化 |
