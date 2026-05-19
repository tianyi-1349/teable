# Review Plan

> 文档分层：历史辅助输入。
> 
> 这份文档记录本轮专项评审阶段的修复计划，当前主要作为过程材料和历史执行参考。

## 1. 最终确认要修的问题

### 问题 1：平板端 published shell 首屏会从桌面布局跳到平板布局
- 严重程度：Medium
- 涉及文件：
  - `apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx`
  - `apps/nextjs-app/src/features/app/published-app/shell/PublishedAppShell.tsx`
- 为什么必须修：`isTablet` 依赖 `useMedia`，SSR 阶段会按非 tablet 渲染，客户端 hydration 后再切到 tablet。平板访问 published/share 页面时会出现明显布局跳变。
- 最小修复方式：在 shell 选择层增加客户端挂载保护，mounted 前先使用稳定占位或稳定 shell，避免 SSR 输出和客户端首次渲染选择不同 shell。
- 验证命令：
  ```bash
  pnpm --filter @teable/app typecheck
  pnpm --filter @teable/app exec vitest run src/features/app/automation/lib/workflowNodes.spec.ts
  ```

### 问题 2：share 场景找不到 published manifest 节点时会丢弃原页面内容
- 严重程度：Medium
- 涉及文件：
  - `apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceSwitch.tsx`
- 为什么必须修：share 链接直接访问某个 table/dashboard/workflow/app 资源时，如果该资源未出现在 published manifest 中，当前逻辑会显示 `No published resources`，并丢弃原本已经通过 SSR 准备好的页面内容。
- 最小修复方式：在 `PublishedResourceSwitch` 中读取 `isShare`，当 `node` 不存在且处于 share 场景时直接渲染 `children`，保留旧 share 页面访问能力。
- 验证命令：
  ```bash
  pnpm --filter @teable/app typecheck
  pnpm --filter @teable/app exec vitest run src/features/app/automation/lib/workflowNodes.spec.ts
  ```

### 问题 3：workflow capabilities OpenAPI 路由缺少 automation 标签
- 严重程度：Low
- 涉及文件：
  - `packages/openapi/src/automation/workflow/get-capabilities.ts`
- 为什么必须修：该接口是 automation/workflow API 的一部分，缺少 `tags: ['automation']` 会让生成的 OpenAPI 文档分组不一致。
- 最小修复方式：在 `GetWorkflowCapabilitiesRoute` 的 `registerRoute` 配置中补充 `tags: ['automation']`。
- 验证命令：
  ```bash
  pnpm --filter @teable/openapi typecheck
  pnpm -F @teable/openapi build
  ```

### 问题 4：runScript 可配置但不可运行，测试运行前缺少明确提示
- 严重程度：Low
- 涉及文件：
  - `apps/nextjs-app/src/features/app/automation/Pages.tsx`
  - `apps/nestjs-backend/src/features/workflow/workflow-capability.service.ts`
- 为什么必须修：后端 capabilities 明确返回 `runScript` 的 `runnable: false`，但前端只使用 `configurable` 控制添加按钮。用户可以添加 `runScript` 后点击测试运行，再收到失败结果，体验不清晰。
- 最小修复方式：优先保持后端能力语义不变，在前端测试运行区域根据当前 workflow 节点和 capabilities 检测不可运行 action，禁用或提示测试运行按钮。若现有 UI 结构不适合最小提示，可把 `runScript` 的 `configurable` 改为 `false`，在沙箱上线前禁止添加。
- 验证命令：
  ```bash
  pnpm --filter @teable/app typecheck
  pnpm --filter @teable/backend typecheck
  pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-runner.service.spec.ts
  pnpm --filter @teable/app exec vitest run src/features/app/automation/lib/workflowNodes.spec.ts
  ```

## 2. 暂不处理的问题

