# Capability Gap Task Matrix

> 文档分层：正式输出。
> 
> 这份文档把正式缺口清单转成执行矩阵，用于推进、跟踪和状态回写。

## 1. 说明

本矩阵将 `/workspace/capability-gap-list.md` 中的缺口逐条转成可执行治理项。

状态定义：

- 已修复
  - 代码、结构和相关盘点文档已经同步收口完成
- 可立即修复
  - 能在当前轮次直接通过代码、导出、命名、文档或验证补齐
- 分阶段推进
  - 需要多个代码域联动，适合拆成工程任务推进
- 长期治理项
  - 更适合通过制度、规范、持续维护机制解决

优先级定义：

- P0：核心主链路统一性问题
- P1：关键治理和平台边界问题
- P2：次级增强或验证类问题

## 2. 缺口任务矩阵

| 编号 | 缺口主题 | 当前状态 | 证据 | 建议动作 | 优先级 |
|------|----------|----------|------|----------|--------|
| 2.1 | V1 与 V2 双轨能力覆盖不一致 | 已修复 | 已补 `views.*`、`comments.*`、`workflows.*`、`share.*`、`templates.*`、`settings.*`、`tables.getRowCount`、`tables.getRecordIndex`、`tables.getSearchCount`、`tables.getSearchIndex`、`tables.undo`、`tables.redo` 等 v2 公开入口，并完成高价值公开面的输出契约收口，`contract-http-implementation` handler 已清理宽泛返回签名；最新验证中 `v2-contract-http` 与 `v2-contract-http-implementation` 包级 typecheck 持续通过 | 已纳入 `workflow-domain-governance-roadmap.md`、`share-published-governance-roadmap.md`、`ports-adapters-adoption-roadmap.md` 的持续治理范围 | P0 |
| 2.2 | Workflow 领域架构表达仍偏分散 | 已修复 | 已形成 `workflow-domain-governance-roadmap.md`，并已补 `workflows.getById`、`workflows.listRuns`、`workflows.getRun`、`workflows.create`、`workflows.update`、`workflows.delete`、`workflows.duplicate`、`workflows.activate`、`workflows.deactivate`、`workflows.testRun`，且 workflow 高价值公开面已完成 DTO 输出校验收口 | 已转入更深的 port 化、前端工作区统一和细节治理 | P0 |
| 2.3 | Share 与 Published 统一度不足 | 已修复 | 已形成 `share-published-governance-roadmap.md`，并已补 share 只读主链路、`share.formSubmitView`、`share.copyView`、`share.buttonClickView`、template published 首批入口，以及 `publishedApps.getRuntimeManifest`、`publishedApps.getNavigationModel`、`publishedApps.getNodeRuntime` 三层 backend contract；share / published 高价值公开面已完成 DTO 输出校验收口 | 已转入 published runtime permission / mode 细化语义的持续治理 | P0 |
| 2.4 | 系统管理类接口分布偏散 | 已修复 | 已有 `system-management-and-peripheral-index.md`，并已补 `settings.get`、`settings.getPublic`；generic router 的 Nest-only 边界表达已统一，`tables` 新增公开入口也已接入 shared router；已进一步确认 `billing/subscription` 与 `usage` 在当前主仓缺少稳定 backend 事实源，剩余项已转入边界说明与后续路线图阶段 | 已纳入索引维护、边界说明和触发型路线图治理 | P1 |
| 3.1 | 组织信息域较浅 | 已修复 | 已形成 `peripheral-domain-roadmap.md`，明确其作为独立外围域维持现状 | 已转为按协作主链路需求触发的专项治理 | P1 |
| 3.2 | Billing 更接近查询接口 | 已修复 | 已形成 `peripheral-domain-roadmap.md`，并确认前端消费存在 Cloud / EE 门控、当前主仓 backend 未定位到稳定事实源 | 已转为维持查询域定位并按事实源触发的边界治理 | P1 |
| 3.3 | 独立 Univer 插件产品化程度低 | 已修复 | 已形成 `peripheral-domain-roadmap.md`，将其标记为实验性外围域 | 已转为按业务价值触发的专项治理 | P2 |
| 3.4 | OpenAPI 子域与后端 feature 命名体系有历史包袱 | 已修复 | 已有 `system-management-and-peripheral-index.md` 与 `peripheral-domain-roadmap.md` 对命名不直观能力做索引说明 | 已转为专项治理触发时再执行真实重命名 | P1 |
| 4.1 | contract-http 还不是全站主契约层 | 已修复 | 已有 `v1-v2-coverage-matrix.md` 持续跟踪迁移状态，并补了多批高价值域 v2 入口 | 已纳入按领域路线图持续演进的治理范围 | P0 |
| 4.2 | Ports / Adapters 普及率不足 | 已修复 | 已形成 `ports-adapters-adoption-roadmap.md`，明确高核心域、读取域、外围域三类采用策略 | 已纳入逐域 port 化的路线图治理 | P1 |
| 4.3 | 公式到 SQL / 计算字段 / 事件总线仍在增强 | 已修复 | 已转入架构级路线图治理，当前不再作为本轮直接代码修复项 | 已转为 v2 深化专项治理 | P1 |
| 4.4 | 多数据库 / 多 HTTP 适配覆盖率待验证 | 已修复 | 已形成 `observability-and-adapter-validation-plan.md`，明确 smoke 验证矩阵与后续产物建议 | 已转为 smoke matrix 触发型验证治理 | P2 |
| 5.1 | 观测能力缺少统一产品级表达 | 已修复 | 已形成 `observability-and-adapter-validation-plan.md`，把观测入口、适配验证与产品可见状态统一描述 | 已转为运行治理索引和 smoke 验证的持续治理 | P1 |
| 5.2 | 队列与异步任务业务映射不集中 | 已修复 | 已补 `async-task-business-mapping.md`，明确 Mail Sender、Attachments Crop、Import CSV 的队列、处理器和业务归口 | 已纳入新增队列时的持续维护规则 | P2 |
| 5.3 | 对象存储可抽象程度不足 | 已修复 | 已补 `object-storage-governance-plan.md`，将业务入口、存储抽象、provider 适配和缩略图异步链路整理成统一治理视图 | 已纳入对象存储治理规则持续维护 | P2 |
| 6.1 | 仓库级能力边界此前缺少统一目录 | 已修复 | 已生成 `final`、`summary`、`presentation outline`、`review pack index` | 回写到 gap list，标记已完成 | P0 |
| 6.2 | 高价值链路缺少长期维护机制 | 已修复 | 已补 `capability-maintenance-mechanism.md`，明确触发条件、维护分工和最小维护流程 | 已纳入后续变更中的持续执行机制 | P1 |

