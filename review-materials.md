# Review Materials

> 文档分层：历史辅助输入。
> 
> 这份文档汇总本轮专项评审使用的材料和检查依据，当前主要作为历史辅助输入保留。

## 1. 生成信息
- 生成时间：2026-05-14 13:25:56 
- 当前分支：develop
- 工作区路径：/workspace

## 2. 项目规则摘要
### AGENTS.md
```md
# AGENTS

## Use This File

- A legacy `agents.md` exists at the repo root. If it conflicts with this file, trust `AGENTS.md`.

## Toolchain

- Use `pnpm` only. Root `packageManager` is `pnpm@9.13.0`; `npm` is explicitly disallowed.
- Match CI when possible: Node `22.18.0`.

## Repo Map

- `apps/nextjs-app`: Next.js frontend.
- `apps/nestjs-backend`: main backend; local dev starts from here.
- `packages/openapi`: shared API route/schema/client layer. Backend API changes often require matching updates here.
- `packages/sdk`: frontend/sdk helpers and shared React-side utilities.
- `packages/db-main-prisma`: Prisma schema, migrations, client generation.
- `packages/v2/*`: newer runtime/domain packages. These build with `tsdown`, not `tsc` emit.

## Local Dev

- First-time setup follows the root README: `pnpm install` then `make switch-db-mode`.
- Start local dev from `apps/nestjs-backend` with `pnpm dev`.
- Do not start the Next app separately for normal local development; the backend dev flow starts it.
- Shared env files live under `apps/nextjs-app/.env*`, and Prisma scripts load env from that directory via `dotenv-flow`.
- Plugin dev is separate: run `pnpm build:packages`, then `pnpm run:plugin` (serves plugins on port `3002`).

## Verification Order

- If you changed Prisma schema or migrations, run `pnpm --filter @teable/db-main-prisma prisma-generate-ci` before typechecking apps/packages.
- CI lint/type flow is:
  1. `pnpm -F @teable/db-main-prisma prisma-generate --schema ./prisma/postgres/schema.prisma`
  2. `pnpm -F "./packages/**" run build`
  3. `pnpm g:typecheck`
  4. `pnpm g:lint`
  5. `pnpm g:lint-styles`
- Fast package-level checks:
  - `pnpm --filter @teable/app typecheck`
  - `pnpm --filter @teable/backend typecheck`
  - `pnpm --filter @teable/openapi typecheck`
  - `pnpm --filter @teable/sdk typecheck`
- Focused tests usually go through Vitest directly, for example:
  - `pnpm --filter @teable/backend exec vitest run path/to/spec.ts`
  - `pnpm --filter @teable/app exec vitest run path/to/spec.ts`

## Test Quirks

- `@teable/backend` e2e tests seed the database first via its `pre-test-e2e` script; do not assume `vitest` alone is enough.
- The heavy integration path used in CI is `make postgres.integration.test`.
- v2 integration coverage in CI runs with `FORCE_V2_ALL=true` and `V2_COMPUTED_UPDATE_MODE=sync`. Reuse those env vars when debugging v2-only behavior.
- Repo-wide unit-test CI intentionally excludes backend and runs `pnpm -F "!@teable/backend" -r --parallel test-unit`.

## v2 HTTP Contract Conventions

- `packages/v2/contract-http` uses action-style paths such as `/tables/createField`, `/tables/listRecords`, `/tables/rename`; do not introduce nested REST paths there.
- HTTP adapters live in `packages/v2/contract-http-*`. `contract-http-express` is a thin router wrapper over the shared contract/implementation packages.

## Hooks

- Pre-commit only runs `pnpm g:lint-staged-files`, which formats staged files through `lint-staged`/Prettier; it is not a substitute for lint/type/test.
- Commit messages are checked by `commitlint` via `.husky/commit-msg`.

## Frontend Chart Stability

- In `apps/nextjs-app`, use `features/app/components/Chart/Chart` as the only ECharts runtime entry.
- Do not call `echarts.init(...)` in feature/page code.
- Prefer `updateMode="replace"` for stable option replacement; only use `updateMode="merge"` when incremental merge is explicitly required.
- Keep chart lifecycle handling (init/reuse/resize/dispose) inside the base chart component.
- For chart-related changes, run:
  - `pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx`
  - `pnpm --filter @teable/app typecheck`

```

### MEMORY.md 相关条目摘录
```md
[项目知识摘要]
- Date: [YYYY-MM-DD]
- Context: Agent 在执行 [具体任务描述] 时发现
- Category: [代码结构|代码模式|代码生成|构建方法|测试方法|依赖关系|环境配置]
- Instructions:
  - [具体的知识点，逐行描述]

[v2-core typecheck 与声明打包需区分源码边界和跨包类型依赖]
- Date: 2026-05-06
- Context: Agent 在清理 `packages/v2/core` 的 typecheck 与 build warning 时发现
- Category: 构建方法
- Instructions:
  - `packages/v2/core` 的 `typecheck` 需要显式补齐 `@teable/core` path 和 `../../core/src` include，否则会把上游类型解析成缺失依赖
  - `packages/v2/core` 的 `tsconfig.json` 应排除 `src/**/*.spec.ts`、`src/**/*.test.ts` 和 `src/testkit/**`，避免生产源码 typecheck 被测试桩拖垮
  - `rolldown-plugin-dts` 对跨包接口和值导出较敏感，端口接口和 visitor 类型应优先使用 `import type`
  - `IExecutionContext.$t` 作为通用执行上下文翻译钩子可接受 `string` key，不必在 `v2-core` 声明层强绑定 `@teable/i18n-keys` 类型导出

[Teable 仓库开发与校验约定]
- Date: 2026-05-06
- Context: Agent 在执行 AGENTS.md 维护任务时发现
- Category: 构建方法
- Instructions:
  - 根仓库只使用 `pnpm`，`packageManager` 固定为 `pnpm@9.13.0`，`npm` 被 engines 明确禁止
  - 本地开发按 `pnpm install` -> `make switch-db-mode` -> `cd apps/nestjs-backend && pnpm dev` 走，前端由 backend dev 流程自动拉起
  - CI 的 lint/type 顺序是 Prisma generate -> `pnpm -F "./packages/**" run build` -> `pnpm g:typecheck` -> `pnpm g:lint` -> `pnpm g:lint-styles`
  - backend e2e 依赖 `pre-test-e2e` 先执行 Prisma seed，重型集成链路走 `make postgres.integration.test`

[VoltAgent / Apple 已有第一轮真实页面试点]
- Date: 2026-05-06
- Context: Agent 按 SDD 模式完成第一轮品牌风格代码落地时发现
- Category: 代码模式
- Instructions:
  - VoltAgent 第一轮试点页面为 `apps/nextjs-app/src/features/app/dashboard/DashboardHeader.tsx`
  - Apple 第一轮试点页面为 `apps/nextjs-app/src/features/app/components/setting/integration/third-party-integrations/Detail.tsx`
  - 当前环境未安装依赖，`pnpm --filter @teable/app typecheck` 会因缺少 `tsc` 和 `node_modules` 阻塞，验证前需先完成依赖安装

[automation overridable 组件通过 tsconfig paths 指向本地实现]
- Date: 2026-05-06
- Context: Agent 在修复 `WorkFlowPanel` 类型断层并追查 automation override 架构时发现
- Category: 代码结构
- Instructions:
  - `apps/nextjs-app/tsconfig.json` 中 `@overridable/WorkFlowPanel` 直接映射到 `./features/app/automation/workflow-panel/WorkFlowPanel`
  - 当前仓库中 `AutomationPage` 定义在 `apps/nextjs-app/src/features/app/automation/Pages.tsx`，已是实际 workflow 页面实现，并由 `apps/nextjs-app/src/features/app/base-node/WorkflowPage.tsx` 直接渲染
  - `apps/nextjs-app/src/features/app/automation/workflow-panel/WorkFlowPanel.tsx` 已暴露 `getWorkflow`、`checkCanActive`、`activeWorkflow` 等实际运行时方法
  - 后续增强 `WorkFlowPanelRef` 时应基于现有真实页面与运行时方法扩展，避免回退到占位页假设

[前端 typecheck 可能被跨包断链阻塞]
- Date: 2026-05-06
- Context: Agent 在修复 `WorkFlowPanel` 后重新执行 `pnpm --filter @teable/app typecheck` 时发现
- Category: 依赖关系
- Instructions:
  - `packages/openapi/src/automation/index.ts` 当前导出了不存在的 `./workflow/types`、`./workflow/get`、`./workflow/get-execution-list`、`./workflow/update`、`./workflow/delete`
  - `packages/sdk/src/hooks/index.ts` 当前导出了不存在的 `./use-ai-record-operations`
  - 前端 typecheck 失败不一定来自页面改动，需同时检查被 `paths` 引入的 workspace 包源码导出是否仍然存在

[前端测试 mock 需跟随 core schema 演进同步更新]
- Date: 2026-05-06
- Context: Agent 在清理 `@teable/app` 前端 typecheck 阻塞时发现
- Category: 测试方法
- Instructions:
  - `selectionViewQuery` 相关测试里的排序值应优先使用 `@teable/core` 的 `SortFunc` 枚举，而不是裸字符串字面量
  - `FieldSetting` 相关 lookup mock 需要跟随 `IFieldVo.lookupOptions` 的 schema 演进，同步补齐 `relationship`、`fkHostTableName`、`selfKeyName`、`foreignKeyName` 等必填字段
  - `DeleteSelectionProgressDialog` 测试应匹配 UI 适配层收窄后的 phase，当前对话框层只接受 `preparing`/`deleting` 源事件并映射到内部 phase

[workflow 面板当前应作为上下文工作区而非伪造编辑器]
- Date: 2026-05-06
- Context: Agent 在继续推进 `WorkFlowPanel` 接近真实运行时时发现
- Category: 代码结构
- Instructions:
  - 当前仓库前端已存在真实 workflow 页面入口与运行时方法，`WorkFlowPanel` 既承载 workflow 上下文，也承载实际查询与激活动作
  - `WorkFlowPanel` 仍适合作为 workflow 上下文、入口动作和右侧 `app-mode` 配置的统一工作区，并继续避免引入脱离现有页面模型的额外伪接口
  - 当从按钮字段配置进入 workflow 面板时，优先展示 `workflowId`、`baseId`、触发字段等上下文，帮助用户把 automation 配置与 app-mode 治理放在同一工作区理解

[用户要求按 SDD 模式继续全量执行]
- Date: 2026-05-07
- Context: 用户要求围绕 PDF 预览与关联字段导航继续执行全部工作
- Instructions:
  - 按 SDD 模式同时维护规格文档与代码实现，不只停留在分析
  - 在没有真实阻塞前持续推进后续改造、测试与验证，不重复询问是否继续

[backend 单文件 e2e 需要补齐 seed 与 SQL executor 环境开关]
- Date: 2026-05-07
- Context: Agent 在新增 PDF attachment e2e 并单独运行 `apps/nestjs-backend/test/attachment.e2e-spec.ts` 时发现
- Category: 测试方法
- Instructions:
  - backend 单文件 e2e 不能直接裸跑；至少要先执行 `pnpm pre-test-e2e`，确保 `globalThis.testConfig` 对应的测试账号和 base 已 seed 完成
  - 当前受限本地 Postgres 环境里，若缺少 `CREATE ROLE` 权限，需要为 e2e 临时加 `DISABLE_PRE_SQL_EXECUTOR_CHECK=true`，跳过 `BaseSqlExecutorService` 的只读角色预检查
  - `apps/nestjs-backend/test/attachment.e2e-spec.ts` 的 PDF thumbnail 断言应以“至少一个 thumbnail URL 已生成，且不回退到原始 `presignedUrl`”为准，不应强制要求 `lgThumbnailUrl` 必然存在

[AI Chat 后端复用现有模型配置和 AI SDK 工具类型]
- Date: 2026-05-09
- Context: Agent 在修复 AI Chat 后端 typecheck 与 Tool Calling 时发现
- Category: 代码模式
- Instructions:
  - `apps/nestjs-backend` 的 AI Chat 流式模型应复用 `AiService.getAIConfig(baseId)` 和 `AiService.getModelInstance(modelKey, llmProviders)`，不要绕过现有 provider 配置重新组装模型
  - AI SDK v6 工具应在服务里直接返回 `tool({ inputSchema, execute })` 对象，避免把 schema/execute 拆成自定义定义后再包装导致 `Tool<never>` 推断错误
  - AI SDK v6 `streamText` 文本分片当前使用 `chunk.type === 'text-delta'` 且读取 `chunk.text`，多步工具调用使用 `stopWhen: stepCountIs(5)`
  - AI Chat 记录读写应走 `RecordService` / `RecordOpenApiService`，不要直接 SQL 操作不存在的通用 `table_records` 表

[当前仓库自动化运行时为占位与企业版外接边界]
- Date: 2026-05-10
- Context: Agent 在对照 Teable 官方自动化文档评估本仓库实现时发现
- Category: 代码结构
- Instructions:
  - 当前开源仓库已具备 workflow 页面入口、`WorkFlowPanel` 本地实现和 `getWorkflow`、`checkCanActive`、`activeWorkflow` 等运行时方法，前端不再属于纯占位页状态
  - Prisma 当前 schema 不包含可用 Workflow model；旧 `automation_workflow*` 表在后续迁移中被删除，后续迁移只兼容检测可能存在的企业版 `workflow` 表
  - 若要进一步补齐官方自动化能力，重点仍在统一 workflow 存储、触发器、动作、测试、发布、运行历史和执行器，而不是只追加前端表层交互
```

## 3. Git 状态
### `git status --short`
```text
 M apps/nestjs-backend/src/features/workflow/script/script-runtime.module.ts
 M apps/nestjs-backend/src/features/workflow/script/script-runtime.service.spec.ts
 M apps/nestjs-backend/src/features/workflow/script/script-runtime.service.ts
 M apps/nestjs-backend/src/features/workflow/workflow-runner.service.spec.ts
 M apps/nestjs-backend/src/features/workflow/workflow-runner.service.ts
 M apps/nestjs-backend/src/features/workflow/workflow.controller.ts
 M apps/nestjs-backend/src/features/workflow/workflow.module.ts
 M apps/nestjs-backend/src/features/workflow/workflow.service.ts
 M apps/nextjs-app/src/features/app/automation/Pages.tsx
 M apps/nextjs-app/src/features/app/base-node/index.ts
 M apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx
 M apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx
 M apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceRenderer.tsx
 M apps/nextjs-app/src/features/app/published-app/runtime/index.ts
 M apps/nextjs-app/src/features/app/published-app/shell/DesktopShell.tsx
 M apps/nextjs-app/src/features/app/published-app/shell/MobileShell.tsx
 M apps/nextjs-app/src/features/app/published-app/shell/PublishedAppBottomNav.tsx
 M apps/nextjs-app/src/features/app/published-app/shell/PublishedAppDrawer.tsx
 M apps/nextjs-app/src/features/app/published-app/shell/PublishedAppHeader.tsx
 M apps/nextjs-app/src/features/app/published-app/shell/TabletShell.tsx
 M apps/nextjs-app/src/pages/base/[baseId]/[[...slug]].tsx
 M apps/nextjs-app/src/pages/share/[shareId]/base/[baseId]/[[...slug]].tsx
 M package.json
 M packages/i18n-keys/package.json
 M packages/openapi/src/automation/index.ts
 M packages/v2/adapter-csv-parser-papaparse/package.json
 M packages/v2/adapter-undo-redo-keyv/package.json
 M packages/v2/contract-http/src/contract.ts
?? .monkeycode/docs/teable-feishu-capability-gap-analysis-2026-05-13.md
?? apps/nestjs-backend/src/features/authority-matrix/
?? apps/nestjs-backend/src/features/workflow/actions/
?? apps/nestjs-backend/src/features/workflow/script/disabled-script-runtime.service.ts
?? apps/nestjs-backend/src/features/workflow/script/script-runtime.interface.ts
?? apps/nestjs-backend/src/features/workflow/workflow-capability.service.ts
?? apps/nestjs-backend/src/features/workflow/workflow-run-state.spec.ts
?? apps/nestjs-backend/src/features/workflow/workflow-run-state.ts
?? apps/nextjs-app/src/features/app/automation/lib/
?? apps/nextjs-app/src/features/app/base-node/BaseNodePageSwitch.tsx
?? apps/nextjs-app/src/features/app/base-node/getResourcePageProps.ts
?? apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceState.tsx
?? apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceSwitch.tsx
?? apps/nextjs-app/src/features/app/published-app/runtime/resources/
?? apps/nextjs-app/src/features/app/published-app/shell/PublishedAppNavItem.tsx
?? packages/openapi/src/automation/workflow/get-capabilities.ts
```

### `git branch --show-current`
```text
develop
```

### `git diff --stat`
```text
 .../workflow/script/script-runtime.module.ts       |   8 +-
 .../workflow/script/script-runtime.service.spec.ts |   8 +-
 .../workflow/script/script-runtime.service.ts      |  21 +-
 .../workflow/workflow-runner.service.spec.ts       |  91 +++++--
 .../features/workflow/workflow-runner.service.ts   | 241 ++++++++++++-----
 .../src/features/workflow/workflow.controller.ts   |  59 +++--
 .../src/features/workflow/workflow.module.ts       |   9 +-
 .../src/features/workflow/workflow.service.ts      |   9 +-
 .../src/features/app/automation/Pages.tsx          | 288 +++++----------------
 .../nextjs-app/src/features/app/base-node/index.ts |   2 +
 .../src/features/app/layouts/ShareBaseLayout.tsx   |  34 ++-
 .../published-app/context/PublishedAppContext.tsx  |   5 +-
 .../runtime/PublishedResourceRenderer.tsx          |   7 +-
 .../features/app/published-app/runtime/index.ts    |   2 +
 .../app/published-app/shell/DesktopShell.tsx       |  26 +-
 .../app/published-app/shell/MobileShell.tsx        |  10 +-
 .../published-app/shell/PublishedAppBottomNav.tsx  |  27 +-
 .../app/published-app/shell/PublishedAppDrawer.tsx |  24 +-
 .../app/published-app/shell/PublishedAppHeader.tsx |  14 +-
 .../app/published-app/shell/TabletShell.tsx        |  12 +-
 .../src/pages/base/[baseId]/[[...slug]].tsx        |  49 +---
 .../share/[shareId]/base/[baseId]/[[...slug]].tsx  |  49 +---
 package.json                                       |   2 +-
 packages/i18n-keys/package.json                    |   2 +-
 packages/openapi/src/automation/index.ts           |   1 +
 .../v2/adapter-csv-parser-papaparse/package.json   |   2 +-
 packages/v2/adapter-undo-redo-keyv/package.json    |   2 +-
 packages/v2/contract-http/src/contract.ts          |   4 +-
 28 files changed, 528 insertions(+), 480 deletions(-)
```

### `git diff --name-only`
```text
apps/nestjs-backend/src/features/workflow/script/script-runtime.module.ts
apps/nestjs-backend/src/features/workflow/script/script-runtime.service.spec.ts
apps/nestjs-backend/src/features/workflow/script/script-runtime.service.ts
apps/nestjs-backend/src/features/workflow/workflow-runner.service.spec.ts
apps/nestjs-backend/src/features/workflow/workflow-runner.service.ts
apps/nestjs-backend/src/features/workflow/workflow.controller.ts
apps/nestjs-backend/src/features/workflow/workflow.module.ts
apps/nestjs-backend/src/features/workflow/workflow.service.ts
apps/nextjs-app/src/features/app/automation/Pages.tsx
apps/nextjs-app/src/features/app/base-node/index.ts
apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx
apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx
apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceRenderer.tsx
apps/nextjs-app/src/features/app/published-app/runtime/index.ts
apps/nextjs-app/src/features/app/published-app/shell/DesktopShell.tsx
apps/nextjs-app/src/features/app/published-app/shell/MobileShell.tsx
apps/nextjs-app/src/features/app/published-app/shell/PublishedAppBottomNav.tsx
apps/nextjs-app/src/features/app/published-app/shell/PublishedAppDrawer.tsx
apps/nextjs-app/src/features/app/published-app/shell/PublishedAppHeader.tsx
apps/nextjs-app/src/features/app/published-app/shell/TabletShell.tsx
apps/nextjs-app/src/pages/base/[baseId]/[[...slug]].tsx
apps/nextjs-app/src/pages/share/[shareId]/base/[baseId]/[[...slug]].tsx
package.json
packages/i18n-keys/package.json
packages/openapi/src/automation/index.ts
packages/v2/adapter-csv-parser-papaparse/package.json
packages/v2/adapter-undo-redo-keyv/package.json
packages/v2/contract-http/src/contract.ts
```

### `git diff --check`
```text
(无输出)
```

## 4. Git Diff
```diff
diff --git a/apps/nestjs-backend/src/features/workflow/script/script-runtime.module.ts b/apps/nestjs-backend/src/features/workflow/script/script-runtime.module.ts
index a1d261c..31b9489 100644
--- a/apps/nestjs-backend/src/features/workflow/script/script-runtime.module.ts
+++ b/apps/nestjs-backend/src/features/workflow/script/script-runtime.module.ts
@@ -1,8 +1,14 @@
 import { Module } from '@nestjs/common';
+import { DisabledScriptRuntimeService } from './disabled-script-runtime.service';
+import { scriptRuntimeToken } from './script-runtime.interface';
 import { ScriptRuntimeService } from './script-runtime.service';
 
 @Module({
-  providers: [ScriptRuntimeService],
+  providers: [
+    DisabledScriptRuntimeService,
+    ScriptRuntimeService,
+    { provide: scriptRuntimeToken, useExisting: DisabledScriptRuntimeService },
+  ],
   exports: [ScriptRuntimeService],
 })
 export class ScriptRuntimeModule {}
diff --git a/apps/nestjs-backend/src/features/workflow/script/script-runtime.service.spec.ts b/apps/nestjs-backend/src/features/workflow/script/script-runtime.service.spec.ts
index edb18ac..ec0d189 100644
--- a/apps/nestjs-backend/src/features/workflow/script/script-runtime.service.spec.ts
+++ b/apps/nestjs-backend/src/features/workflow/script/script-runtime.service.spec.ts
@@ -1,4 +1,6 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
+import { DisabledScriptRuntimeService } from './disabled-script-runtime.service';
+import { SCRIPT_RUNTIME_DISABLED_MESSAGE } from './script-runtime.interface';
 import { ScriptRuntimeService } from './script-runtime.service';
 
 describe('ScriptRuntimeService', () => {
@@ -6,14 +8,12 @@ describe('ScriptRuntimeService', () => {
 
   beforeEach(() => {
     vi.clearAllMocks();
-    service = new ScriptRuntimeService();
+    service = new ScriptRuntimeService(new DisabledScriptRuntimeService());
   });
 
   it('rejects server-side custom script execution', async () => {
     await expect(
       service.execute('return input;', { baseId: 'bse123', input: { recordId: 'rec123' } })
-    ).rejects.toThrow(
-      'Run Script workflow actions are disabled until a process-isolated sandbox is available'
-    );
+    ).rejects.toThrow(SCRIPT_RUNTIME_DISABLED_MESSAGE);
   });
 });
diff --git a/apps/nestjs-backend/src/features/workflow/script/script-runtime.service.ts b/apps/nestjs-backend/src/features/workflow/script/script-runtime.service.ts
index b90b933..e60d4da 100644
--- a/apps/nestjs-backend/src/features/workflow/script/script-runtime.service.ts
+++ b/apps/nestjs-backend/src/features/workflow/script/script-runtime.service.ts
@@ -1,18 +1,15 @@
-import { Injectable } from '@nestjs/common';
-
-interface IScriptContext {
-  baseId: string;
-  input: unknown;
-}
+import { Inject, Injectable } from '@nestjs/common';
+import {
+  IScriptRuntime,
+  scriptRuntimeToken,
+  type IScriptContext,
+} from './script-runtime.interface';
 
 @Injectable()
 export class ScriptRuntimeService {
-  async execute(script: string, context: IScriptContext): Promise<unknown> {
-    void script;
-    void context;
+  constructor(@Inject(scriptRuntimeToken) private readonly scriptRuntime: IScriptRuntime) {}
 
-    throw new Error(
-      'Run Script workflow actions are disabled until a process-isolated sandbox is available'
-    );
+  execute(script: string, context: IScriptContext): Promise<unknown> {
+    return this.scriptRuntime.execute(script, context);
   }
 }
diff --git a/apps/nestjs-backend/src/features/workflow/workflow-runner.service.spec.ts b/apps/nestjs-backend/src/features/workflow/workflow-runner.service.spec.ts
index e738013..6cd6aa3 100644
--- a/apps/nestjs-backend/src/features/workflow/workflow-runner.service.spec.ts
+++ b/apps/nestjs-backend/src/features/workflow/workflow-runner.service.spec.ts
@@ -4,6 +4,10 @@ import { WorkflowRunnerService } from './workflow-runner.service';
 describe('WorkflowRunnerService', () => {
   const runId = 'wrun123';
   const baseId = 'bse123';
+  const recordId = 'rec123';
+  const generatedSummary = 'Generated summary';
+  const disabledScriptRuntimeMessage =
+    'Run Script workflow actions are disabled until a process-isolated sandbox is available';
   const startedTime = new Date('2026-05-11T00:00:00.000Z');
   const prismaService = {
     workflowRun: {
@@ -28,8 +32,11 @@ describe('WorkflowRunnerService', () => {
   const recordService = {
     getRecords: vi.fn(),
   };
-  const permissionService = {
-    validPermissions: vi.fn(),
+  const authorityPolicyService = {
+    assertWorkflowExecute: vi.fn(),
+    assertRecordRead: vi.fn(),
+    assertRecordCreate: vi.fn(),
+    assertRecordUpdate: vi.fn(),
   };
   const clsService = {
     get: vi.fn(),
@@ -45,7 +52,7 @@ describe('WorkflowRunnerService', () => {
       workflowAiService as never,
       recordsService as never,
       recordService as never,
-      permissionService as never,
+      authorityPolicyService as never,
       clsService as never
     );
   });
@@ -53,7 +60,7 @@ describe('WorkflowRunnerService', () => {
   it('completes a run without script actions', async () => {
     prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
       id: runId,
-      input: { recordId: 'rec123' },
+      input: { recordId },
       workflow: { baseId },
       snapshot: { snapshot: { baseId, nodes: [] } },
     });
@@ -76,7 +83,7 @@ describe('WorkflowRunnerService', () => {
   it('marks run failed when runScript execution is disabled', async () => {
     prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
       id: runId,
-      input: { recordId: 'rec123' },
+      input: { recordId },
       workflow: { baseId },
       snapshot: {
         snapshot: {
@@ -93,25 +100,20 @@ describe('WorkflowRunnerService', () => {
       },
     });
     prismaService.workflowRunStep.create.mockResolvedValue({ id: 'step123', startedTime });
-    scriptRuntimeService.execute.mockRejectedValue(
-      new Error(
-        'Run Script workflow actions are disabled until a process-isolated sandbox is available'
-      )
-    );
+    scriptRuntimeService.execute.mockRejectedValue(new Error(disabledScriptRuntimeMessage));
 
     await service.executeWorkflowRun(runId);
 
     expect(scriptRuntimeService.execute).toHaveBeenCalledWith('return input;', {
       baseId,
-      input: { recordId: 'rec123' },
+      input: { recordId },
     });
     expect(prismaService.workflowRunStep.update).toHaveBeenCalledWith({
       where: { id: 'step123' },
       data: expect.objectContaining({
         status: 'failed',
         error: {
-          message:
-            'Run Script workflow actions are disabled until a process-isolated sandbox is available',
+          message: disabledScriptRuntimeMessage,
         },
       }),
     });
@@ -120,8 +122,7 @@ describe('WorkflowRunnerService', () => {
       data: expect.objectContaining({
         status: 'failed',
         error: {
-          message:
-            'Run Script workflow actions are disabled until a process-isolated sandbox is available',
+          message: disabledScriptRuntimeMessage,
         },
       }),
     });
@@ -215,7 +216,7 @@ describe('WorkflowRunnerService', () => {
   it('executes aiGenerate actions and records generated text', async () => {
     prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
       id: runId,
-      input: { recordId: 'rec123' },
+      input: { recordId },
       workflow: { baseId },
       snapshot: {
         snapshot: {
@@ -232,26 +233,76 @@ describe('WorkflowRunnerService', () => {
       },
     });
     prismaService.workflowRunStep.create.mockResolvedValue({ id: 'step-ai', startedTime });
-    workflowAiService.generateText.mockResolvedValue('Generated summary');
+    workflowAiService.generateText.mockResolvedValue(generatedSummary);
 
     await service.executeWorkflowRun(runId);
 
     expect(workflowAiService.generateText).toHaveBeenCalledWith(baseId, {
-      prompt: 'Summarize {"recordId":"rec123"}',
+      prompt: `Summarize {"recordId":"${recordId}"}`,
       modelKey: 'gpt',
     });
     expect(prismaService.workflowRunStep.update).toHaveBeenCalledWith({
       where: { id: 'step-ai' },
       data: expect.objectContaining({
         status: 'completed',
-        output: { text: 'Generated summary' },
+        output: { text: generatedSummary },
+      }),
+    });
+    expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
+      where: { id: runId },
+      data: expect.objectContaining({
+        status: 'completed',
+        output: { text: generatedSummary },
       }),
     });
+  });
+
+  it('executes updateRecords actions with trigger input interpolation', async () => {
+    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
+      id: runId,
+      input: { tableId: 'tbl123', record: { id: recordId, fields: { name: 'Old' } } },
+      workflow: { baseId },
+      snapshot: {
+        snapshot: {
+          baseId,
+          nodes: [
+            {
+              id: 'wa-update',
+              nodeType: 'action',
+              kind: 'updateRecords',
+              config: {
+                tableId: '{{ input.tableId }}',
+                recordId: '{{ input.record.id }}',
+                fields: { status: 'processed', sourceName: '{{ input.record.fields.name }}' },
+              },
+            },
+          ],
+        },
+      },
+    });
+    prismaService.workflowRunStep.create.mockResolvedValue({ id: 'step-update', startedTime });
+    recordsService.updateRecord.mockResolvedValue({
+      id: recordId,
+      fields: { status: 'processed' },
+    });
+
+    await service.executeWorkflowRun(runId);
+
+    expect(authorityPolicyService.assertRecordUpdate).toHaveBeenCalledWith('tbl123');
+    expect(recordsService.updateRecord).toHaveBeenCalledWith(
+      'tbl123',
+      recordId,
+      {
+        record: { fields: { status: 'processed', sourceName: 'Old' } },
+      },
+      undefined,
+      'true'
+    );
     expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
       where: { id: runId },
       data: expect.objectContaining({
         status: 'completed',
-        output: { text: 'Generated summary' },
+        output: { id: recordId, fields: { status: 'processed' } },
       }),
     });
   });
diff --git a/apps/nestjs-backend/src/features/workflow/workflow-runner.service.ts b/apps/nestjs-backend/src/features/workflow/workflow-runner.service.ts
index 05789bf..7e669b5 100644
--- a/apps/nestjs-backend/src/features/workflow/workflow-runner.service.ts
+++ b/apps/nestjs-backend/src/features/workflow/workflow-runner.service.ts
@@ -1,14 +1,21 @@
 import { Injectable } from '@nestjs/common';
-import { PrismaService } from '@teable/db-main-prisma';
-import { Prisma } from '@prisma/client';
 import type { IFilterSet } from '@teable/core';
+import { PrismaService } from '@teable/db-main-prisma';
 import { ClsService } from 'nestjs-cls';
 import type { IClsStore } from '../../types/cls';
-import { PermissionService } from '../auth/permission.service';
+import { AuthorityPolicyService } from '../authority-matrix/authority-policy.service';
 import { RecordOpenApiService } from '../record/open-api/record-open-api.service';
 import { RecordService } from '../record/record.service';
 import { ScriptRuntimeService } from './script/script-runtime.service';
 import { WorkflowAiService } from './workflow-ai.service';
+import {
+  buildWorkflowRunFailureData,
+  buildWorkflowRunStartData,
+  buildWorkflowRunStepFailureData,
+  buildWorkflowRunStepStartData,
+  buildWorkflowRunStepSuccessData,
+  buildWorkflowRunSuccessData,
+} from './workflow-run-state';
 
 interface IWorkflowSnapshotNode {
   id: string;
@@ -24,10 +31,6 @@ interface IWorkflowSnapshot {
   nodes?: IWorkflowSnapshotNode[];
 }
 
-function toJson(value: unknown): Prisma.InputJsonValue {
-  return (value ?? Prisma.JsonNull) as Prisma.InputJsonValue;
-}
-
 function getScript(config: unknown): string | undefined {
   if (!config || typeof config !== 'object') {
     return undefined;
@@ -50,6 +53,121 @@ function getAiGenerateConfig(config: unknown): { prompt: string; modelKey?: stri
   };
 }
 
+function getUpdateRecordsConfig(
+  config: unknown
+): { tableId: string; recordId: string; fields: Record<string, unknown> } | undefined {
+  if (!config || typeof config !== 'object') {
+    return undefined;
+  }
+  const { tableId, recordId, fields } = config as {
+    tableId?: unknown;
+    recordId?: unknown;
+    fields?: unknown;
+  };
+  if (
+    typeof tableId !== 'string' ||
+    !tableId.trim() ||
+    typeof recordId !== 'string' ||
+    !recordId.trim() ||
+    !fields ||
+    typeof fields !== 'object' ||
+    Array.isArray(fields)
+  ) {
+    return undefined;
+  }
+  return { tableId, recordId, fields: fields as Record<string, unknown> };
+}
+
+function getCreateRecordsConfig(
+  config: unknown
+): { tableId: string; records: Record<string, unknown>[] } | undefined {
+  if (!config || typeof config !== 'object') {
+    return undefined;
+  }
+  const { tableId, records } = config as { tableId?: unknown; records?: unknown };
+  if (
+    typeof tableId !== 'string' ||
+    !tableId.trim() ||
+    !Array.isArray(records) ||
+    !records.length ||
+    records.some((record) => !record || typeof record !== 'object' || Array.isArray(record))
+  ) {
+    return undefined;
+  }
+  return { tableId, records: records as Record<string, unknown>[] };
+}
+
+function getQueryRecordsConfig(
+  config: unknown
+): { tableId: string; filter?: IFilterSet; take?: number } | undefined {
+  if (!config || typeof config !== 'object') {
+    return undefined;
+  }
+  const { tableId, filter, take } = config as {
+    tableId?: unknown;
+    filter?: unknown;
+    take?: unknown;
+  };
+  if (
+    typeof tableId !== 'string' ||
+    !tableId.trim() ||
+    (filter != null && (typeof filter !== 'object' || Array.isArray(filter))) ||
+    (take != null && (typeof take !== 'number' || !Number.isInteger(take) || take <= 0))
+  ) {
+    return undefined;
+  }
+  return {
+    tableId,
+    ...(filter && { filter: filter as IFilterSet }),
+    ...(take != null && { take }),
+  };
+}
+
+const supportedActionKinds = [
+  'runScript',
+  'aiGenerate',
+  'updateRecords',
+  'createRecords',
+  'queryRecords',
+];
+
+function interpolateValue(value: unknown, input: unknown): unknown {
+  if (typeof value === 'string') {
+    return interpolateTemplate(value, input);
+  }
+
+  if (Array.isArray(value)) {
+    return value.map((item) => interpolateValue(item, input));
+  }
+
+  if (value && typeof value === 'object') {
+    return Object.fromEntries(
+      Object.entries(value).map(([key, item]) => [key, interpolateValue(item, input)])
+    );
+  }
+
+  return value;
+}
+
+function getInputPathValue(input: unknown, path: string) {
+  return path.split('.').reduce<unknown>((current, segment) => {
+    if (!current || typeof current !== 'object') {
+      return undefined;
+    }
+    return (current as Record<string, unknown>)[segment.replace(/\?$/, '')];
+  }, input);
+}
+
+function interpolateTemplate(template: string, input: unknown) {
+  return template.replace(/\{\{\s*input(?:\.([\w?.]+))?\s*\}\}/g, (_match, path?: string) => {
+    const value = path ? getInputPathValue(input, path) : input;
+    if (value == null) {
+      return '';
+    }
+    return typeof value === 'string' ? value : JSON.stringify(value);
+  });
+}
+
 function sortActionsByChain(actions: IWorkflowSnapshotNode[]) {
   const actionMap = new Map(actions.map((action) => [action.id, action]));
   const firstAction = actions.find(
@@ -81,7 +199,7 @@ export class WorkflowRunnerService {
     private readonly workflowAiService: WorkflowAiService,
     private readonly recordsService: RecordOpenApiService,
     private readonly recordService: RecordService,
-    private readonly permissionService: PermissionService,
+    private readonly authorityPolicyService: AuthorityPolicyService,
     private readonly cls: ClsService<IClsStore>
   ) {}
 
@@ -115,18 +233,16 @@ export class WorkflowRunnerService {
 
     await this.prismaService.workflowRun.update({
       where: { id: runId },
-      data: { status: 'running', startedTime },
+      data: buildWorkflowRunStartData(startedTime),
     });
 
     if (!actions.length) {
       await this.prismaService.workflowRun.update({
         where: { id: runId },
-        data: {
-          status: 'completed',
-          finishedTime: startedTime,
-          durationMs: 0,
-          output: { skipped: true, reason: 'No workflow runner actions are configured yet' },
-        },
+        data: buildWorkflowRunSuccessData(startedTime, startedTime, {
+          skipped: true,
+          reason: 'No workflow runner actions are configured yet',
+        }),
       });
       return;
     }
@@ -141,24 +257,14 @@ export class WorkflowRunnerService {
       const finishedTime = new Date();
       await this.prismaService.workflowRun.update({
         where: { id: runId },
-        data: {
-          status: 'completed',
-          finishedTime,
-          durationMs: finishedTime.getTime() - startedTime.getTime(),
-          output: toJson(currentInput),
-        },
+        data: buildWorkflowRunSuccessData(startedTime, finishedTime, currentInput),
       });
     } catch (error) {
       const finishedTime = new Date();
       const message = error instanceof Error ? error.message : String(error);
       await this.prismaService.workflowRun.update({
         where: { id: runId },
-        data: {
-          status: 'failed',
-          finishedTime,
-          durationMs: finishedTime.getTime() - startedTime.getTime(),
-          error: { message },
-        },
+        data: buildWorkflowRunFailureData(startedTime, finishedTime, message),
       });
     }
   }
@@ -170,12 +276,7 @@ export class WorkflowRunnerService {
     input: unknown
   ): Promise<unknown> {
     const step = await this.prismaService.workflowRunStep.create({
-      data: {
-        runId,
-        nodeId: action.id,
-        status: 'running',
-        input: toJson(input),
-      },
+      data: buildWorkflowRunStepStartData(runId, action.id, input),
       select: { id: true, startedTime: true },
     });
 
@@ -183,11 +284,7 @@ export class WorkflowRunnerService {
     if (invalidMessage) {
       await this.prismaService.workflowRunStep.update({
         where: { id: step.id },
-        data: {
-          status: 'failed',
-          finishedTime: new Date(),
-          error: { message: invalidMessage },
-        },
+        data: buildWorkflowRunStepFailureData(step.startedTime, new Date(), invalidMessage),
       });
       throw new Error(invalidMessage);
     }
@@ -197,12 +294,7 @@ export class WorkflowRunnerService {
       const finishedTime = new Date();
       await this.prismaService.workflowRunStep.update({
         where: { id: step.id },
-        data: {
-          status: 'completed',
-          output: toJson(output),
-          finishedTime,
-          durationMs: finishedTime.getTime() - step.startedTime.getTime(),
-        },
+        data: buildWorkflowRunStepSuccessData(step.startedTime, finishedTime, output),
       });
       return output;
     } catch (error) {
@@ -210,12 +302,7 @@ export class WorkflowRunnerService {
       const message = error instanceof Error ? error.message : String(error);
       await this.prismaService.workflowRunStep.update({
         where: { id: step.id },
-        data: {
-          status: 'failed',
-          error: { message },
-          finishedTime,
-          durationMs: finishedTime.getTime() - step.startedTime.getTime(),
-        },
+        data: buildWorkflowRunStepFailureData(step.startedTime, finishedTime, message),
       });
       throw error;
     }
@@ -228,7 +315,16 @@ export class WorkflowRunnerService {
     if (action.kind === 'aiGenerate' && !getAiGenerateConfig(action.config)) {
       return `AI Generate node ${action.id} is missing prompt`;
     }
-    if (!['runScript', 'aiGenerate'].includes(action.kind)) {
+    if (action.kind === 'updateRecords' && !getUpdateRecordsConfig(action.config)) {
+      return `Update Records node ${action.id} is missing tableId, recordId, or fields`;
+    }
+    if (action.kind === 'createRecords' && !getCreateRecordsConfig(action.config)) {
+      return `Create Records node ${action.id} is missing tableId or records`;
+    }
+    if (action.kind === 'queryRecords' && !getQueryRecordsConfig(action.config)) {
+      return `Query Records node ${action.id} is missing tableId or has invalid query options`;
+    }
+    if (!supportedActionKinds.includes(action.kind)) {
       return `Unsupported workflow action ${action.kind}`;
     }
     return undefined;
@@ -240,12 +336,12 @@ export class WorkflowRunnerService {
     input: unknown
   ) {
     if (action.kind === 'runScript') {
-      await this.permissionService.validPermissions(baseId, ['automation|update']);
+      await this.authorityPolicyService.assertWorkflowExecute(baseId);
       return this.scriptRuntimeService.execute(getScript(action.config)!, { baseId, input });
     }
 
     if (action.kind === 'aiGenerate') {
-      await this.permissionService.validPermissions(baseId, ['automation|read']);
+      await this.authorityPolicyService.assertWorkflowExecute(baseId);
       const text = await this.workflowAiService.generateText(baseId, {
         prompt: this.interpolatePrompt(getAiGenerateConfig(action.config)!.prompt, input),
         ...(getAiGenerateConfig(action.config)!.modelKey && {
@@ -257,12 +353,13 @@ export class WorkflowRunnerService {
 
     // Handle record actions
     if (action.kind === 'updateRecords') {
-      const config = action.config as {
-        tableId: string;
-        recordId: string;
-        fields: Record<string, unknown>;
-      };
-      await this.permissionService.validPermissions(config.tableId, ['record|update']);
+      const config = interpolateValue(getUpdateRecordsConfig(action.config)!, input) as ReturnType<
+        typeof getUpdateRecordsConfig
+      >;
+      if (!config?.tableId || !config.recordId) {
+        throw new Error(`Update Records node ${action.id} resolved empty tableId or recordId`);
+      }
+      await this.authorityPolicyService.assertRecordUpdate(config.tableId);
       return this.recordsService.updateRecord(
         config.tableId,
         config.recordId,
@@ -275,8 +372,13 @@ export class WorkflowRunnerService {
     }
 
     if (action.kind === 'createRecords') {
-      const config = action.config as { tableId: string; records: Record<string, unknown>[] };
-      await this.permissionService.validPermissions(config.tableId, ['record|create']);
+      const config = interpolateValue(getCreateRecordsConfig(action.config)!, input) as ReturnType<
+        typeof getCreateRecordsConfig
+      >;
+      if (!config?.tableId) {
+        throw new Error(`Create Records node ${action.id} resolved empty tableId`);
+      }
+      await this.authorityPolicyService.assertRecordCreate(config.tableId);
       return this.recordsService.multipleCreateRecords(
         config.tableId,
         { records: config.records.map((fields) => ({ fields })) },
@@ -286,14 +388,15 @@ export class WorkflowRunnerService {
     }
 
     if (action.kind === 'queryRecords') {
-      const config = action.config as {
-        tableId: string;
-        filter?: Record<string, unknown>;
-        take?: number;
-      };
-      await this.permissionService.validPermissions(config.tableId, ['record|read']);
+      const config = interpolateValue(getQueryRecordsConfig(action.config)!, input) as ReturnType<
+        typeof getQueryRecordsConfig
+      >;
+      if (!config?.tableId) {
+        throw new Error(`Query Records node ${action.id} resolved empty tableId`);
+      }
+      await this.authorityPolicyService.assertRecordRead(config.tableId);
       return this.recordService.getRecords(config.tableId, {
-        filter: config.filter as IFilterSet | undefined,
+        filter: config.filter,
         take: config.take,
       });
     }
@@ -302,6 +405,6 @@ export class WorkflowRunnerService {
   }
 
   private interpolatePrompt(prompt: string, input: unknown) {
-    return prompt.replace(/\{\{\s*input\s*\}\}/g, () => JSON.stringify(input));
+    return interpolateTemplate(prompt, input);
   }
 }
diff --git a/apps/nestjs-backend/src/features/workflow/workflow.controller.ts b/apps/nestjs-backend/src/features/workflow/workflow.controller.ts
index d932c9c..b56e689 100644
--- a/apps/nestjs-backend/src/features/workflow/workflow.controller.ts
+++ b/apps/nestjs-backend/src/features/workflow/workflow.controller.ts
@@ -3,6 +3,7 @@ import type {
   IAiCreateWorkflowDraftRo,
   IDuplicateWorkflowRo,
   IUpdateWorkflowRo,
+  IWorkflowCapabilitiesVo,
   IWorkflowDetailVo,
   IWorkflowRo,
   IWorkflowRunDetailVo,
@@ -20,24 +21,37 @@ import { EmitControllerEvent } from '../../event-emitter/decorators/emit-control
 import { Events } from '../../event-emitter/events';
 import { ZodValidationPipe } from '../../zod.validation.pipe';
 import { Permissions } from '../auth/decorators/permissions.decorator';
+import { WorkflowCapabilityService } from './workflow-capability.service';
 import { WorkflowRunnerService } from './workflow-runner.service';
 import { WorkflowService } from './workflow.service';
 
+const automationReadPermission = 'automation|read';
+const automationCreatePermission = 'automation|create';
+const automationUpdatePermission = 'automation|update';
+const workflowIdParam = ':workflowId';
+
 @Controller('api/base/:baseId/workflow')
 export class WorkflowController {
   constructor(
     private readonly workflowService: WorkflowService,
-    private readonly workflowRunnerService: WorkflowRunnerService
+    private readonly workflowRunnerService: WorkflowRunnerService,
+    private readonly workflowCapabilityService: WorkflowCapabilityService
   ) {}
 
   @Get()
-  @Permissions('automation|read')
+  @Permissions(automationReadPermission)
   getWorkflowList(@Param('baseId') baseId: string): Promise<IWorkflowVo[]> {
     return this.workflowService.getWorkflowList(baseId);
   }
 
-  @Get(':workflowId')
-  @Permissions('automation|read')
+  @Get('capabilities')
+  @Permissions(automationReadPermission)
+  getWorkflowCapabilities(): IWorkflowCapabilitiesVo {
+    return this.workflowCapabilityService.getCapabilities();
+  }
+
+  @Get(workflowIdParam)
+  @Permissions(automationReadPermission)
   getWorkflow(
     @Param('baseId') baseId: string,
     @Param('workflowId') workflowId: string
@@ -45,8 +59,8 @@ export class WorkflowController {
     return this.workflowService.getWorkflow(baseId, workflowId);
   }
 
-  @Get(':workflowId/run')
-  @Permissions('automation|read')
+  @Get(`${workflowIdParam}/run`)
+  @Permissions(automationReadPermission)
   getWorkflowRunList(
     @Param('baseId') baseId: string,
     @Param('workflowId') workflowId: string
@@ -54,8 +68,8 @@ export class WorkflowController {
     return this.workflowService.getWorkflowRunList(baseId, workflowId);
   }
 
-  @Get(':workflowId/run/:runId')
-  @Permissions('automation|read')
+  @Get(`${workflowIdParam}/run/:runId`)
+  @Permissions(automationReadPermission)
   getWorkflowRun(
     @Param('baseId') baseId: string,
     @Param('workflowId') workflowId: string,
@@ -64,8 +78,8 @@ export class WorkflowController {
     return this.workflowService.getWorkflowRun(baseId, workflowId, runId);
   }
 
-  @Post(':workflowId/test-run')
-  @Permissions('automation|update')
+  @Post(`${workflowIdParam}/test-run`)
+  @Permissions(automationUpdatePermission)
   async testRunWorkflow(
     @Param('baseId') baseId: string,
     @Param('workflowId') workflowId: string,
@@ -73,12 +87,11 @@ export class WorkflowController {
   ): Promise<IWorkflowRunVo> {
     const run = await this.workflowService.createTestRun(baseId, workflowId, ro.input);
     await this.workflowRunnerService.executeWorkflowRun(run.id);
-    const detail = await this.workflowService.getWorkflowRun(baseId, workflowId, run.id);
-    return detail;
+    return this.workflowService.getWorkflowRun(baseId, workflowId, run.id);
   }
 
   @Post()
-  @Permissions('automation|create')
+  @Permissions(automationCreatePermission)
   @EmitControllerEvent(Events.WORKFLOW_CREATE)
   createWorkflow(
     @Param('baseId') baseId: string,
@@ -88,7 +101,7 @@ export class WorkflowController {
   }
 
   @Post('ai-create-draft')
-  @Permissions('automation|create')
+  @Permissions(automationCreatePermission)
   @EmitControllerEvent(Events.WORKFLOW_CREATE)
   aiCreateWorkflowDraft(
     @Param('baseId') baseId: string,
@@ -97,8 +110,8 @@ export class WorkflowController {
     return this.workflowService.aiCreateWorkflowDraft(baseId, ro);
   }
 
-  @Put(':workflowId')
-  @Permissions('automation|update')
+  @Put(workflowIdParam)
+  @Permissions(automationUpdatePermission)
   @EmitControllerEvent(Events.WORKFLOW_UPDATE)
   updateWorkflow(
     @Param('baseId') baseId: string,
@@ -108,8 +121,8 @@ export class WorkflowController {
     return this.workflowService.updateWorkflow(baseId, workflowId, ro);
   }
 
-  @Post(':workflowId/duplicate')
-  @Permissions('automation|create')
+  @Post(`${workflowIdParam}/duplicate`)
+  @Permissions(automationCreatePermission)
   @EmitControllerEvent(Events.WORKFLOW_CREATE)
   duplicateWorkflow(
     @Param('baseId') baseId: string,
@@ -119,8 +132,8 @@ export class WorkflowController {
     return this.workflowService.duplicateWorkflow(baseId, workflowId, ro);
   }
 
-  @Post(':workflowId/activate')
-  @Permissions('automation|update')
+  @Post(`${workflowIdParam}/activate`)
+  @Permissions(automationUpdatePermission)
   @EmitControllerEvent(Events.WORKFLOW_ACTIVATE)
   activateWorkflow(
     @Param('baseId') baseId: string,
@@ -129,8 +142,8 @@ export class WorkflowController {
     return this.workflowService.activateWorkflow(baseId, workflowId);
   }
 
-  @Post(':workflowId/deactivate')
-  @Permissions('automation|update')
+  @Post(`${workflowIdParam}/deactivate`)
+  @Permissions(automationUpdatePermission)
   @EmitControllerEvent(Events.WORKFLOW_DEACTIVATE)
   deactivateWorkflow(
     @Param('baseId') baseId: string,
@@ -139,7 +152,7 @@ export class WorkflowController {
     return this.workflowService.deactivateWorkflow(baseId, workflowId);
   }
 
-  @Delete(':workflowId')
+  @Delete(workflowIdParam)
   @Permissions('automation|delete')
   @EmitControllerEvent(Events.WORKFLOW_DELETE)
   deleteWorkflow(
diff --git a/apps/nestjs-backend/src/features/workflow/workflow.module.ts b/apps/nestjs-backend/src/features/workflow/workflow.module.ts
index ddcf921..f389d83 100644
--- a/apps/nestjs-backend/src/features/workflow/workflow.module.ts
+++ b/apps/nestjs-backend/src/features/workflow/workflow.module.ts
@@ -1,23 +1,26 @@
 import { Module } from '@nestjs/common';
 import { AiModule } from '../ai/ai.module';
+import { AuthorityMatrixModule } from '../authority-matrix/authority-matrix.module';
 import { RecordModule } from '../record/record.module';
 import { ScriptRuntimeModule } from './script/script-runtime.module';
 import { WorkflowAiProvider } from './workflow-ai.provider';
 import { WORKFLOW_AI_PROVIDER, WorkflowAiService } from './workflow-ai.service';
-import { WorkflowController } from './workflow.controller';
+import { WorkflowCapabilityService } from './workflow-capability.service';
 import { WorkflowRunnerService } from './workflow-runner.service';
+import { WorkflowController } from './workflow.controller';
 import { WorkflowService } from './workflow.service';
 
 @Module({
-  imports: [AiModule, RecordModule, ScriptRuntimeModule],
+  imports: [AiModule, AuthorityMatrixModule, RecordModule, ScriptRuntimeModule],
   controllers: [WorkflowController],
   providers: [
     WorkflowAiProvider,
     { provide: WORKFLOW_AI_PROVIDER, useExisting: WorkflowAiProvider },
     WorkflowAiService,
+    WorkflowCapabilityService,
     WorkflowService,
     WorkflowRunnerService,
   ],
-  exports: [WorkflowService, WorkflowRunnerService],
+  exports: [WorkflowService, WorkflowRunnerService, WorkflowCapabilityService],
 })
 export class WorkflowModule {}
diff --git a/apps/nestjs-backend/src/features/workflow/workflow.service.ts b/apps/nestjs-backend/src/features/workflow/workflow.service.ts
index 37552eb..8a5b691 100644
--- a/apps/nestjs-backend/src/features/workflow/workflow.service.ts
+++ b/apps/nestjs-backend/src/features/workflow/workflow.service.ts
@@ -24,6 +24,7 @@ import { CustomHttpException } from '../../custom.exception';
 import type { IClsStore } from '../../types/cls';
 import { RecordService } from '../record/record.service';
 import { WorkflowAiService } from './workflow-ai.service';
+import { buildWorkflowRunSuccessData } from './workflow-run-state';
 
 type IRecordTriggerType = 'recordCreated' | 'recordUpdated';
 
@@ -842,11 +843,11 @@ export class WorkflowService {
     await this.prismaService.workflowRun.update({
       where: { id: runId },
       data: {
-        status: 'completed',
         startedTime,
-        finishedTime: startedTime,
-        durationMs: 0,
-        output: { skipped: true, reason: 'No workflow runner actions are implemented yet' },
+        ...buildWorkflowRunSuccessData(startedTime, startedTime, {
+          skipped: true,
+          reason: 'No workflow runner actions are implemented yet',
+        }),
       },
     });
   }
diff --git a/apps/nextjs-app/src/features/app/automation/Pages.tsx b/apps/nextjs-app/src/features/app/automation/Pages.tsx
index 01e6d20..c72dda6 100644
--- a/apps/nextjs-app/src/features/app/automation/Pages.tsx
+++ b/apps/nextjs-app/src/features/app/automation/Pages.tsx
@@ -1,5 +1,4 @@
 import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
-import { generateWorkflowActionId } from '@teable/core';
 import type {
   IWorkflowDetailVo,
   IWorkflowNode,
@@ -13,6 +12,7 @@ import {
   deactivateWorkflow,
   deleteWorkflow,
   getWorkflow,
+  getWorkflowCapabilities,
   getWorkflowList,
   getWorkflowRun,
   getWorkflowRunList,
@@ -42,22 +42,27 @@ import Head from 'next/head';
 import { useRouter } from 'next/router';
 import { useTranslation } from 'next-i18next';
 import { useEffect, useMemo, useState } from 'react';
-
-interface IRecordUpdateActionConfig {
-  tableId: string;
-  recordId: string;
-  fields: Record<string, unknown>;
-}
-
-interface IRecordCreateActionConfig {
-  tableId: string;
-  records: Record<string, unknown>[];
-}
-
-interface IRecordQueryActionConfig {
-  tableId: string;
-  filter?: Record<string, unknown>;
-  take?: number;
+import { formatJson, getStatusTone } from './lib/runHistory';
+import {
+  appendActionNode,
+  getActiveActionNodeId,
+  getAiGeneratePrompt,
+  getFirstActionNodeId,
+  getRecordTriggerFilterText,
+  getRecordTriggerKind,
+  getRecordTriggerTableId,
+  getScriptPreview,
+  hasSelectedActionNode,
+  removeActionNode,
+  type WorkflowActionKind,
+} from './lib/workflowNodes';
+
+interface IWorkflowActionCapabilityMap {
+  [kind: string]: {
+    configurable: boolean;
+    runnable: boolean;
+    reason?: string;
+  };
 }
 
 interface IAutomationPageProps {
@@ -68,165 +73,17 @@ interface IAutomationPageProps {
 }
 
 const workflowListQueryKey = (baseId: string) => ['workflow-list', baseId] as const;
+const workflowCapabilitiesQueryKey = (baseId: string) => ['workflow-capabilities', baseId] as const;
 const workflowRunListQueryKey = (baseId: string, workflowId: string) =>
   ['workflow-run-list', baseId, workflowId] as const;
 const workflowRunDetailQueryKey = (baseId: string, workflowId: string, runId: string) =>
   ['workflow-run-detail', baseId, workflowId, runId] as const;
 
-const getStatusTone = (status: string) => {
-  if (status === 'completed') return 'text-emerald-600';
-  if (status === 'failed') return 'text-destructive';
-  if (status === 'running') return 'text-blue-600';
-  return 'text-muted-foreground';
-};
-
-const getScriptPreview = (workflow?: IWorkflowDetailVo, nodeId?: string) => {
-  const runScriptNode = workflow?.nodes.find(
-    (node) =>
-      node.nodeType === 'action' && node.kind === 'runScript' && (!nodeId || node.id === nodeId)
-  );
-  const config = runScriptNode?.config as { script?: string; code?: string } | undefined;
-  return config?.script ?? config?.code ?? '';
-};
-
-const getAiGeneratePrompt = (workflow?: IWorkflowDetailVo, nodeId?: string) => {
-  const aiGenerateNode = workflow?.nodes.find(
-    (node) =>
-      node.nodeType === 'action' && node.kind === 'aiGenerate' && (!nodeId || node.id === nodeId)
-  );
-  const config = aiGenerateNode?.config as { prompt?: string } | undefined;
-  return config?.prompt ?? '';
-};
-
-const getRecordTriggerTableId = (workflow?: IWorkflowDetailVo) => {
-  const recordTriggerNode = workflow?.nodes.find(
-    (node) => node.nodeType === 'trigger' && ['recordCreated', 'recordUpdated'].includes(node.kind)
-  );
-  const config = recordTriggerNode?.config as { tableId?: string } | undefined;
-  return config?.tableId ?? '';
-};
-
-const getRecordTriggerKind = (workflow?: IWorkflowDetailVo) => {
-  const recordTriggerNode = workflow?.nodes.find(
-    (node) => node.nodeType === 'trigger' && ['recordCreated', 'recordUpdated'].includes(node.kind)
-  );
-  return recordTriggerNode?.kind === 'recordUpdated' ? 'recordUpdated' : 'recordCreated';
-};
-
-const getRecordTriggerFilterText = (workflow?: IWorkflowDetailVo) => {
-  const recordTriggerNode = workflow?.nodes.find(
-    (node) => node.nodeType === 'trigger' && ['recordCreated', 'recordUpdated'].includes(node.kind)
-  );
-  const config = recordTriggerNode?.config as { filter?: unknown } | undefined;
-  return config?.filter ? JSON.stringify(config.filter, null, 2) : '';
-};
-
 const parseOptionalJson = (value: string) => {
   const trimmed = value.trim();
   return trimmed ? JSON.parse(trimmed) : undefined;
 };
 
-const appendActionNode = (
-  workflow: IWorkflowDetailVo,
-  kind: 'runScript' | 'aiGenerate' | 'updateRecords' | 'createRecords' | 'queryRecords'
-): IWorkflowNode[] => {
-  const actionNodes = workflow.nodes.filter((node) => node.nodeType === 'action');
-  const triggerNode = workflow.nodes.find((node) => node.nodeType === 'trigger');
-  const previousNode = actionNodes[actionNodes.length - 1] ?? triggerNode;
-  const newNodeId = generateWorkflowActionId();
-
-  let config:
-    | IRecordUpdateActionConfig
-    | IRecordCreateActionConfig
-    | IRecordQueryActionConfig
-    | { script: string }
-    | { prompt: string };
-  switch (kind) {
-    case 'aiGenerate':
-      config = { prompt: 'Summarize this automation input: {{ input }}' };
-      break;
-    case 'runScript':
-      config = {
-        script: ['console.log("Automation input", input);', 'return {', '  input,', '};'].join(
-          '\n'
-        ),
-      };
-      break;
-    case 'updateRecords':
-      config = {
-        tableId: '',
-        recordId: '{{ input.record?.id }}',
-        fields: {},
-      };
-      break;
-    case 'createRecords':
-      config = {
-        tableId: '',
-        records: [{}],
-      };
-      break;
-    case 'queryRecords':
-      config = {
-        tableId: '',
-        filter: {},
-        take: 10,
-      };
-      break;
-  }
-
-  const newNode: IWorkflowNode = {
-    id: newNodeId,
-    workflowId: workflow.id,
-    nodeType: 'action',
-    kind,
-    parentNodeId: previousNode?.id,
-    config,
-  };
-
-  return [
-    ...workflow.nodes.map((node) =>
-      node.id === previousNode?.id ? { ...node, nextNodeId: newNodeId } : node
-    ),
-    newNode,
-  ];
-};
-
-const removeActionNode = (workflow: IWorkflowDetailVo, nodeId: string): IWorkflowNode[] => {
-  const nodeToRemove = workflow.nodes.find((node) => node.id === nodeId);
-  if (!nodeToRemove || nodeToRemove.nodeType !== 'action') {
-    return workflow.nodes;
-  }
-
-  return workflow.nodes
-    .filter((node) => node.id !== nodeId)
-    .map((node) => {
-      if (node.id === nodeToRemove.parentNodeId) {
-        return { ...node, nextNodeId: nodeToRemove.nextNodeId };
-      }
-      if (node.id === nodeToRemove.nextNodeId) {
-        return { ...node, parentNodeId: nodeToRemove.parentNodeId };
-      }
-      return node;
-    });
-};
-
-const hasSelectedActionNode = (
-  workflow: IWorkflowDetailVo | undefined,
-  nodeId: string | undefined,
-  kind: 'runScript' | 'aiGenerate' | 'updateRecords' | 'createRecords' | 'queryRecords'
-) => Boolean(workflow?.nodes.some((node) => node.id === nodeId && node.kind === kind));
-
-const formatJson = (value: unknown): string => {
-  if (value == null) {
-    return 'None';
-  }
-  try {
-    return JSON.stringify(value, null, 2) ?? 'None';
-  } catch {
-    return String(value);
-  }
-};
-
 interface IWorkflowSidebarProps {
   workflows: IWorkflowVo[];
   selectedId?: string;
@@ -364,12 +221,6 @@ interface IWorkflowDetailProps {
   aiPromptPreview: string;
   aiPromptDraft: string;
   selectedAiNodeId?: string;
-  updateRecordsDraft: IRecordUpdateActionConfig;
-  selectedUpdateRecordsNodeId?: string;
-  createRecordsDraft: IRecordCreateActionConfig;
-  selectedCreateRecordsNodeId?: string;
-  queryRecordsDraft: IRecordQueryActionConfig;
-  selectedQueryRecordsNodeId?: string;
   recordTriggerTableIdPreview: string;
   recordTriggerTableIdDraft: string;
   recordTriggerKindDraft: 'recordCreated' | 'recordUpdated';
@@ -384,6 +235,7 @@ interface IWorkflowDetailProps {
   isSavingRecordTrigger: boolean;
   isAddingAction: boolean;
   isRemovingAction: boolean;
+  actionCapabilities: IWorkflowActionCapabilityMap;
   onToggleActive: () => void;
   onDelete: (workflowId: string) => void;
   onTestRun: (workflowId: string) => void;
@@ -400,9 +252,7 @@ interface IWorkflowDetailProps {
   onRecordTriggerTableIdDraftChange: (value: string) => void;
   onRecordTriggerFilterDraftChange: (value: string) => void;
   onSaveRecordTrigger: () => void;
-  onAddAction: (
-    kind: 'runScript' | 'aiGenerate' | 'updateRecords' | 'createRecords' | 'queryRecords'
-  ) => void;
+  onAddAction: (kind: WorkflowActionKind) => void;
   onRemoveAction: (nodeId: string) => void;
 }
 
@@ -574,17 +424,6 @@ const getWorkflowDetailCapabilities = (
   ),
 });
 
-const getFirstActionNodeId = (
-  workflow: IWorkflowDetailVo | undefined,
-  kind: 'runScript' | 'aiGenerate' | 'updateRecords' | 'createRecords' | 'queryRecords'
-) => workflow?.nodes.find((node) => node.nodeType === 'action' && node.kind === kind)?.id;
-
-const getActiveActionNodeId = (
-  workflow: IWorkflowDetailVo | undefined,
-  selectedNodeId: string | undefined,
-  kind: 'runScript' | 'aiGenerate' | 'updateRecords' | 'createRecords' | 'queryRecords'
-) => selectedNodeId ?? getFirstActionNodeId(workflow, kind);
-
 const WorkflowDetail = (props: IWorkflowDetailProps) => {
   const {
     workflow,
@@ -610,6 +449,7 @@ const WorkflowDetail = (props: IWorkflowDetailProps) => {
     isSavingRecordTrigger,
     isAddingAction,
     isRemovingAction,
+    actionCapabilities,
     onToggleActive,
     onDelete,
     onTestRun,
@@ -701,7 +541,8 @@ const WorkflowDetail = (props: IWorkflowDetailProps) => {
                 <Button
                   size="sm"
                   variant="outline"
-                  disabled={isAddingAction}
+                  disabled={isAddingAction || !actionCapabilities.runScript?.configurable}
+                  title={actionCapabilities.runScript?.reason}
                   onClick={() => onAddAction('runScript')}
                 >
                   Add Run Script
@@ -709,7 +550,8 @@ const WorkflowDetail = (props: IWorkflowDetailProps) => {
                 <Button
                   size="sm"
                   variant="outline"
-                  disabled={isAddingAction}
+                  disabled={isAddingAction || !actionCapabilities.aiGenerate?.configurable}
+                  title={actionCapabilities.aiGenerate?.reason}
                   onClick={() => onAddAction('aiGenerate')}
                 >
                   Add AI Generate
@@ -717,7 +559,8 @@ const WorkflowDetail = (props: IWorkflowDetailProps) => {
                 <Button
                   size="sm"
                   variant="outline"
-                  disabled={isAddingAction}
+                  disabled={isAddingAction || !actionCapabilities.updateRecords?.configurable}
+                  title={actionCapabilities.updateRecords?.reason}
                   onClick={() => onAddAction('updateRecords')}
                 >
                   Add Record Update
@@ -725,7 +568,8 @@ const WorkflowDetail = (props: IWorkflowDetailProps) => {
                 <Button
                   size="sm"
                   variant="outline"
-                  disabled={isAddingAction}
+                  disabled={isAddingAction || !actionCapabilities.createRecords?.configurable}
+                  title={actionCapabilities.createRecords?.reason}
                   onClick={() => onAddAction('createRecords')}
                 >
                   Add Record Create
@@ -733,7 +577,8 @@ const WorkflowDetail = (props: IWorkflowDetailProps) => {
                 <Button
                   size="sm"
                   variant="outline"
-                  disabled={isAddingAction}
+                  disabled={isAddingAction || !actionCapabilities.queryRecords?.configurable}
+                  title={actionCapabilities.queryRecords?.reason}
                   onClick={() => onAddAction('queryRecords')}
                 >
                   Add Record Query
@@ -944,9 +789,14 @@ const RunHistory = ({ runs, selectedRunId, runDetail, onSelectRun }: IRunHistory
 export function AutomationPage(props: IAutomationPageProps = {}) {
   const router = useRouter();
   const routeBaseId = useBaseId();
-  const baseId = props.baseId ?? routeBaseId ?? (router.query.baseId as string | undefined) ?? '';
-  const selectedWorkflowId =
-    props.workflowId ?? (router.query.workflowId as string | undefined) ?? undefined;
+  const baseId = useMemo(
+    () => props.baseId ?? routeBaseId ?? (router.query.baseId as string | undefined) ?? '',
+    [props.baseId, routeBaseId, router.query.baseId]
+  );
+  const selectedWorkflowId = useMemo(
+    () => props.workflowId ?? (router.query.workflowId as string | undefined) ?? undefined,
+    [props.workflowId, router.query.workflowId]
+  );
   const { t } = useTranslation('common');
   const isReadOnlyPreview = useIsReadOnlyPreview();
   const queryClient = useQueryClient();
@@ -962,29 +812,6 @@ export function AutomationPage(props: IAutomationPageProps = {}) {
   const [scriptDraft, setScriptDraft] = useState('');
   const [selectedAiNodeId, setSelectedAiNodeId] = useState<string | undefined>();
   const [aiPromptDraft, setAiPromptDraft] = useState('');
-  const [selectedUpdateRecordsNodeId, setSelectedUpdateRecordsNodeId] = useState<
-    string | undefined
-  >();
-  const [updateRecordsDraft, setUpdateRecordsDraft] = useState<IRecordUpdateActionConfig>({
-    tableId: '',
-    recordId: '{{ input.record?.id }}',
-    fields: {},
-  });
-  const [selectedCreateRecordsNodeId, setSelectedCreateRecordsNodeId] = useState<
-    string | undefined
-  >();
-  const [createRecordsDraft, setCreateRecordsDraft] = useState<IRecordCreateActionConfig>({
-    tableId: '',
-    records: [{}],
-  });
-  const [selectedQueryRecordsNodeId, setSelectedQueryRecordsNodeId] = useState<
-    string | undefined
-  >();
-  const [queryRecordsDraft, setQueryRecordsDraft] = useState<IRecordQueryActionConfig>({
-    tableId: '',
-    filter: {},
-    take: 10,
-  });
   const [recordTriggerTableIdDraft, setRecordTriggerTableIdDraft] = useState('');
   const [recordTriggerKindDraft, setRecordTriggerKindDraft] = useState<
     'recordCreated' | 'recordUpdated'
@@ -998,6 +825,18 @@ export function AutomationPage(props: IAutomationPageProps = {}) {
     enabled: Boolean(baseId) && !isReadOnlyPreview,
   });
 
+  const { data: workflowCapabilities } = useQuery({
+    queryKey: workflowCapabilitiesQueryKey(baseId),
+    queryFn: () => getWorkflowCapabilities(baseId).then(({ data }) => data),
+    enabled: Boolean(baseId) && !isReadOnlyPreview,
+  });
+
+  const actionCapabilities = useMemo<IWorkflowActionCapabilityMap>(() => {
+    return Object.fromEntries(
+      (workflowCapabilities?.actions ?? []).map((capability) => [capability.kind, capability])
+    );
+  }, [workflowCapabilities?.actions]);
+
   useEffect(() => {
     if (selectedWorkflowId) {
       setSelectedId(selectedWorkflowId);
@@ -1038,7 +877,7 @@ export function AutomationPage(props: IAutomationPageProps = {}) {
     if (!hasSelectedActionNode(workflow, selectedScriptNodeId, 'runScript')) {
       setSelectedScriptNodeId(firstScriptNodeId);
     }
-  }, [firstScriptNodeId, selectedScriptNodeId, workflow?.nodes]);
+  }, [firstScriptNodeId, selectedScriptNodeId, workflow]);
 
   useEffect(() => {
     setAiPromptDraft(aiPromptPreview);
@@ -1048,7 +887,7 @@ export function AutomationPage(props: IAutomationPageProps = {}) {
     if (!hasSelectedActionNode(workflow, selectedAiNodeId, 'aiGenerate')) {
       setSelectedAiNodeId(firstAiNodeId);
     }
-  }, [firstAiNodeId, selectedAiNodeId, workflow?.nodes]);
+  }, [firstAiNodeId, selectedAiNodeId, workflow]);
 
   useEffect(() => {
     setRecordTriggerTableIdDraft(recordTriggerTableIdPreview);
@@ -1324,9 +1163,7 @@ export function AutomationPage(props: IAutomationPageProps = {}) {
   });
 
   const addActionMutation = useMutation({
-    mutationFn: async (
-      kind: 'runScript' | 'aiGenerate' | 'updateRecords' | 'createRecords' | 'queryRecords'
-    ) => {
+    mutationFn: async (kind: WorkflowActionKind) => {
       if (!workflow) return undefined;
       return updateWorkflow(baseId, workflow.id, { nodes: appendActionNode(workflow, kind) });
     },
@@ -1422,12 +1259,6 @@ export function AutomationPage(props: IAutomationPageProps = {}) {
             aiPromptPreview={aiPromptPreview}
             aiPromptDraft={aiPromptDraft}
             selectedAiNodeId={activeAiNodeId}
-            updateRecordsDraft={updateRecordsDraft}
-            selectedUpdateRecordsNodeId={undefined}
-            createRecordsDraft={createRecordsDraft}
-            selectedCreateRecordsNodeId={undefined}
-            queryRecordsDraft={queryRecordsDraft}
-            selectedQueryRecordsNodeId={undefined}
             recordTriggerTableIdPreview={recordTriggerTableIdPreview}
             recordTriggerTableIdDraft={recordTriggerTableIdDraft}
             recordTriggerKindDraft={recordTriggerKindDraft}
@@ -1442,6 +1273,7 @@ export function AutomationPage(props: IAutomationPageProps = {}) {
             isSavingRecordTrigger={saveRecordTriggerMutation.isPending}
             isAddingAction={addActionMutation.isPending}
             isRemovingAction={removeActionMutation.isPending}
+            actionCapabilities={actionCapabilities}
             onToggleActive={handleToggleActive}
             onDelete={(workflowId) => deleteMutation.mutate(workflowId)}
             onTestRun={(workflowId) => testRunMutation.mutate(workflowId)}
diff --git a/apps/nextjs-app/src/features/app/base-node/index.ts b/apps/nextjs-app/src/features/app/base-node/index.ts
index 56e58c4..956a26b 100644
--- a/apps/nextjs-app/src/features/app/base-node/index.ts
+++ b/apps/nextjs-app/src/features/app/base-node/index.ts
@@ -7,3 +7,5 @@ export { DashBoardPage, getDashboardServerSideProps } from './DashBoardPage';
 export { WorkflowPage, getWorkflowServerSideProps } from './WorkflowPage';
 export { getBaseServerSideProps } from './BasePage';
 export { AppPage, getAppServerSideProps } from './AppPage';
+export { BaseNodePageSwitch } from './BaseNodePageSwitch';
+export { getResourcePageProps } from './getResourcePageProps';
diff --git a/apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx b/apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx
index 82c8c74..98e9480 100644
--- a/apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx
+++ b/apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx
@@ -21,6 +21,8 @@ import { useSdkLocale } from '../hooks/useSdkLocale';
 import { PublishedAppProvider, PublishedAppRuntime } from '../published-app';
 import { initAxios } from '../utils/init-axios';
 
+const isPublishedAppShellDisabled = process.env.NEXT_PUBLIC_PUBLISHED_APP_SHELL_DISABLED === 'true';
+
 interface IShareBaseLayoutProps {
   children: React.ReactNode;
   tableServerData?: ITableVo[];
@@ -117,21 +119,27 @@ export const ShareBaseLayout: React.FC<IShareBaseLayoutProps> = ({
                       <TableProvider serverData={tableServerData}>
                         <div
                           id="portal"
-                          className="relative flex h-screen w-full items-start"
+                          className="h-screen w-full"
                           onContextMenu={(e) => e.preventDefault()}
                         >
-                          <div className="flex h-screen w-full">
-                            <Sidebar headerLeft={<BaseSidebarHeaderLeft />}>
-                              <Fragment>
-                                <div className="flex h-full flex-col gap-2 divide-y divide-solid overflow-auto py-2">
-                                  <BaseSideBar />
-                                </div>
-                                <div className="grow basis-0" />
-                                <SideBarFooter />
-                              </Fragment>
-                            </Sidebar>
-                            <div className="min-w-80 flex-1">{children}</div>
-                          </div>
+                          {isPublishedAppShellDisabled ? (
+                            <div className="relative flex h-screen w-full items-start">
+                              <div className="flex h-screen w-full">
+                                <Sidebar headerLeft={<BaseSidebarHeaderLeft />}>
+                                  <Fragment>
+                                    <div className="flex h-full flex-col gap-2 divide-y divide-solid overflow-auto py-2">
+                                      <BaseSideBar />
+                                    </div>
+                                    <div className="grow basis-0" />
+                                    <SideBarFooter />
+                                  </Fragment>
+                                </Sidebar>
+                                <div className="min-w-80 flex-1">{children}</div>
+                              </div>
+                            </div>
+                          ) : (
+                            children
+                          )}
                         </div>
                       </TableProvider>
                     </PublishedAppRuntime>
diff --git a/apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx b/apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx
index a3bd9de..444f21f 100644
--- a/apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx
+++ b/apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx
@@ -4,6 +4,7 @@ import { useIsMobile } from '@teable/sdk/hooks';
 import { useRouter } from 'next/router';
 import { createContext, useContext, useMemo } from 'react';
 import type { ReactNode } from 'react';
+import { useMedia } from 'react-use';
 import { BaseNodeContext } from '@/features/app/blocks/base/base-node/BaseNodeContext';
 import type { TreeItemData } from '@/features/app/blocks/base/base-node/hooks';
 import { ROOT_ID } from '@/features/app/blocks/base/base-node/hooks';
@@ -72,6 +73,7 @@ export const PublishedAppProvider = ({
   const router = useRouter();
   const resource = useBaseResource();
   const isMobile = useIsMobile();
+  const isTablet = useMedia('(min-width: 641px) and (max-width: 1024px)');
   const isPwaStandalone = useIsPwaStandalone();
   const { treeItems } = useContext(BaseNodeContext);
 
@@ -122,7 +124,7 @@ export const PublishedAppProvider = ({
       isShare: Boolean(shareId),
       isReadonly: !allowEdit,
       isMobile,
-      isTablet: false,
+      isTablet,
       isEmbed: false,
       isPwaStandalone,
       navigateToNode: (nodeId: string) => {
@@ -137,6 +139,7 @@ export const PublishedAppProvider = ({
     currentNode,
     defaultNode,
     isMobile,
+    isTablet,
     isPwaStandalone,
     manifest,
     navigation,
diff --git a/apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceRenderer.tsx b/apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceRenderer.tsx
index cfe645e..d352db5 100644
--- a/apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceRenderer.tsx
+++ b/apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceRenderer.tsx
@@ -1,6 +1,11 @@
 import type { ReactNode } from 'react';
 import { PublishedResourceErrorBoundary } from './PublishedResourceErrorBoundary';
+import { PublishedResourceSwitch } from './PublishedResourceSwitch';
 
 export const PublishedResourceRenderer = ({ children }: { children: ReactNode }) => {
-  return <PublishedResourceErrorBoundary>{children}</PublishedResourceErrorBoundary>;
+  return (
+    <PublishedResourceErrorBoundary>
+      <PublishedResourceSwitch>{children}</PublishedResourceSwitch>
+    </PublishedResourceErrorBoundary>
+  );
 };
diff --git a/apps/nextjs-app/src/features/app/published-app/runtime/index.ts b/apps/nextjs-app/src/features/app/published-app/runtime/index.ts
index e59b2d2..57b65b0 100644
--- a/apps/nextjs-app/src/features/app/published-app/runtime/index.ts
+++ b/apps/nextjs-app/src/features/app/published-app/runtime/index.ts
@@ -1,3 +1,5 @@
 export * from './PublishedAppRuntime';
 export * from './PublishedResourceErrorBoundary';
 export * from './PublishedResourceRenderer';
+export * from './PublishedResourceState';
+export * from './PublishedResourceSwitch';
diff --git a/apps/nextjs-app/src/features/app/published-app/shell/DesktopShell.tsx b/apps/nextjs-app/src/features/app/published-app/shell/DesktopShell.tsx
index 36fec90..4f2a833 100644
--- a/apps/nextjs-app/src/features/app/published-app/shell/DesktopShell.tsx
+++ b/apps/nextjs-app/src/features/app/published-app/shell/DesktopShell.tsx
@@ -1,5 +1,29 @@
+import { usePublishedApp } from '../context';
+import { PublishedAppNavItem } from './PublishedAppNavItem';
 import type { PublishedAppShellProps } from './types';
 
 export const DesktopShell = ({ children }: PublishedAppShellProps) => {
-  return <>{children}</>;
+  const { activeNavigationItem, manifest, navigateToNode, navigation } = usePublishedApp();
+
+  return (
+    <div className="flex h-screen min-h-0 bg-background">
+      <aside className="flex w-64 shrink-0 flex-col border-r bg-muted/20">
+        <div className="border-b px-4 py-3">
+          <div className="truncate text-sm font-semibold">{manifest.title || 'Published app'}</div>
+          <div className="text-xs text-muted-foreground">Published runtime</div>
+        </div>
+        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
+          {navigation.flatItems.map((item) => (
+            <PublishedAppNavItem
+              key={item.nodeId}
+              item={item}
+              activeNodeId={activeNavigationItem?.nodeId}
+              onNavigate={navigateToNode}
+            />
+          ))}
+        </nav>
+      </aside>
+      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
+    </div>
+  );
 };
diff --git a/apps/nextjs-app/src/features/app/published-app/shell/MobileShell.tsx b/apps/nextjs-app/src/features/app/published-app/shell/MobileShell.tsx
index 30c4577..fbeb443 100644
--- a/apps/nextjs-app/src/features/app/published-app/shell/MobileShell.tsx
+++ b/apps/nextjs-app/src/features/app/published-app/shell/MobileShell.tsx
@@ -1,5 +1,13 @@
+import { PublishedAppBottomNav } from './PublishedAppBottomNav';
+import { PublishedAppHeader } from './PublishedAppHeader';
 import type { PublishedAppShellProps } from './types';
 
 export const MobileShell = ({ children }: PublishedAppShellProps) => {
-  return <>{children}</>;
+  return (
+    <div className="flex h-screen min-h-0 flex-col bg-background">
+      <PublishedAppHeader />
+      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
+      <PublishedAppBottomNav />
+    </div>
+  );
 };
diff --git a/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppBottomNav.tsx b/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppBottomNav.tsx
index 8fcd98b..e57d596 100644
--- a/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppBottomNav.tsx
+++ b/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppBottomNav.tsx
@@ -1,3 +1,28 @@
+import { usePublishedApp } from '../context';
+import { PublishedAppNavItem } from './PublishedAppNavItem';
+
 export const PublishedAppBottomNav = () => {
-  return null;
+  const { activeNavigationItem, navigateToNode, navigation } = usePublishedApp();
+  const items = navigation.flatItems.filter((item) => item.renderable).slice(0, 5);
+
+  if (items.length <= 1) {
+    return null;
+  }
+
+  return (
+    <nav
+      className="grid shrink-0 gap-1 border-t bg-background p-2"
+      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
+    >
+      {items.map((item) => (
+        <PublishedAppNavItem
+          key={item.nodeId}
+          item={item}
+          activeNodeId={activeNavigationItem?.nodeId}
+          compact
+          onNavigate={navigateToNode}
+        />
+      ))}
+    </nav>
+  );
 };
diff --git a/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppDrawer.tsx b/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppDrawer.tsx
index 4595d1f..88b68ad 100644
--- a/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppDrawer.tsx
+++ b/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppDrawer.tsx
@@ -1,3 +1,25 @@
+import { usePublishedApp } from '../context';
+import { PublishedAppNavItem } from './PublishedAppNavItem';
+
 export const PublishedAppDrawer = () => {
-  return null;
+  const { activeNavigationItem, manifest, navigateToNode, navigation } = usePublishedApp();
+
+  return (
+    <aside className="hidden w-20 shrink-0 flex-col border-r bg-muted/20 p-2 sm:flex">
+      <div className="mb-2 border-b pb-2 text-center text-xs font-semibold text-muted-foreground">
+        {manifest.title?.slice(0, 2) || 'TA'}
+      </div>
+      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
+        {navigation.flatItems.map((item) => (
+          <PublishedAppNavItem
+            key={item.nodeId}
+            item={item}
+            activeNodeId={activeNavigationItem?.nodeId}
+            compact
+            onNavigate={navigateToNode}
+          />
+        ))}
+      </nav>
+    </aside>
+  );
 };
diff --git a/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppHeader.tsx b/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppHeader.tsx
index 631abef..014a732 100644
--- a/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppHeader.tsx
+++ b/apps/nextjs-app/src/features/app/published-app/shell/PublishedAppHeader.tsx
@@ -1,3 +1,15 @@
+import { usePublishedApp } from '../context';
+
 export const PublishedAppHeader = () => {
-  return null;
+  const { activeNavigationItem, manifest } = usePublishedApp();
+  const title = activeNavigationItem?.title || manifest.title || 'Published app';
+
+  return (
+    <header className="flex h-12 shrink-0 items-center border-b bg-background px-4">
+      <div className="min-w-0">
+        <div className="truncate text-sm font-semibold">{title}</div>
+        <div className="truncate text-xs text-muted-foreground">{manifest.title}</div>
+      </div>
+    </header>
+  );
 };
diff --git a/apps/nextjs-app/src/features/app/published-app/shell/TabletShell.tsx b/apps/nextjs-app/src/features/app/published-app/shell/TabletShell.tsx
index 81828d9..6ca310d 100644
--- a/apps/nextjs-app/src/features/app/published-app/shell/TabletShell.tsx
+++ b/apps/nextjs-app/src/features/app/published-app/shell/TabletShell.tsx
@@ -1,5 +1,15 @@
+import { PublishedAppDrawer } from './PublishedAppDrawer';
+import { PublishedAppHeader } from './PublishedAppHeader';
 import type { PublishedAppShellProps } from './types';
 
 export const TabletShell = ({ children }: PublishedAppShellProps) => {
-  return <>{children}</>;
+  return (
+    <div className="flex h-screen min-h-0 bg-background">
+      <PublishedAppDrawer />
+      <div className="flex min-w-0 flex-1 flex-col">
+        <PublishedAppHeader />
+        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
+      </div>
+    </div>
+  );
 };
diff --git a/apps/nextjs-app/src/pages/base/[baseId]/[[...slug]].tsx b/apps/nextjs-app/src/pages/base/[baseId]/[[...slug]].tsx
index 7342662..9fde097 100644
--- a/apps/nextjs-app/src/pages/base/[baseId]/[[...slug]].tsx
+++ b/apps/nextjs-app/src/pages/base/[baseId]/[[...slug]].tsx
@@ -1,25 +1,12 @@
 import { QueryClient } from '@tanstack/react-query';
 import { IdPrefix } from '@teable/core';
-import { BaseNodeResourceType } from '@teable/openapi';
 import { ReactQueryKeys } from '@teable/sdk/config';
 import type { GetServerSideProps } from 'next';
 import type { ReactElement } from 'react';
-import { CommunityPage } from '@/features/app/base/CommunityPage';
 import type { ISSRContext } from '@/features/app/base-node';
-import {
-  TablePage,
-  getTableServerSideProps,
-  DashBoardPage,
-  getDashboardServerSideProps,
-  getWorkflowServerSideProps,
-  WorkflowPage,
-  AppPage,
-  getAppServerSideProps,
-  getBaseServerSideProps,
-  redirect,
-} from '@/features/app/base-node';
+import { BaseNodePageSwitch, getResourcePageProps, redirect } from '@/features/app/base-node';
 import type { IBaseNodePageProps } from '@/features/app/base-node/types';
-import { parseBaseSlug, useBaseResource } from '@/features/app/hooks/useBaseResource';
+import { parseBaseSlug } from '@/features/app/hooks/useBaseResource';
 import { BaseLayout } from '@/features/app/layouts/BaseLayout';
 import { baseAllConfig } from '@/features/i18n/base-all.config';
 import ensureLogin from '@/lib/ensureLogin';
@@ -30,20 +17,7 @@ import withAuthSSR from '@/lib/withAuthSSR';
 import withEnv from '@/lib/withEnv';
 
 const UnifiedBasePage: NextPageWithLayout<IBaseNodePageProps> = (props: IBaseNodePageProps) => {
-  const { resourceType } = useBaseResource();
-
-  switch (resourceType) {
-    case BaseNodeResourceType.Table:
-      return <TablePage {...props} />;
-    case BaseNodeResourceType.Dashboard:
-      return <DashBoardPage />;
-    case BaseNodeResourceType.Workflow:
-      return <WorkflowPage />;
-    case BaseNodeResourceType.App:
-      return <AppPage {...props} />;
-    default:
-      return <CommunityPage />;
-  }
+  return <BaseNodePageSwitch {...props} />;
 };
 
 export const getServerSideProps: GetServerSideProps<IBaseNodePageProps> = withEnv(
@@ -86,22 +60,7 @@ export const getServerSideProps: GetServerSideProps<IBaseNodePageProps> = withEn
         base,
       };
 
-      if (!parsed.resourceType) {
-        return getBaseServerSideProps(ctx);
-      }
-
-      switch (parsed.resourceType) {
-        case BaseNodeResourceType.Table:
-          return getTableServerSideProps(ctx, parsed, queryParams);
-        case BaseNodeResourceType.Dashboard:
-          return getDashboardServerSideProps(ctx, parsed);
-        case BaseNodeResourceType.Workflow:
-          return getWorkflowServerSideProps(ctx, parsed);
-        case BaseNodeResourceType.App:
-          return getAppServerSideProps(ctx, parsed);
-        default:
-          return { notFound: true };
-      }
+      return getResourcePageProps(ctx, parsed, queryParams);
     })
   )
 );
diff --git a/apps/nextjs-app/src/pages/share/[shareId]/base/[baseId]/[[...slug]].tsx b/apps/nextjs-app/src/pages/share/[shareId]/base/[baseId]/[[...slug]].tsx
index b4c255b..e7b6934 100644
--- a/apps/nextjs-app/src/pages/share/[shareId]/base/[baseId]/[[...slug]].tsx
+++ b/apps/nextjs-app/src/pages/share/[shareId]/base/[baseId]/[[...slug]].tsx
@@ -1,23 +1,11 @@
-import { BaseNodeResourceType } from '@teable/openapi';
 import type { GetServerSideProps } from 'next';
 import type { ReactElement } from 'react';
 import { SsrApi } from '@/backend/api/rest/ssr-api';
 import type { ISSRContext } from '@/features/app/base-node';
-import {
-  DashBoardPage,
-  AppPage,
-  getBaseServerSideProps,
-  getAppServerSideProps,
-  getDashboardServerSideProps,
-  getTableServerSideProps,
-  getWorkflowServerSideProps,
-  TablePage,
-  WorkflowPage,
-} from '@/features/app/base-node';
+import { BaseNodePageSwitch, getResourcePageProps } from '@/features/app/base-node';
 import type { IShareBasePagePropsBase } from '@/features/app/blocks/share/base/share-base-ssr';
 import { createShareBaseSSR } from '@/features/app/blocks/share/base/share-base-ssr';
 import type { IBaseResourceParsed } from '@/features/app/hooks/useBaseResource';
-import { useBaseResource } from '@/features/app/hooks/useBaseResource';
 import { ShareBaseLayout } from '@/features/app/layouts/ShareBaseLayout';
 import type { NextPageWithLayout } from '@/lib/type';
 import withEnv from '@/lib/withEnv';
@@ -25,42 +13,15 @@ import withEnv from '@/lib/withEnv';
 export type IShareBasePageProps = IShareBasePagePropsBase;
 
 const ShareBasePage: NextPageWithLayout<IShareBasePageProps> = (props: IShareBasePageProps) => {
-  const { resourceType } = useBaseResource();
-
-  switch (resourceType) {
-    case BaseNodeResourceType.Table:
-      return <TablePage {...props} />;
-    case BaseNodeResourceType.Dashboard:
-      return <DashBoardPage />;
-    case BaseNodeResourceType.Workflow:
-      return <WorkflowPage />;
-    case BaseNodeResourceType.App:
-      return <AppPage {...props} />;
-    default:
-      return null;
-  }
+  return <BaseNodePageSwitch {...props} />;
 };
 
-const getResourcePageProps = async (
+const getShareResourcePageProps = async (
   ctx: ISSRContext,
   parsed: IBaseResourceParsed,
   queryParams: Record<string, string | string[] | undefined>
 ) => {
-  if (!parsed.resourceType) {
-    return getBaseServerSideProps(ctx);
-  }
-  switch (parsed.resourceType) {
-    case BaseNodeResourceType.Table:
-      return getTableServerSideProps(ctx, parsed, queryParams);
-    case BaseNodeResourceType.Dashboard:
-      return getDashboardServerSideProps(ctx, parsed);
-    case BaseNodeResourceType.Workflow:
-      return getWorkflowServerSideProps(ctx, parsed);
-    case BaseNodeResourceType.App:
-      return getAppServerSideProps(ctx, parsed);
-    default:
-      return null;
-  }
+  return getResourcePageProps(ctx, parsed, queryParams);
 };
 
 export const getServerSideProps: GetServerSideProps<IShareBasePageProps> =
@@ -69,7 +30,7 @@ export const getServerSideProps: GetServerSideProps<IShareBasePageProps> =
     return createShareBaseSSR<IShareBasePageProps>({
       ssrApi,
       context,
-      getResourcePageProps,
+      getResourcePageProps: getShareResourcePageProps,
     });
   });
 
diff --git a/package.json b/package.json
index 7814f6e..f283a02 100644
--- a/package.json
+++ b/package.json
@@ -44,7 +44,7 @@
     "g:test-e2e-cover": "pnpm -r test-e2e-cover",
     "g:test-unit": "pnpm -r --parallel test-unit",
     "g:test-unit-cover": "pnpm -r --parallel test-unit-cover",
-    "g:typecheck": "pnpm -r --workspace-concurrency=8 typecheck",
+    "g:typecheck": "pnpm -F @teable/sdk build && pnpm -r --workspace-concurrency=8 typecheck",
     "generate-openapi-types": "node scripts/generate-openapi-types.mjs",
     "install:playwright": "playwright install",
     "install:husky": "node .husky/install.mjs",
diff --git a/packages/i18n-keys/package.json b/packages/i18n-keys/package.json
index 9a6d79a..a9740b0 100644
--- a/packages/i18n-keys/package.json
+++ b/packages/i18n-keys/package.json
@@ -36,7 +36,7 @@
     "build": "tsdown --tsconfig tsconfig.build.json",
     "dev": "tsdown --tsconfig tsconfig.build.json --watch",
     "clean": "rimraf ./dist ./coverage ./tsconfig.tsbuildinfo ./tsconfig.build.tsbuildinfo ./.eslintcache",
-    "lint": "eslint . --ext .ts,.js,.mjs,.cjs,.mts,.cts --cache --cache-location ../../.cache/eslint/i18n-keys.eslintcache",
+    "lint": "eslint . --ext .ts,.js,.mjs,.cjs,.mts,.cts --ignore-pattern dist --cache --cache-location ../../.cache/eslint/i18n-keys.eslintcache",
     "typecheck": "tsc --project ./tsconfig.json --noEmit"
   },
   "devDependencies": {
diff --git a/packages/openapi/src/automation/index.ts b/packages/openapi/src/automation/index.ts
index 767c290..1c6a591 100644
--- a/packages/openapi/src/automation/index.ts
+++ b/packages/openapi/src/automation/index.ts
@@ -5,6 +5,7 @@ export * from './workflow/deactivate';
 export * from './workflow/delete';
 export * from './workflow/duplicate';
 export * from './workflow/get';
+export * from './workflow/get-capabilities';
 export * from './workflow/get-list';
 export * from './workflow/get-run';
 export * from './workflow/get-run-list';
diff --git a/packages/v2/adapter-csv-parser-papaparse/package.json b/packages/v2/adapter-csv-parser-papaparse/package.json
index 8c15214..a06bd2a 100644
--- a/packages/v2/adapter-csv-parser-papaparse/package.json
+++ b/packages/v2/adapter-csv-parser-papaparse/package.json
@@ -24,7 +24,7 @@
     "build": "tsdown --tsconfig tsconfig.build.json",
     "dev": "tsdown --tsconfig tsconfig.build.json --watch",
     "clean": "rimraf ./dist ./coverage ./tsconfig.tsbuildinfo ./tsconfig.build.tsbuildinfo ./.eslintcache",
-    "lint": "eslint . --ext .ts,.js,.mjs,.cjs,.mts,.cts --cache --cache-location ../../../.cache/eslint/v2-adapter-csv-parser-papaparse.eslintcache",
+    "lint": "eslint . --ext .ts,.js,.mjs,.cjs,.mts,.cts --ignore-pattern dist --cache --cache-location ../../../.cache/eslint/v2-adapter-csv-parser-papaparse.eslintcache",
     "typecheck": "tsc --project ./tsconfig.json --noEmit",
     "test-unit": "vitest run --silent --passWithNoTests",
     "test-unit-cover": "pnpm test-unit --coverage",
diff --git a/packages/v2/adapter-undo-redo-keyv/package.json b/packages/v2/adapter-undo-redo-keyv/package.json
index 99675da..cfc42a6 100644
--- a/packages/v2/adapter-undo-redo-keyv/package.json
+++ b/packages/v2/adapter-undo-redo-keyv/package.json
@@ -24,7 +24,7 @@
     "build": "tsdown --tsconfig tsconfig.build.json",
     "dev": "tsdown --tsconfig tsconfig.build.json --watch",
     "clean": "rimraf ./dist ./coverage ./tsconfig.tsbuildinfo ./tsconfig.build.tsbuildinfo ./.eslintcache",
-    "lint": "eslint . --ext .ts,.js,.mjs,.cjs,.mts,.cts --cache --cache-location ../../../.cache/eslint/v2-adapter-undo-redo-keyv.eslintcache",
+    "lint": "eslint . --ext .ts,.js,.mjs,.cjs,.mts,.cts --ignore-pattern dist --cache --cache-location ../../../.cache/eslint/v2-adapter-undo-redo-keyv.eslintcache",
     "typecheck": "tsc --project ./tsconfig.json --noEmit",
     "test-unit": "vitest run --silent",
     "test-unit-cover": "pnpm test-unit --coverage",
diff --git a/packages/v2/contract-http/src/contract.ts b/packages/v2/contract-http/src/contract.ts
index 1583bc0..c4f73c2 100644
--- a/packages/v2/contract-http/src/contract.ts
+++ b/packages/v2/contract-http/src/contract.ts
@@ -109,7 +109,7 @@ const TABLES_DUPLICATE_FIELD_PATH = '/tables/duplicateField';
 const TABLES_DUPLICATE_RECORD_PATH = '/tables/duplicateRecord';
 const TABLES_DUPLICATE_TABLE_PATH = '/tables/duplicateTable';
 
-export const v2Contract = {
+export const v2Contract: AnyContractRouter = {
   bases: {
     create: oc
       .route({
@@ -474,7 +474,7 @@ export const v2Contract = {
       .input(explainDeleteRecordsInputSchema)
       .output(explainOkResponseSchema),
   },
-} as const satisfies AnyContractRouter;
+} as const;
 
 export const v2ContractErrors = {
   400: createTableErrorResponseSchema,
```

## 5. 关键文件快照
### 文件：apps/nestjs-backend/src/features/workflow/workflow-runner.service.ts
```ts
import { Injectable } from '@nestjs/common';
import type { IFilterSet } from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import { ClsService } from 'nestjs-cls';
import type { IClsStore } from '../../types/cls';
import { AuthorityPolicyService } from '../authority-matrix/authority-policy.service';
import { RecordOpenApiService } from '../record/open-api/record-open-api.service';
import { RecordService } from '../record/record.service';
import { ScriptRuntimeService } from './script/script-runtime.service';
import { WorkflowAiService } from './workflow-ai.service';
import {
  buildWorkflowRunFailureData,
  buildWorkflowRunStartData,
  buildWorkflowRunStepFailureData,
  buildWorkflowRunStepStartData,
  buildWorkflowRunStepSuccessData,
  buildWorkflowRunSuccessData,
} from './workflow-run-state';

interface IWorkflowSnapshotNode {
  id: string;
  nodeType: string;
  kind: string;
  parentNodeId?: string | null;
  nextNodeId?: string | null;
  config?: unknown;
}

interface IWorkflowSnapshot {
  baseId: string;
  nodes?: IWorkflowSnapshotNode[];
}

function getScript(config: unknown): string | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { script, code } = config as { script?: unknown; code?: unknown };
  return typeof script === 'string' ? script : typeof code === 'string' ? code : undefined;
}

function getAiGenerateConfig(config: unknown): { prompt: string; modelKey?: string } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { prompt, modelKey } = config as { prompt?: unknown; modelKey?: unknown };
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return undefined;
  }
  return {
    prompt,
    ...(typeof modelKey === 'string' && modelKey.trim() && { modelKey }),
  };
}

function getUpdateRecordsConfig(
  config: unknown
): { tableId: string; recordId: string; fields: Record<string, unknown> } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { tableId, recordId, fields } = config as {
    tableId?: unknown;
    recordId?: unknown;
    fields?: unknown;
  };
  if (
    typeof tableId !== 'string' ||
    !tableId.trim() ||
    typeof recordId !== 'string' ||
    !recordId.trim() ||
    !fields ||
    typeof fields !== 'object' ||
    Array.isArray(fields)
  ) {
    return undefined;
  }
  return { tableId, recordId, fields: fields as Record<string, unknown> };
}

function getCreateRecordsConfig(
  config: unknown
): { tableId: string; records: Record<string, unknown>[] } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { tableId, records } = config as { tableId?: unknown; records?: unknown };
  if (
    typeof tableId !== 'string' ||
    !tableId.trim() ||
    !Array.isArray(records) ||
    !records.length ||
    records.some((record) => !record || typeof record !== 'object' || Array.isArray(record))
  ) {
    return undefined;
  }
  return { tableId, records: records as Record<string, unknown>[] };
}

function getQueryRecordsConfig(
  config: unknown
): { tableId: string; filter?: IFilterSet; take?: number } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { tableId, filter, take } = config as {
    tableId?: unknown;
    filter?: unknown;
    take?: unknown;
  };
  if (
    typeof tableId !== 'string' ||
    !tableId.trim() ||
    (filter != null && (typeof filter !== 'object' || Array.isArray(filter))) ||
    (take != null && (typeof take !== 'number' || !Number.isInteger(take) || take <= 0))
  ) {
    return undefined;
  }
  return {
    tableId,
    ...(filter && { filter: filter as IFilterSet }),
    ...(take != null && { take }),
  };
}

const supportedActionKinds = [
  'runScript',
  'aiGenerate',
  'updateRecords',
  'createRecords',
  'queryRecords',
];

function interpolateValue(value: unknown, input: unknown): unknown {
  if (typeof value === 'string') {
    return interpolateTemplate(value, input);
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateValue(item, input));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, interpolateValue(item, input)])
    );
  }

  return value;
}

function getInputPathValue(input: unknown, path: string) {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[segment.replace(/\?$/, '')];
  }, input);
}

function interpolateTemplate(template: string, input: unknown) {
  return template.replace(/\{\{\s*input(?:\.([\w?.]+))?\s*\}\}/g, (_match, path?: string) => {
    const value = path ? getInputPathValue(input, path) : input;
    if (value == null) {
      return '';
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  });
}

function sortActionsByChain(actions: IWorkflowSnapshotNode[]) {
  const actionMap = new Map(actions.map((action) => [action.id, action]));
  const firstAction = actions.find(
    (action) => !action.parentNodeId || !actionMap.has(action.parentNodeId)
  );
  if (!firstAction) {
    return actions;
  }

  const sorted: IWorkflowSnapshotNode[] = [];
  const visited = new Set<string>();
  let current: IWorkflowSnapshotNode | undefined = firstAction;

  while (current && !visited.has(current.id)) {
    sorted.push(current);
    visited.add(current.id);
    current = current.nextNodeId ? actionMap.get(current.nextNodeId) : undefined;
  }

  const remaining = actions.filter((action) => !visited.has(action.id));
  return [...sorted, ...remaining];
}

@Injectable()
export class WorkflowRunnerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly scriptRuntimeService: ScriptRuntimeService,
    private readonly workflowAiService: WorkflowAiService,
    private readonly recordsService: RecordOpenApiService,
    private readonly recordService: RecordService,
    private readonly authorityPolicyService: AuthorityPolicyService,
    private readonly cls: ClsService<IClsStore>
  ) {}

  async executeWorkflowRun(runId: string): Promise<void> {
    const run = await this.prismaService.workflowRun.findUniqueOrThrow({
      where: { id: runId },
      select: {
        id: true,
        input: true,
        workflow: { select: { id: true, baseId: true } },
        snapshot: { select: { snapshot: true } },
      },
    });
    const startedTime = new Date();
    const snapshot = (run.snapshot?.snapshot ?? {}) as Partial<IWorkflowSnapshot>;
    const baseId = snapshot.baseId ?? run.workflow.baseId;
    const actions = sortActionsByChain(
      (snapshot.nodes ?? []).filter((node) => node.nodeType === 'action')
    );

    // Set automation context to prevent recursive triggers
    const automationContext: IClsStore['automationContext'] = {
      source: 'automation',
      workflowId: run.workflow.id,
      runId: run.id,
      baseId,
      timestamp: new Date().toISOString(),
    };

    await this.cls.set('automationContext', automationContext);

    await this.prismaService.workflowRun.update({
      where: { id: runId },
      data: buildWorkflowRunStartData(startedTime),
    });

    if (!actions.length) {
      await this.prismaService.workflowRun.update({
        where: { id: runId },
        data: buildWorkflowRunSuccessData(startedTime, startedTime, {
          skipped: true,
          reason: 'No workflow runner actions are configured yet',
        }),
      });
      return;
    }

    let currentInput: unknown = run.input;

    try {
      for (const action of actions) {
        currentInput = await this.executeAction(runId, baseId, action, currentInput);
      }

      const finishedTime = new Date();
      await this.prismaService.workflowRun.update({
        where: { id: runId },
        data: buildWorkflowRunSuccessData(startedTime, finishedTime, currentInput),
      });
    } catch (error) {
      const finishedTime = new Date();
      const message = error instanceof Error ? error.message : String(error);
      await this.prismaService.workflowRun.update({
        where: { id: runId },
        data: buildWorkflowRunFailureData(startedTime, finishedTime, message),
      });
    }
  }

  private async executeAction(
    runId: string,
    baseId: string,
    action: IWorkflowSnapshotNode,
    input: unknown
  ): Promise<unknown> {
    const step = await this.prismaService.workflowRunStep.create({
      data: buildWorkflowRunStepStartData(runId, action.id, input),
      select: { id: true, startedTime: true },
    });

    const invalidMessage = this.getInvalidActionMessage(action);
    if (invalidMessage) {
      await this.prismaService.workflowRunStep.update({
        where: { id: step.id },
        data: buildWorkflowRunStepFailureData(step.startedTime, new Date(), invalidMessage),
      });
      throw new Error(invalidMessage);
    }

    try {
      const output = await this.executeConfiguredAction(baseId, action, input);
      const finishedTime = new Date();
      await this.prismaService.workflowRunStep.update({
        where: { id: step.id },
        data: buildWorkflowRunStepSuccessData(step.startedTime, finishedTime, output),
      });
      return output;
    } catch (error) {
      const finishedTime = new Date();
      const message = error instanceof Error ? error.message : String(error);
      await this.prismaService.workflowRunStep.update({
        where: { id: step.id },
        data: buildWorkflowRunStepFailureData(step.startedTime, finishedTime, message),
      });
      throw error;
    }
  }

  private getInvalidActionMessage(action: IWorkflowSnapshotNode) {
    if (action.kind === 'runScript' && !getScript(action.config)) {
      return `Run Script node ${action.id} is missing script content`;
    }
    if (action.kind === 'aiGenerate' && !getAiGenerateConfig(action.config)) {
      return `AI Generate node ${action.id} is missing prompt`;
    }
    if (action.kind === 'updateRecords' && !getUpdateRecordsConfig(action.config)) {
      return `Update Records node ${action.id} is missing tableId, recordId, or fields`;
    }
    if (action.kind === 'createRecords' && !getCreateRecordsConfig(action.config)) {
      return `Create Records node ${action.id} is missing tableId or records`;
    }
    if (action.kind === 'queryRecords' && !getQueryRecordsConfig(action.config)) {
      return `Query Records node ${action.id} is missing tableId or has invalid query options`;
    }
    if (!supportedActionKinds.includes(action.kind)) {
      return `Unsupported workflow action ${action.kind}`;
    }
    return undefined;
  }

  private async executeConfiguredAction(
    baseId: string,
    action: IWorkflowSnapshotNode,
    input: unknown
  ) {
    if (action.kind === 'runScript') {
      await this.authorityPolicyService.assertWorkflowExecute(baseId);
      return this.scriptRuntimeService.execute(getScript(action.config)!, { baseId, input });
    }

    if (action.kind === 'aiGenerate') {
      await this.authorityPolicyService.assertWorkflowExecute(baseId);
      const text = await this.workflowAiService.generateText(baseId, {
        prompt: this.interpolatePrompt(getAiGenerateConfig(action.config)!.prompt, input),
        ...(getAiGenerateConfig(action.config)!.modelKey && {
          modelKey: getAiGenerateConfig(action.config)!.modelKey,
        }),
      });
      return { text };
    }

    // Handle record actions
    if (action.kind === 'updateRecords') {
      const config = interpolateValue(getUpdateRecordsConfig(action.config)!, input) as ReturnType<
        typeof getUpdateRecordsConfig
      >;
      if (!config?.tableId || !config.recordId) {
        throw new Error(`Update Records node ${action.id} resolved empty tableId or recordId`);
      }
      await this.authorityPolicyService.assertRecordUpdate(config.tableId);
      return this.recordsService.updateRecord(
        config.tableId,
        config.recordId,
        {
          record: { fields: config.fields },
        },
        undefined,
        'true'
      );
    }

    if (action.kind === 'createRecords') {
      const config = interpolateValue(getCreateRecordsConfig(action.config)!, input) as ReturnType<
        typeof getCreateRecordsConfig
      >;
      if (!config?.tableId) {
        throw new Error(`Create Records node ${action.id} resolved empty tableId`);
      }
      await this.authorityPolicyService.assertRecordCreate(config.tableId);
      return this.recordsService.multipleCreateRecords(
        config.tableId,
        { records: config.records.map((fields) => ({ fields })) },
        false,
        'true'
      );
    }

    if (action.kind === 'queryRecords') {
      const config = interpolateValue(getQueryRecordsConfig(action.config)!, input) as ReturnType<
        typeof getQueryRecordsConfig
      >;
      if (!config?.tableId) {
        throw new Error(`Query Records node ${action.id} resolved empty tableId`);
      }
      await this.authorityPolicyService.assertRecordRead(config.tableId);
      return this.recordService.getRecords(config.tableId, {
        filter: config.filter,
        take: config.take,
      });
    }

    throw new Error(`Unsupported action type: ${action.kind}`);
  }

  private interpolatePrompt(prompt: string, input: unknown) {
    return interpolateTemplate(prompt, input);
  }
}

```

### 文件：apps/nestjs-backend/src/features/workflow/workflow-capability.service.ts
```ts
import { Injectable } from '@nestjs/common';
import type { IWorkflowActionCapability } from './actions/action-definition';

@Injectable()
export class WorkflowCapabilityService {
  getCapabilities(): { actions: IWorkflowActionCapability[] } {
    return {
      actions: [
        { kind: 'queryRecords', configurable: true, runnable: true },
        { kind: 'createRecords', configurable: true, runnable: true },
        { kind: 'updateRecords', configurable: true, runnable: true },
        { kind: 'aiGenerate', configurable: true, runnable: true },
        { kind: 'runScript', configurable: true, runnable: false, reason: 'requiresSandbox' },
      ],
    };
  }
}

```

### 文件：apps/nestjs-backend/src/features/workflow/workflow.controller.ts
```ts
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import type {
  IAiCreateWorkflowDraftRo,
  IDuplicateWorkflowRo,
  IUpdateWorkflowRo,
  IWorkflowCapabilitiesVo,
  IWorkflowDetailVo,
  IWorkflowRo,
  IWorkflowRunDetailVo,
  IWorkflowRunVo,
  IWorkflowVo,
} from '@teable/openapi';
import {
  aiCreateWorkflowDraftRoSchema,
  duplicateWorkflowRoSchema,
  testRunWorkflowRoSchema,
  updateWorkflowRoSchema,
  workflowRoSchema,
} from '@teable/openapi';
import { EmitControllerEvent } from '../../event-emitter/decorators/emit-controller-event.decorator';
import { Events } from '../../event-emitter/events';
import { ZodValidationPipe } from '../../zod.validation.pipe';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { WorkflowCapabilityService } from './workflow-capability.service';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WorkflowService } from './workflow.service';

const automationReadPermission = 'automation|read';
const automationCreatePermission = 'automation|create';
const automationUpdatePermission = 'automation|update';
const workflowIdParam = ':workflowId';

@Controller('api/base/:baseId/workflow')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowRunnerService: WorkflowRunnerService,
    private readonly workflowCapabilityService: WorkflowCapabilityService
  ) {}

  @Get()
  @Permissions(automationReadPermission)
  getWorkflowList(@Param('baseId') baseId: string): Promise<IWorkflowVo[]> {
    return this.workflowService.getWorkflowList(baseId);
  }

  @Get('capabilities')
  @Permissions(automationReadPermission)
  getWorkflowCapabilities(): IWorkflowCapabilitiesVo {
    return this.workflowCapabilityService.getCapabilities();
  }

  @Get(workflowIdParam)
  @Permissions(automationReadPermission)
  getWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowDetailVo> {
    return this.workflowService.getWorkflow(baseId, workflowId);
  }

  @Get(`${workflowIdParam}/run`)
  @Permissions(automationReadPermission)
  getWorkflowRunList(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowRunVo[]> {
    return this.workflowService.getWorkflowRunList(baseId, workflowId);
  }

  @Get(`${workflowIdParam}/run/:runId`)
  @Permissions(automationReadPermission)
  getWorkflowRun(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Param('runId') runId: string
  ): Promise<IWorkflowRunDetailVo> {
    return this.workflowService.getWorkflowRun(baseId, workflowId, runId);
  }

  @Post(`${workflowIdParam}/test-run`)
  @Permissions(automationUpdatePermission)
  async testRunWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body(new ZodValidationPipe(testRunWorkflowRoSchema)) ro: { input?: unknown }
  ): Promise<IWorkflowRunVo> {
    const run = await this.workflowService.createTestRun(baseId, workflowId, ro.input);
    await this.workflowRunnerService.executeWorkflowRun(run.id);
    return this.workflowService.getWorkflowRun(baseId, workflowId, run.id);
  }

  @Post()
  @Permissions(automationCreatePermission)
  @EmitControllerEvent(Events.WORKFLOW_CREATE)
  createWorkflow(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(workflowRoSchema)) ro: IWorkflowRo
  ): Promise<IWorkflowVo> {
    return this.workflowService.createWorkflow(baseId, ro);
  }

  @Post('ai-create-draft')
  @Permissions(automationCreatePermission)
  @EmitControllerEvent(Events.WORKFLOW_CREATE)
  aiCreateWorkflowDraft(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(aiCreateWorkflowDraftRoSchema)) ro: IAiCreateWorkflowDraftRo
  ): Promise<IWorkflowDetailVo> {
    return this.workflowService.aiCreateWorkflowDraft(baseId, ro);
  }

  @Put(workflowIdParam)
  @Permissions(automationUpdatePermission)
  @EmitControllerEvent(Events.WORKFLOW_UPDATE)
  updateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body(new ZodValidationPipe(updateWorkflowRoSchema)) ro: IUpdateWorkflowRo
  ): Promise<IWorkflowVo> {
    return this.workflowService.updateWorkflow(baseId, workflowId, ro);
  }

  @Post(`${workflowIdParam}/duplicate`)
  @Permissions(automationCreatePermission)
  @EmitControllerEvent(Events.WORKFLOW_CREATE)
  duplicateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body(new ZodValidationPipe(duplicateWorkflowRoSchema)) ro: IDuplicateWorkflowRo
  ): Promise<IWorkflowVo> {
    return this.workflowService.duplicateWorkflow(baseId, workflowId, ro);
  }

  @Post(`${workflowIdParam}/activate`)
  @Permissions(automationUpdatePermission)
  @EmitControllerEvent(Events.WORKFLOW_ACTIVATE)
  activateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowVo> {
    return this.workflowService.activateWorkflow(baseId, workflowId);
  }

  @Post(`${workflowIdParam}/deactivate`)
  @Permissions(automationUpdatePermission)
  @EmitControllerEvent(Events.WORKFLOW_DEACTIVATE)
  deactivateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowVo> {
    return this.workflowService.deactivateWorkflow(baseId, workflowId);
  }

  @Delete(workflowIdParam)
  @Permissions('automation|delete')
  @EmitControllerEvent(Events.WORKFLOW_DELETE)
  deleteWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<void> {
    return this.workflowService.deleteWorkflow(baseId, workflowId);
  }
}

```

### 文件：apps/nestjs-backend/src/features/workflow/workflow.module.ts
```ts
import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AuthorityMatrixModule } from '../authority-matrix/authority-matrix.module';
import { RecordModule } from '../record/record.module';
import { ScriptRuntimeModule } from './script/script-runtime.module';
import { WorkflowAiProvider } from './workflow-ai.provider';
import { WORKFLOW_AI_PROVIDER, WorkflowAiService } from './workflow-ai.service';
import { WorkflowCapabilityService } from './workflow-capability.service';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [AiModule, AuthorityMatrixModule, RecordModule, ScriptRuntimeModule],
  controllers: [WorkflowController],
  providers: [
    WorkflowAiProvider,
    { provide: WORKFLOW_AI_PROVIDER, useExisting: WorkflowAiProvider },
    WorkflowAiService,
    WorkflowCapabilityService,
    WorkflowService,
    WorkflowRunnerService,
  ],
  exports: [WorkflowService, WorkflowRunnerService, WorkflowCapabilityService],
})
export class WorkflowModule {}

```

### 文件：apps/nestjs-backend/src/features/workflow/workflow-runner.service.spec.ts
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkflowRunnerService } from './workflow-runner.service';

describe('WorkflowRunnerService', () => {
  const runId = 'wrun123';
  const baseId = 'bse123';
  const recordId = 'rec123';
  const generatedSummary = 'Generated summary';
  const disabledScriptRuntimeMessage =
    'Run Script workflow actions are disabled until a process-isolated sandbox is available';
  const startedTime = new Date('2026-05-11T00:00:00.000Z');
  const prismaService = {
    workflowRun: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    workflowRunStep: {
      create: vi.fn(),
      update: vi.fn(),
    },
  };
  const scriptRuntimeService = {
    execute: vi.fn(),
  };
  const workflowAiService = {
    generateText: vi.fn(),
  };
  const recordsService = {
    updateRecord: vi.fn(),
    multipleCreateRecords: vi.fn(),
  };
  const recordService = {
    getRecords: vi.fn(),
  };
  const authorityPolicyService = {
    assertWorkflowExecute: vi.fn(),
    assertRecordRead: vi.fn(),
    assertRecordCreate: vi.fn(),
    assertRecordUpdate: vi.fn(),
  };
  const clsService = {
    get: vi.fn(),
    set: vi.fn(),
  };
  let service: WorkflowRunnerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkflowRunnerService(
      prismaService as never,
      scriptRuntimeService as never,
      workflowAiService as never,
      recordsService as never,
      recordService as never,
      authorityPolicyService as never,
      clsService as never
    );
  });

  it('completes a run without script actions', async () => {
    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
      id: runId,
      input: { recordId },
      workflow: { baseId },
      snapshot: { snapshot: { baseId, nodes: [] } },
    });

    await service.executeWorkflowRun(runId);

    expect(prismaService.workflowRun.update).toHaveBeenCalledWith({
      where: { id: runId },
      data: expect.objectContaining({ status: 'running' }),
    });
    expect(prismaService.workflowRun.update).toHaveBeenCalledWith({
      where: { id: runId },
      data: expect.objectContaining({
        status: 'completed',
        output: { skipped: true, reason: 'No workflow runner actions are configured yet' },
      }),
    });
  });

  it('marks run failed when runScript execution is disabled', async () => {
    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
      id: runId,
      input: { recordId },
      workflow: { baseId },
      snapshot: {
        snapshot: {
          baseId,
          nodes: [
            {
              id: 'wa123',
              nodeType: 'action',
              kind: 'runScript',
              config: { script: 'return input;' },
            },
          ],
        },
      },
    });
    prismaService.workflowRunStep.create.mockResolvedValue({ id: 'step123', startedTime });
    scriptRuntimeService.execute.mockRejectedValue(new Error(disabledScriptRuntimeMessage));

    await service.executeWorkflowRun(runId);

    expect(scriptRuntimeService.execute).toHaveBeenCalledWith('return input;', {
      baseId,
      input: { recordId },
    });
    expect(prismaService.workflowRunStep.update).toHaveBeenCalledWith({
      where: { id: 'step123' },
      data: expect.objectContaining({
        status: 'failed',
        error: {
          message: disabledScriptRuntimeMessage,
        },
      }),
    });
    expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
      where: { id: runId },
      data: expect.objectContaining({
        status: 'failed',
        error: {
          message: disabledScriptRuntimeMessage,
        },
      }),
    });
  });

  it('executes non-script actions by parent and next node chain order', async () => {
    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
      id: runId,
      input: { count: 0 },
      workflow: { baseId },
      snapshot: {
        snapshot: {
          baseId,
          nodes: [
            {
              id: 'wa-second',
              nodeType: 'action',
              kind: 'aiGenerate',
              parentNodeId: 'wa-first',
              config: { prompt: 'second {{ input }}' },
            },
            {
              id: 'wa-first',
              nodeType: 'action',
              kind: 'aiGenerate',
              nextNodeId: 'wa-second',
              config: { prompt: 'first {{ input }}' },
            },
          ],
        },
      },
    });
    prismaService.workflowRunStep.create
      .mockResolvedValueOnce({ id: 'step-first', startedTime })
      .mockResolvedValueOnce({ id: 'step-second', startedTime });
    workflowAiService.generateText
      .mockResolvedValueOnce('first output')
      .mockResolvedValueOnce('second output');

    await service.executeWorkflowRun(runId);

    expect(workflowAiService.generateText).toHaveBeenNthCalledWith(1, baseId, {
      prompt: 'first {"count":0}',
    });
    expect(workflowAiService.generateText).toHaveBeenNthCalledWith(2, baseId, {
      prompt: 'second {"text":"first output"}',
    });
    expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
      where: { id: runId },
      data: expect.objectContaining({
        status: 'completed',
        output: { text: 'second output' },
      }),
    });
  });

  it('marks run failed when a script action fails', async () => {
    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
      id: runId,
      input: {},
      workflow: { baseId },
      snapshot: {
        snapshot: {
          baseId,
          nodes: [
            {
              id: 'wa123',
              nodeType: 'action',
              kind: 'runScript',
              config: { script: 'throw error;' },
            },
          ],
        },
      },
    });
    prismaService.workflowRunStep.create.mockResolvedValue({ id: 'step123', startedTime });
    scriptRuntimeService.execute.mockRejectedValue(new Error('boom'));

    await service.executeWorkflowRun(runId);

    expect(prismaService.workflowRunStep.update).toHaveBeenCalledWith({
      where: { id: 'step123' },
      data: expect.objectContaining({ status: 'failed', error: { message: 'boom' } }),
    });
    expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
      where: { id: runId },
      data: expect.objectContaining({ status: 'failed', error: { message: 'boom' } }),
    });
  });

  it('executes aiGenerate actions and records generated text', async () => {
    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
      id: runId,
      input: { recordId },
      workflow: { baseId },
      snapshot: {
        snapshot: {
          baseId,
          nodes: [
            {
              id: 'wa-ai',
              nodeType: 'action',
              kind: 'aiGenerate',
              config: { prompt: 'Summarize {{ input }}', modelKey: 'gpt' },
            },
          ],
        },
      },
    });
    prismaService.workflowRunStep.create.mockResolvedValue({ id: 'step-ai', startedTime });
    workflowAiService.generateText.mockResolvedValue(generatedSummary);

    await service.executeWorkflowRun(runId);

    expect(workflowAiService.generateText).toHaveBeenCalledWith(baseId, {
      prompt: `Summarize {"recordId":"${recordId}"}`,
      modelKey: 'gpt',
    });
    expect(prismaService.workflowRunStep.update).toHaveBeenCalledWith({
      where: { id: 'step-ai' },
      data: expect.objectContaining({
        status: 'completed',
        output: { text: generatedSummary },
      }),
    });
    expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
      where: { id: runId },
      data: expect.objectContaining({
        status: 'completed',
        output: { text: generatedSummary },
      }),
    });
  });

  it('executes updateRecords actions with trigger input interpolation', async () => {
    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
      id: runId,
      input: { tableId: 'tbl123', record: { id: recordId, fields: { name: 'Old' } } },
      workflow: { baseId },
      snapshot: {
        snapshot: {
          baseId,
          nodes: [
            {
              id: 'wa-update',
              nodeType: 'action',
              kind: 'updateRecords',
              config: {
                tableId: '{{ input.tableId }}',
                recordId: '{{ input.record.id }}',
                fields: { status: 'processed', sourceName: '{{ input.record.fields.name }}' },
              },
            },
          ],
        },
      },
    });
    prismaService.workflowRunStep.create.mockResolvedValue({ id: 'step-update', startedTime });
    recordsService.updateRecord.mockResolvedValue({
      id: recordId,
      fields: { status: 'processed' },
    });

    await service.executeWorkflowRun(runId);

    expect(authorityPolicyService.assertRecordUpdate).toHaveBeenCalledWith('tbl123');
    expect(recordsService.updateRecord).toHaveBeenCalledWith(
      'tbl123',
      recordId,
      {
        record: { fields: { status: 'processed', sourceName: 'Old' } },
      },
      undefined,
      'true'
    );
    expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
      where: { id: runId },
      data: expect.objectContaining({
        status: 'completed',
        output: { id: recordId, fields: { status: 'processed' } },
      }),
    });
  });
});

```

### 文件：apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx
```tsx
import type { DehydratedState } from '@tanstack/react-query';
import type { IGetBaseVo, ITableVo } from '@teable/openapi';
import { SessionProvider, addQueryParamsToWebSocketUrl } from '@teable/sdk';
import type { IUser } from '@teable/sdk/context';
import { AnchorContext, AppProvider, BaseProvider, TableProvider } from '@teable/sdk/context';
import { getWsPath } from '@teable/sdk/context/app/useConnection';
import { useTranslation } from 'next-i18next';
import React, { Fragment, useMemo } from 'react';
import { AppLayout } from '@/features/app/layouts';
import { BaseNodeProvider } from '../blocks/base/base-node/BaseNodeProvider';
import { BaseSideBar } from '../blocks/base/base-side-bar/BaseSideBar';
import { BaseSidebarHeaderLeft } from '../blocks/base/base-side-bar/BaseSidebarHeaderLeft';
import { BasePermissionListener } from '../blocks/base/BasePermissionListener';
import { Sidebar } from '../components/sidebar/Sidebar';
import { SideBarFooter } from '../components/SideBarFooter';
import { ShareContext } from '../context/ShareContext';
import type { IBaseResourceTable } from '../hooks/useBaseResource';
import { useBaseResource } from '../hooks/useBaseResource';
import { useEnv } from '../hooks/useEnv';
import { useSdkLocale } from '../hooks/useSdkLocale';
import { PublishedAppProvider, PublishedAppRuntime } from '../published-app';
import { initAxios } from '../utils/init-axios';

const isPublishedAppShellDisabled = process.env.NEXT_PUBLIC_PUBLISHED_APP_SHELL_DISABLED === 'true';

interface IShareBaseLayoutProps {
  children: React.ReactNode;
  tableServerData?: ITableVo[];
  dehydratedState?: DehydratedState;
  user?: IUser;
  base?: IGetBaseVo;
  shareId?: string;
  shareNodeId?: string;
  allowSave?: boolean;
  allowCopy?: boolean;
  allowEdit?: boolean;
}

export const ShareBaseLayout: React.FC<IShareBaseLayoutProps> = ({
  children,
  tableServerData,
  dehydratedState,
  user,
  base,
  shareId,
  shareNodeId,
  allowSave,
  allowCopy,
  allowEdit,
}) => {
  const { baseId, tableId, viewId } = useBaseResource() as IBaseResourceTable;
  const sdkLocale = useSdkLocale();
  const { i18n } = useTranslation();
  const { maxSearchFieldCount } = useEnv();

  const isShare = !!shareId;

  // Initialize axios with share header (synchronous, like template)
  if (isShare) {
    initAxios({ shareId });
  }

  const wsPath = useMemo(() => {
    if (typeof window === 'object' && shareId) {
      return addQueryParamsToWebSocketUrl(getWsPath(), { baseShareId: shareId });
    }
    return undefined;
  }, [shareId]);

  // Share context value with URL prefix and nodeId for filtering
  const shareContextValue = useMemo(
    () => ({
      shareId,
      urlPrefix: shareId ? `/share/${shareId}` : undefined,
      nodeId: shareNodeId,
      allowSave,
      allowCopy,
      allowEdit,
    }),
    [shareId, shareNodeId, allowSave, allowCopy, allowEdit]
  );

  // If not a share context, just render children (fallback)
  if (!isShare) {
    return <>{children}</>;
  }

  return (
    <ShareContext.Provider value={shareContextValue}>
      <AppLayout>
        <AppProvider
          lang={i18n.language}
          locale={sdkLocale}
          dehydratedState={dehydratedState}
          wsPath={wsPath}
          shareId={shareId}
          maxSearchFieldCount={maxSearchFieldCount}
        >
          <SessionProvider user={user} disabledApi>
            <AnchorContext.Provider
              value={{
                baseId: baseId as string,
                tableId: tableId as string,
                viewId: viewId as string,
              }}
            >
              <BaseProvider>
                <BaseNodeProvider>
                  <PublishedAppProvider
                    base={base}
                    shareId={shareId}
                    shareNodeId={shareNodeId}
                    allowSave={allowSave}
                    allowCopy={allowCopy}
                    allowEdit={allowEdit}
                  >
                    <PublishedAppRuntime>
                      <BasePermissionListener />
                      <TableProvider serverData={tableServerData}>
                        <div
                          id="portal"
                          className="h-screen w-full"
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          {isPublishedAppShellDisabled ? (
                            <div className="relative flex h-screen w-full items-start">
                              <div className="flex h-screen w-full">
                                <Sidebar headerLeft={<BaseSidebarHeaderLeft />}>
                                  <Fragment>
                                    <div className="flex h-full flex-col gap-2 divide-y divide-solid overflow-auto py-2">
                                      <BaseSideBar />
                                    </div>
                                    <div className="grow basis-0" />
                                    <SideBarFooter />
                                  </Fragment>
                                </Sidebar>
                                <div className="min-w-80 flex-1">{children}</div>
                              </div>
                            </div>
                          ) : (
                            children
                          )}
                        </div>
                      </TableProvider>
                    </PublishedAppRuntime>
                  </PublishedAppProvider>
                </BaseNodeProvider>
              </BaseProvider>
            </AnchorContext.Provider>
          </SessionProvider>
        </AppProvider>
      </AppLayout>
    </ShareContext.Provider>
  );
};

```

### 文件：apps/nextjs-app/src/features/app/published-app/runtime/PublishedAppRuntime.tsx
```tsx
import type { ReactNode } from 'react';
import { PublishedAppPwaMeta } from '../pwa';
import { PublishedAppShell } from '../shell';
import { PublishedResourceRenderer } from './PublishedResourceRenderer';

const isPublishedAppShellDisabled = process.env.NEXT_PUBLIC_PUBLISHED_APP_SHELL_DISABLED === 'true';

export const PublishedAppRuntime = ({ children }: { children: ReactNode }) => {
  const content = <PublishedResourceRenderer>{children}</PublishedResourceRenderer>;

  return (
    <>
      <PublishedAppPwaMeta />
      {isPublishedAppShellDisabled ? content : <PublishedAppShell>{content}</PublishedAppShell>}
    </>
  );
};

```

### 文件：apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx
```tsx
import type { IGetBaseVo } from '@teable/openapi';
import { BaseNodeResourceType } from '@teable/openapi';
import { useIsMobile } from '@teable/sdk/hooks';
import { useRouter } from 'next/router';
import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useMedia } from 'react-use';
import { BaseNodeContext } from '@/features/app/blocks/base/base-node/BaseNodeContext';
import type { TreeItemData } from '@/features/app/blocks/base/base-node/hooks';
import { ROOT_ID } from '@/features/app/blocks/base/base-node/hooks';
import { useBaseResource } from '@/features/app/hooks/useBaseResource';
import { buildPublishedAppManifest } from '../manifest';
import type { PublishedAppManifest, PublishedAppNode } from '../manifest';
import { buildPublishedNavigation } from '../navigation';
import type { PublishedNavigationItem, PublishedNavigationModel } from '../navigation';
import { useIsPwaStandalone } from '../pwa/useIsPwaStandalone';

export interface PublishedAppContextValue {
  manifest: PublishedAppManifest;
  navigation: PublishedNavigationModel;
  currentNode?: PublishedAppNode;
  defaultNode?: PublishedAppNode;
  activeNavigationItem?: PublishedNavigationItem;
  isShare: boolean;
  isReadonly: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isEmbed: boolean;
  isPwaStandalone: boolean;
  navigateToNode: (nodeId: string) => void;
}

export interface PublishedAppProviderProps {
  children: ReactNode;
  base?: IGetBaseVo;
  shareId?: string;
  shareNodeId?: string;
  allowSave?: boolean;
  allowCopy?: boolean;
  allowEdit?: boolean;
}

export const PublishedAppContext = createContext<PublishedAppContextValue | undefined>(undefined);

const getResourceIdFromRoute = (resource: ReturnType<typeof useBaseResource>) => {
  switch (resource.resourceType) {
    case BaseNodeResourceType.Table:
      return resource.tableId;
    case BaseNodeResourceType.Dashboard:
      return resource.dashboardId;
    case BaseNodeResourceType.Workflow:
      return resource.workflowId;
    case BaseNodeResourceType.App:
      return resource.appId;
    default:
      return undefined;
  }
};

const getSourceNodes = (treeItems: Record<string, TreeItemData>) => {
  return Object.values(treeItems).filter((node) => node.id !== ROOT_ID);
};

export const PublishedAppProvider = ({
  children,
  base,
  shareId,
  shareNodeId,
  allowSave,
  allowCopy,
  allowEdit,
}: PublishedAppProviderProps) => {
  const router = useRouter();
  const resource = useBaseResource();
  const isMobile = useIsMobile();
  const isTablet = useMedia('(min-width: 641px) and (max-width: 1024px)');
  const isPwaStandalone = useIsPwaStandalone();
  const { treeItems } = useContext(BaseNodeContext);

  const manifest = useMemo(() => {
    return buildPublishedAppManifest({
      baseId: resource.baseId,
      title: base?.name ?? '',
      icon: base?.icon,
      shareId,
      shareNodeId,
      nodes: getSourceNodes(treeItems),
      permissions: {
        allowSave,
        allowCopy,
        allowEdit,
        readonly: !allowEdit,
      },
      mode: shareId ? 'share' : 'authenticated',
    });
  }, [
    allowCopy,
    allowEdit,
    allowSave,
    base?.icon,
    base?.name,
    resource.baseId,
    shareId,
    shareNodeId,
    treeItems,
  ]);

  const resourceId = getResourceIdFromRoute(resource);
  const currentNode = manifest.nodes.find(
    (node) => node.resourceType === resource.resourceType && node.resourceId === resourceId
  );
  const defaultNode = manifest.nodes.find((node) => node.nodeId === manifest.defaultNodeId);
  const navigation = useMemo(() => {
    return buildPublishedNavigation({ manifest, currentNode });
  }, [currentNode, manifest]);

  const value = useMemo<PublishedAppContextValue>(() => {
    return {
      manifest,
      navigation,
      currentNode,
      defaultNode,
      activeNavigationItem: navigation.activeItem,
      isShare: Boolean(shareId),
      isReadonly: !allowEdit,
      isMobile,
      isTablet,
      isEmbed: false,
      isPwaStandalone,
      navigateToNode: (nodeId: string) => {
        const item = navigation.flatItems.find((navItem) => navItem.nodeId === nodeId);
        if (item?.url) {
          router.push(item.url);
        }
      },
    };
  }, [
    allowEdit,
    currentNode,
    defaultNode,
    isMobile,
    isTablet,
    isPwaStandalone,
    manifest,
    navigation,
    router,
    shareId,
  ]);

  return <PublishedAppContext.Provider value={value}>{children}</PublishedAppContext.Provider>;
};

export const usePublishedApp = () => {
  const context = useContext(PublishedAppContext);
  if (!context) {
    throw new Error('usePublishedApp must be used within PublishedAppProvider');
  }
  return context;
};

export const useOptionalPublishedApp = () => {
  return useContext(PublishedAppContext);
};

```

### 文件：apps/nextjs-app/src/features/app/published-app/shell/DesktopShell.tsx
```tsx
import { usePublishedApp } from '../context';
import { PublishedAppNavItem } from './PublishedAppNavItem';
import type { PublishedAppShellProps } from './types';

export const DesktopShell = ({ children }: PublishedAppShellProps) => {
  const { activeNavigationItem, manifest, navigateToNode, navigation } = usePublishedApp();

  return (
    <div className="flex h-screen min-h-0 bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r bg-muted/20">
        <div className="border-b px-4 py-3">
          <div className="truncate text-sm font-semibold">{manifest.title || 'Published app'}</div>
          <div className="text-xs text-muted-foreground">Published runtime</div>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {navigation.flatItems.map((item) => (
            <PublishedAppNavItem
              key={item.nodeId}
              item={item}
              activeNodeId={activeNavigationItem?.nodeId}
              onNavigate={navigateToNode}
            />
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
};

```

### 文件：apps/nextjs-app/src/features/app/published-app/shell/TabletShell.tsx
```tsx
import { PublishedAppDrawer } from './PublishedAppDrawer';
import { PublishedAppHeader } from './PublishedAppHeader';
import type { PublishedAppShellProps } from './types';

export const TabletShell = ({ children }: PublishedAppShellProps) => {
  return (
    <div className="flex h-screen min-h-0 bg-background">
      <PublishedAppDrawer />
      <div className="flex min-w-0 flex-1 flex-col">
        <PublishedAppHeader />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

```

### 文件：apps/nextjs-app/src/features/app/automation/lib/workflowNodes.ts
```ts
import { generateWorkflowActionId } from '@teable/core';
import type { IWorkflowDetailVo, IWorkflowNode } from '@teable/openapi';

export interface IRecordUpdateActionConfig {
  tableId: string;
  recordId: string;
  fields: Record<string, unknown>;
}

export interface IRecordCreateActionConfig {
  tableId: string;
  records: Record<string, unknown>[];
}

export interface IRecordQueryActionConfig {
  tableId: string;
  filter?: Record<string, unknown>;
  take?: number;
}

export type WorkflowActionKind =
  | 'runScript'
  | 'aiGenerate'
  | 'updateRecords'
  | 'createRecords'
  | 'queryRecords';

const triggerInputTableIdTemplate = '{{ input.tableId }}';

export const getScriptPreview = (workflow?: IWorkflowDetailVo, nodeId?: string) => {
  const runScriptNode = workflow?.nodes.find(
    (node) =>
      node.nodeType === 'action' && node.kind === 'runScript' && (!nodeId || node.id === nodeId)
  );
  const config = runScriptNode?.config as { script?: string; code?: string } | undefined;
  return config?.script ?? config?.code ?? '';
};

export const getAiGeneratePrompt = (workflow?: IWorkflowDetailVo, nodeId?: string) => {
  const aiGenerateNode = workflow?.nodes.find(
    (node) =>
      node.nodeType === 'action' && node.kind === 'aiGenerate' && (!nodeId || node.id === nodeId)
  );
  const config = aiGenerateNode?.config as { prompt?: string } | undefined;
  return config?.prompt ?? '';
};

export const getRecordTriggerTableId = (workflow?: IWorkflowDetailVo) => {
  const recordTriggerNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && ['recordCreated', 'recordUpdated'].includes(node.kind)
  );
  const config = recordTriggerNode?.config as { tableId?: string } | undefined;
  return config?.tableId ?? '';
};

export const getRecordTriggerKind = (workflow?: IWorkflowDetailVo) => {
  const recordTriggerNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && ['recordCreated', 'recordUpdated'].includes(node.kind)
  );
  return recordTriggerNode?.kind === 'recordUpdated' ? 'recordUpdated' : 'recordCreated';
};

export const getRecordTriggerFilterText = (workflow?: IWorkflowDetailVo) => {
  const recordTriggerNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && ['recordCreated', 'recordUpdated'].includes(node.kind)
  );
  const config = recordTriggerNode?.config as { filter?: unknown } | undefined;
  return config?.filter ? JSON.stringify(config.filter, null, 2) : '';
};

export const appendActionNode = (
  workflow: IWorkflowDetailVo,
  kind: WorkflowActionKind
): IWorkflowNode[] => {
  const actionNodes = workflow.nodes.filter((node) => node.nodeType === 'action');
  const triggerNode = workflow.nodes.find((node) => node.nodeType === 'trigger');
  const previousNode = actionNodes[actionNodes.length - 1] ?? triggerNode;
  const newNodeId = generateWorkflowActionId();

  let config:
    | IRecordUpdateActionConfig
    | IRecordCreateActionConfig
    | IRecordQueryActionConfig
    | { script: string }
    | { prompt: string };
  switch (kind) {
    case 'aiGenerate':
      config = { prompt: 'Summarize this automation input: {{ input }}' };
      break;
    case 'runScript':
      config = {
        script: ['console.log("Automation input", input);', 'return {', '  input,', '};'].join(
          '\n'
        ),
      };
      break;
    case 'updateRecords':
      config = {
        tableId: triggerInputTableIdTemplate,
        recordId: '{{ input.record.id }}',
        fields: {},
      };
      break;
    case 'createRecords':
      config = { tableId: triggerInputTableIdTemplate, records: [{}] };
      break;
    case 'queryRecords':
      config = { tableId: triggerInputTableIdTemplate, filter: {}, take: 10 };
      break;
  }

  const newNode: IWorkflowNode = {
    id: newNodeId,
    workflowId: workflow.id,
    nodeType: 'action',
    kind,
    parentNodeId: previousNode?.id,
    config,
  };

  return [
    ...workflow.nodes.map((node) =>
      node.id === previousNode?.id ? { ...node, nextNodeId: newNodeId } : node
    ),
    newNode,
  ];
};

export const removeActionNode = (workflow: IWorkflowDetailVo, nodeId: string): IWorkflowNode[] => {
  const nodeToRemove = workflow.nodes.find((node) => node.id === nodeId);
  if (!nodeToRemove || nodeToRemove.nodeType !== 'action') {
    return workflow.nodes;
  }

  return workflow.nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => {
      if (node.id === nodeToRemove.parentNodeId) {
        return { ...node, nextNodeId: nodeToRemove.nextNodeId };
      }
      if (node.id === nodeToRemove.nextNodeId) {
        return { ...node, parentNodeId: nodeToRemove.parentNodeId };
      }
      return node;
    });
};

export const hasSelectedActionNode = (
  workflow: IWorkflowDetailVo | undefined,
  nodeId: string | undefined,
  kind: WorkflowActionKind
) => Boolean(workflow?.nodes.some((node) => node.id === nodeId && node.kind === kind));

export const getFirstActionNodeId = (
  workflow: IWorkflowDetailVo | undefined,
  kind: WorkflowActionKind
) => workflow?.nodes.find((node) => node.nodeType === 'action' && node.kind === kind)?.id;

export const getActiveActionNodeId = (
  workflow: IWorkflowDetailVo | undefined,
  selectedNodeId: string | undefined,
  kind: WorkflowActionKind
) => selectedNodeId ?? getFirstActionNodeId(workflow, kind);

```

### 文件：apps/nextjs-app/src/features/app/automation/lib/workflowNodes.spec.ts
```ts
import type { IWorkflowDetailVo } from '@teable/openapi';
import { describe, expect, it } from 'vitest';
import { appendActionNode, removeActionNode } from './workflowNodes';

describe('workflowNodes', () => {
  const workflow = {
    id: 'wfl123',
    nodes: [
      { id: 'wtr123', workflowId: 'wfl123', nodeType: 'trigger', kind: 'recordCreated' },
      {
        id: 'wac123',
        workflowId: 'wfl123',
        nodeType: 'action',
        kind: 'aiGenerate',
        parentNodeId: 'wtr123',
      },
    ],
  } as IWorkflowDetailVo;

  it('appends an action after the last action node', () => {
    const nodes = appendActionNode(workflow, 'queryRecords');
    const newNode = nodes.find((node) => node.kind === 'queryRecords');

    expect(nodes.find((node) => node.id === 'wac123')?.nextNodeId).toBe(newNode?.id);
    expect(newNode).toMatchObject({
      workflowId: 'wfl123',
      nodeType: 'action',
      parentNodeId: 'wac123',
      config: { tableId: '{{ input.tableId }}', filter: {}, take: 10 },
    });
  });

  it('removes an action and reconnects neighbors', () => {
    const nodes = removeActionNode(
      {
        ...workflow,
        nodes: [
          { id: 'wtr123', workflowId: 'wfl123', nodeType: 'trigger', kind: 'recordCreated' },
          {
            id: 'wac123',
            workflowId: 'wfl123',
            nodeType: 'action',
            kind: 'aiGenerate',
            parentNodeId: 'wtr123',
            nextNodeId: 'wac456',
          },
          {
            id: 'wac456',
            workflowId: 'wfl123',
            nodeType: 'action',
            kind: 'runScript',
            parentNodeId: 'wac123',
          },
        ],
      } as IWorkflowDetailVo,
      'wac123'
    );

    expect(nodes.some((node) => node.id === 'wac123')).toBe(false);
    expect(nodes.find((node) => node.id === 'wtr123')?.nextNodeId).toBe('wac456');
    expect(nodes.find((node) => node.id === 'wac456')?.parentNodeId).toBe('wtr123');
  });
});

```

### 文件：packages/openapi/src/automation/index.ts
```ts
export * from './workflow/ai-create-draft';
export * from './workflow/activate';
export * from './workflow/create';
export * from './workflow/deactivate';
export * from './workflow/delete';
export * from './workflow/duplicate';
export * from './workflow/get';
export * from './workflow/get-capabilities';
export * from './workflow/get-list';
export * from './workflow/get-run';
export * from './workflow/get-run-list';
export * from './workflow/test-run';
export * from './workflow/types';
export * from './workflow/update';

```

### 文件：packages/v2/contract-http/src/contract.ts
```ts
import { oc } from '@orpc/contract';
import type { AnyContractRouter } from '@orpc/contract';
import {
  createBaseInputSchema,
  createFieldInputSchema,
  createRecordInputSchema,
  createRecordsInputSchema,
  submitRecordInputSchema,
  createTableInputSchema,
  createTablesInputSchema,
  deleteByRangeCommandInputSchema,
  deleteFieldInputSchema,
  deleteRecordsInputSchema,
  deleteTableInputSchema,
  duplicateFieldInputSchema,
  duplicateRecordInputSchema,
  duplicateTableInputSchema,
  getRecordByIdInputSchema,
  getTableByIdInputSchema,
  importCsvInputSchema,
  importRecordsInputSchema,
  listBasesInputSchema,
  listTableRecordsInputSchema,
  listTablesInputSchema,
  pasteCommandInputSchema,
  clearCommandInputSchema,
  renameTableInputSchema,
  restoreTableInputSchema,
  updateFieldInputSchema,
  updateRecordInputSchema,
  updateRecordsInputSchema,
  reorderRecordsInputSchema,
} from '@teable/v2-core';

import { createBaseOkResponseSchema } from './base/createBase';
import { listBasesOkResponseSchema } from './base/listBases';
import { clearOkResponseSchema } from './table/clear';
import { createFieldOkResponseSchema } from './table/createField';
import { createRecordOkResponseSchema } from './table/createRecord';
import { createRecordsOkResponseSchema } from './table/createRecords';
import { createTableErrorResponseSchema, createTableOkResponseSchema } from './table/createTable';
import { createTablesOkResponseSchema } from './table/createTables';
import { deleteByRangeOkResponseSchema } from './table/deleteByRange';
import { deleteFieldOkResponseSchema } from './table/deleteField';
import { deleteRecordsOkResponseSchema } from './table/deleteRecords';
import { deleteTableErrorResponseSchema, deleteTableOkResponseSchema } from './table/deleteTable';
import { duplicateFieldOkResponseSchema } from './table/duplicateField';
import { duplicateRecordOkResponseSchema } from './table/duplicateRecord';
import { duplicateTableOkResponseSchema } from './table/duplicateTable';
import {
  explainCreateFieldInputSchema,
  explainCreateRecordInputSchema,
  explainDeleteFieldInputSchema,
  explainDeleteTableInputSchema,
  explainDeleteRecordsInputSchema,
  explainOkResponseSchema,
  explainUpdateFieldInputSchema,
  explainUpdateRecordInputSchema,
} from './table/explainCommand';
import { getRecordByIdOkResponseSchema } from './table/getRecordById';
import { getTableByIdOkResponseSchema } from './table/getTableById';
import { importCsvOkResponseSchema } from './table/importCsv';
import { importRecordsOkResponseSchema } from './table/importRecords';
import { listTableRecordsOkResponseSchema } from './table/listTableRecords';
import { listTablesOkResponseSchema } from './table/listTables';
import { pasteOkResponseSchema } from './table/paste';
import { renameTableOkResponseSchema } from './table/renameTable';
import { reorderRecordsOkResponseSchema } from './table/reorderRecords';
import { restoreTableOkResponseSchema } from './table/restoreTable';
import { submitRecordOkResponseSchema } from './table/submitRecord';
import { updateFieldOkResponseSchema } from './table/updateField';
import { updateRecordOkResponseSchema } from './table/updateRecord';
import { updateRecordsOkResponseSchema } from './table/updateRecords';

const BASES_CREATE_PATH = '/bases/create';
const BASES_LIST_PATH = '/bases/list';
const TABLES_CREATE_FIELD_PATH = '/tables/createField';
const TABLES_CREATE_PATH = '/tables/create';
const TABLES_CREATE_TABLES_PATH = '/tables/createTables';
const TABLES_CREATE_RECORD_PATH = '/tables/createRecord';
const TABLES_SUBMIT_RECORD_PATH = '/tables/submitRecord';
const TABLES_CREATE_RECORDS_PATH = '/tables/createRecords';
const TABLES_DELETE_RECORDS_PATH = '/tables/deleteRecords';
const TABLES_DELETE_FIELD_PATH = '/tables/deleteField';
const TABLES_DELETE_PATH = '/tables/delete';
const TABLES_EXPLAIN_CREATE_FIELD_PATH = '/tables/explainCreateField';
const TABLES_EXPLAIN_CREATE_RECORD_PATH = '/tables/explainCreateRecord';
const TABLES_EXPLAIN_UPDATE_FIELD_PATH = '/tables/explainUpdateField';
const TABLES_EXPLAIN_UPDATE_RECORD_PATH = '/tables/explainUpdateRecord';
const TABLES_EXPLAIN_DELETE_FIELD_PATH = '/tables/explainDeleteField';
const TABLES_EXPLAIN_DELETE_TABLE_PATH = '/tables/explainDeleteTable';
const TABLES_EXPLAIN_DELETE_RECORDS_PATH = '/tables/explainDeleteRecords';
const TABLES_GET_PATH = '/tables/get';
const TABLES_GET_RECORD_PATH = '/tables/getRecord';
const TABLES_IMPORT_CSV_PATH = '/tables/importCsv';
const TABLES_IMPORT_RECORDS_PATH = '/tables/importRecords';
const TABLES_LIST_RECORDS_PATH = '/tables/listRecords';
const TABLES_LIST_PATH = '/tables/list';
const TABLES_PASTE_PATH = '/tables/paste';
const TABLES_CLEAR_PATH = '/tables/clear';
const TABLES_DELETE_BY_RANGE_PATH = '/tables/deleteByRange';
const TABLES_RENAME_PATH = '/tables/rename';
const TABLES_RESTORE_PATH = '/tables/restore';
const TABLES_UPDATE_FIELD_PATH = '/tables/updateField';
const TABLES_UPDATE_RECORD_PATH = '/tables/updateRecord';
const TABLES_UPDATE_RECORDS_PATH = '/tables/updateRecords';
const TABLES_REORDER_RECORDS_PATH = '/tables/reorderRecords';
const TABLES_DUPLICATE_FIELD_PATH = '/tables/duplicateField';
const TABLES_DUPLICATE_RECORD_PATH = '/tables/duplicateRecord';
const TABLES_DUPLICATE_TABLE_PATH = '/tables/duplicateTable';

export const v2Contract: AnyContractRouter = {
  bases: {
    create: oc
      .route({
        method: 'POST',
        path: BASES_CREATE_PATH,
        successStatus: 201,
        summary: 'Create base',
        tags: ['bases'],
      })
      .input(createBaseInputSchema)
      .output(createBaseOkResponseSchema),
    list: oc
      .route({
        method: 'GET',
        path: BASES_LIST_PATH,
        successStatus: 200,
        summary: 'List bases',
        tags: ['bases'],
      })
      .input(listBasesInputSchema)
      .output(listBasesOkResponseSchema),
  },
  tables: {
    create: oc
      .route({
        method: 'POST',
        path: TABLES_CREATE_PATH,
        successStatus: 201,
        summary: 'Create table',
        tags: ['tables'],
      })
      .input(createTableInputSchema)
      .output(createTableOkResponseSchema),
    createTables: oc
      .route({
        method: 'POST',
        path: TABLES_CREATE_TABLES_PATH,
        successStatus: 201,
        summary: 'Create tables',
        tags: ['tables'],
      })
      .input(createTablesInputSchema)
      .output(createTablesOkResponseSchema),
    createField: oc
      .route({
        method: 'POST',
        path: TABLES_CREATE_FIELD_PATH,
        successStatus: 200,
        summary: 'Create field',
        tags: ['tables'],
      })
      .input(createFieldInputSchema)
      .output(createFieldOkResponseSchema),
    explainCreateField: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_CREATE_FIELD_PATH,
        successStatus: 200,
        summary: 'Explain create field',
        tags: ['tables'],
      })
      .input(explainCreateFieldInputSchema)
      .output(explainOkResponseSchema),
    updateField: oc
      .route({
        method: 'POST',
        path: TABLES_UPDATE_FIELD_PATH,
        successStatus: 200,
        summary: 'Update field',
        tags: ['tables'],
      })
      .input(updateFieldInputSchema)
      .output(updateFieldOkResponseSchema),
    explainUpdateField: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_UPDATE_FIELD_PATH,
        successStatus: 200,
        summary: 'Explain update field',
        tags: ['tables'],
      })
      .input(explainUpdateFieldInputSchema)
      .output(explainOkResponseSchema),
    updateRecords: oc
      .route({
        method: 'POST',
        path: TABLES_UPDATE_RECORDS_PATH,
        successStatus: 200,
        summary: 'Update multiple records by filter or recordIds',
        tags: ['tables'],
      })
      .input(updateRecordsInputSchema)
      .output(updateRecordsOkResponseSchema),
    createRecord: oc
      .route({
        method: 'POST',
        path: TABLES_CREATE_RECORD_PATH,
        successStatus: 201,
        summary: 'Create record',
        tags: ['tables'],
      })
      .input(createRecordInputSchema)
      .output(createRecordOkResponseSchema),
    submitRecord: oc
      .route({
        method: 'POST',
        path: TABLES_SUBMIT_RECORD_PATH,
        successStatus: 201,
        summary: 'Submit record from form',
        tags: ['tables'],
      })
      .input(submitRecordInputSchema)
      .output(submitRecordOkResponseSchema),
    createRecords: oc
      .route({
        method: 'POST',
        path: TABLES_CREATE_RECORDS_PATH,
        successStatus: 201,
        summary: 'Create multiple records',
        tags: ['tables'],
      })
      .input(createRecordsInputSchema)
      .output(createRecordsOkResponseSchema),
    deleteRecords: oc
      .route({
        method: 'DELETE',
        path: TABLES_DELETE_RECORDS_PATH,
        successStatus: 200,
        summary: 'Delete records',
        tags: ['tables'],
      })
      .input(deleteRecordsInputSchema)
      .output(deleteRecordsOkResponseSchema),
    deleteField: oc
      .route({
        method: 'DELETE',
        path: TABLES_DELETE_FIELD_PATH,
        successStatus: 200,
        summary: 'Delete field',
        tags: ['tables'],
      })
      .input(deleteFieldInputSchema)
      .output(deleteFieldOkResponseSchema),
    explainDeleteField: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_DELETE_FIELD_PATH,
        successStatus: 200,
        summary: 'Explain delete field',
        tags: ['tables'],
      })
      .input(explainDeleteFieldInputSchema)
      .output(explainOkResponseSchema),
    explainDeleteTable: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_DELETE_TABLE_PATH,
        successStatus: 200,
        summary: 'Explain delete table',
        tags: ['tables'],
      })
      .input(explainDeleteTableInputSchema)
      .output(explainOkResponseSchema),
    delete: oc
      .route({
        method: 'DELETE',
        path: TABLES_DELETE_PATH,
        successStatus: 200,
        summary: 'Delete table',
        tags: ['tables'],
      })
      .input(deleteTableInputSchema)
      .output(deleteTableOkResponseSchema),
    restore: oc
      .route({
        method: 'POST',
        path: TABLES_RESTORE_PATH,
        successStatus: 200,
        summary: 'Restore table',
        tags: ['tables'],
      })
      .input(restoreTableInputSchema)
      .output(restoreTableOkResponseSchema),
    getById: oc
      .route({
        method: 'GET',
        path: TABLES_GET_PATH,
        successStatus: 200,
        summary: 'Get table by id',
        tags: ['tables'],
      })
      .input(getTableByIdInputSchema)
      .output(getTableByIdOkResponseSchema),
    getRecord: oc
      .route({
        method: 'GET',
        path: TABLES_GET_RECORD_PATH,
        successStatus: 200,
        summary: 'Get record by id',
        tags: ['tables'],
      })
      .input(getRecordByIdInputSchema)
      .output(getRecordByIdOkResponseSchema),
    importCsv: oc
      .route({
        method: 'POST',
        path: TABLES_IMPORT_CSV_PATH,
        successStatus: 201,
        summary: 'Import CSV to create table with records',
        tags: ['tables'],
      })
      .input(importCsvInputSchema)
      .output(importCsvOkResponseSchema),
    importRecords: oc
      .route({
        method: 'POST',
        path: TABLES_IMPORT_RECORDS_PATH,
        successStatus: 200,
        summary: 'Import records into existing table',
        tags: ['tables'],
      })
      .input(importRecordsInputSchema)
      .output(importRecordsOkResponseSchema),
    listRecords: oc
      .route({
        method: 'GET',
        path: TABLES_LIST_RECORDS_PATH,
        successStatus: 200,
        summary: 'List table records',
        tags: ['tables'],
      })
      .input(listTableRecordsInputSchema)
      .output(listTableRecordsOkResponseSchema),
    list: oc
      .route({
        method: 'GET',
        path: TABLES_LIST_PATH,
        successStatus: 200,
        summary: 'List tables',
        tags: ['tables'],
      })
      .input(listTablesInputSchema)
      .output(listTablesOkResponseSchema),
    rename: oc
      .route({
        method: 'POST',
        path: TABLES_RENAME_PATH,
        successStatus: 200,
        summary: 'Rename table',
        tags: ['tables'],
      })
      .input(renameTableInputSchema)
      .output(renameTableOkResponseSchema),
    updateRecord: oc
      .route({
        method: 'POST',
        path: TABLES_UPDATE_RECORD_PATH,
        successStatus: 200,
        summary: 'Update record',
        tags: ['tables'],
      })
      .input(updateRecordInputSchema)
      .output(updateRecordOkResponseSchema),
    reorderRecords: oc
      .route({
        method: 'POST',
        path: TABLES_REORDER_RECORDS_PATH,
        successStatus: 200,
        summary: 'Reorder records',
        tags: ['tables'],
      })
      .input(reorderRecordsInputSchema)
      .output(reorderRecordsOkResponseSchema),
    duplicateField: oc
      .route({
        method: 'POST',
        path: TABLES_DUPLICATE_FIELD_PATH,
        successStatus: 200,
        summary: 'Duplicate field',
        tags: ['tables'],
      })
      .input(duplicateFieldInputSchema)
      .output(duplicateFieldOkResponseSchema),
    duplicateRecord: oc
      .route({
        method: 'POST',
        path: TABLES_DUPLICATE_RECORD_PATH,
        successStatus: 201,
        summary: 'Duplicate record',
        tags: ['tables'],
      })
      .input(duplicateRecordInputSchema)
      .output(duplicateRecordOkResponseSchema),
    duplicateTable: oc
      .route({
        method: 'POST',
        path: TABLES_DUPLICATE_TABLE_PATH,
        successStatus: 201,
        summary: 'Duplicate table',
        tags: ['tables'],
      })
      .input(duplicateTableInputSchema)
      .output(duplicateTableOkResponseSchema),
    paste: oc
      .route({
        method: 'POST',
        path: TABLES_PASTE_PATH,
        successStatus: 200,
        summary: 'Paste content to table cells',
        tags: ['tables'],
      })
      .input(pasteCommandInputSchema)
      .output(pasteOkResponseSchema),
    clear: oc
      .route({
        method: 'POST',
        path: TABLES_CLEAR_PATH,
        successStatus: 200,
        summary: 'Clear cell values in selected range',
        tags: ['tables'],
      })
      .input(clearCommandInputSchema)
      .output(clearOkResponseSchema),
    deleteByRange: oc
      .route({
        method: 'DELETE',
        path: TABLES_DELETE_BY_RANGE_PATH,
        successStatus: 200,
        summary: 'Delete records by range selection',
        tags: ['tables'],
      })
      .input(deleteByRangeCommandInputSchema)
      .output(deleteByRangeOkResponseSchema),
    explainCreateRecord: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_CREATE_RECORD_PATH,
        successStatus: 200,
        summary: 'Explain create record command',
        tags: ['tables', 'explain'],
      })
      .input(explainCreateRecordInputSchema)
      .output(explainOkResponseSchema),
    explainUpdateRecord: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_UPDATE_RECORD_PATH,
        successStatus: 200,
        summary: 'Explain update record command',
        tags: ['tables', 'explain'],
      })
      .input(explainUpdateRecordInputSchema)
      .output(explainOkResponseSchema),
    explainDeleteRecords: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_DELETE_RECORDS_PATH,
        successStatus: 200,
        summary: 'Explain delete records command',
        tags: ['tables', 'explain'],
      })
      .input(explainDeleteRecordsInputSchema)
      .output(explainOkResponseSchema),
  },
} as const;

export const v2ContractErrors = {
  400: createTableErrorResponseSchema,
  404: deleteTableErrorResponseSchema,
  500: createTableErrorResponseSchema,
} as const;

```

### 文件：package.json
```json
{
  "name": "@teable/teable",
  "version": "1.10.0",
  "license": "AGPL-3.0",
  "private": true,
  "homepage": "https://github.com/teableio/teable",
  "repository": {
    "type": "git",
    "url": "https://github.com/teableio/teable"
  },
  "author": {
    "name": "tea artist",
    "url": "https://github.com/tea-artist"
  },
  "keywords": [
    "teable",
    "database"
  ],
  "workspaces": [
    "apps/*",
    "packages/*",
    "packages/v2/*",
    "plugins",
    "!apps/electron"
  ],
  "scripts": {
    "clean:global-cache": "rimraf ./.cache",
    "deps:check": "pnpm --package=npm-check-updates@latest dlx npm-check-updates --configFileName .ncurc.yml --workspaces --root --mergeConfig",
    "deps:update": "pnpm --package=npm-check-updates@latest dlx npm-check-updates --configFileName .ncurc.yml -u --workspaces --root --mergeConfig",
    "dev:v2": "pnpm -r --parallel --stream -F @teable/formula -F './packages/v2/*' dev",
    "clean:v2": "pnpm -r --parallel --stream -F @teable/formula -F './packages/v2/*' clean",
    "build:v2": "pnpm -r --parallel --stream -F @teable/formula -F './packages/v2/*' build",
    "build:packages": "pnpm -r -F './packages/**' build",
    "g:build": "pnpm -r run build",
    "g:build-changed": "pnpm -r -F '...[origin/main]' build",
    "g:check-dist": "pnpm -r --parallel check-dist",
    "g:clean": "pnpm clean:global-cache && pnpm -r run clean",
    "g:fix-all-files": "pnpm -r fix-all-files",
    "g:lint": "pnpm -r --parallel lint --color",
    "g:lint-staged-files": "lint-staged --allow-empty",
    "g:lint-styles": "pnpm -r lint-styles --color",
    "g:test": "pnpm g:test-e2e && pnpm g:test-unit",
    "g:test-e2e": "pnpm -r test-e2e",
    "g:test-e2e-cover": "pnpm -r test-e2e-cover",
    "g:test-unit": "pnpm -r --parallel test-unit",
    "g:test-unit-cover": "pnpm -r --parallel test-unit-cover",
    "g:typecheck": "pnpm -F @teable/sdk build && pnpm -r --workspace-concurrency=8 typecheck",
    "generate-openapi-types": "node scripts/generate-openapi-types.mjs",
    "install:playwright": "playwright install",
    "install:husky": "node .husky/install.mjs",
    "nuke:node_modules": "pnpm -r exec -- rm -fr node_modules",
    "publish:beta:prerelease": "node ./scripts/publish.mjs prerelease beta",
    "publish:beta:patch": "node ./scripts/publish.mjs prepatch beta",
    "publish:beta:minor": "node ./scripts/publish.mjs preminor beta",
    "publish:beta:major": "node ./scripts/publish.mjs premajor beta",
    "publish:next:patch": "node ./scripts/publish.mjs patch next",
    "publish:next:minor": "node ./scripts/publish.mjs minor next",
    "publish:next:major": "node ./scripts/publish.mjs major next",
    "publish:latest:patch": "node ./scripts/publish.mjs patch latest",
    "publish:latest:minor": "node ./scripts/publish.mjs minor latest",
    "publish:latest:major": "node ./scripts/publish.mjs major latest",
    "prepare": "run-s install:husky",
    "run:plugin": "pnpm -F '@teable/plugin' dev"
  },
  "dependencies": {
    "cross-env": "7.0.3",
    "vm2": "3.11.2"
  },
  "devDependencies": {
    "@commitlint/cli": "19.2.1",
    "@commitlint/config-conventional": "19.1.0",
    "@teable/eslint-config-bases": "workspace:^",
    "@types/shell-quote": "1.7.5",
    "eslint": "8.57.0",
    "husky": "9.0.11",
    "lint-staged": "15.2.2",
    "npm-run-all2": "6.1.2",
    "openapi-typescript": "6.7.5",
    "prettier": "3.2.5",
    "rimraf": "5.0.5",
    "shell-quote": "1.8.1",
    "typescript": "5.4.3",
    "zx": "8.8.5"
  },
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.13.0",
    "npm": "please-use-pnpm"
  },
  "packageManager": "pnpm@9.13.0"
}

```

### 文件：pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'packages/v2/*'
  - 'plugins'
  - '!apps/electron'

```

## 6. 给后续模型的使用说明
- 主模型负责生成全局上下文、统一问题口径和制定最小修复计划。
- 复核模型负责交叉检查高风险项、边界项和契约一致性问题。
- Coding Agent 最后按 `review-plan.md` 执行修复和验证。
