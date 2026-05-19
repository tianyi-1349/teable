# V1 / V2 Coverage Matrix

> 文档分层：正式输出。
> 
> 这份文档是正式覆盖判断依据，用于支撑 V1 / V2 迁移讨论、缺口排序和路线图决策。

## 1. 目的

这份矩阵用于把 `capability-gap-list.md` 中最核心的两个结构性主题落成可跟踪事实：

- 2.1 V1 与 V2 双轨能力覆盖不一致
- 4.1 contract-http 还没有成为全站统一主契约层

本矩阵只基于当前仓库中可以明确验证的代码结构、契约文件和领域实现，不依赖推测。

## 2. 判定口径

### V1 覆盖

满足以下任一条件即可判定为 V1 已覆盖：

- `packages/openapi/src/<domain>/` 下存在明确契约文件
- `apps/nestjs-backend/src/features/<domain>/` 下存在明确 controller / service 主链路

### V2 覆盖

按覆盖强度分 3 档：

- 完整
  - 同时存在 `packages/v2/contract-http` 契约入口和 `packages/v2/core` 的 command / query / 领域实现
- 局部
  - 存在 `packages/v2/core` 或 adapter 侧实现，但没有形成稳定公开 contract-http 覆盖
- 未见稳定覆盖
  - 当前未发现可作为稳定业务入口的 v2 契约或领域实现

## 3. 覆盖矩阵总表