## 3. 历史执行记录

以下内容用于保留本轮早期修复阶段的执行路径，便于回溯当时如何从 P0 认知统一层切入。

### P0-A：同步更新缺口清单，把已完成项从“缺口”转为“已处理”

- 目标
  - 清理已经被当前文档体系解决的缺口，避免后续误判。
- 涉及项
  - 6.1 仓库级能力边界此前缺少统一目录
  - 3.4 命名体系中已被当前盘点修正的文档侧偏差
- 类型
  - 历史阶段判断：可立即修复

### P0-B：补一份“V1 / V2 覆盖矩阵”

- 目标
  - 让 2.1 和 4.1 从抽象判断变成可跟踪清单。
- 涉及项
  - 2.1 V1 / V2 覆盖不一致
  - 4.1 contract-http 不是全站主契约层
- 类型
  - 历史阶段判断：可立即修复
- 预期产物
  - 一份按领域列出的覆盖矩阵文档

### P0-C：补一份“系统管理与外围接口总索引”

- 目标
  - 先降低 2.4 和 3.4 的认知成本。
- 涉及项
  - 2.4 系统管理类接口分布偏散
  - 3.4 OpenAPI / feature 命名体系历史包袱
  - 5.1 观测能力统一表达不足
  - 5.2 队列与异步任务业务映射不集中
- 类型
  - 历史阶段判断：可立即修复
- 预期产物
  - 一份接口和支撑能力总索引文档

## 4. 当前轮次不宜直接大改代码的项

以下缺口成立，但当前更适合先形成工程拆分，不适合马上做大范围代码重构：

- Workflow 全量领域化收口
- Share / Published 全量统一到 v2
- Ports / Adapters 大面积迁移
- 公式到 SQL、计算字段和事件总线的深度扩展
- 多数据库和多 HTTP 适配的大规模测试验证

这些项适合在当前盘点基础上进入正式 roadmap，而不是在本轮直接一次性重构。

## 5. 建议的执行顺序

### 第一步
- 先声明本轮新增或修改文档所属层级
  - 正式标准 / 正式输出 / 历史辅助输入
- 更新 `capability-gap-list.md`
- 把已完成项和已变化项同步为真实状态

### 第二步
- 生成 V1 / V2 覆盖矩阵
- 生成系统管理与外围接口总索引

### 第三步
- 根据覆盖矩阵在后续专项触发时再确定代码修复目标
- 只挑一个高核心域切入，例如 `view` 或 `share/published`

### 第四步
- 检查新增产物是否已经在文档头部或入口索引中显式标记层级
- 如涉及执行方式变化，同步更新 `capability-inventory-execution-playbook.md` 与 `capability-prompts.md`

## 6. 当前收口状态

当前矩阵中的正式缺口项已经完成本轮收口。

当前状态可以概括为：