- 问题：`workflow.service.ts` 中 `buildWorkflowRunSuccessData` 和手写字段混合。
- 暂不处理原因：当前复核结论认为该写法字段齐全且类型应兼容，当前没有确定运行失败证据。
- 后续如何验证：执行 `pnpm --filter @teable/backend typecheck`，并运行 workflow 相关单测。

- 问题：`interpolateTemplate` 正则中 `\w` 在字符类内的行为。
- 暂不处理原因：标准 JavaScript 中字符类内 `\w` 语义有效，且已有 workflow runner 单测可覆盖模板插值。
- 后续如何验证：执行 `pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-runner.service.spec.ts`。

- 问题：`ScriptRuntimeModule` 的 `useExisting` 绑定方式。
- 暂不处理原因：NestJS 同模块 provider 使用 `useExisting` 是常规用法，当前无循环依赖证据。
- 后续如何验证：执行 `pnpm --filter @teable/backend typecheck`。

- 问题：`PublishedResourceSwitch` 和 `BaseNodePageSwitch` 默认 fallback 行为不同。
- 暂不处理原因：published runtime 的 fallback 与普通 base 页面语义不同，当前需要先修 share 场景误丢 children 的确定问题。
- 后续如何验证：检查 `buildPublishedAppManifest` 是否只输出 table/dashboard/workflow/app 四类 renderable resource。

- 问题：share 页面 `getShareResourcePageProps` 与通用 `getResourcePageProps` 返回类型兼容性。
- 暂不处理原因：需要 typecheck 验证，当前没有明确类型错误证据。
- 后续如何验证：执行 `pnpm --filter @teable/app typecheck`。

## 3. 串行修复步骤

### Step 1：稳定 published shell 的 SSR/CSR 选择
- 改哪些文件：
  - `apps/nextjs-app/src/features/app/published-app/shell/PublishedAppShell.tsx`
  - 如必须，也可小范围调整 `apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx`
- 怎么改：
  - 在 shell 选择层增加客户端 mounted 状态。
  - mounted 前使用稳定的默认 shell 或只渲染内容容器，避免 SSR 输出 DesktopShell、客户端首次切 TabletShell。
  - 保持 `DesktopShell`、`TabletShell`、`MobileShell` 现有 UI 不变。
- 不要改哪些东西：
  - 不要重写 `useIsMobile`。
  - 不要改 navigation 构建逻辑。
  - 不要改 `ShareBaseLayout` 的 shell disable 开关语义。
- 可能风险：首屏 mounted 前可能少一次 shell 包裹，需要确保内容容器高度不坍塌。
- 验证命令：
  ```bash
  pnpm --filter @teable/app typecheck
  pnpm --filter @teable/app exec vitest run src/features/app/automation/lib/workflowNodes.spec.ts
  ```

### Step 2：share 场景缺少 manifest 节点时保留原页面内容
- 改哪些文件：
  - `apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceSwitch.tsx`
- 怎么改：
  - 从 `usePublishedApp()` 里同时读取 `isShare`。
  - 当 `node` 为空且 `isShare` 为 true 时，返回 `children`。
  - 非 share 场景继续显示 `No published resources`。
- 不要改哪些东西：
  - 不要改 `PublishedResourceState` 的文案。
  - 不要改 `BaseNodePageSwitch`。
  - 不要改 SSR props 生成链路。
- 可能风险：share 场景会绕过 published manifest 过滤，需要限定只在 `node` 为空时 fallback 到 `children`。
- 验证命令：
  ```bash
  pnpm --filter @teable/app typecheck
  pnpm --filter @teable/app exec vitest run src/features/app/automation/lib/workflowNodes.spec.ts
  ```

### Step 3：补齐 workflow capabilities 的 OpenAPI 标签
- 改哪些文件：
  - `packages/openapi/src/automation/workflow/get-capabilities.ts`
- 怎么改：
  - 在 `registerRoute` 配置对象中添加 `tags: ['automation']`。
- 不要改哪些东西：
  - 不要改 route path。
  - 不要改 response schema。
  - 不要改 client 函数签名。