| 业务域 | V1 覆盖 | V2 覆盖 | 当前判定 | 证据摘要 |
|--------|---------|---------|----------|----------|
| Base | 完整 | 完整 | 双轨并行，V2 已具备基础闭环 | V1 有 `openapi/src/base/*` + `features/base/*`；V2 有 `contract-http/src/base/*` + `CreateBaseCommand` / `ListBasesHandler` |
| Table | 完整 | 完整 | 双轨并行，V2 已具备较完整闭环 | V1 有 `openapi/src/table/*` + `features/table/*`；V2 有 `contract-http/src/table/*` + create / list / get / rename / delete / restore / duplicate |
| Field | 完整 | 完整 | 双轨并行，V2 已具备较完整闭环 | V1 有 `openapi/src/field/*` + `features/field/*`；V2 有 create / update / delete / duplicate field contract + command / handler |
| Record | 完整 | 完整 | 双轨并行，V2 已具备较完整闭环 | V1 有 `openapi/src/record/*` + `features/record/*`；V2 有 create / list / get / update / batch / paste / clear / reorder / importCsv |
| View | 完整 | 局部 | V1 主导，V2 已形成基础独立读写闭环 | V1 有 `openapi/src/view/*` + `features/view/*`；V2 已有 `domain/table/views/*`、相关 spec / event / projection，且已新增 `views.list`、`views.getById`、`views.updateName`、`views.updateDescription`、`views.updateLocked`、`views.updateShareMeta`、`views.updateOptions`、`views.updateOrder`、`views.updateFilter`、`views.updateSort`、`views.updateGroup`、`views.updateColumnMeta`、`views.reorderRecords`，shared router 与 `api/v2` 已接通基础执行入口 |
| Comment | 完整 | 局部 | V1 主导，V2 已新增基础读面与订阅能力，且 comment 高价值公开面已完成 DTO 输出校验收口 | V1 有 `openapi/src/comment/*` + `features/comment/*`；V2 当前已新增 `packages/v2/contract-http/src/comment/listComments.ts`、`getCommentById.ts`、`getCommentCounts.ts`、`commentSubscribe.ts` 与 Nest `api/v2` `comments.list`、`comments.getById`、`comments.getRecordCount`、`comments.getTableCount`、`comments.getSubscribeDetail`、`comments.subscribe`、`comments.unsubscribe` 入口，implementation handler 已清理宽泛返回签名 |
| Share / Published | 完整 | 较完整 | V1 主导，但 share 读取与核心交互面、template published 公开面已进入 v2，published runtime 的 manifest / navigation / node runtime 三层 backend contract 已落地；当前稳定缺口聚焦于 `authenticated/template` mode 未实现、`defaultNodeId` 命名未统一、统一 runtime 访问模型未成型 | V1 有 `openapi/src/share/*` + `features/share/*` + 前端 Published 运行时；V2 当前已新增 `packages/v2/contract-http/src/share/*` 下的 `getShareView`、`getShareViewAggregations`、`getShareViewRowCount`、`getShareViewRecords`、`getShareViewGroupPoints`、`getShareViewLinkRecords`、`getShareViewCollaborators`、`getShareViewCalendarDailyCollection`、`getShareViewSearchCount`、`getShareViewSearchIndex`、`formSubmitShareView.ts`、`copyShareView.ts`、`buttonClickShareView.ts`，并新增 `packages/v2/contract-http/src/template/listPublishedTemplates.ts`、`getTemplateById.ts`、`getTemplatePermalink.ts`、`incrementTemplateVisit.ts`、`packages/v2/contract-http/src/published-app/getRuntimeManifest.ts`、`getNavigationModel.ts`、`getNodeRuntime.ts` 与 Nest `api/v2` 对应入口 |
| Workflow | 完整 | 基础闭环已形成 | 功能成熟，读取、CRUD、lifecycle、node test、direct trigger、9 类最小 action runtime、webhook 分层错误契约，以及 AI draft 多形态/多节点/activation-ready 草稿生成主链路已完成本轮公开迁移，且 workflow 高价值公开面已完成 DTO 输出校验收口 | V1 有 `openapi/src/automation/workflow/*` + `features/workflow/*`；V2 当前已新增 `packages/v2/contract-http/src/workflow/activateWorkflow.ts`、`createWorkflow.ts`、`deactivateWorkflow.ts`、`listWorkflows.ts`、`updateWorkflow.ts`、`deleteWorkflow.ts`、`duplicateWorkflow.ts`、`getWorkflowById.ts`、`getWorkflowCapabilities.ts`、`listWorkflowRuns.ts`、`getWorkflowRun.ts`、`testRunWorkflow.ts`、`testNodeWorkflow.ts`、`triggerWebhookWorkflow.ts`、`triggerScheduleWorkflow.ts`、`triggerFormSubmittedWorkflow.ts`、`triggerEmailReceivedWorkflow.ts`，并由 Nest `api/v2` 公开 `workflows.activate`、`workflows.create`、`workflows.deactivate`、`workflows.list`、`workflows.update`、`workflows.delete`、`workflows.duplicate`、`workflows.getById`、`workflows.getCapabilities`、`workflows.listRuns`、`workflows.getRun`、`workflows.testRun`、`workflows.testNode` 与四类 direct trigger 入口 |
| Undo / Redo | 完整 | 较完整 | V2 已形成命令、服务、公开契约和 shared router 接线；主契约链路已闭环 | V1 有 `openapi/src/undo-redo/*` + `features/undo-redo/*`；V2 当前已新增 `packages/v2/contract-http/src/table/undo.ts`、`redo.ts`，并在 `contract.ts`、Nest `api/v2` 与 `createV2OrpcRouter` 中公开 `tables.undo`、`tables.redo`；剩余差异主要是 SSE stream 仍保留在 v1/openapi |
| Aggregation / Search | 完整 | 较完整 | V1 主导；v2 已补齐基础 4 个 table 级公开读取入口，并已新增 4 个高级聚合 contract + Nest adapter 接线，执行层仍复用 v1 service | V1 有 `openapi/src/aggregation/*`、`search/*` + backend feature；V2 当前已新增 `packages/v2/contract-http/src/table/getRowCount.ts`、`getRecordIndex.ts`、`getSearchCount.ts`、`getSearchIndex.ts`、`getAggregation.ts`、`getGroupPoints.ts`、`getCalendarDailyCollection.ts`、`getTaskStatusCollection.ts`，并在 `contract.ts` 与 Nest `api/v2` 中公开对应入口；当前 generic router 的 DI 版高级聚合执行层仍未单独下沉 |
| Admin / Setting / Billing | 完整 | 局部 | V1 主导，setting 已完成本轮 v2 公开层和输出契约收口，billing & usage 当前受仓库边界限制 | V1 有 `openapi/src/admin/setting/*`、`billing/subscription/*`、`usage/*`；V2 当前已新增 `packages/v2/contract-http/src/setting/getSetting.ts`、`getPublicSetting.ts` 与 Nest `api/v2` `settings.get`、`settings.getPublic` 入口，setting handler 已完成显式 DTO 输出校验；billing & usage 在主仓仅有 openapi 契约与前端 Cloud / EE 门控，backend 未定位到对应稳定 controller / service |

## 4. 领域级详细说明

### 4.1 Base

- V1
  - OpenAPI：`packages/openapi/src/base/*`
  - Backend：`apps/nestjs-backend/src/features/base/*`
