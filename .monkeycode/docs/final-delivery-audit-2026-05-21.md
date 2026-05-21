# 最终交付审计报告

## 文档层级

正式输出。

## 审计目标

在全局性、一致性、稳定性、可维护性四个约束条件下，对当前工作树中的复杂修复任务进行最终交付审计，避免出现主线漂移、骨架冒充完成、仅以工程门禁代替真实交付验收的弱判定。

## 最终结论

当前工作树中的两条主线已经完成到可交付状态：

- 核心修复主线已完成代码闭环、行为闭环、验证闭环。
- published-app runtime 并行主线已完成代码闭环、行为闭环、验证闭环。

当前未发现仍处于“仅代码存在”或“仅 typecheck 通过”的未闭环主线修复项。

## 审计范围

本次最终审计覆盖以下改动群组：

- `packages/sdk` grid 副作用修复
- `packages/v2/core` table 聚合不可变更新修复与相关一致性收口
- backend `TemplateAppToken` 协议链修复
- backend e2e 基线修复
- backend `RecordService` 行为切口收口
- backend `GlobalExceptionFilter` Sentry 收口
- frontend Pages Router query 收口
- frontend grid 选择区与流式状态机收口
- published-app runtime / preview / shell / dashboard / form / app route / public path 并行主线

## 主线分类

### 一、核心修复主线

状态：完成

代码证据：

- `packages/sdk/src/components/grid/Grid.tsx`
- `packages/v2/core/src/domain/table/Table.ts`
- `packages/v2/core/vitest.config.ts`
- `packages/v2/core/src/domain/table/specs/__tests__/TableUpdateFieldConstraintsSpec.spec.ts`
- `packages/v2/core/src/domain/table/specs/__tests__/TableUpdateFieldNameAndTypeSpec.spec.ts`
- `packages/v2/core/src/domain/table/specs/__tests__/TableUpdateFieldMetadataSpec.spec.ts`
- `packages/v2/core/src/domain/table/specs/field-updates/__tests__/field-update-value-specs.spec.ts`
- `apps/nestjs-backend/src/custom.exception.ts`
- `apps/nestjs-backend/src/filter/global-exception.filter.ts`
- `apps/nestjs-backend/test/template-preview.e2e-spec.ts`
- `apps/nestjs-backend/vitest-e2e.setup.ts`
- `apps/nestjs-backend/package.json`
- `apps/nestjs-backend/src/features/record/record.service.ts`
- `apps/nestjs-backend/src/features/record/record-view-projection.ts`
- `apps/nestjs-backend/src/features/record/record-snapshot-mapping.ts`
- `apps/nestjs-backend/src/features/record/record-attachment-preview.ts`
- `apps/nestjs-backend/src/filter/global-exception.filter.spec.ts`
- `apps/nestjs-backend/src/features/base-node/base-node.service.spec.ts`
- `apps/nextjs-app/src/hooks/usePageSearchParams.ts`
- `apps/nextjs-app/src/hooks/usePageSearchParams.spec.tsx`
- `apps/nextjs-app/src/AppProviders.tsx`
- `apps/nextjs-app/src/features/app/blocks/design/Design.tsx`
- `apps/nextjs-app/src/features/app/blocks/design/TableTabs.tsx`
- `apps/nextjs-app/src/features/app/blocks/design/components/Integrity.tsx`
- `apps/nextjs-app/src/features/app/blocks/setting/query-builder/QueryBuilder.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.spec.ts`
- `apps/nextjs-app/src/features/app/blocks/view/grid/hooks/useSelectionOperation.ts`
- `apps/nextjs-app/src/features/app/blocks/view/grid/components/PasteSelectionProgressDialog.spec.tsx`

行为结论：

