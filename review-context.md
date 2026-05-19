# Review Context

> 文档分层：历史辅助输入。
> 
> 这份文档记录本轮专项评审阶段的上下文、风险点和复核问题，当前主要作为历史背景材料。

## 1. 本次改动涉及哪些模块

### 后端 workflow（apps/nestjs-backend/src/features/workflow）
- 负责什么：workflow 的创建、执行、运行历史记录、action 调度
- 本次改动大概影响什么：
  - `WorkflowRunnerService` 新增了 `updateRecords`、`createRecords`、`queryRecords` 三种 record action 的 config 校验和执行分支
  - 新增了 trigger input 插值机制（`interpolateValue` / `interpolateTemplate` / `getInputPathValue`）
  - 权限校验从 `PermissionService.validPermissions` 切换到 `AuthorityPolicyService` 的细分方法
  - workflow run / step 状态写入从手写 data 对象改为 `buildWorkflowRun*Data` 工具函数
  - `ScriptRuntimeService` 改为依赖注入 `IScriptRuntime` 接口，新增 `DisabledScriptRuntimeService` 作为默认实现
  - `WorkflowCapabilityService` 新增，暴露当前支持的动作列表及其可配置/可运行状态
  - `WorkflowController` 新增 `GET capabilities` 端点
- 新手应该重点看什么：
  - `workflow-runner.service.ts` 的 `supportedActionKinds` 数组是否和前端 `workflowNodes.ts` 的 `WorkflowActionKind` 一致
  - `interpolateValue` 的递归逻辑是否处理了 null / undefined / 数组 / 嵌套对象
  - `AuthorityPolicyService` 的四个 assert 方法是否真的能拦住无权限调用

### 后端 authority-matrix（apps/nestjs-backend/src/features/authority-matrix）
- 负责什么：细粒度权限策略封装，替代旧 `PermissionService.validPermissions` 的粗粒度检查
- 本次改动大概影响什么：新增了整个 authority-matrix 目录，包括 `AuthorityPolicyService`、`AuthorityMatrixModule`
- 新手应该重点看什么：`AuthorityPolicyService` 是否被 `WorkflowModule` 正确导入并注入

### 后端 script-runtime（apps/nestjs-backend/src/features/workflow/script）
- 负责什么：workflow script action 的执行环境
- 本次改动大概影响什么：
  - 新增 `IScriptRuntime` 接口和 `scriptRuntimeToken`，`ScriptRuntimeService` 改为注入依赖
  - 新增 `DisabledScriptRuntimeService`，默认禁用脚本执行
  - `ScriptRuntimeModule` 新增 DI provider 配置
- 新手应该重点看什么：`ScriptRuntimeModule` 的 DI provider 是否正确绑定 `scriptRuntimeToken` 到 `DisabledScriptRuntimeService`

### 前端 automation Pages（apps/nextjs-app/src/features/app/automation）
- 负责什么：workflow 前端编辑面板，包括动作添加/删除、测试运行、运行历史展示
- 本次改动大概影响什么：
  - 大量 helper 函数从 Pages.tsx 内联定义抽取到 `lib/workflowNodes.ts` 和 `lib/runHistory.ts`
  - 新增 `WorkflowActionKind` 类型
  - 新增 `getWorkflowCapabilities` API 调用和 `actionCapabilities` 状态
  - 动作添加按钮现在根据 `actionCapabilities` 的 `configurable` 字段禁用/启用
  - 移除了 updateRecords / createRecords / queryRecords 的独立 draft state
- 新手应该重点看什么：`Pages.tsx` 导入的 `WorkflowActionKind` 是否和后端 `supportedActionKinds` 一致

### 前端 workflowNodes lib（apps/nextjs-app/src/features/app/automation/lib）
- 负责什么：workflow 节点拼接逻辑、默认 action config、action kind 类型定义
- 本次改动大概影响什么：新文件，包含 `appendActionNode`、`removeActionNode`、`hasSelectedActionNode` 等函数，以及 `WorkflowActionKind` 类型
- 新手应该重点看什么：
  - `updateRecords` 默认 config 里 `tableId: '{{ input.tableId }}'` 和 `recordId: '{{ input.record.id }}'` 是否能被后端 `interpolateTemplate` 正确插值
  - 旧版默认 config `recordId: '{{ input.record?.id }}'` 已改为 `{{ input.record.id }}`，`getInputPathValue` 对 `?.` 的处理是否兼容

