# V2 Capability Repair Commit Scope

> 文档分层：正式输出。

## 1. 建议纳入同一提交的文件

本轮建议提交主题已经从最初的 table 聚合 / undo-redo 扩大为完整的 `v2 API surface` 收口包，因此提交边界应覆盖：

1. Nest `api/v2` 总装层
2. `contract-http` 的高价值公开面 contract
3. `contract-http-implementation` 的对应 handler 与 router 接线
4. 为这些公开面服务的最小共享 schema 收口
5. 与当前代码事实一致的正式输出文档

### 1.1 Nest `api/v2` 入口

- `apps/nestjs-backend/src/features/v2/v2.controller.ts`
- `apps/nestjs-backend/src/features/v2/v2.module.ts`
- `apps/nestjs-backend/src/features/v2/v2-published-app.service.ts`

### 1.2 V2 Core 最小依赖

这轮 `view` 公开面已经接入真实 command / query 链路，因此以下 `packages/v2/core` 文件属于当前提交的必要依赖，不能继续排除：

- `packages/v2/core/src/index.ts`
- `packages/v2/core/src/domain/table/Table.ts`
- `packages/v2/core/src/domain/table/views/View.ts`
- `packages/v2/core/src/domain/table/views/copyViewState.ts`
- `packages/v2/core/src/domain/table/views/visitors/CloneViewVisitor.ts`
- `packages/v2/core/src/domain/table/specs/ITableSpecVisitor.ts`
- `packages/v2/core/src/domain/table/specs/TableSpecs.spec.ts`
- `packages/v2/core/src/domain/table/specs/TableUpdateViewColumnMetaSpec.ts`
- `packages/v2/core/src/domain/table/specs/TableUpdateViewNameSpec.ts`
- `packages/v2/core/src/domain/table/specs/TableUpdateViewOptionsSpec.ts`
- `packages/v2/core/src/domain/table/specs/TableUpdateViewPropertiesSpec.ts`
- `packages/v2/core/src/domain/table/specs/TableUpdateViewQueryDefaultsSpec.ts`
- `packages/v2/core/src/domain/table/specs/visitors/TableEventGeneratingSpecVisitor.ts`
- `packages/v2/core/src/domain/table/specs/visitors/TableSpecEventVisitor.ts`
- `packages/v2/core/src/ports/mappers/TableMapper.ts`
- `packages/v2/core/src/ports/mappers/defaults/DefaultTableMapper.ts`
- `packages/v2/core/src/queries/GetTableByIdQuery.ts`
- `packages/v2/core/src/queries/GetViewByIdQuery.ts`
- `packages/v2/core/src/queries/GetViewByIdHandler.ts`
- `packages/v2/core/src/queries/ListViewsQuery.ts`
- `packages/v2/core/src/queries/ListViewsHandler.ts`
- `packages/v2/core/src/commands/UpdateViewNameCommand.ts`
- `packages/v2/core/src/commands/UpdateViewNameHandler.ts`
- `packages/v2/core/src/commands/UpdateViewDescriptionCommand.ts`
- `packages/v2/core/src/commands/UpdateViewDescriptionHandler.ts`
- `packages/v2/core/src/commands/UpdateViewLockedCommand.ts`
- `packages/v2/core/src/commands/UpdateViewLockedHandler.ts`
- `packages/v2/core/src/commands/UpdateViewShareMetaCommand.ts`
- `packages/v2/core/src/commands/UpdateViewShareMetaHandler.ts`
- `packages/v2/core/src/commands/UpdateViewOptionsCommand.ts`
- `packages/v2/core/src/commands/UpdateViewOptionsHandler.ts`
- `packages/v2/core/src/commands/UpdateViewOrderCommand.ts`
- `packages/v2/core/src/commands/UpdateViewOrderHandler.ts`
- `packages/v2/core/src/commands/UpdateViewFilterCommand.ts`
- `packages/v2/core/src/commands/UpdateViewFilterHandler.ts`
- `packages/v2/core/src/commands/UpdateViewSortCommand.ts`
- `packages/v2/core/src/commands/UpdateViewSortHandler.ts`
- `packages/v2/core/src/commands/UpdateViewGroupCommand.ts`
- `packages/v2/core/src/commands/UpdateViewGroupHandler.ts`
- `packages/v2/core/src/commands/UpdateViewColumnMetaCommand.ts`
- `packages/v2/core/src/commands/UpdateViewColumnMetaHandler.ts`