- V2
  - Contract：`packages/v2/contract-http/src/base/createBase.ts`、`listBases.ts`
  - Domain：`CreateBaseCommand.ts`、`CreateBaseHandler.ts`、`ListBasesQuery.ts`、`ListBasesHandler.ts`
- 判断
  - V2 已具备基础闭环，但覆盖范围仍小于 V1 的 Base 周边能力，例如邀请、协作者、ERD、导入导出等。

### 4.2 Table

- V1
  - OpenAPI：`packages/openapi/src/table/*`
  - Backend：`apps/nestjs-backend/src/features/table/*`
- V2
  - Contract：`packages/v2/contract-http/src/table/createTable.ts`、`createTables.ts`、`listTables.ts`、`getTableById.ts`、`renameTable.ts`、`deleteTable.ts`、`restoreTable.ts`、`duplicateTable.ts`
  - Domain：`CreateTableCommand.ts`、`DeleteTableCommand.ts`、`DuplicateTableCommand.ts`、`RenameTableCommand.ts`
- 判断
  - Table 主链路在 V2 已明显成型。

### 4.3 Field

- V1
  - OpenAPI：`packages/openapi/src/field/*`
  - Backend：`apps/nestjs-backend/src/features/field/*`
- V2
  - Contract：`createField.ts`、`updateField.ts`、`deleteField.ts`、`duplicateField.ts`
  - Domain：`CreateFieldCommand.ts`、`UpdateFieldCommand.ts`、`DeleteFieldsCommand.ts`、相关 handler
- 判断
  - Field 主链路在 V2 已较完整，但 V1 仍承载更多周边能力，如 link filter、delete references、auto fill stop 等。

### 4.4 Record

- V1
  - OpenAPI：`packages/openapi/src/record/*`
  - Backend：`apps/nestjs-backend/src/features/record/*`
- V2
  - Contract：`createRecord.ts`、`submitRecord.ts`、`createRecords.ts`、`listTableRecords.ts`、`getRecordById.ts`、`updateRecord.ts`、`updateRecords.ts`、`deleteRecords.ts`、`duplicateRecord.ts`、`paste.ts`、`clear.ts`、`deleteByRange.ts`、`reorderRecords.ts`、`importCsv.ts`、`importRecords.ts`
  - Domain：`CreateRecords*`、`UpdateRecordCommand.ts`、`UpdateRecordsCommand`、`DeleteRecordsHandler.ts`、`PasteHandler.ts`、`ClearCommand.ts`、`ReorderRecordsCommand.ts`
- 判断
  - Record 是当前 V2 覆盖最强的核心域之一。

### 4.5 View

- V1
  - OpenAPI：`packages/openapi/src/view/*`
  - Backend：`apps/nestjs-backend/src/features/view/*`
- V2
  - 已存在领域内核：`packages/v2/core/src/domain/table/views/*`
  - 已存在相关规则与投影：`TableUpdateViewColumnMetaSpec.ts`、`TableUpdateViewQueryDefaultsSpec.ts`、`ViewColumnMetaUpdated.ts`、`ViewColumnMetaUpdatedRealtimeProjection.ts`
  - V1 controller 中已存在局部 v2 接入：`ViewOpenApiV2Service` + `UseV2Feature('reorderRecords')`
  - 已新增独立契约文件：`packages/v2/contract-http/src/view/listViews.ts`、`getViewById.ts`、`updateProperties.ts`、`updateFilter.ts`、`updateSort.ts`、`updateGroup.ts`、`updateColumnMeta.ts`、`reorderRecords.ts`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `views.list`、`views.getById`、`views.updateName`、`views.updateDescription`、`views.updateLocked`、`views.updateShareMeta`、`views.updateOptions`、`views.updateOrder`、`views.updateFilter`、`views.updateSort`、`views.updateGroup`、`views.updateColumnMeta`、`views.reorderRecords`
  - `apps/nestjs-backend/src/features/v2/v2.controller.ts` 与 `packages/v2/contract-http-implementation/src/router.ts` 已公开对应入口
  - 当前只读入口已具备专用 `GetViewByIdQuery`、`ListViewsQuery` 与对应 handler；`updateName`、`updateDescription`、`updateLocked`、`updateShareMeta`、`updateOptions`、`updateOrder`、`updateColumnMeta`、`updateFilter`、`updateSort`、`updateGroup` 已具备专用 command / handler，shared router 与 Nest `api/v2` 都已接入 command bus
- 判断
  - View 仍明显由 V1 主导，但不应再被表述为“v2 空白域”。
   - 当前更准确的判断是：v2 领域内核存在，且基础独立读写闭环已落地；后续事项进入专项路线图持续治理。