### 前端 published-app shell（apps/nextjs-app/src/features/app/published-app/shell）
- 负责什么：应用模式的多端 shell 布局（桌面、平板、移动、嵌入）
- 本次改动大概影响什么：
  - `DesktopShell` 从空壳改为有侧边导航栏的真实 shell
  - `TabletShell` 从空壳改为有 drawer + header 的真实 shell
  - `MobileShell` 从空壳改为有 header + bottom nav 的真实 shell
  - 新增 `PublishedAppNavItem` 组件
  - 新增 `PublishedAppDrawer` 和 `PublishedAppHeader` 的真实实现
  - `PublishedAppBottomNav` 从空壳改为有底部导航的真实实现
- 新手应该重点看什么：shell 是否和 `ShareBaseLayout` 的旧 `Sidebar` 产生双导航渲染

### 前端 ShareBaseLayout（apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx）
- 负责什么：share 页面的外层布局容器
- 本次改动大概影响什么：
  - 当 `NEXT_PUBLIC_PUBLISHED_APP_SHELL_DISABLED=true` 时保留旧 `Sidebar` + children
  - 当 published shell 启用时只渲染 `children`，让 `PublishedAppRuntime` 外层 shell 接管布局
- 新手应该重点看什么：`isPublishedAppShellDisabled` 判断是否和 `PublishedAppRuntime` 的 shell 选择逻辑一致

### 前端 PublishedAppContext（apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx）
- 负责什么：published app 的全局状态上下文（导航、设备类型、manifest）
- 本次改动大概影响什么：`isTablet` 从硬编码 `false` 改为 `useMedia('(min-width: 641px) and (max-width: 1024px)')` 动态判断
- 新手应该重点看什么：SSR 场景下 `useMedia` 是否有初始值不一致导致 hydration mismatch 的问题

### 前端 base-node 页面路由（apps/nextjs-app/src/features/app/base-node + pages/base + pages/share）
- 负责什么：根据 URL 路径解析资源类型，渲染对应页面（table / dashboard / workflow / app）
- 本次改动大概影响什么：
  - 两个 page 文件的 switch-case 路由逻辑统一抽取到 `BaseNodePageSwitch` 和 `getResourcePageProps`
  - share 页面也使用同样的 `BaseNodePageSwitch`
- 新手应该重点看什么：`getResourcePageProps` 是否覆盖了所有资源类型的 SSR props 生成

### 前端 PublishedResourceRenderer / PublishedResourceSwitch / PublishedResourceState
- 负责什么：published app 的资源渲染和状态管理
- 本次改动大概影响什么：新增 `PublishedResourceSwitch` 和 `PublishedResourceState`，包裹在 `PublishedResourceRenderer` 内
- 新手应该重点看什么：`PublishedResourceSwitch` 的资源切换逻辑是否和 `BaseNodePageSwitch` 一致

### openapi（packages/openapi/src/automation）
- 负责什么：前后端共享的 API route/schema/client 层
- 本次改动大概影响什么：
  - `automation/index.ts` 新增导出 `workflow/get-capabilities`
  - 新文件 `workflow/get-capabilities.ts` 定义了 capabilities API 的 route/client/schema
- 新手应该重点看什么：`getWorkflowCapabilities` 的 client 函数是否和 `WorkflowController` 的 `GET capabilities` 端点路径一致

### v2 contract-http（packages/v2/contract-http/src/contract.ts）
- 负责什么：v2 版 HTTP 契约路由定义
- 本次改动大概影响什么：`v2Contract` 显式标注 `AnyContractRouter` 类型，移除 `satisfies AnyContractRouter`
- 新手应该重点看什么：这个改动是否影响 v2 contract 的类型推断或 router 生成

### package.json 和多个子包 package.json
- 负责什么：workspace 级和包级构建配置
- 本次改动大概影响什么：
  - `g:typecheck` 前置了 `pnpm -F @teable/sdk build`
  - `i18n-keys`、`v2/adapter-csv-parser-papaparse`、`v2/adapter-undo-redo-keyv` 的 lint 命令加了 `--ignore-pattern dist`
- 新手应该重点看什么：`g:typecheck` 的前置 build 是否会导致 CI 流程顺序变化