### 1.3 Contract 层

- `packages/v2/contract-http/package.json`
- `packages/v2/contract-http/tsconfig.json`
- `packages/v2/contract-http/src/contract.ts`
- `packages/v2/contract-http/src/index.ts`
- `packages/v2/contract-http/src/shared/http.ts`
- `packages/v2/contract-http/src/shared/json.ts`
- `packages/v2/contract-http/src/table/dto.ts`
- `packages/v2/contract-http/src/table/recordDto.ts`
- `packages/v2/contract-http/src/table/updateField.ts`
- `packages/v2/contract-http/src/table/explainCommand.ts`
- `packages/v2/contract-http/src/table/getRowCount.ts`
- `packages/v2/contract-http/src/table/getRecordIndex.ts`
- `packages/v2/contract-http/src/table/getSearchCount.ts`
- `packages/v2/contract-http/src/table/getSearchIndex.ts`
- `packages/v2/contract-http/src/table/undo.ts`
- `packages/v2/contract-http/src/table/redo.ts`
- `packages/v2/contract-http/src/view/dto.ts`
- `packages/v2/contract-http/src/view/listViews.ts`
- `packages/v2/contract-http/src/view/getViewById.ts`
- `packages/v2/contract-http/src/view/updateProperties.ts`
- `packages/v2/contract-http/src/view/updateFilter.ts`
- `packages/v2/contract-http/src/view/updateSort.ts`
- `packages/v2/contract-http/src/view/updateGroup.ts`
- `packages/v2/contract-http/src/view/updateColumnMeta.ts`
- `packages/v2/contract-http/src/view/reorderRecords.ts`
- `packages/v2/contract-http/src/comment/commentSubscribe.ts`
- `packages/v2/contract-http/src/comment/getCommentById.ts`
- `packages/v2/contract-http/src/comment/getCommentCounts.ts`
- `packages/v2/contract-http/src/comment/listComments.ts`
- `packages/v2/contract-http/src/published-app/getRuntimeManifest.ts`
- `packages/v2/contract-http/src/published-app/getNavigationModel.ts`
- `packages/v2/contract-http/src/published-app/getNodeRuntime.ts`
- `packages/v2/contract-http/src/share/getShareView.ts`
- `packages/v2/contract-http/src/share/getShareViewAggregations.ts`
- `packages/v2/contract-http/src/share/getShareViewRowCount.ts`
- `packages/v2/contract-http/src/share/getShareViewRecords.ts`
- `packages/v2/contract-http/src/share/getShareViewGroupPoints.ts`
- `packages/v2/contract-http/src/share/getShareViewLinkRecords.ts`
- `packages/v2/contract-http/src/share/getShareViewCollaborators.ts`
- `packages/v2/contract-http/src/share/getShareViewCalendarDailyCollection.ts`
- `packages/v2/contract-http/src/share/getShareViewSearchCount.ts`
- `packages/v2/contract-http/src/share/getShareViewSearchIndex.ts`
- `packages/v2/contract-http/src/share/formSubmitShareView.ts`
- `packages/v2/contract-http/src/share/copyShareView.ts`
- `packages/v2/contract-http/src/share/buttonClickShareView.ts`
- `packages/v2/contract-http/src/setting/getSetting.ts`
- `packages/v2/contract-http/src/setting/getPublicSetting.ts`
- `packages/v2/contract-http/src/template/listPublishedTemplates.ts`
- `packages/v2/contract-http/src/template/getTemplateById.ts`
- `packages/v2/contract-http/src/template/getTemplatePermalink.ts`
- `packages/v2/contract-http/src/template/incrementTemplateVisit.ts`
- `packages/v2/contract-http/src/workflow/listWorkflows.ts`
- `packages/v2/contract-http/src/workflow/getWorkflowCapabilities.ts`
- `packages/v2/contract-http/src/workflow/getWorkflowById.ts`
- `packages/v2/contract-http/src/workflow/listWorkflowRuns.ts`
- `packages/v2/contract-http/src/workflow/getWorkflowRun.ts`
- `packages/v2/contract-http/src/workflow/createWorkflow.ts`
- `packages/v2/contract-http/src/workflow/updateWorkflow.ts`
- `packages/v2/contract-http/src/workflow/deleteWorkflow.ts`
- `packages/v2/contract-http/src/workflow/duplicateWorkflow.ts`
- `packages/v2/contract-http/src/workflow/activateWorkflow.ts`
- `packages/v2/contract-http/src/workflow/deactivateWorkflow.ts`
- `packages/v2/contract-http/src/workflow/testRunWorkflow.ts`

