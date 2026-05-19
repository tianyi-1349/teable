# Review Findings

> 文档分层：历史辅助输入。
> 
> 这份文档记录本轮专项评审阶段识别出的发现项，当前主要作为历史问题清单和修复依据回溯材料。

## 1. 确认的问题

### 问题 1：`isTablet` 使用 `useMedia` 导致 SSR 和客户端渲染不一致
- 严重程度：Medium
- 文件位置：`apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx:76`
- 问题是什么：`useMedia('(min-width: 641px) and (max-width: 1024px)')` 在 SSR 时始终返回 `false`，客户端 hydration 后在 `useEffect` 中更新为真实值。在平板设备上（宽度 641-1024px），SSR 渲染 `DesktopShell`，hydration 后切换为 `TabletShell`，导致页面跳变。
- 什么时候会触发：用户在平板设备（如 iPad）上访问 publish/share 页面，且 `NEXT_PUBLIC_PUBLISHED_APP_SHELL_DISABLED` 未设为 `true`。
- 为什么会坏：React hydration 会触发 warning（不是 crash），但视觉上用户会看到桌面侧边栏布局短暂出现后突然变为平板 drawer+header 布局。
- 建议怎么修：
  1. 给 `useMedia` 传入第二个参数 `defaultState` 设为 `undefined`，让初始值不确定时隐藏 shell 渲染直到客户端 ready
  2. 或在 `PublishedAppShell` 中延迟渲染，等 `isTablet` 就绪（`typeof window === 'undefined'` 时不渲染）
  3. 最简方案：在 `PublishedAppShell` 中用 `useMounted` guard，确保只在客户端渲染
- 修完跑什么命令验证：`pnpm --filter @teable/app typecheck && pnpm --filter @teable/app exec vitest run`（React 渲染相关测试如存在）

### 问题 2：`PublishedResourceSwitch` 在无已发布资源时静默替换子页面内容
- 严重程度：Medium
- 文件位置：`apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceSwitch.tsx:15-21`
- 问题是什么：当 `PublishedAppProvider` 构建的 manifest 中找不到当前路由对应的资源节点时，`PublishedResourceSwitch` 直接返回 `<PublishedResourceState title="No published resources" />`，完全丢弃了 `children`（即原页面组件渲染的内容如 `TablePage`）。
- 什么时候会触发：在 share 链接场景下，用户通过 `https://site/share/shareId/base/baseId/table/tbl123` 直接访问一个在 published manifest 中不存在（未被标记为 renderable）的资源。
- 为什么会坏：share 链接用户期望看到所有被分享的资源，但 published shell 按"仅已发布"策略过滤，导致用户看到"没有已发布资源"而不是表格内容。share 场景和 published app 场景的预期行为冲突。
- 建议怎么修：
  1. 在 `PublishedResourceSwitch` 中，当 `node` 不存在时，检查当前是否在 share 上下文中（可通过 `usePublishedApp().isShare`），如果是则跳过过滤直接渲染 `children`
  2. 或者为 share 上下文单独渲染一个带 `children` 的 fallback，而不是完全替换
- 修完跑什么命令验证：`pnpm --filter @teable/app typecheck`

### 问题 3：`GetWorkflowCapabilitiesRoute` 缺少 `tags`
- 严重程度：Low
- 文件位置：`packages/openapi/src/automation/workflow/get-capabilities.ts:28`
- 问题是什么：`GetWorkflowCapabilitiesRoute` 的 `registerRoute` 调用中没有 `tags: ['automation']`，而其他 workflow 路由（如 `GetWorkflowRoute`）都有。
- 什么时候会触发：生成 OpenAPI 文档时，capabilities 接口不会被归入 `automation` 标签组。
- 为什么会坏：不影响运行时功能，但 API 文档中该接口可能出现在其他分组或未被正确归类。
- 建议怎么修：在 `registerRoute` 参数中加上 `tags: ['automation']`。
- 修完跑什么命令验证：`pnpm -F @teable/openapi build && pnpm -F @teable/openapi typecheck`

