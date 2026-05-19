# View Domain Repair Package

> 文档分层：正式输出。
> 
> 这份文档是 View 域收口与迁移判断的正式修复包，用于评审、校正和后续推进。

## 1. 目的

本修复包用于把 `View` 域从“抽象缺口”收敛成可执行状态。

基于当前仓库实际核对结果，`View` 域的真实情况不是：

- 完全缺少 v2 支撑

而是：

- V1 已形成完整主链路
- V2 已存在明确领域内核
- 当前已具备独立 `view` contract-http 基础读写契约面，核心基础读写链路已经闭环
- 当前缺少一份面向评审和迁移的 View 域现状总览

因此，这一轮修复的目标是先补齐“真实现状收口层”，避免后续在错误路径上推进改造。

## 2. 当前现状

### 2.1 V1 主链路完整

- OpenAPI
  - `packages/openapi/src/view/*`
- Backend
  - `apps/nestjs-backend/src/features/view/open-api/view-open-api.controller.ts`
  - `apps/nestjs-backend/src/features/view/open-api/view-open-api.service.ts`
  - `apps/nestjs-backend/src/features/view/view.service.ts`
- Frontend
  - `apps/nextjs-app/src/features/app/blocks/view/*`
  - `apps/nextjs-app/src/features/app/blocks/share/view/*`

### 2.2 V1 已覆盖的能力面

- View CRUD
- name / description / locked / share-meta 更新
- filter / sort / group / options / order / record-order
- share enable / disable / refresh-share-id
- filter-link-records
- plugin install / get / update storage
- duplicate view
- socket snapshot / doc ids

### 2.3 V2 并非空白

当前已经明确存在的 v2 View 相关内核：

- 领域模型
  - `packages/v2/core/src/domain/table/views/View.ts`
  - `ViewId.ts`
  - `ViewType.ts`
  - `ViewFactory.ts`
  - `ViewColumnMeta.ts`
- 视图类型
  - `types/GridView.ts`
  - `types/KanbanView.ts`
  - `types/GalleryView.ts`
  - `types/CalendarView.ts`
  - `types/FormView.ts`
  - `types/PluginView.ts`
- 领域规则与规格
  - `TableUpdateViewColumnMetaSpec.ts`
  - `TableUpdateViewQueryDefaultsSpec.ts`
- 事件与投影
  - `ViewColumnMetaUpdated.ts`
  - `ViewColumnMetaUpdatedRealtimeProjection.ts`

### 2.4 当前缺失点

- 当前独立公开的 view 契约已覆盖：`list`、`getById`、`updateName`、`updateDescription`、`updateLocked`、`updateShareMeta`、`updateOptions`、`updateOrder`、`updateFilter`、`updateSort`、`updateGroup`、`updateColumnMeta`、`reorderRecords`
- 当前已经形成 `views.*` 独立契约组与对应执行入口
- `v1-v2-coverage-matrix.md` 中 View 域目前只能判定为：
  - V1 完整
  - V2 领域内核存在，且已补独立最小契约组，但整体 view 契约覆盖仍不足

## 3. 当前轮次最适合做的修复

### 3.1 已完成的认知修复

本轮已经完成：

- 纠正了“View 域没有 v2”的误解
- 确认了前端真实入口在 `blocks/view` 和 `blocks/share/view`，而不是此前假设的 `views/` 目录
- 确认了 V1 controller 已内置一条局部 V2 接入点：
  - `updateRecordOrders` 通过 `ViewOpenApiV2Service` 和 `UseV2Feature('reorderRecords')` 切入 v2
- 补齐了一个最小公开入口：
  - `apps/nestjs-backend/src/features/v2/v2.controller.ts` 已公开 `v2Contract.tables.reorderRecords`
  - `packages/v2/contract-http/src/view/reorderRecords.ts` 已建立独立 `view` 契约文件
  - `packages/v2/contract-http/src/contract.ts` 已建立 `views.reorderRecords`
  - `packages/v2/contract-http-implementation/src/router.ts` 已接入 `views.reorderRecords`
- 继续补齐了最小只读契约：
  - `packages/v2/contract-http/src/view/listViews.ts`
  - `packages/v2/contract-http/src/view/getViewById.ts`
  - `packages/v2/contract-http/src/contract.ts` 已建立 `views.list`、`views.getById`
  - `apps/nestjs-backend/src/features/v2/v2.controller.ts` 与 `packages/v2/contract-http-implementation/src/router.ts` 已同步接线
- 补齐了一条已落原生命令链路的写契约：
  - `packages/v2/contract-http/src/view/updateColumnMeta.ts`
  - `packages/v2/contract-http/src/contract.ts` 已建立 `views.updateColumnMeta`
  - `apps/nestjs-backend/src/features/v2/v2.controller.ts` 已公开对应入口
  - 当前执行层已切到专用 `UpdateViewColumnMetaCommand` / `UpdateViewColumnMetaHandler`
  - 已保留字段归属校验与“主字段隐藏受视图类型限制”两条关键业务约束