### 1.4 Contract Implementation 层

- `packages/v2/contract-http-implementation/package.json`
- `packages/v2/contract-http-implementation/tsconfig.json`
- `packages/v2/contract-http-implementation/src/handlers/index.ts`
- `packages/v2/contract-http-implementation/src/router.ts`
- `packages/v2/contract-http-implementation/src/handlers/tables/index.ts`
- `packages/v2/contract-http-implementation/src/handlers/tables/getRowCount.ts`
- `packages/v2/contract-http-implementation/src/handlers/tables/getRecordIndex.ts`
- `packages/v2/contract-http-implementation/src/handlers/tables/getSearchCount.ts`
- `packages/v2/contract-http-implementation/src/handlers/tables/getSearchIndex.ts`
- `packages/v2/contract-http-implementation/src/handlers/tables/undo.ts`
- `packages/v2/contract-http-implementation/src/handlers/tables/redo.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/index.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/listViews.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/getViewById.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateSimpleProperties.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateProperties.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateColumnMeta.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateViewNameCommand.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateViewDescriptionCommand.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateViewLockedCommand.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateViewShareMetaCommand.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateViewOptionsCommand.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateViewOrderCommand.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateViewFilterCommand.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateViewSortCommand.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateViewGroupCommand.ts`
- `packages/v2/contract-http-implementation/src/handlers/views/updateViewColumnMetaCommand.ts`
- `packages/v2/contract-http-implementation/src/handlers/comments/commentSubscribe.ts`
- `packages/v2/contract-http-implementation/src/handlers/comments/getCommentById.ts`
- `packages/v2/contract-http-implementation/src/handlers/comments/getCommentCounts.ts`
- `packages/v2/contract-http-implementation/src/handlers/comments/listComments.ts`
- `packages/v2/contract-http-implementation/src/handlers/published-app/getRuntimeManifest.ts`
- `packages/v2/contract-http-implementation/src/handlers/published-app/getNavigationModel.ts`
- `packages/v2/contract-http-implementation/src/handlers/published-app/getNodeRuntime.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/getShareView.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/getShareViewAggregations.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/getShareViewRowCount.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/getShareViewRecords.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/getShareViewGroupPoints.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/getShareViewLinkRecords.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/getShareViewCollaborators.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/getShareViewCalendarDailyCollection.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/getShareViewSearchCount.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/getShareViewSearchIndex.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/formSubmitShareView.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/copyShareView.ts`
- `packages/v2/contract-http-implementation/src/handlers/share/buttonClickShareView.ts`
- `packages/v2/contract-http-implementation/src/handlers/setting/getSetting.ts`
- `packages/v2/contract-http-implementation/src/handlers/setting/getPublicSetting.ts`
- `packages/v2/contract-http-implementation/src/handlers/template/listPublishedTemplates.ts`
- `packages/v2/contract-http-implementation/src/handlers/template/getTemplateById.ts`
- `packages/v2/contract-http-implementation/src/handlers/template/getTemplatePermalink.ts`
- `packages/v2/contract-http-implementation/src/handlers/template/incrementTemplateVisit.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/listWorkflows.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/getWorkflowCapabilities.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/getWorkflowById.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/listWorkflowRuns.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/getWorkflowRun.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/createWorkflow.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/updateWorkflow.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/deleteWorkflow.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/duplicateWorkflow.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/activateWorkflow.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/deactivateWorkflow.ts`
- `packages/v2/contract-http-implementation/src/handlers/workflows/testRunWorkflow.ts`

