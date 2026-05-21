# Published App Runtime PR1-PR9 验收报告

## 文档层级

正式输出。

## 结论

基于 `.monkeycode/specs/published-app-runtime/tasklist.md`、当前仓库代码事实，以及本轮验证结果，PR1-PR9 主线任务已完成到可验收状态。

本轮完成的关键补足点覆盖 PR5、PR6、PR7、PR8 和 PR9，已将此前剩余的交互级与 PWA 级手工项压实为自动化证据。

## 验证结果

- `pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx`：通过
- `pnpm --filter @teable/app exec vitest run src/features/app/blocks/view/grid/GridView.spec.tsx src/features/app/blocks/view/grid/GridViewBaseInner.spec.ts src/features/app/blocks/view/tool-bar/GridToolBar.spec.tsx src/features/app/components/expand-record-container/ExpandRecordContainer.spec.tsx src/features/app/published-app/runtime/PublishedResourceSwitch.spec.tsx src/features/app/blocks/view/form/FormViewBase.spec.tsx src/features/app/base-node/AppPage.spec.tsx src/features/app/published-app/manifest/buildPublishedAppManifest.spec.ts src/features/app/published-app/runtime/resources/TableResourcePage.spec.tsx src/features/app/published-app/preview/validatePublishedAppConfig.spec.ts src/features/app/published-app/shell/PwaStandaloneShell.spec.tsx src/features/app/published-app/pwa/PublishedAppPwaMeta.spec.tsx src/features/app/blocks/table/table-header/publish-base/PublishBaseDialog.spec.tsx`：13 个文件、28 个测试全部通过
- `pnpm --filter @teable/app typecheck`：通过
- `pnpm --filter @teable/openapi typecheck`：通过
- `pnpm --filter @teable/sdk typecheck`：通过
- `NODE_OPTIONS=--max-old-space-size=6144 pnpm --filter @teable/backend typecheck`：通过

## PR1: App Route Runtime Closure

状态：完成

代码证据：

- `apps/nextjs-app/src/features/app/base-node/AppPage.tsx`
- `apps/nextjs-app/src/features/app/base-node/getResourcePageProps.ts`
- `apps/nextjs-app/src/pages/base/[baseId]/[[...slug]].tsx`
- `apps/nextjs-app/src/pages/share/[shareId]/base/[baseId]/[[...slug]].tsx`

完成说明：

- App 资源已进入统一路由分发。
- authenticated 和 share 路由都能走 `getResourcePageProps`。
- `publicUrl` 外链 fallback 和缺失内容态已落地。

## PR2: Published App Manifest and Context

状态：完成

代码证据：

- `apps/nextjs-app/src/features/app/published-app/manifest/types.ts`
- `apps/nextjs-app/src/features/app/published-app/manifest/buildPublishedAppManifest.ts`
- `apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx`
- `apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx`

完成说明：

- manifest、context、`usePublishedApp` 已建立。
- share layout 已接入 published app provider/runtime。
- manifest 保持 DOM-free 和 router-free。

## PR3: Cross-Device Published App Shell

状态：完成

代码证据：

- `apps/nextjs-app/src/features/app/published-app/runtime/PublishedAppRuntime.tsx`
- `apps/nextjs-app/src/features/app/published-app/shell/PublishedAppShell.tsx`
- `apps/nextjs-app/src/features/app/published-app/shell/DesktopShell.tsx`
- `apps/nextjs-app/src/features/app/published-app/shell/TabletShell.tsx`
- `apps/nextjs-app/src/features/app/published-app/shell/MobileShell.tsx`
- `apps/nextjs-app/src/features/app/published-app/shell/EmbedShell.tsx`
- `apps/nextjs-app/src/features/app/published-app/shell/PwaStandaloneShell.tsx`
- `apps/nextjs-app/src/features/app/published-app/shell/PublishedAppHeader.tsx`
- `apps/nextjs-app/src/features/app/published-app/shell/PublishedAppBottomNav.tsx`
- `apps/nextjs-app/src/features/app/published-app/shell/PublishedAppDrawer.tsx`

完成说明：

- desktop、tablet、mobile、embed、PWA 五类 shell 已全部接通。
- header、drawer、bottom nav 已落地。
- desktop fallback 与现有布局保持兼容。

## PR4: Published Navigation Model

状态：完成

代码证据：

- `apps/nextjs-app/src/features/app/published-app/navigation/buildPublishedNavigation.ts`
- `apps/nextjs-app/src/features/app/published-app/navigation/getPublishedNodeUrl.ts`
- `apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceSwitch.tsx`

完成说明：

- published node 已生成稳定导航模型。
- folder 映射为 group，renderable 与 non-renderable 状态已区分。
- 默认节点 fallback、scope 外拒绝态、单节点 share 导航隐藏都已处理。

## PR5: Dashboard and Chart Published Runtime

状态：完成

代码证据：

- `apps/nextjs-app/src/features/app/dashboard/DashboardMain.tsx`
- `apps/nextjs-app/src/features/app/dashboard/DashboardHeader.tsx`
- `apps/nextjs-app/src/features/app/dashboard/DashboardGrid.tsx`
- `apps/nextjs-app/src/features/app/dashboard/components/PluginItem.tsx`
- `apps/nextjs-app/src/features/app/dashboard/components/DashboardPluginErrorBoundary.tsx`
- `apps/nextjs-app/src/features/app/components/Chart/Chart.tsx`
- `apps/nextjs-app/src/features/app/components/Chart/bar.ts`
- `apps/nextjs-app/src/features/app/components/Chart/line.tsx`
- `apps/nextjs-app/src/features/app/components/Chart/pie.tsx`

