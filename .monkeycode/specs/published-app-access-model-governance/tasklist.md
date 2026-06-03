# Published App Access Model Governance Task List

文档层级：正式输出。

## Execution Rule

- 使用行为切片推进。
- 不把 wrapper、透传接线或兼容字段并存本身视为完成。
- 完成判定绑定真实行为与最小验证矩阵。
- 代码实施前先通知用户确认。

## T1: Lock Current Runtime Boundary

Goal: 固定 share / authenticated `App` / template 当前真实边界。

Tasks:

- 复核 `ShareBaseLayout.tsx` 的 Published Runtime 主线入口。
- 复核 `BaseLayout.tsx` 的 authenticated `App` 主线入口。
- 复核 `pages/t/[identifier].tsx` 与 `TemplateBaseLayout.tsx` 的 template transport/layout 路径。
- 复核 `PublishedAppMode` 中 `template` 的当前真实消费状态。
- 产出边界结论，明确本轮不把已完成 runtime 主线重新打开。

Verification:

- 代码证据整理。
- 与 `.monkeycode/docs/published-app-runtime-pr1-pr9-acceptance-report-2026-05-20.md` 对齐。

## T2: Decide Default Node Contract Strategy

Goal: 明确 `defaultActiveNodeId` / `defaultNodeId` 的前端单点映射策略。

Tasks:

- 盘点 source write contract：`packages/openapi/src/base/publish.ts`。
- 盘点 template read contract：`packages/openapi/src/template/get.ts`。
- 盘点 backend source/template 归一化：`base.service.ts`、`v2.controller.ts`。
- 盘点 frontend source consumer 与 runtime consumer：`PublishBaseDialog.tsx`、`validatePublishedAppConfig.ts`。
- 固定 compatibility boundary 为前端 source consumer 层。

Verification:

- 文件级映射表。
- 影响面说明。
- 状态：completed。
- 代码结果：`PublishBaseDialog.tsx` 已在前端单点边界将 `defaultActiveNodeId` 映射为 runtime `defaultNodeId`。

## T3: Decide Template Runtime Disposition

Goal: 明确本轮是否接通 template published runtime。

Tasks:

- 评估 template transport/layout path 与 Published Runtime 的当前耦合情况。
- 对比方案 A 与方案 B 的风险和收益。
- 固化本轮结论为方案 A：template transport/layout path 保持现状，`template` published runtime 保留为 deferred item，除非后续证据证明必须接通。

Verification:

- design 文档结论闭环。
- backlog 与 spec 状态同步。
- 状态：completed。
- 结论：本轮保持方案 A，template permalink / layout path 保持现状，独立 template published runtime 入口保留为 deferred item。

## T4: Define Minimal Verification Matrix

Goal: 为统一访问模型治理建立最小验证面。

Tasks:

- 设计 share runtime 默认节点链路验证。
- 设计 authenticated `App` runtime 默认节点链路验证。
- 设计 template publish config 默认节点兼容验证。
- 设计 template permalink 或 template layout 路径保留验证。
- 明确 L1 / L2 / 最小集成验证边界。

Verification:

- 验证矩阵清单。
- 对应测试命令或验证方式清单。
- 状态：completed。
- 正式输出：`.monkeycode/docs/published-app-access-model-minimal-integration-matrix-2026-05-27.md`
- 已落地验证：
  - `PublishBaseDialog.spec.tsx`
  - `validatePublishedAppConfig.spec.ts`
  - `buildPublishedAppManifest.spec.ts`
  - `src/pages/t/[identifier].spec.ts`
  - `TemplateBaseLayout.spec.tsx`
  - `PublishedAppContext.spec.tsx`
  - `e2e/pages/published/published-access-model.spec.ts`
  - `e2e/pages/published/published-business-flow.spec.ts`
  - `e2e/pages/published/published-route-entry.spec.ts`
  - `src/features/app/ssr/base-route-entry.spec.ts`
  - `src/features/app/blocks/share/base/share-base-ssr.spec.ts`
  - 状态补充：`published-route-entry.spec.ts` 已覆盖 authenticated login redirect、share base auth route、share view auth route 三类真实浏览器入口。

## T5: Prepare Implementation Gate

Goal: 为代码实施准备最小补丁顺序和确认点。

Tasks:

- 确认优先改动顺序：frontend compatibility boundary -> focused tests -> docs。
- 确认实施前暂停点与实施后复核点。
- 将代码改动限制在最小必要文件集。

Verification:

- 实施顺序清单。
- 暂停确认点清单。
- 状态：completed。
- 实际实施顺序：frontend compatibility boundary -> focused tests -> typecheck -> docs。

## Suggested Verification Commands

```bash
pnpm --filter @teable/openapi typecheck
pnpm --filter @teable/app exec vitest run src/features/app/published-app/preview/validatePublishedAppConfig.spec.ts
pnpm --filter @teable/app exec vitest run src/features/app/published-app/manifest/buildPublishedAppManifest.spec.ts
pnpm --filter @teable/app exec vitest run src/features/app/blocks/table/table-header/publish-base/PublishBaseDialog.spec.tsx
pnpm --filter @teable/app exec vitest run 'src/pages/t/[identifier].spec.ts'
pnpm --filter @teable/app exec vitest run src/features/app/layouts/TemplateBaseLayout.spec.tsx
pnpm --filter @teable/app exec vitest run src/features/app/published-app/context/PublishedAppContext.spec.tsx
pnpm --filter @teable/app exec vitest run src/features/app/ssr/base-route-entry.spec.ts
pnpm --filter @teable/app exec vitest run src/features/app/blocks/share/base/share-base-ssr.spec.ts
E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-access-model.spec.ts --project='Desktop Chrome'
E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-business-flow.spec.ts --project='Desktop Chrome'
E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-route-entry.spec.ts --project='Desktop Chrome'
pnpm --filter @teable/app typecheck
```

以上命令已在本轮执行通过。

如后续证据证明必须触达 backend template 归一化映射，再补：

```bash
pnpm --filter @teable/backend typecheck
```
