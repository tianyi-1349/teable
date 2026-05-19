# Capability Engineering Task Breakdown — GPT-codex5.3

> 文档分层：正式输出。
>
> 本文是阶段 3 `GPT-codex5.3` 工程化拆解结果。输入来自：
> 1) 阶段 1 主稿：`.monkeycode/docs/current-capability-defect-backlog-2026-05-18.md`
> 2) 阶段 2 边界复核：`boundary-review-output-deepseek-v4pro-2026-05-18.md`

## 1) 拆解规则

每个任务统一包含：
1. Goal（目标）
2. Minimum Cut（最小改动切口）
3. Files（文件范围）
4. Dependencies（依赖顺序）
5. Verification（验证命令）
6. Commit Boundary（提交边界）

任务按 P0 / P1 / P2 分层，保持"可执行、可验证、可分批提交"。

---

## 2) P0 Tasks

### P0-T1 Published Runtime Mode 与默认节点语义收敛

- Goal: 把 Published Runtime 的 `mode`、`defaultNodeId` 语义从文档/契约/实现三层对齐，先完成后端语义闭环。
- Minimum Cut:
  - 在 `publishedApps.getRuntimeManifest` 中消除硬编码 `mode: 'share'`，补齐 `share | template | authenticated` 的可判定逻辑和回退策略。
  - 统一 `defaultNodeId` 命名：manifest 输出、base share 读取、requirements 术语保持一致。
- Files:
  - `apps/nestjs-backend/src/features/v2/v2-published-app.service.ts`
  - `packages/v2/contract-http/src/published-app/getRuntimeManifest.ts`
  - `.monkeycode/specs/published-app-runtime/requirements.md`
  - `share-published-governance-roadmap.md`
- Dependencies: 无前置，可直接开始。
- Verification:
  - `pnpm --filter @teable/backend typecheck`
  - `pnpm --filter @teable/openapi typecheck`
  - `pnpm g:typecheck`
- Commit Boundary:
  - 仅提交 runtime manifest 语义对齐与规格同步。
  - 不混入前端 shell、resource renderer、workflow 相关改动。

### P0-T2 Published Runtime 跨端 Shell 最小闭环

- Goal: 建立 desktop / tablet / mobile / embed / pwa 的统一 shell 骨架与 navigation context，形成可运行的前端壳层。
- Current Progress:
  - 已有 `PublishedAppProvider + PublishedAppRuntime + PublishedAppShell` 目录结构与 share 路由接线。
  - 当前又补齐 authenticated `App` 路由进入统一 runtime 壳层，形成第一批 route closure。
- Minimum Cut:
  - 前端新增统一 Published Runtime 上下文（current node / default node / permissions / mode）。
  - 统一路由入口，保证 app node route closure 可落到同一 runtime shell。
  - 首批支持 table/form/dashboard/chart 的 fallback 分发占位。
- Files:
  - `apps/nextjs-app/src/features/...`（published runtime 页面、context、router、shell 组件）
  - `.monkeycode/specs/published-app-runtime/requirements.md`
- Dependencies: 依赖 `P0-T1` 先完成后端语义稳定输出。
- Verification:
  - `pnpm --filter @teable/app typecheck`
  - `pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx`
  - `pnpm g:typecheck`
- Commit Boundary:
  - 只提交 published runtime 前端壳层与路由闭环。
  - 不混入 preview/validation 与 workflow 编辑器改动。

### P0-T3 Workflow Draft/Apply-Update 后端语义闭环