### 4.6 Comment

- V1
  - OpenAPI：`packages/openapi/src/comment/*`
  - Backend：`apps/nestjs-backend/src/features/comment/*`
- V2
  - 已新增独立契约文件：`packages/v2/contract-http/src/comment/listComments.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/comment/getCommentById.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/comment/getCommentCounts.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/comment/commentSubscribe.ts`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `comments.getRecordCount`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `comments.getTableCount`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `comments.list`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `comments.getById`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `comments.getSubscribeDetail`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `comments.subscribe`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `comments.unsubscribe`
  - `apps/nestjs-backend/src/features/v2/v2.controller.ts` 已公开对应入口
  - generic `createV2OrpcRouter` 当前保留 comment adapter 边界，真实执行由 Nest `api/v2` 承载
- 判断
  - Comment 的 v2 公开覆盖开始起步，当前已有基础只读四件套与 subscribe 三件套，整体仍以 V1 为主。

### 4.7 Share / Published

- V1
  - OpenAPI：`packages/openapi/src/share/*`
  - Backend：`apps/nestjs-backend/src/features/share/*`
  - Frontend：Published 运行时位于 `apps/nextjs-app/src/features/app/blocks/published/*`
- V2
  - 已新增独立契约文件：`packages/v2/contract-http/src/share/getShareView.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/share/getShareViewAggregations.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/share/getShareViewRowCount.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/share/getShareViewRecords.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/share/getShareViewGroupPoints.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/share/getShareViewLinkRecords.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/share/getShareViewCollaborators.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/share/getShareViewCalendarDailyCollection.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/share/getShareViewSearchCount.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/share/getShareViewSearchIndex.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/template/listPublishedTemplates.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/template/getTemplateById.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/template/getTemplatePermalink.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/template/incrementTemplateVisit.ts`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `share.getView`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `share.getViewAggregations`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `share.getViewGroupPoints`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `share.getViewCalendarDailyCollection`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `share.getViewLinkRecords`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `share.getViewCollaborators`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `share.getViewRowCount`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `share.getViewRecords`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `share.getViewSearchCount`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `share.getViewSearchIndex`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `templates.getById`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `templates.getPermalink`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `templates.incrementVisit`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `templates.listPublished`
  - 已新增独立契约文件：`packages/v2/contract-http/src/published-app/getRuntimeManifest.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/published-app/getNavigationModel.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/published-app/getNodeRuntime.ts`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `publishedApps.getRuntimeManifest`、`publishedApps.getNavigationModel`、`publishedApps.getNodeRuntime`
  - `apps/nestjs-backend/src/features/v2/v2-published-app.service.ts` 已基于 `BaseShareAuthService` 与 `BaseNodeService` 组装 share 模式 manifest、navigation model 与 node runtime，并补 `defaultUrl`、`shareMeta.passwordRestricted` 语义
  - `TemplatePermalinkService.resolvePermalink(...)` 已基于 `publishInfo.defaultUrl` 输出 template publish 默认跳转地址，说明 template publish 与 published runtime 已出现真实共享语义
  - `apps/nestjs-backend/src/features/v2/v2.controller.ts` 已公开对应入口
  - generic `createV2OrpcRouter` 当前保留 share / template / published adapter 边界，真实执行由 Nest `api/v2` 承载
- 判断
  - 这是用户面能力成熟、V2 统一度仍偏低的典型领域；share 只读公开面、核心交互面、template published 公开入口与 published runtime 的 manifest / navigation / node runtime 三层都已完成本轮公开契约收口，且 template publish 与 published runtime 已共享 `defaultUrl` 语义。
  - 当前更准确的剩余缺口是：`authenticated/template` mode 仍未落地，`nodeId/defaultNodeId/defaultActiveNodeId` 命名仍待收敛，share view 与 published app 仍缺统一 runtime 访问模型。

### 4.8 Workflow

- V1
  - OpenAPI：`packages/openapi/src/automation/workflow/*`
  - Backend：`apps/nestjs-backend/src/features/workflow/*`