- 补齐了三条条件类写契约：
  - `packages/v2/contract-http/src/view/updateFilter.ts`
  - `packages/v2/contract-http/src/view/updateSort.ts`
  - `packages/v2/contract-http/src/view/updateGroup.ts`
  - `apps/nestjs-backend/src/features/v2/v2.controller.ts` 已公开对应入口
  - 当前 `updateFilter` 已切到专用 `UpdateViewFilterCommand` / `UpdateViewFilterHandler`
  - 当前 `updateSort` 已切到专用 `UpdateViewSortCommand` / `UpdateViewSortHandler`
  - 当前 `updateGroup` 已切到专用 `UpdateViewGroupCommand` / `UpdateViewGroupHandler`
- 补齐了六条基础属性类写契约：
  - `updateName`
  - `updateDescription`
  - `updateLocked`
  - `updateShareMeta`
  - `updateOptions`
  - `updateOrder`
  - 其中 `updateName` 已切到专用 `UpdateViewNameCommand` / `UpdateViewNameHandler`
  - 其中 `updateOptions` 已切到专用 `UpdateViewOptionsCommand` / `UpdateViewOptionsHandler`
  - `updateDescription` 已切到专用 `UpdateViewDescriptionCommand` / `UpdateViewDescriptionHandler`
  - `updateLocked` 已切到专用 `UpdateViewLockedCommand` / `UpdateViewLockedHandler`
  - `updateShareMeta` 已切到专用 `UpdateViewShareMetaCommand` / `UpdateViewShareMetaHandler`
  - `updateOrder` 已切到专用 `UpdateViewOrderCommand` / `UpdateViewOrderHandler`
  - 这些基础属性写能力当前已经在 Nest `api/v2` 与 generic `createV2OrpcRouter` 两层都接到 command bus

### 3.2 当前轮次不宜直接做的大改动

当前不宜直接做：

- 立刻新增完整的 view contract-http 契约全家桶
- 直接把 V1 view controller 大面积迁移到 v2
- 在没有迁移路线图前同时改前端、后端、契约三层

原因：

- View 与 filter / sort / group / share / plugin / socket / record-order 强耦合
- 一次性重构容易破坏稳定性
- 当前最缺的是“统一迁移面说明”，不是“再多做一个分散实现”

## 4. 第一批实际修复项

### 修复项 A：更新覆盖矩阵对 View 域的判定说明

- 目标
  - 避免把 View 域错误表述为“v2 完全缺失”
- 动作
  - 在 `v1-v2-coverage-matrix.md` 中把 View 域描述为：
    - V2 领域内核存在
    - 稳定公开契约缺失

### 修复项 B：补一份 View 域专项索引

- 目标
  - 让后续迁移不再从零判断路径
- 本文档已承担该作用

### 修复项 C：把 View 域列为下一阶段“高价值统一域”候选

- 目标
  - 在后续 roadmap 中明确优先级
- 判断依据
  - 用户价值高
  - 关联链路长
  - V1 成熟、V2 已有内核基础

## 5. 后续触发时的代码推进方向

如果后续重新打开 View 域专项治理，最适合的顺序是：

1. 继续把当前 `views.list`、`views.getById`、`views.updateName`、`views.updateDescription`、`views.updateLocked`、`views.updateShareMeta`、`views.updateOptions`、`views.updateOrder`、`views.updateFilter`、`views.updateSort`、`views.updateGroup`、`views.updateColumnMeta`、`views.reorderRecords` 扩成更完整的 `view` 契约组
2. 继续在 `v2/core` 读取侧沿专用 `GetViewById` / `ListViews` query 闭环扩展测试与适配覆盖
3. 继续补更复杂的 `share / plugin / published` 相关 view 能力
4. 最后再考虑更深层的前后端统一迁移

## 6. 当前结论

### 6.1 View 域不是“空白缺口”

View 域当前的真实状态是：

- V1 完整成熟
- V2 领域内核存在
- v2 已有独立 `views.list`、`views.getById`、`views.updateName`、`views.updateDescription`、`views.updateLocked`、`views.updateShareMeta`、`views.updateOptions`、`views.updateOrder`、`views.updateFilter`、`views.updateSort`、`views.updateGroup`、`views.updateColumnMeta`、`views.reorderRecords` 契约组，但整体公开契约覆盖仍偏窄

### 6.2 当前最稳的处理方式

当前最稳的方式是：

- 已完成认知修正
- 已建立 View 域迁移起点
- 已完成 `list`、`getById`、基础属性更新、条件更新、`updateColumnMeta`、`record-order` 的独立 view v2 契约组落地
- 已完成 `GetViewByIdQuery`、`ListViewsQuery` 及对应 handler，读取侧已脱离 `GetTableByIdQuery` 视图切片适配
- 已完成 `UpdateViewNameCommand`、`UpdateViewDescriptionCommand`、`UpdateViewLockedCommand`、`UpdateViewShareMetaCommand`、`UpdateViewOptionsCommand`、`UpdateViewOrderCommand`、`UpdateViewColumnMetaCommand`、`UpdateViewFilterCommand`、`UpdateViewSortCommand`、`UpdateViewGroupCommand` 及对应 handler，写侧基础链路已原生化
- 已完成 `@teable/v2-contract-http`、`@teable/v2-contract-http-implementation`、`@teable/backend` 的类型校验

### 6.3 对缺口清单的影响

这说明 `capability-gap-list.md` 中与 View 相关的结构性缺口应被理解为：

- “view 产品级公开契约覆盖仍不足，但基础读写闭环已具备”

而不是：

- “完全没有 v2 基础”