- Goal: 完成 workflow 从 draft 编辑到 apply-update 的后端主链路，支撑真实编辑发布流程。
- Current Progress:
  - 已补 `packages/v2/contract-http/src/workflow/aiCreateDraftWorkflow.ts`。
  - 已补 `packages/v2/contract-http-implementation/src/handlers/workflows/aiCreateDraftWorkflow.ts`。
  - 已在 `packages/v2/contract-http/src/contract.ts` 新增 `workflows.aiCreateDraft`。
  - 已在 `apps/nestjs-backend/src/features/v2/v2.controller.ts` 接线，并直接复用 `WorkflowService.aiCreateWorkflowDraft(...)`。
  - 已确认 `WorkflowService.updateWorkflow(...)` 现有 `ro.nodes` upsert/delete 语义已经承载 draft node editing，并有对应 service spec 覆盖。
  - 已补 `packages/v2/contract-http/src/workflow/applyUpdateWorkflow.ts`。
  - 已补 `packages/v2/contract-http-implementation/src/handlers/workflows/applyUpdateWorkflow.ts`。
  - 已在 `apps/nestjs-backend/src/features/workflow/workflow.service.ts` 新增 `applyUpdateWorkflow(...)`，用于刷新 active snapshot。
  - 已在 Nest `workflow.controller.ts` 与 `features/v2/v2.controller.ts` 接线独立 `apply-update` 入口。
  - `pnpm --filter @teable/openapi typecheck`、`pnpm --filter @teable/v2-contract-http typecheck`、`pnpm --filter @teable/v2-contract-http-implementation typecheck`、`pnpm --filter @teable/backend typecheck` 与 workflow 聚焦测试已通过。
- Minimum Cut:
  - 第一批先公开现有 `aiCreateDraft` 能力，形成 draft authoring v2 入口。
  - 第二批把现有 `updateWorkflow` 明确收口为正式 draft editing 语义并同步规格文档。
  - 第三批补齐 apply update 语义与 active snapshot 更新。
  - 第四批对齐 workflow/node test 的基础调用链。
- Files:
  - `apps/nestjs-backend/src/features/workflow/**`
  - `packages/v2/contract-http/src/workflow/**`
  - `packages/v2/contract-http-implementation/src/handlers/workflow/**`
  - `workflow-domain-governance-roadmap.md`
- Dependencies: 建议在 `P0-T1` 后并行执行。
- Verification:
  - `pnpm --filter @teable/backend typecheck`
  - `pnpm --filter @teable/backend exec vitest run path/to/workflow/spec.ts`
  - `pnpm g:typecheck`
- Commit Boundary:
  - 第一批仅提交 workflow `aiCreateDraft` v2 公开能力。
  - 第二批再提交 apply-update 后端能力与必要的 draft editing 规格收口。
  - 不混入前端 workflow 工作区和 AI authoring。

### P0-T4 Workflow Trigger Runner 与 Step History 最小可用闭环

- Goal: 让 workflow 运行记录从"可触发"走到"可追踪"，形成 per-step run history 最小闭环。
- Current Progress:
  - `WorkflowRunnerService` 已在 action 执行前后写入 `workflowRunStep.create/update`。
  - `runScript`、`aiGenerate`、`updateRecords`、`createRecords`、`queryRecords` 已进入 step-level history 主链路。
  - `recordCreated`、`recordUpdated`、`recordMatchesConditions` 三类核心 trigger 已进入最小 runner 主链路。
  - `schedule` 已补最小后端直连入口：controller 接收 schedule body，service 创建 pending run，runner 直接执行；前端已支持 draft 创建与页面内手动触发。
  - `webhook` 已补最小后端直连入口：controller 接收 webhook body，service 创建 pending run，runner 直接执行；前端已展示 URL 并支持页面内手动触发。
  - `formSubmitted` 已补最小后端直连入口：controller 接收 form submission body，service 创建 pending run，runner 直接执行；前端已支持 draft 创建与页面内手动触发。
  - `emailReceived` 已补最小后端直连入口：controller 接收 email body，service 创建 pending run，runner 直接执行；前端已支持 draft 创建与页面内手动触发。
  - `testNode` 已补最小闭环：controller/service 新增 node test 入口，临时 snapshot 裁剪到目标 action node，runner 在 `manualNodeTest` 完成后回写 `workflowNode.testStatus/testOutput`，前端已支持页面内直接触发节点测试。
  - `pnpm --filter @teable/backend typecheck` 与 workflow 聚焦测试已通过。