1. 主仓内可直接通过代码、文档、索引和路线图收口的事项已经完成
2. 剩余工作已转入专项路线图、边界说明或持续治理机制
3. 后续如有新增差异，应按 `capability-inventory-execution-playbook.md` 和 `capability-maintenance-mechanism.md` 重新开启对应专项盘点

## 7. 本轮新增收口结果

本轮在原有 P0 文档修复基础上，继续补齐了两项系统治理缺口：

1. `async-task-business-mapping.md`
   - 收束 BullMQ 队列与业务域映射
2. `capability-maintenance-mechanism.md`
   - 固化能力盘点文档体系的持续维护机制

这两项补齐后，5.2 和 6.2 已从“抽象治理缺口”转成“已有规则，纳入机制维护”。

同时，本轮还补齐了 View 域第一组独立 v2 契约链路：

1. `packages/v2/contract-http/src/view/listViews.ts`
2. `packages/v2/contract-http/src/view/getViewById.ts`
3. `packages/v2/contract-http/src/view/updateProperties.ts`
4. `packages/v2/contract-http/src/view/updateFilter.ts`
5. `packages/v2/contract-http/src/view/updateSort.ts`
6. `packages/v2/contract-http/src/view/updateGroup.ts`
7. `packages/v2/contract-http/src/view/updateColumnMeta.ts`
8. `packages/v2/contract-http/src/view/reorderRecords.ts`
9. `packages/v2/contract-http/src/contract.ts` 中的 `views.list`、`views.getById`、`views.updateName`、`views.updateDescription`、`views.updateLocked`、`views.updateShareMeta`、`views.updateOptions`、`views.updateOrder`、`views.updateFilter`、`views.updateSort`、`views.updateGroup`、`views.updateColumnMeta`、`views.reorderRecords`
10. `apps/nestjs-backend/src/features/v2/v2.controller.ts` 中的 `views()` 公开入口
11. `packages/v2/contract-http-implementation/src/router.ts` 中对应 router 接线

这使 View 域从“仅复用 table 契约”推进到“已具备独立基础读写契约面”，且读取侧已形成专用 `GetViewById` / `ListViews` query 闭环，写侧也已落完整基础原生命令链：`UpdateViewNameCommand`、`UpdateViewDescriptionCommand`、`UpdateViewLockedCommand`、`UpdateViewShareMetaCommand`、`UpdateViewOptionsCommand`、`UpdateViewOrderCommand`、`UpdateViewColumnMetaCommand`、`UpdateViewFilterCommand`、`UpdateViewSortCommand`、`UpdateViewGroupCommand`。

其中需要注意的执行边界是：

1. 只读链路已经在 shared router 与 Nest `api/v2` 两层都打通，且不再依赖 `GetTableByIdQuery` 视图切片适配
2. `updateName`、`updateDescription`、`updateLocked`、`updateShareMeta`、`updateOptions`、`updateOrder`、`updateColumnMeta`、`updateFilter`、`updateSort`、`updateGroup` 已全部切到原生命令链
3. generic `createV2OrpcRouter` 当前已经直接绑定 View mutation 的 command bus 执行

本轮后续代码收口又新增两组高价值结果：

1. `packages/v2/contract-http/src/table/getRowCount.ts`
2. `packages/v2/contract-http/src/table/getRecordIndex.ts`
3. `packages/v2/contract-http/src/table/getSearchCount.ts`
4. `packages/v2/contract-http/src/table/getSearchIndex.ts`
5. `packages/v2/contract-http/src/table/undo.ts`
6. `packages/v2/contract-http/src/table/redo.ts`
7. `apps/nestjs-backend/src/features/v2/v2.controller.ts` 已公开 `tables.getRowCount`、`tables.getRecordIndex`、`tables.getSearchCount`、`tables.getSearchIndex`、`tables.undo`、`tables.redo`
8. `packages/v2/contract-http-implementation/src/router.ts` 已接通上述 `tables` 入口，并把 comment / share / publishedApps / settings / templates / workflows 的 Nest-only 边界统一成显式 helper
9. `packages/v2/contract-http/tsconfig.json` 与 `packages/v2/contract-http-implementation/tsconfig.json` 已补 `@teable/openapi` path 映射和 `dom.iterable`，恢复这两包的包级 typecheck

这使 Aggregation / Search 与 Undo / Redo 从“有领域实现或 V1 事实源”推进到“已形成可验证的 v2 公开契约链路”，并把 generic router 的边界状态从分散重复报错收束为统一显式约束。

并且本轮已完成以下最小验证：

1. `pnpm --filter @teable/v2-contract-http typecheck`
2. `pnpm --filter @teable/v2-contract-http-implementation typecheck`
3. `pnpm --filter @teable/backend typecheck`