### 问题 4：`workflow.service.ts` 中 `buildWorkflowRunSuccessData` 调用和原有的 raw 字段混合
- 严重程度：Medium
- 文件位置：`apps/nestjs-backend/src/features/workflow/workflow.service.ts:842-850`
- 问题是什么：`workflow.service.ts` 的 `finishEmptyAssetRun` 方法中，在已有 `startedTime` 手动设置的 data 对象中，通过 `...buildWorkflowRunSuccessData(startedTime, startedTime, {...})` 展开混入。但 `buildWorkflowRunSuccessData` 返回的对象包含 `status: 'completed'`，`finishedTime`，`durationMs: 0` 和 `output: toJson(output)`。而旧的 `data` 对象中只设置了 `startedTime`，新旧混合后字段齐全，不会冲突。不过 `output` 通过 `toJson` 转换可能产生 `Prisma.NullInput` 而非 `Prisma.JsonNull`，取决于 `@prisma/client` 版本。
- 什么时候会触发：当 workflow 没有任何 runner action 时（空 run），会调用 `finishEmptyAssetRun`。
- 为什么会坏：如果 Prisma 版本中 `Prisma.NullInput` 不被 update data 接受（某些版本只接受 `Prisma.InputJsonValue`），可能导致 Prisma write error。但 `toJson` 的返回类型是 `Prisma.InputJsonValue`，所以应该兼容。
- 建议怎么修：无需修改。但建议验证 `toJson` 返回的 `Prisma.InputJsonValue` 类型和 NestJS Prisma client update data 的预期类型兼容。
- 修完跑什么命令验证：`pnpm --filter @teable/backend typecheck`

### 问题 5：前端 `actionCapabilities` 的 `runnable` 字段未用于拦截测试运行
- 严重程度：Low
- 文件位置：`apps/nextjs-app/src/features/app/automation/Pages.tsx`（测试运行按钮部分）
- 问题是什么：`WorkflowCapabilityService` 返回每条 action 的 `runnable` 字段（如 `runScript` 标记为 `runnable: false`），前端用 `configurable` 控制"添加动作"按钮的禁用状态，但不检查 `runnable` 来阻止"测试运行"。用户可以将 `runScript` 动作添加到 workflow 中并点击测试运行，运行会失败但前端没有提前提示。
- 什么时候会触发：用户添加了 `runScript` 动作后点击"Test Run"按钮。
- 为什么会坏：测试运行失败并显示错误，用户体验不佳。用户不知道为什么可以添加但不能运行。
- 建议怎么修：
  1. 在测试运行按钮旁检查 `actionCapabilities` 中是否存在 `runnable: false` 的动作，提前显示 warning tooltip
  2. 或将 `runScript` 的 `configurable` 也设为 `false`，在沙箱可用前禁止添加
- 修完跑什么命令验证：`pnpm --filter @teable/app typecheck`

## 2. 不确定但建议验证的问题

- **文件位置**：`apps/nestjs-backend/src/features/workflow/workflow-runner.service.ts` 中的 `interpolateTemplate` 正则
  - **不确定点**：正则 `/\{\{\s*input(?:\.([\w?.]+))?\s*\}\}/g` 中 `[\w?.]+` 的 `\w` 在 `[]` 内是否被某些 JS 引擎解析为字面 `w` 而非 word character class。标准 ES 规范中 `\w` 在字符类内仍然是 `[a-zA-Z0-9_]`，但需确认目标 Node.js 版本无此差异。
  - **建议验证方式**：运行 `pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-runner.service.spec.ts`，确认所有插值测试通过。

- **文件位置**：`apps/nestjs-backend/src/features/workflow/script/script-runtime.module.ts`
  - **不确定点**：`ScriptRuntimeModule` 中 `scriptRuntimeToken` 绑定使用 `useExisting: DisabledScriptRuntimeService`，但 `DisabledScriptRuntimeService` 同时作为类 provider 注册（`providers: [DisabledScriptRuntimeService]`）。NestJS 的 `useExisting` 引用同模块的类 provider，在当前版本下可以正常工作，但在某些极端情况下（循环依赖）可能出问题。
  - **建议验证方式**：`pnpm --filter @teable/backend typecheck` 确保 DI 编译无错误。

- **文件位置**：`apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceSwitch.tsx:28-39`
  - **不确定点**：`PublishedResourceSwitch` 对 `Table` / `Dashboard` / `Workflow` / `App` 四个资源类型的映射，但 `BaseNodePageSwitch` 还包括 `CommunityPage` 作为默认值。如果 published manifest 中包含除这四个之外的资源类型，`PublishedResourceSwitch` 会 fallback 到 `UnsupportedResourcePage` 但 `BaseNodePageSwitch` 会渲染 `CommunityPage`。两者行为不一致。
  - **建议验证方式**：检查 `buildPublishedAppManifest` 生成的节点是否只会产生这四种 `resourceType`。如果有限定则无问题。