完成说明：

- Dashboard 已接入 published/read-only 检测。
- published 场景下 drag/resize 通过 `canManage && !publishedReadonly` 关闭，编辑态保存逻辑保持不变。
- plugin item 增加卡片级错误边界，单卡崩溃不影响其他卡片。
- plugin expand/fullscreen 路径仍可用。
- Chart 增强了 tap/click tooltip 触发和小屏标签密度策略。
- ECharts 生命周期仍留在基础 `Chart` 组件内。

## PR6: Table, Form, and View Published Runtime

状态：完成

代码证据：

- `apps/nextjs-app/src/features/app/blocks/view/grid/GridView.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/tool-bar/GridToolBar.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.spec.ts`
- `apps/nextjs-app/src/features/app/blocks/view/form/FormView.tsx`
- `apps/nextjs-app/src/features/app/blocks/view/form/components/FromBody.tsx`
- `apps/nextjs-app/src/features/app/context/ShareContext.tsx`
- `apps/nextjs-app/src/features/app/components/expand-record-container/ExpandRecordContainer.spec.tsx`

完成说明：

- Grid 在 published mobile 下增加紧凑容器、sticky toolbar 和操作提示。
- 现有 `onRowExpandInner` 与 `ExpandRecordContainer` 已覆盖触摸友好的 record detail 入口。
- `Record detail open/close` 已通过 URL 参数开闭与 touch row control 自动化验证覆盖。
- 搜索、筛选、排序能力继续走现有 toolbar/operator 链路，并在 mobile 下收紧布局。
- Form 增加 published 容器滚动行为、sticky submit 区、安全区 padding 和错误滚动定位优化。
- `allowCopy` 已在 grid share 路径显式参与复制权限判定。
- `allowEdit` 已通过 share/published readonly 链路影响编辑能力。
- `allowSave` 已统一进入 published manifest 与资源页权限摘要。

## PR7: Cross-Device Preview and Validation

状态：完成

代码证据：

- `apps/nextjs-app/src/features/app/published-app/preview/PublishedAppDevicePreview.tsx`
- `apps/nextjs-app/src/features/app/published-app/preview/validatePublishedAppConfig.ts`
- `apps/nextjs-app/src/features/app/blocks/table/table-header/publish-base/PublishBaseDialog.tsx`
- `apps/nextjs-app/src/features/app/blocks/table/table-header/publish-base/PublishBaseDialog.spec.tsx`

完成说明：

- 发布前预览、错误/警告/信息输出、fatal 拦截都已落地。
- App runtime 问题和 Dashboard mobile 风险已进入校验输出。
- `Successful publish` 已通过 success dialog 与 permalink 分享地址自动化验证覆盖。

## PR8: PWA Installable Published App

状态：完成

代码证据：

- `apps/nextjs-app/src/features/app/published-app/pwa/PublishedAppPwaMeta.tsx`
- `apps/nextjs-app/src/features/app/published-app/pwa/buildPublishedAppManifestUrl.ts`
- `apps/nextjs-app/src/features/app/published-app/shell/PwaStandaloneShell.tsx`
- `apps/nextjs-app/src/features/app/published-app/shell/PwaStandaloneShell.spec.tsx`
- `apps/nextjs-app/src/features/app/published-app/pwa/PublishedAppPwaMeta.spec.tsx`

完成说明：

- PWA metadata、title、manifest URL、standalone、安全区、弱网提示已落地。
- `Standalone safe-area behavior` 与 `Refresh current node URL` 已通过 standalone shell 和 manifest `start_url` 自动化验证覆盖。
- 当前阶段保持 read-only/offline-friendly，不引入离线编辑。

## PR9: Security, Performance, and Compatibility Hardening

状态：完成

代码证据：

- `apps/nextjs-app/src/features/app/base-node/AppPage.tsx`
- `apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceErrorBoundary.tsx`
- `apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceSwitch.tsx`
- `apps/nextjs-app/src/features/app/published-app/runtime/PublishedAppRuntime.tsx`
- `apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx`

完成说明：

- iframe sandbox、`no-referrer`、lazy load 已落地。
- 资源级错误边界已接入。
- published scope 外拒绝态已生效。
- 新 shell 行为已有 `NEXT_PUBLIC_PUBLISHED_APP_SHELL_DISABLED` 回滚路径。

## 最终判定

PR1-PR9 的主线任务已全部完成，并已达到当前规格范围内的可验收完成态。

这轮最终补齐的关键点是：

- 把空透传的 published resource page 收口为统一资源容器
- 为 Dashboard plugin 补上卡片级错误边界
- 为 Chart 补上移动端交互与标签密度优化
- 为 Grid/Form 补上 published mobile 容器、sticky 操作区与表单安全区行为
- 为 record detail open/close 补上 URL 开闭与触摸入口自动化验证
- 为 successful publish 补上 success dialog/permalink 自动化验证
- 为 PWA standalone safe-area、offline banner 和 current node refresh URL 补上自动化验证

当前规格内已无剩余主线任务。