- Minimum Cut:
  - 先实现 2-3 个核心 trigger（record created/updated/matches）真实 runner。
  - 写入 step-level history，并提供查询接口给前端。
  - direct trigger 与 node test 最小闭环已完成，后续转向正式基础设施能力。
- Files:
  - `apps/nestjs-backend/src/features/workflow/**`
  - `packages/v2/core/src/**`（workflow runtime 相关）
  - `packages/v2/contract-http/src/workflow/**`
- Dependencies: 依赖 `P0-T3`。
- Verification:
  - `pnpm --filter @teable/backend typecheck`
  - `pnpm --filter @teable/backend exec vitest run path/to/workflow-runner/spec.ts`
  - `pnpm g:typecheck`
- Commit Boundary:
  - 只提交 runner + history 后端能力。
  - 不混入前端工作区和非核心 trigger 全量实现。

### P0-T5 V2 高级聚合端点补齐计划落地（先契约）

- Goal: 将阶段 2 复核识别出的高级聚合差距纳入 v2 主链路。
- Current Progress:
  - 第一批 `contract-http + Nest adapter` 接线已落地：`tables.getAggregation`、`tables.getGroupPoints`、`tables.getCalendarDailyCollection`、`tables.getTaskStatusCollection`。
  - 当前执行层仍复用 `AggregationOpenApiService`，generic router 的独立 DI 执行层仍可后续下沉。
- Minimum Cut:
  - 在 `contract-http` 增加高级聚合端点定义：
    - `tables.getAggregation`
    - `tables.getGroupPoints`
    - `tables.getCalendarDailyCollection`
    - `tables.getTaskStatusCollection`
  - 第一批先做 contract + adapter 接线，执行层复用现有 v1 service。
- Files:
  - `packages/v2/contract-http/src/table/**`
  - `packages/v2/contract-http/src/contract.ts`
  - `apps/nestjs-backend/src/features/v2/v2.controller.ts`
  - `capability-gap-list.md`
  - `v1-v2-coverage-matrix.md`
- Dependencies: 与 `P0-T3/T4` 可并行。
- Verification:
  - `pnpm --filter @teable/openapi typecheck`
  - `pnpm --filter @teable/backend typecheck`
  - `pnpm g:typecheck`
- Commit Boundary:
  - 只提交高级聚合 v2 契约+接线。
  - 不混入聚合执行层重写与 share/published 语义改造。

---

## 3) P1 Tasks

### P1-T1 Share / Published / Template 统一访问模型契约化

- Goal: 把 `defaultUrl + defaultNodeId + permission/mode` 提炼为统一访问模型。
- Minimum Cut:
  - 在 published/base-share/template 三域定义统一 contract 对象与字段映射。
  - 明确 `nodeId/defaultNodeId/defaultActiveNodeId` 的单一权威字段。
- Files:
  - `packages/v2/contract-http/src/published-app/**`
  - `packages/openapi/src/base-share/**`
  - `apps/nestjs-backend/src/features/base-share/**`
  - `apps/nestjs-backend/src/features/v2/v2-published-app.service.ts`
- Dependencies: 建议在 `P0-T1` 后执行。
- Verification:
  - `pnpm --filter @teable/backend typecheck`
  - `pnpm --filter @teable/openapi typecheck`

- Commit Boundary:
  - 只提交统一访问模型契约与映射层。
  - 不混入 UI 壳层和 workflow 改动。

### P1-T2 Frontend Workflow 工作区闭环（List/Detail/Test/History）