- **文件位置**：`apps/nextjs-app/src/pages/base/[baseId]/[[...slug]].tsx` 和 `apps/nextjs-app/src/pages/share/[shareId]/base/[baseId]/[[...slug]].tsx`
  - **不确定点**：两个页面的 `getServerSideProps` 都调用了 `getResourcePageProps`，但 share 页面通过 `getShareResourcePageProps` 间接调用。`getShareResourcePageProps` 返回 `getResourcePageProps(ctx, parsed, queryParams)`，而 `getResourcePageProps` 返回的 `SSRResult` 类型和 share 页面的 `SSRResult` 类型是否兼容。
  - **建议验证方式**：`pnpm --filter @teable/app typecheck`

## 3. 已检查但没发现问题的地方

### 后端 workflow 契约
- `WorkflowController.GET capabilities` vs `GET :workflowId` 路由优先级：NestJS 优先匹配精确路径 `capabilities` 再匹配参数化路径 `:workflowId`，不会冲突。
- `WorkflowModule` DI：`AuthorityMatrixModule`、`RecordModule`、`ScriptRuntimeModule`、`AiModule` 全部正确导入。
- `supportedActionKinds` 数组（`'runScript', 'aiGenerate', 'updateRecords', 'createRecords', 'queryRecords'`）和 `WorkflowCapabilityService.getCapabilities()` 返回的 action kind 完全一致。
- `WorkflowRunnerService.executeAction` 的权限校验：`runScript` 和 `aiGenerate` 使用 `assertWorkflowExecute(baseId)`，record actions 使用 `assertRecordUpdate/Create/Read(tableId)`，语义正确。
- `getUpdateRecordsConfig` / `getCreateRecordsConfig` / `getQueryRecordsConfig` 的校验逻辑完备，`fields: {}`（空对象）和 `records: [{}]`（含一个空记录的数组）都能正确通过。
- `interpolateValue` 递归处理 string / array / object 的逻辑正确。
- `interpolateTemplate` 对 `{{ input.tableId }}`、`{{ input.record.id }}`、`{{ input.record.fields.name }}` 路径解析正确。
- 测试 mock（`authorityPolicyService`、`scriptRuntimeService`）和真实 DI constructor 参数一致。

### 前端 published app / share 布局
- `ShareBaseLayout` 在 published shell 启用时只渲染 `children`，由 `PublishedAppRuntime` 包裹 `PublishedAppShell`（DesktopShell/TabletShell/MobileShell）提供导航。两层不会同时渲染导航，无双导航问题。
- DesktopShell、TabletShell、MobileShell 都有完整的导航实现，通过 `PublishedAppShell` 根据设备类型选择。
- `BaseNodePageSwitch` 正确覆盖了 Table、Dashboard、Workflow、App 四种资源类型，默认 fallback 到 `CommunityPage`。
- `getResourcePageProps` 中 `default: return { notFound: true }` 在 SSR 阶段正确拦截不支持的类型。
- `PublishedAppProvider` 的 `useMemo` 依赖数组正确，不会产生不必要的重渲染。

### openapi / v2 / package
- `packages/openapi/src/automation/index.ts` 新增的导出 `./workflow/get-capabilities` 指向的文件存在且导出正确。
- `getWorkflowCapabilities` 的 axios client 函数签名 `(baseId: string) => axios.get<...>(urlBuilder(...))` 和前端调用方式一致。
- `GET_WORKFLOW_CAPABILITIES = '/base/{baseId}/workflow/capabilities'` 路径格式和现有 workflow 路由格式（如 `GET_WORKFLOW = '/base/{baseId}/workflow/{workflowId}'`）一致。
- `v2Contract: AnyContractRouter` 类型标注变化（移除 `satisfies`）不影响路由类型推断。
- `package.json` 的 `g:typecheck` 前置 `pnpm -F @teable/sdk build` 不会破坏现有构建链。
- 子包 lint `--ignore-pattern dist` 添加不会影响已有 lint 检查。
- `git diff --check` 无 whitespace 问题。