## 2. 模块之间必须保持一致的地方

### 后端接口和 packages/openapi 必须对应
- `WorkflowController` 的每个 `@Get`/`@Post`/`@Put`/`@Delete` 路径必须有对应的 openapi route/client/schema
- 新增的 `GET capabilities` 端点（路径 `api/base/:baseId/workflow/capabilities`）必须在 `packages/openapi/src/automation/workflow/get-capabilities.ts` 中有匹配的 route 定义
- 前端通过 openapi client 调用的方法名（如 `getWorkflowCapabilities`）必须和 openapi 导出一致

### 前端调用的 openapi 方法和后端接口必须对应
- `Pages.tsx` 中 `getWorkflowCapabilities(baseId)` 的调用路径必须对应 `WorkflowController` 的 `GET capabilities` 端点
- 前端 `getWorkflowList`、`getWorkflow`、`getWorkflowRun` 等已有调用路径不能被新增端点路由变化破坏

### workflow action 名称在前端、后端、openapi 必须一致
- 后端 `supportedActionKinds` 数组包含 `['runScript', 'aiGenerate', 'updateRecords', 'createRecords', 'queryRecords']`
- 前端 `WorkflowActionKind` 类型必须覆盖同样的 kind 列表
- `WorkflowCapabilityService.getCapabilities()` 返回的 `actions[].kind` 必须和 `supportedActionKinds` 一致
- openapi 的 capabilities schema 如果定义了 action kind enum，也必须一致

### workflow action 默认配置和后端 runner 必须一致
- 前端 `appendActionNode` 生成的默认 config（如 `tableId: '{{ input.tableId }}'`、`recordId: '{{ input.record.id }}'`）必须能被后端 `getUpdateRecordsConfig` 校验通过
- 后端 `interpolateTemplate` 对 `{{ input.tableId }}`、`{{ input.record.id }}`、`{{ input.record.fields.name }}` 的插值结果必须能传给 `recordsService.updateRecord` 等方法
- 前端旧版 `{{ input.record?.id }}` 格式已改为 `{{ input.record.id }}`，需确认 `getInputPathValue` 的 `segment.replace(/\?$/, '')` 是否仍能兼容

### share 页面和 published app shell 不能重复布局
- `ShareBaseLayout` 在 published shell 启用时只渲染 `children`，避免和 `PublishedAppRuntime` 外层 shell（DesktopShell / TabletShell / MobileShell）产生双导航
- `NEXT_PUBLIC_PUBLISHED_APP_SHELL_DISABLED=true` 时 `ShareBaseLayout` 保留旧 `Sidebar`，此时 `PublishedAppRuntime` 不应再渲染 shell

### desktop / tablet / mobile / embed / PWA shell 都应该可达
- `PublishedAppRuntime` 根据 `isMobile` / `isTablet` / `isEmbed` / `isPwaStandalone` 选择 shell
- `isTablet` 现在通过 `useMedia` 动态判断，SSR 时可能返回 `false`，客户端可能返回 `true`，需要确认 hydration 是否一致
- 每种 shell（DesktopShell、TabletShell、MobileShell）都有真实导航实现，需要确认 `usePublishedApp()` 的 `navigation` 和 `activeNavigationItem` 在各 shell 中都能正常工作

### package.json 改动可能影响 workspace 构建
- `g:typecheck` 前置 `pnpm -F @teable/sdk build` 可能导致 CI 流程顺序变化
- 子包 lint 加 `--ignore-pattern dist` 是合理的，不影响构建

### v2 contract 路径应符合 action-style 约定
- `packages/v2/contract-http` 使用 `/tables/createField`、`/tables/listRecords` 等 action-style 路径
- 本次改动只在类型标注上变化（`v2Contract: AnyContractRouter`），没有新增路径，符合约定

## 3. 高风险文件清单

### workflow-runner.service.ts
- 文件路径：apps/nestjs-backend/src/features/workflow/workflow-runner.service.ts
- 为什么高风险：核心执行逻辑，新增了 3 种 record action 的校验/执行/插值，改动量大
- 复核模型下一步应该检查什么：
  - `interpolateValue` 递归逻辑是否对 null / undefined / 循环引用有保护
  - `getUpdateRecordsConfig` / `getCreateRecordsConfig` / `getQueryRecordsConfig` 校验是否和前端默认 config 匹配
  - `interpolateTemplate` 对 `{{ input.xxx }}` 的正则是否覆盖了所有前端使用的模板格式
  - 权限方法从 `validPermissions` 切换到 `assertWorkflowExecute` / `assertRecordUpdate` / `assertRecordCreate` / `assertRecordRead` 是否语义一致