### 1.5 正式输出与项目记忆

- `.monkeycode/MEMORY.md`
- `capability-gap-list.md`
- `capability-gap-task-matrix.md`
- `v1-v2-coverage-matrix.md`
- `v2-capability-repair-change-summary.md`
- `v2-capability-repair-commit-scope.md`

## 2. 建议排除出本次提交的文件

以下文件当前也有改动，但不属于这轮“v2 公开契约覆盖与 router 边界统一”主题，建议继续留在各自改动链路中：

- `AGENTS.md`
- `packages/v2/adapter-repository-postgres/src/**`
- `packages/v2/adapter-table-repository-postgres/src/**`
- `packages/v2/contract-http/src/table/getTableById.ts`
- 其他本轮之前已存在的未跟踪文档和目录

## 3. 建议提交信息

```text
feat(v2): align api surface contracts and router boundaries
```

## 4. 可直接执行的暂存命令

当前建议提交范围已经较大，且覆盖多组新增目录。实际暂存时更适合按上面的五个分组逐组 `git add`，并单独核对 `packages/v2/core` 只纳入 view 公开面所需的最小依赖，避免混入 repository 侧改动。

## 5. 提交前建议验证

```bash
pnpm --filter @teable/v2-contract-http typecheck
pnpm --filter @teable/v2-contract-http-implementation typecheck
pnpm --filter @teable/backend typecheck
```

## 6. 当前工作区核对结论

当前工作区已经确认的可纳入范围如下：