- V2
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/aiCreateDraftWorkflow.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/listWorkflows.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/createWorkflow.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/updateWorkflow.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/deleteWorkflow.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/duplicateWorkflow.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/activateWorkflow.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/applyUpdateWorkflow.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/deactivateWorkflow.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/getWorkflowCapabilities.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/getWorkflowById.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/listWorkflowRuns.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/getWorkflowRun.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/workflow/testRunWorkflow.ts`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.aiCreateDraft`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.list`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.create`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.update`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.delete`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.duplicate`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.activate`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.applyUpdate`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.deactivate`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.getCapabilities`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.getById`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.listRuns`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.getRun`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `workflows.testRun`
  - `apps/nestjs-backend/src/features/v2/v2.controller.ts` 已公开对应入口
  - generic `createV2OrpcRouter` 当前保留 workflow adapter 边界，真实执行由 Nest `api/v2` 承载
- 判断
   - Workflow 功能完整，本轮已完成新架构公开契约主链路收口，且 AI draft、apply-update、最小 trigger runner 与 step history 已进入稳定主链路；整体剩余差异集中在剩余 trigger、前端工作区与更深治理。

### 4.9 Undo / Redo

- V1
  - OpenAPI：`packages/openapi/src/undo-redo/*`
  - Backend：`apps/nestjs-backend/src/features/undo-redo/*`
- V2
  - Domain：`UndoCommand.ts`、`RedoCommand.ts`、相关 handler 和大量 integration/e2e 测试
  - 已新增独立契约文件：`packages/v2/contract-http/src/table/undo.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/table/redo.ts`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `tables.undo`、`tables.redo`
  - `apps/nestjs-backend/src/features/v2/v2.controller.ts` 已公开对应入口
  - `packages/v2/contract-http-implementation/src/router.ts` 已接通 `tables.undo`、`tables.redo`
- 判断
  - 这一域已从“领域实现较强”推进到“公开契约主链路已落地”，剩余差异集中在更深的执行模型与外围边界治理。

### 4.10 Aggregation / Search

- V1
  - OpenAPI：`packages/openapi/src/aggregation/*`、`packages/openapi/src/search/*`
  - Backend：`apps/nestjs-backend/src/features/aggregation/*`
- V2
  - 已新增独立契约文件：`packages/v2/contract-http/src/table/getRowCount.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/table/getRecordIndex.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/table/getSearchCount.ts`
  - 已新增独立契约文件：`packages/v2/contract-http/src/table/getSearchIndex.ts`
  - `packages/v2/contract-http/src/contract.ts` 已新增 `tables.getRowCount`、`tables.getRecordIndex`、`tables.getSearchCount`、`tables.getSearchIndex`
  - `apps/nestjs-backend/src/features/v2/v2.controller.ts` 已公开对应入口
  - `packages/v2/contract-http-implementation/src/router.ts` 已接通对应 shared router 入口
- 判断
  - Aggregation / Search 已从“未见稳定覆盖”推进到“table 级读取公开层已落地”，整体仍由 V1 主导更宽的产品面。

## 5. 结论

### 5.1 当前 V2 覆盖最强的领域

- Base
- Table
- Field
- Record

这些领域已经形成较清晰的：
- contract-http 契约层
- v2 core command / query 层
- handler / 测试基础

### 5.2 当前 V1 主导最明显的领域

- View
- Comment
- Share / Published
- Workflow
- Admin / Setting / Billing
- Aggregation / Search

这些领域说明当前仓库的“产品成熟面”仍主要由 V1 承担。

### 5.3 当前最重要的持续治理判断

如果后续继续做结构统一类推进，最值得聚焦的是：

1. Workflow：参考 `workflow-domain-governance-roadmap.md`
2. Share / Published：参考 `share-published-governance-roadmap.md`
3. Ports / Adapters 普及：参考 `ports-adapters-adoption-roadmap.md`

### 5.4 当前矩阵收口结论

当前缺口矩阵中的“可立即修复”和“可通过文档与路线图收口”的任务已经完成收束。

后续事项当前已经转为：

1. 按专项路线图持续推进的工程任务
2. 按治理计划持续维护的长期任务

当前更适合持续投入的高价值统一域包括：

1. Workflow
2. Share / Published
3. View
4. Comment

这些领域的共同点是：

1. 用户感知价值高
2. 当前仍存在明显的 V1 主导面
3. 继续提升统一契约和新架构表达的收益最高

## 6. 建议的后续使用方式

这份矩阵适合与以下文件配合使用：

- `capability-gap-list.md`
- `capability-gap-task-matrix.md`

推荐用法：

1. 先用这份矩阵确认后续专项治理真正的目标域
2. 单次专项只聚焦一个高复杂领域
3. 结合 `capability-inventory-execution-playbook.md`、`capability-gap-task-matrix.md` 和专项路线图选择后续主治理域