- 可能风险：极低，仅影响文档分组。
- 验证命令：
  ```bash
  pnpm --filter @teable/openapi typecheck
  pnpm -F @teable/openapi build
  ```

### Step 4：让不可运行 workflow action 在测试运行前可见
- 改哪些文件：
  - 优先：`apps/nextjs-app/src/features/app/automation/Pages.tsx`
  - 如 UI 改动过大，备选：`apps/nestjs-backend/src/features/workflow/workflow-capability.service.ts`
- 怎么改：
  - 优先前端修复：根据当前 workflow 的 action kind 和 `actionCapabilities[kind].runnable` 计算是否存在不可运行 action。
  - 测试运行按钮在存在不可运行 action 时给出明确禁用态或 title 提示。
  - 保持 `runScript` 后端执行仍返回 disabled error，作为最终安全兜底。
  - 备选后端修复：把 `runScript` 的 `configurable` 改为 `false`，避免用户新增不可运行 action。
- 不要改哪些东西：
  - 不要实现脚本沙箱。
  - 不要让 `runScript` 在后端变为 runnable。
  - 不要改 workflow runner 的安全禁用逻辑。
- 可能风险：如果已有 workflow 中已经包含 `runScript`，禁用测试运行会改变用户可操作按钮状态，但提示会更清晰。
- 验证命令：
  ```bash
  pnpm --filter @teable/app typecheck
  pnpm --filter @teable/backend typecheck
  pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-runner.service.spec.ts
  pnpm --filter @teable/app exec vitest run src/features/app/automation/lib/workflowNodes.spec.ts
  ```

### Step 5：最终格式和契约验证
- 改哪些文件：
  - 不改文件，只运行验证。
- 怎么改：
  - 按最终验证命令从小到大执行。
  - 如果某个命令失败，先回到对应 Step 修复失败原因。
- 不要改哪些东西：
  - 不要顺手修复无关 lint 历史问题。
  - 不要回滚用户已有改动。
- 可能风险：全量检查可能暴露仓库既有问题，需要区分本次改动和既有失败。
- 验证命令：
  ```bash
  pnpm --filter @teable/backend typecheck
  pnpm --filter @teable/app typecheck
  pnpm --filter @teable/openapi typecheck
  pnpm -F @teable/openapi build
  pnpm -F @teable/v2-contract-http build
  pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-runner.service.spec.ts
  pnpm --filter @teable/app exec vitest run src/features/app/automation/lib/workflowNodes.spec.ts
  git diff --check
  ```

## 4. 最终验证命令

```bash
pnpm --filter @teable/backend typecheck
pnpm --filter @teable/app typecheck
pnpm --filter @teable/openapi typecheck
pnpm -F @teable/openapi build
pnpm -F @teable/v2-contract-http build
pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-runner.service.spec.ts
pnpm --filter @teable/app exec vitest run src/features/app/automation/lib/workflowNodes.spec.ts
git diff --check
```

## 5. 给 Coding Agent 的最终执行指令

请读取 `/workspace/review-plan.md`，并严格按里面的“串行修复步骤”执行。

执行要求：
- 一次只执行一个 Step。
- 每完成一个 Step，立即运行该 Step 的验证命令。
- 如果验证失败，先修复失败原因，再继续下一个 Step。
- 不要回滚用户已有改动。
- 不要扩大改动范围。
- 不要修改 `review-materials.md`、`review-context.md`、`review-findings.md`、`review-plan.md`，除非计划中明确要求。
- 全部 Step 完成后，运行 `review-plan.md` 里的“最终验证命令”。
- 最终验证必须包含并执行以下两条测试命令：
  ```bash
  pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-runner.service.spec.ts
  pnpm --filter @teable/app exec vitest run src/features/app/automation/lib/workflowNodes.spec.ts
  ```
- 最后用简洁中文汇报：
  - 改了哪些文件
  - 修了哪些问题
  - 跑了哪些命令
  - 哪些通过
  - 哪些仍然失败