1. 必须纳入
   - `apps/nestjs-backend/src/features/v2/v2.controller.ts`
   - `apps/nestjs-backend/src/features/v2/v2.module.ts`
   - `apps/nestjs-backend/src/features/v2/v2-published-app.service.ts`
   - `packages/v2/contract-http/package.json`
   - `packages/v2/contract-http/tsconfig.json`
   - `packages/v2/contract-http/src/contract.ts`
   - `packages/v2/contract-http/src/index.ts`
   - `packages/v2/contract-http/src/shared/http.ts`
   - `packages/v2/contract-http/src/shared/json.ts`
   - `packages/v2/contract-http/src/table/dto.ts`
   - `packages/v2/contract-http/src/table/recordDto.ts`
   - `packages/v2/contract-http/src/table/updateField.ts`
   - `packages/v2/contract-http/src/table/explainCommand.ts`
   - `packages/v2/contract-http/src/table/getRowCount.ts`
   - `packages/v2/contract-http/src/table/getRecordIndex.ts`
   - `packages/v2/contract-http/src/table/getSearchCount.ts`
   - `packages/v2/contract-http/src/table/getSearchIndex.ts`
   - `packages/v2/contract-http/src/table/undo.ts`
   - `packages/v2/contract-http/src/table/redo.ts`
   - `packages/v2/contract-http/src/view/*.ts`
   - `packages/v2/contract-http/src/comment/*.ts`
   - `packages/v2/contract-http/src/published-app/*.ts`
   - `packages/v2/contract-http/src/share/*.ts`
   - `packages/v2/contract-http/src/setting/*.ts`
   - `packages/v2/contract-http/src/template/*.ts`
   - `packages/v2/contract-http/src/workflow/*.ts`
   - `packages/v2/contract-http-implementation/package.json`
   - `packages/v2/contract-http-implementation/tsconfig.json`
   - `packages/v2/contract-http-implementation/src/router.ts`
   - `packages/v2/contract-http-implementation/src/handlers/index.ts`
   - `packages/v2/contract-http-implementation/src/handlers/tables/index.ts`
   - `packages/v2/contract-http-implementation/src/handlers/tables/getRowCount.ts`
   - `packages/v2/contract-http-implementation/src/handlers/tables/getRecordIndex.ts`
   - `packages/v2/contract-http-implementation/src/handlers/tables/getSearchCount.ts`
   - `packages/v2/contract-http-implementation/src/handlers/tables/getSearchIndex.ts`
   - `packages/v2/contract-http-implementation/src/handlers/tables/undo.ts`
   - `packages/v2/contract-http-implementation/src/handlers/tables/redo.ts`
   - `packages/v2/contract-http-implementation/src/handlers/views/*.ts`
   - `packages/v2/contract-http-implementation/src/handlers/comments/*.ts`
   - `packages/v2/contract-http-implementation/src/handlers/published-app/*.ts`
   - `packages/v2/contract-http-implementation/src/handlers/share/*.ts`
   - `packages/v2/contract-http-implementation/src/handlers/setting/*.ts`
   - `packages/v2/contract-http-implementation/src/handlers/template/*.ts`
   - `packages/v2/contract-http-implementation/src/handlers/workflows/*.ts`
   - `packages/v2/core/src/index.ts`
   - `packages/v2/core/src/domain/table/Table.ts`
   - `packages/v2/core/src/domain/table/views/**/*.ts`
   - `packages/v2/core/src/domain/table/specs/ITableSpecVisitor.ts`
   - `packages/v2/core/src/domain/table/specs/TableSpecs.spec.ts`
   - `packages/v2/core/src/domain/table/specs/TableUpdateViewColumnMetaSpec.ts`
   - `packages/v2/core/src/domain/table/specs/TableUpdateViewNameSpec.ts`
   - `packages/v2/core/src/domain/table/specs/TableUpdateViewOptionsSpec.ts`
   - `packages/v2/core/src/domain/table/specs/TableUpdateViewPropertiesSpec.ts`
   - `packages/v2/core/src/domain/table/specs/TableUpdateViewQueryDefaultsSpec.ts`
   - `packages/v2/core/src/domain/table/specs/visitors/TableEventGeneratingSpecVisitor.ts`
   - `packages/v2/core/src/domain/table/specs/visitors/TableSpecEventVisitor.ts`
   - `packages/v2/core/src/ports/mappers/TableMapper.ts`
   - `packages/v2/core/src/ports/mappers/defaults/DefaultTableMapper.ts`
   - `packages/v2/core/src/queries/GetTableByIdQuery.ts`
   - `packages/v2/core/src/queries/GetViewByIdQuery.ts`
   - `packages/v2/core/src/queries/GetViewByIdHandler.ts`
   - `packages/v2/core/src/queries/ListViewsQuery.ts`
   - `packages/v2/core/src/queries/ListViewsHandler.ts`
   - `packages/v2/core/src/commands/UpdateView*.ts`
   - `.monkeycode/MEMORY.md`
   - `capability-gap-list.md`
   - `capability-gap-task-matrix.md`
   - `v1-v2-coverage-matrix.md`
   - `v2-capability-repair-change-summary.md`
   - `v2-capability-repair-commit-scope.md`