### workflowNodes.ts
- 文件路径：apps/nextjs-app/src/features/app/automation/lib/workflowNodes.ts
- 为什么高风险：前端 workflow 节点拼接逻辑，默认 config 直接影响后端 runner 的校验和执行
- 复核模型下一步应该检查什么：
  - `WorkflowActionKind` 类型是否和后端 `supportedActionKinds` 一致
  - `appendActionNode` 各 kind 的默认 config 是否能被后端对应 `getXxxConfig` 校验通过
  - `triggerInputTableIdTemplate` 的值 `{{ input.tableId }}` 是否能被 `interpolateTemplate` 正确解析

### ShareBaseLayout.tsx
- 文件路径：apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx
- 为什么高风险：share 页面布局边界，published shell 启用/禁用的判断直接影响双导航问题
- 复核模型下一步应该检查什么：
  - `isPublishedAppShellDisabled` 判断是否和 `PublishedAppRuntime` 的 shell 渲染条件一致
  - published shell 启用时 `children` 是否包含 `PublishedAppRuntime` 的 shell 包裹
  - 禁用时的旧 `Sidebar` 渲染是否保持原有功能不变

### DesktopShell.tsx
- 文件路径：apps/nextjs-app/src/features/app/published-app/shell/DesktopShell.tsx
- 为什么高风险：从空壳改为有侧边导航的真实 shell，依赖 `usePublishedApp()` 的 navigation 数据
- 复核模型下一步应该检查什么：
  - `usePublishedApp()` 返回的 `navigation.flatItems` 是否在 desktop shell 初始化时已就绪
  - 和 `ShareBaseLayout` 的旧 `Sidebar` 是否会同时渲染（双导航）

### PublishedAppContext.tsx
- 文件路径：apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx
- 为什么高风险：`isTablet` 从硬编码改为 `useMedia` 动态判断，可能导致 SSR/CSR hydration mismatch
- 复核模型下一步应该检查什么：
  - `useMedia` 在 SSR 时是否返回默认值 `false`
  - 客户端首次渲染时 `isTablet` 是否可能和 SSR 值不一致
  - `isTablet` 变化是否会导致 shell 切换闪烁

### workflow.controller.ts
- 文件路径：apps/nestjs-backend/src/features/workflow/workflow.controller.ts
- 为什么高风险：新增 `GET capabilities` 端点，路由顺序可能影响 `GET :workflowId` 的匹配
- 复核模型下一步应该检查什么：
  - `GET capabilities` 和 `GET :workflowId` 的路由顺序是否会导致 `capabilities` 被当作 `workflowId` 参数
  - NestJS 的路由匹配顺序是否正确处理了这种冲突

### workflow-capability.service.ts
- 文件路径：apps/nestjs-backend/src/features/workflow/workflow-capability.service.ts
- 为什么高风险：新增文件，声明支持的 action kind 和其 configurable/runnable 状态
- 复核模型下一步应该检查什么：
  - `getCapabilities()` 返回的 action kind 是否和 `supportedActionKinds` 一致
  - configurable/runnable 逻辑是否和前端 `actionCapabilities` 的禁用按钮逻辑一致

### automation/index.ts（openapi）
- 文件路径：packages/openapi/src/automation/index.ts
- 为什么高风险：新增导出 `workflow/get-capabilities`，如果文件不存在会导致 openapi build 失败
- 复核模型下一步应该检查什么：
  - `workflow/get-capabilities.ts` 是否存在且导出正确
  - 是否有其他已导出但不存在的 workflow 子模块（MEMORY.md 提到过旧版断链问题）

### Pages.tsx（automation）
- 文件路径：apps/nextjs-app/src/features/app/automation/Pages.tsx
- 为什么高风险：大量内联逻辑抽取到外部模块，新增 capabilities API 调用，移除 draft state
- 复核模型下一步应该检查什么：
  - 抽取后的函数导入是否完整
  - `actionCapabilities` 在 capabilities API 未返回数据时是否有合理的 fallback
  - 移除 updateRecords / createRecords / queryRecords draft state 是否导致配置编辑功能缺失