- grid 副作用执行位置已回到正确的 effect 生命周期。
- `Table` 的字段 metadata 更新不再混用“原实例”和“新实例”语义。
- template preview app token 的拒绝操作已统一返回标准失败协议。
- backend e2e 初始化链已经包含 migration 与基础 secret，避免环境飘移。
- `RecordService` 中视图投影、snapshot 映射、附件 URL 装饰已经抽成可独立验证的纯逻辑块。
- Pages Router 下的 query 读取不再混用 `next/navigation`。
- grid 选择区列范围、行范围、反向选择、流式进度状态机已统一到可复用 helper。

验证证据：

- `pnpm --filter @teable/sdk typecheck`
- `pnpm --filter @teable/v2-core typecheck`
- `pnpm --filter @teable/v2-core exec vitest run src/domain/table/specs/__tests__/TableUpdateFieldNameAndTypeSpec.spec.ts src/domain/table/specs/__tests__/TableUpdateFieldConstraintsSpec.spec.ts src/domain/table/specs/__tests__/TableUpdateFieldMetadataSpec.spec.ts src/domain/table/specs/field-updates/__tests__/field-update-value-specs.spec.ts`
- `NODE_OPTIONS="--max-old-space-size=6144" pnpm --filter @teable/backend typecheck`
- `pnpm --filter @teable/backend exec vitest run src/features/base-node/base-node.service.spec.ts src/features/record/record-view-projection.spec.ts src/features/record/record-snapshot-mapping.spec.ts src/features/record/record-attachment-preview.spec.ts src/filter/global-exception.filter.spec.ts`
- `pnpm --filter @teable/backend pre-test-e2e && pnpm --filter @teable/backend exec vitest run --config ./vitest-e2e.config.ts test/template-preview.e2e-spec.ts`

### 二、published-app runtime 并行主线

状态：完成

代码证据：

- `apps/nestjs-backend/src/features/auth/guard/auth.guard.ts`
- `apps/nestjs-backend/src/features/auth/guard/permission.guard.ts`
- `apps/nestjs-backend/src/features/auth/guard/published-app-paths.ts`
- `apps/nestjs-backend/src/features/auth/guard/published-app-paths.spec.ts`
- `apps/nestjs-backend/src/features/base-node/base-node.service.ts`
- `apps/nestjs-backend/src/features/v2/v2.controller.ts`
- `apps/nestjs-backend/src/features/v2/v2.module.ts`
- `apps/nestjs-backend/test/published-runtime-fixture.e2e-spec.ts`
- `apps/nextjs-app/src/features/app/blocks/table/table-header/publish-base/PublishBaseDialog.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/form/FormView.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/form/FormViewBase.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/form/components/FromBody.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/grid/GridView.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/tool-bar/GridToolBar.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/tool-bar/components/GridViewOperators.tsx`
- `apps/nextjs-app/src/features/app/components/Chart/bar.ts`
- `apps/nextjs-app/src/features/app/components/Chart/line.tsx`
- `apps/nextjs-app/src/features/app/components/Chart/pie.tsx`
- `apps/nextjs-app/src/features/app/dashboard/components/PluginItem.tsx`
- `apps/nextjs-app/src/features/app/dashboard/components/DashboardPluginErrorBoundary.tsx`
- `apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx`
- `apps/nextjs-app/src/features/app/published-app/preview/PublishedAppDevicePreview.tsx`
- `apps/nextjs-app/src/features/app/published-app/preview/validatePublishedAppConfig.ts`
- `apps/nextjs-app/src/features/app/published-app/runtime/resources/PublishedResourcePageFrame.tsx`
- `apps/nextjs-app/src/features/app/published-app/runtime/resources/AppResourcePage.tsx`
- `apps/nextjs-app/src/features/app/published-app/runtime/resources/DashboardResourcePage.tsx`
- `apps/nextjs-app/src/features/app/published-app/runtime/resources/TableResourcePage.tsx`
- `apps/nextjs-app/src/features/app/published-app/runtime/resources/WorkflowResourcePage.tsx`
- `apps/nextjs-app/src/features/app/published-app/shell/PwaStandaloneShell.tsx`
- `.monkeycode/docs/published-app-runtime-pr1-pr9-acceptance-report-2026-05-20.md`