2. 当前明确排除
   - `AGENTS.md`
   - `packages/v2/adapter-repository-postgres/src/**`
   - `packages/v2/adapter-table-repository-postgres/src/**`
   - `packages/v2/contract-http/src/table/getTableById.ts`
   - `packages/v2/contract-http-implementation/src/handlers/tables/getTableById.ts`
   - `packages/v2/contract-http-implementation/src/handlers/tables/{create*,delete*,duplicate*,import*,list*,paste*,renameTable,submitRecord,updateRecord,updateRecords,updateField,deleteByRange,clear,explainCommand,getRecordById,reorderRecords}.ts`

3. 暂存前额外检查点
   - `packages/v2/core/src/commands` 目录只应纳入 `UpdateView*.ts`
   - `packages/v2/core/src/queries` 目录只应纳入 `GetViewById*`、`ListViews*` 与已联动修改的 `GetTableByIdQuery.ts`
   - `packages/v2/contract-http/src/table` 与 `contract-http-implementation/src/handlers/tables` 只纳入本轮新增公开入口与共享 schema 收口文件

## 7. 可直接执行的分组暂存方案

建议按以下分组顺序执行 `git add`，每组执行后都复核一次 `git status --short`：

### 7.1 Nest `api/v2`

```bash
git add \
  apps/nestjs-backend/src/features/v2/v2.controller.ts \
  apps/nestjs-backend/src/features/v2/v2.module.ts \
  apps/nestjs-backend/src/features/v2/v2-published-app.service.ts
```

### 7.2 V2 Core 最小依赖

```bash
git add \
  packages/v2/core/src/index.ts \
  packages/v2/core/src/domain/table/Table.ts \
  packages/v2/core/src/domain/table/views/View.ts \
  packages/v2/core/src/domain/table/views/copyViewState.ts \
  packages/v2/core/src/domain/table/views/visitors/CloneViewVisitor.ts \
  packages/v2/core/src/domain/table/specs/ITableSpecVisitor.ts \
  packages/v2/core/src/domain/table/specs/TableSpecs.spec.ts \
  packages/v2/core/src/domain/table/specs/TableUpdateViewColumnMetaSpec.ts \
  packages/v2/core/src/domain/table/specs/TableUpdateViewNameSpec.ts \
  packages/v2/core/src/domain/table/specs/TableUpdateViewOptionsSpec.ts \
  packages/v2/core/src/domain/table/specs/TableUpdateViewPropertiesSpec.ts \
  packages/v2/core/src/domain/table/specs/TableUpdateViewQueryDefaultsSpec.ts \
  packages/v2/core/src/domain/table/specs/visitors/TableEventGeneratingSpecVisitor.ts \
  packages/v2/core/src/domain/table/specs/visitors/TableSpecEventVisitor.ts \
  packages/v2/core/src/ports/mappers/TableMapper.ts \
  packages/v2/core/src/ports/mappers/defaults/DefaultTableMapper.ts \
  packages/v2/core/src/queries/GetTableByIdQuery.ts \
  packages/v2/core/src/queries/GetViewByIdQuery.ts \
  packages/v2/core/src/queries/GetViewByIdHandler.ts \
  packages/v2/core/src/queries/ListViewsQuery.ts \
  packages/v2/core/src/queries/ListViewsHandler.ts \
  packages/v2/core/src/commands/UpdateViewNameCommand.ts \
  packages/v2/core/src/commands/UpdateViewNameHandler.ts \
  packages/v2/core/src/commands/UpdateViewDescriptionCommand.ts \
  packages/v2/core/src/commands/UpdateViewDescriptionHandler.ts \
  packages/v2/core/src/commands/UpdateViewLockedCommand.ts \
  packages/v2/core/src/commands/UpdateViewLockedHandler.ts \
  packages/v2/core/src/commands/UpdateViewShareMetaCommand.ts \
  packages/v2/core/src/commands/UpdateViewShareMetaHandler.ts \
  packages/v2/core/src/commands/UpdateViewOptionsCommand.ts \
  packages/v2/core/src/commands/UpdateViewOptionsHandler.ts \
  packages/v2/core/src/commands/UpdateViewOrderCommand.ts \
  packages/v2/core/src/commands/UpdateViewOrderHandler.ts \
  packages/v2/core/src/commands/UpdateViewFilterCommand.ts \
  packages/v2/core/src/commands/UpdateViewFilterHandler.ts \
  packages/v2/core/src/commands/UpdateViewSortCommand.ts \
  packages/v2/core/src/commands/UpdateViewSortHandler.ts \
  packages/v2/core/src/commands/UpdateViewGroupCommand.ts \
  packages/v2/core/src/commands/UpdateViewGroupHandler.ts \
  packages/v2/core/src/commands/UpdateViewColumnMetaCommand.ts \
  packages/v2/core/src/commands/UpdateViewColumnMetaHandler.ts
```