## 4. 建议验证命令

按从小到大的顺序：

```bash
# 1. 最小检查：单文件 typecheck
pnpm --filter @teable/backend typecheck
pnpm --filter @teable/app typecheck
pnpm --filter @teable/openapi typecheck

# 2. openapi 和 v2 build
pnpm -F @teable/openapi build
pnpm -F @teable/v2-contract-http build

# 3. 后端 workflow 单测
pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-runner.service.spec.ts

# 4. 前端 workflow 节点单测
pnpm --filter @teable/app exec vitest run src/features/app/automation/lib/workflowNodes.spec.ts

# 5. script-runtime 单测
pnpm --filter @teable/backend exec vitest run src/features/workflow/script/script-runtime.service.spec.ts

# 6. authority-matrix 单测（如果存在）
pnpm --filter @teable/backend exec vitest run src/features/authority-matrix/authority-policy.service.spec.ts

# 7. workflow run-state 单测（如果存在）
pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-run-state.spec.ts

# 8. whitespace 检查
git diff --check

# 9. 全量 typecheck（可能耗时较长）
pnpm g:typecheck
```

## 5. 给复核模型的下一步任务说明

请读取 `/workspace/review-materials.md` 和 `/workspace/review-context.md`，重点检查以下问题：

**后端 workflow 契约链路**
1. `WorkflowController` 的 `GET capabilities` 端点路径是否和 `packages/openapi/src/automation/workflow/get-capabilities.ts` 的 route 定义一致
2. `GET capabilities` 路由和 `GET :workflowId` 路由是否会在 NestJS 路由匹配时产生冲突（`capabilities` 字符串可能被当作 `workflowId` 参数）
3. `WorkflowCapabilityService.getCapabilities()` 返回的 action kind 列表是否和 `supportedActionKinds` 数组完全一致
4. `WorkflowModule` 的 DI 配置是否完整导入 `AuthorityMatrixModule`、`WorkflowCapabilityService`
5. `ScriptRuntimeModule` 的 DI provider 是否正确将 `scriptRuntimeToken` 绑定到 `DisabledScriptRuntimeService`

**前端和后端 action 契约一致性**
6. `workflowNodes.ts` 的 `WorkflowActionKind` 类型是否覆盖了后端 `supportedActionKinds` 的所有 kind
7. `appendActionNode` 各 kind 的默认 config 是否能被后端对应 `getXxxConfig` 校验通过（特别是 `tableId: '{{ input.tableId }}'` 这种模板值）
8. `interpolateTemplate` 正则 `/\{\{\s*input(?:\.([\w?.]+))?\s*\}\}/g` 是否能正确解析前端使用的所有模板格式
9. `getInputPathValue` 的 `segment.replace(/\?$/, '')` 是否兼容旧版 `{{ input.record?.id }}` 和新版 `{{ input.record.id }}`

**前端 published app / share 布局**
10. `ShareBaseLayout` 在 published shell 启用时只渲染 `children`，`PublishedAppRuntime` 外层是否仍会渲染 DesktopShell/TabletShell/MobileShell，两者是否可能产生双导航
11. `PublishedAppContext` 的 `isTablet` 使用 `useMedia` 动态判断，SSR 时默认值是否为 `false`，客户端首次渲染时是否可能产生 hydration mismatch
12. `PublishedResourceSwitch` 和 `BaseNodePageSwitch` 的资源切换逻辑是否一致
13. `DesktopShell` / `TabletShell` / `MobileShell` 的 `usePublishedApp()` 调用是否在 navigation 数据就绪后才渲染

**openapi / v2 / package**
14. `packages/openapi/src/automation/workflow/get-capabilities.ts` 是否存在且导出了正确的 route/client/schema
15. `automation/index.ts` 新增的导出是否会导致 openapi build 失败（参考 MEMORY.md 中提到的旧版断链问题）
16. `v2Contract: AnyContractRouter` 类型标注变化是否影响 router 生成或类型推断

每个确认问题必须给出：文件路径、大概行号、真实触发场景、为什么会坏、建议怎么修、修完跑什么命令验证。