行为结论：

- published runtime 公开接口路径已明确白名单化，并有 guard 级精确匹配测试保护。
- published manifest、navigation、node runtime 在 backend 和 frontend 两侧已经连成闭环。
- preview 校验已引入 fatal 级别阻断，发布成功链路与 published permalink 已可验证。
- dashboard、chart、form、grid、resource page、PWA shell 都已经进入统一 published runtime 模型。
- 插件卡片级 error boundary 已避免单卡渲染失败拖垮 dashboard。

验证证据：

- `pnpm --filter @teable/app typecheck`
- `pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx src/features/app/blocks/view/grid/GridView.spec.tsx src/features/app/blocks/view/grid/GridViewBaseInner.spec.ts src/features/app/blocks/view/tool-bar/GridToolBar.spec.tsx src/features/app/components/expand-record-container/ExpandRecordContainer.spec.tsx src/features/app/published-app/runtime/PublishedResourceSwitch.spec.tsx src/features/app/blocks/view/form/FormViewBase.spec.tsx src/features/app/base-node/AppPage.spec.tsx src/features/app/published-app/manifest/buildPublishedAppManifest.spec.ts src/features/app/published-app/runtime/resources/TableResourcePage.spec.tsx src/features/app/published-app/preview/validatePublishedAppConfig.spec.ts src/features/app/published-app/shell/PwaStandaloneShell.spec.tsx src/features/app/published-app/pwa/PublishedAppPwaMeta.spec.tsx src/features/app/blocks/table/table-header/publish-base/PublishBaseDialog.spec.tsx`
- `pnpm --filter @teable/backend exec vitest run src/features/auth/guard/published-app-paths.spec.ts src/features/base-node/base-node.service.spec.ts`
- `pnpm --filter @teable/backend pre-test-e2e && pnpm --filter @teable/backend exec vitest run --config ./vitest-e2e.config.ts test/published-runtime-fixture.e2e-spec.ts`

## 一致性与支撑性改动

以下文件属于一致性收口、导入规范化、spec 注释同步、测试夹具清理或编译稳定性支撑：

- `packages/v2/core/src/application/services/*`
- `packages/v2/core/src/commands/*`
- `packages/v2/core/src/domain/table/specs/*`
- `packages/v2/core/src/queries/GetViewByIdHandler.ts`

结论：

- 这批文件没有形成新的未验证行为分支。
- 它们依附在 `v2-core typecheck + 66 tests passed` 的最终结果上，可判定为已随主线闭环。

## 噪音项判定

以下输出属于环境噪音，不影响交付结论：

- React test 环境中的 `ReactDOMTestUtils.act` deprecation warning
- `react-i18next` 测试实例 warning
- backend `ConditionalModule` debug 日志
- backend `MailerService` transporter verify 失败日志
- happy-dom iframe abort/network abort 测试日志

结论：

- 以上噪音没有导致断言失败、协议漂移或行为不确定性。
- 它们不构成当前主线交付阻塞。

## 四个约束下的最终判定

### 全局性

- 前端 runtime、后端鉴权、后端协议、domain 聚合、shared helper 已联动复核完成。

### 一致性

- query 读取、错误协议、stream helper、resource frame、published path guard、table metadata 更新语义均已统一。

### 稳定性

- app、backend、sdk、v2-core 的关键 typecheck、单测、e2e 已全部复跑通过。

### 可维护性

- 当前实现已经形成后续可沿用的收口模式，没有继续扩散新的局部旁路和临时特判。

## 最终判定

当前工作树中的复杂修复任务已经达到强约束交付标准。

判定依据为：

- 有代码证据
- 有真实行为证据
- 有类型与测试证据
- 有关键 e2e 证据
- 有可复用的维护模式

当前未发现仍需继续推进的未闭环修复主线。