- Goal: 形成可编辑、可测试、可查看历史的一体化 workflow 工作区。
- Current Progress:
  - 已形成 list / detail / test / history 的最小一体化工作区。
  - 已支持 AI draft 创建、`recordCreated` / `recordUpdated` / `recordMatchesConditions` trigger 创建、metadata 保存、Run Script / AI Generate 草稿编辑。
  - 已支持 `updateRecords` / `createRecords` / `queryRecords` 的结构化 config 编辑与底层 JSON 同步保存。
  - 已新增 `Apply update` 页面入口，用于把 active workflow 的当前 draft 发布为新的 active snapshot。
  - 已支持 `test run` 自定义 JSON input 编辑，便于验证不同 workflow input 形态。
  - 已展示节点级 `testStatus / testOutput` 与最近一次选中节点运行结果，形成最小 node debug 可见性。
- Minimum Cut:
  - 建立 list/detail/test/history 四区一致的数据流。
  - 节点配置项与后端已实现 action/trigger 对齐，超出能力范围的项做显式门控。
- Files:
  - `apps/nextjs-app/src/features/...workflow...`
  - `packages/sdk/**`（必要的查询 key 与调用封装）
- Dependencies: 依赖 `P0-T3/T4` 的后端能力到位。
- Verification:
  - `pnpm --filter @teable/app typecheck`
  - `pnpm --filter @teable/app exec vitest run path/to/workflow-ui/spec.tsx`

- Commit Boundary:
  - 只提交 workflow 前端工作区。
  - 不混入 published runtime shell。

### P1-T3 多适配器 Smoke Matrix 落地

- Goal: 产出正式 `multi-adapter-smoke-matrix.md`，覆盖 3 组最小组合。
- Minimum Cut:
  - Express + PostgreSQL
  - Express + SQLite
  - Fastify + PostgreSQL
  - 每组至少覆盖启动、核心读写、一个 v2 endpoint。
- Files:
  - `observability-and-adapter-validation-plan.md`
  - 新增 `multi-adapter-smoke-matrix.md`
  - 必要的脚本位于 `apps/nestjs-backend` 或 `scripts/`
- Dependencies: 无强依赖。
- Verification:
  - 三组组合分别执行并记录通过结果
  - `pnpm g:typecheck`
- Commit Boundary:
  - 文档与 smoke 脚本同批提交。
  - 不混入功能逻辑改造。

### P1-T4 观测能力产品化索引

- Goal: 形成统一运行视图索引文档，连接产品可见状态与研发运行状态。
- Minimum Cut:
  - 新增 `runtime-observability-index.md`
  - 按"产品状态/研发状态/适配验证状态"分层索引已有观测项。
- Files:
  - 新增 `runtime-observability-index.md`
  - `observability-and-adapter-validation-plan.md`
- Dependencies: 与 `P1-T3` 可并行。
- Verification:
  - 文档链接可达性检查
- Commit Boundary:
  - 仅观测索引文档。

### P1-T5 Billing & Usage 边界项标准化

- Goal: 将边界项表达统一到"一项一口径"，避免后续误判为主仓待实现功能。
- Minimum Cut:
  - 在 gap/backlog/roadmap 中统一命名为 `billing & usage`。
  - 明确"主仓仅 openapi 契约 + 前端门控，后端事实源在外部服务"。
- Files:
  - `capability-gap-list.md`
  - `.monkeycode/docs/current-capability-defect-backlog-2026-05-18.md`
  - `peripheral-domain-roadmap.md`
- Dependencies: 无强依赖。
- Verification:
  - 文档一致性自检（术语全局统一）
- Commit Boundary:
  - 仅文档口径标准化。

---

## 4) P2 Tasks

### P2-T1 `updateField` e2e helper 补齐

- Goal: 补齐 v2 e2e helper 预留实现，和 endpoint 完整接入同步。
- Minimum Cut:
  - 实现 `packages/v2/e2e/src/update-field/helpers.ts` 中占位逻辑。
  - 增补对应 e2e 用例。
- Files:
  - `packages/v2/e2e/src/update-field/helpers.ts`
  - `packages/v2/e2e/src/update-field/**`