### 7.3 Contract 层

```bash
git add \
  packages/v2/contract-http/package.json \
  packages/v2/contract-http/tsconfig.json \
  packages/v2/contract-http/src/contract.ts \
  packages/v2/contract-http/src/index.ts \
  packages/v2/contract-http/src/shared/http.ts \
  packages/v2/contract-http/src/shared/json.ts \
  packages/v2/contract-http/src/table/dto.ts \
  packages/v2/contract-http/src/table/recordDto.ts \
  packages/v2/contract-http/src/table/updateField.ts \
  packages/v2/contract-http/src/table/explainCommand.ts \
  packages/v2/contract-http/src/table/getRowCount.ts \
  packages/v2/contract-http/src/table/getRecordIndex.ts \
  packages/v2/contract-http/src/table/getSearchCount.ts \
  packages/v2/contract-http/src/table/getSearchIndex.ts \
  packages/v2/contract-http/src/table/undo.ts \
  packages/v2/contract-http/src/table/redo.ts \
  packages/v2/contract-http/src/view \
  packages/v2/contract-http/src/comment \
  packages/v2/contract-http/src/published-app \
  packages/v2/contract-http/src/share \
  packages/v2/contract-http/src/setting \
  packages/v2/contract-http/src/template \
  packages/v2/contract-http/src/workflow
```

### 7.4 Contract Implementation 层

```bash
git add \
  packages/v2/contract-http-implementation/package.json \
  packages/v2/contract-http-implementation/tsconfig.json \
  packages/v2/contract-http-implementation/src/router.ts \
  packages/v2/contract-http-implementation/src/handlers/index.ts \
  packages/v2/contract-http-implementation/src/handlers/tables/index.ts \
  packages/v2/contract-http-implementation/src/handlers/tables/getRowCount.ts \
  packages/v2/contract-http-implementation/src/handlers/tables/getRecordIndex.ts \
  packages/v2/contract-http-implementation/src/handlers/tables/getSearchCount.ts \
  packages/v2/contract-http-implementation/src/handlers/tables/getSearchIndex.ts \
  packages/v2/contract-http-implementation/src/handlers/tables/undo.ts \
  packages/v2/contract-http-implementation/src/handlers/tables/redo.ts \
  packages/v2/contract-http-implementation/src/handlers/views \
  packages/v2/contract-http-implementation/src/handlers/comments \
  packages/v2/contract-http-implementation/src/handlers/published-app \
  packages/v2/contract-http-implementation/src/handlers/share \
  packages/v2/contract-http-implementation/src/handlers/setting \
  packages/v2/contract-http-implementation/src/handlers/template \
  packages/v2/contract-http-implementation/src/handlers/workflows
```

### 7.5 文档与记忆

```bash
git add \
  .monkeycode/MEMORY.md \
  capability-gap-list.md \
  capability-gap-task-matrix.md \
  v1-v2-coverage-matrix.md \
  v2-capability-repair-change-summary.md \
  v2-capability-repair-commit-scope.md
```