- Dependencies: 依赖 updateField endpoint 链路稳定。
- Verification:
  - `pnpm --filter @teable/backend exec vitest run path/to/update-field/spec.ts`
- Commit Boundary:
  - 只提交 helper + e2e。

### P2-T2 Record Read 职责继续拆分

- Goal: 收敛 record read 链路职责，降低 `record-query.service` 聚合度。
- Minimum Cut:
  - 从 `record-query.service.ts` 拆分 1-2 个高复杂读取场景到专项 query 层。
- Files:
  - `apps/nestjs-backend/src/features/record/record-query.service.ts`
  - 新增 `apps/nestjs-backend/src/features/record/query/**`
- Dependencies: 无强依赖。
- Verification:
  - `pnpm --filter @teable/backend typecheck`
  - record 相关聚焦测试
- Commit Boundary:
  - 只提交读取职责拆分。

### P2-T3 前端局部体验收口（Chart/Import/Plugin/UserOptions）

- Goal: 处理 backlog 中已标注的局部最小可用态问题。
- Minimum Cut:
  - 按域分 4 个小批次修复，不跨域混提。
- Files:
  - `apps/nextjs-app/src/features/app/blocks/chart/components/chart/ChartQuery.tsx`
  - `apps/nextjs-app/src/features/app/blocks/chart/components/chart/chart-config/form/ComboForm.tsx`
  - `apps/nextjs-app/src/features/app/blocks/import-table/field-config-panel/inplace-panel/InplacePreviewColumn.tsx`
  - `apps/nextjs-app/src/features/app/components/plugin/hooks/useUtilsEvent.ts`
  - `apps/nextjs-app/src/features/app/components/field-setting/options/UserOptions.tsx`
- Dependencies: 无强依赖。
- Verification:
  - `pnpm --filter @teable/app typecheck`
  - 相关组件聚焦测试
- Commit Boundary:
  - 一次只提一个域（chart 或 import 或 plugin 或 user-options）。

### P2-T4 公式/计算字段/事件总线增强专项

- Goal: 将复杂字段边界增强拆成独立专项，和主迁移解耦。
- Minimum Cut:
  - 先基于真实 bug 列出 2-3 个可复现场景，按场景修复。
- Files:
  - `apps/nestjs-backend/src/features/field/open-api/field-open-api.service.ts`
  - `apps/nestjs-backend/src/features/field/field-calculate/field-converting-link.service.ts`
  - `packages/v2/adapter-table-repository-postgres/src/record/visitors/CellValueMutateVisitor.ts`
- Dependencies: 无强依赖。
- Verification:
  - 相关模块 typecheck + 场景测试
- Commit Boundary:
  - 每个场景独立 commit，降低回归面。

---

## 5) 执行波次建议

### Wave A（P0 后端语义）
1. `P0-T1` Published runtime mode/defaultNodeId 语义收敛
2. `P0-T3` Workflow draft/apply-update
3. `P0-T4` Workflow runner/history 最小闭环
4. `P0-T5` 高级聚合 v2 契约补齐

### Wave B（P0/P1 前端与统一模型）
1. `P0-T2` Published runtime shell
2. `P1-T1` Share/Published/Template 统一访问模型
3. `P1-T2` Workflow 前端工作区闭环

### Wave C（P1/P2 稳定性与收尾）
1. `P1-T3` Multi-adapter smoke matrix
2. `P1-T4` Runtime observability index
3. `P1-T5` Billing & Usage 边界项标准化
4. `P2-T1~T4` 局部工程欠账

---

## 6) 阶段 3 输出结论

阶段 3 已将主稿与边界复核结论转为可执行任务树。当前最关键的工程推进顺序是：

1. 先完成 Published Runtime 与 Workflow 的 P0 后端语义闭环
2. 再完成前端壳层与统一访问模型
3. 最后落地多适配器验证、观测索引和局部欠账

该拆解可直接作为阶段 4 `GPT-5.5` 最终收口时更新 gap/matrix/roadmap 的执行输入。
