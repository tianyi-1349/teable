# Capability Gap List

> 文档分层：正式输出。
> 
> 这份文档记录正式能力盘点之后仍然成立的结构性缺口，以及已经被文档体系消化的历史缺口状态。

## 1. 清单目的

本清单基于以下两份产物反推能力缺口：
- `/workspace/capability-inventory-final.md`
- `/workspace/capability-inventory-summary.md`

这里的“缺口”分为四类：

1. 已有能力但链路未完全闭环
2. 已有能力但 V1 / V2 覆盖不一致
3. 已有代码骨架但产品化程度不足
4. 系统支撑层分散，后续需要统一收束

本清单不讨论“产品是否需要新增某功能”，只讨论从仓库现状能直接推导出的建设空白。

### 当前状态说明

本清单当前已进入“盘点后收口阶段”。

这里保留的各类缺口主题，主要用于说明本轮盘点最初识别出的结构性问题是什么，以及这些问题后来如何被代码、文档、路线图和治理机制收口。

当前正式状态以 `capability-gap-task-matrix.md` 为准，因此这些缺口主题分为两类：

1. 仍然成立的结构性缺口
   - 语义上仍代表长期治理方向，但本轮已转入路线图、边界说明或持续维护机制
2. 已被本轮盘点文档体系部分消化的缺口
   - 已在本清单中显式标记，避免后续误判

本轮修订后，以下原则生效：

- 已通过盘点文档解决“能力可见性”和“高价值链路可见性”的问题，不再视为原始未处理状态
- 仍涉及 V1 / V2 统一、Workflow 领域收敛、Share / Published 统一、系统管理边界收束的条目，继续保留为结构性主题，但本轮执行状态已经在矩阵中收口

## 2. 高优先级缺口

### 2.1 V1 与 V2 双轨能力覆盖不一致

- 现状
  - V1 已经覆盖绝大多数核心业务链路。
  - V2 已经有 CQRS、contract-http、Ports/Adapters 和多类 command/query，但覆盖面仍低于 V1。
- 直接表现
  - Base、Table、Field、Record、Comment、Undo/Redo 已有 v2 实现基础。
  - Share、Published、系统管理、部分自动化和外围接口仍主要依赖 V1 主链路。
- 当前修订说明
  - View 域已确认存在 v2 领域内核，并且本轮已补 `views.list`、`views.getById`、`views.updateName`、`views.updateDescription`、`views.updateLocked`、`views.updateShareMeta`、`views.updateOptions`、`views.updateOrder`、`views.updateFilter`、`views.updateSort`、`views.updateGroup`、`views.updateColumnMeta`、`views.reorderRecords` 与 `api/v2` 独立公开入口。
  - View 基础读写链路现已全部形成专用 `view` 读写闭环，shared router 与 Nest `api/v2` 双层都已接通 command/query bus。
  - Comment 域本轮已新增基础读入口：`comments.list`、`comments.getById`、`comments.getRecordCount`、`comments.getTableCount`，并补了 `comments.getSubscribeDetail`、`comments.subscribe`、`comments.unsubscribe`，说明该域已经形成基础 `contract-http + api/v2` 公开迁移面。
- Aggregation / Search 本轮已补 `tables.getRowCount`、`tables.getRecordIndex`、`tables.getSearchCount`、`tables.getSearchIndex`，并继续补 `tables.getAggregation`、`tables.getGroupPoints`、`tables.getCalendarDailyCollection`、`tables.getTaskStatusCollection` 的 v2 contract 与 Nest adapter 接线；当前高级聚合执行层仍复用 v1 service。Undo / Redo 本轮已补 `tables.undo`、`tables.redo`，并同步打通 Nest `api/v2`、`contract-http`、`contract-http-implementation` 与 generic router 四层链路。
- 当前剩余缺口聚焦于 share / published / plugin 等更高层产品能力，以及 comment / share / published / template / setting / workflow 在 generic router 侧仍需显式依赖 Nest adapter 的边界统一。
- 当前处理补充
  - 已通过 `v1-v2-coverage-matrix.md`、`workflow-domain-governance-roadmap.md`、`share-published-governance-roadmap.md`、`ports-adapters-adoption-roadmap.md` 把剩余迁移工作转成持续执行的路线图，不再停留在抽象缺口描述。
- 缺口本质
  - 架构演进方向明确，但核心业务域尚未形成统一的新架构闭环。
- 影响
  - 增加维护成本
  - 增加测试矩阵复杂度
  - 容易出现同能力在两代实现中的行为偏差
- 建议优先级：P0

### 2.2 Workflow 领域已有完整功能，但架构表达仍偏分散

- 现状
  - Workflow 在用户能力上已经很强，含 CRUD、运行、AI 草稿、历史、能力查询。
  - 后端功能集中在 `features/workflow`，前端在 `features/app/automation`，契约在 `openapi/src/automation/workflow/*`。
- 当前修订说明
  - 本轮已新增 `workflows.list`、`workflows.getCapabilities` 两条 v2 公开入口，说明该域已经形成基础 `contract-http + api/v2` 公开迁移面。
  - 后续又补齐 `workflows.getById`、`workflows.listRuns`、`workflows.getRun` 三条只读入口，workflow 的读取面已形成第一批完整公开链路。
  - 当前又补齐 `workflows.create`、`workflows.update`、`workflows.delete`、`workflows.duplicate`，workflow 的主 CRUD 入口也已进入 v2。
  - 当前又补齐 `workflows.activate`、`workflows.deactivate`，workflow lifecycle 主链路已在后续修订中全部补齐。
  - 当前又补齐 `workflows.testRun`，workflow 的读取、CRUD 和 lifecycle 主链路都已进入 v2。
  - 当前又补齐 `workflows.aiCreateDraft`，AI draft 已进入 v2 公开主链路；同时前端工作区已通过 `updateWorkflow` 承载草稿节点编辑。
- 当前又补齐 `workflows.applyUpdate`，独立 apply-update 语义已进入 v2 公开主链路，并由 backend 刷新 `activeSnapshotId` 指向新 snapshot。
- 当前又补齐 `workflows.testNode`、`workflows.triggerWebhook`、`workflows.triggerSchedule`、`workflows.triggerFormSubmitted`、`workflows.triggerEmailReceived`，workflow 的 node debug 与 direct trigger 入口已进入 v2 公开主链路。
- `schedule` 当前已具备最小正式调度基础设施：active workflow 可按 `manual / interval / cron` 配置同步 backend repeat job。
- `webhook` 当前已具备更完整的最小正式契约面：支持可选 secret、可选 HMAC-SHA256 signature 校验、时间窗校验、公开 header 契约说明，以及 workflow 级 body size limit / rate limit / 分层错误语义。
- workflow 当前已具备 9 类最小 action runtime：`runScript`、`aiGenerate`、`updateRecords`、`createRecords`、`queryRecords`、`sendEmail`、`httpRequest`、`condition`、`loop`。
- AI authoring 当前已提升到最小多形态/多节点/activation-ready 草稿生成：AI draft 已可生成多类 trigger/action 组合、最小多节点 actions、fieldMappings 与 `testPlan(input / expectedActionKinds / activationChecks)`，而不是固定单一草稿模板。
  - 已补 `workflow-domain-governance-roadmap.md`，明确读取、CRUD、生命周期三层推进顺序。
- 缺口本质
  - 功能完整，但 V2 领域化表达和统一执行模型仍有继续下沉空间。
- 影响
  - 后续如果扩展 Action / Trigger，会继续放大实现分散度。
- 建议优先级：P0

### 2.3 分享与 Published 能力在“产品成熟度”和“新架构统一度”之间存在落差

- 现状
  - 分享视图、分享 Base、Published App 前端运行时都已成熟。
  - v2 `published` 已存在，但仍属于演进中。
- 当前修订说明
  - 本轮已新增 `share.getView`、`share.getViewAggregations`、`share.getViewRowCount`、`share.getViewRecords`、`share.getViewGroupPoints`、`share.getViewLinkRecords`、`share.getViewCollaborators`、`share.getViewCalendarDailyCollection`、`share.getViewSearchCount`、`share.getViewSearchIndex` 等 v2 公开入口，并新增 `templates.listPublished`、`templates.getById`、`templates.getPermalink`、`templates.incrementVisit`，说明 share 域只读主链路与 published/template 公开入口已经完成本轮 `contract-http + api/v2` 公开迁移收口。
- 当前又补齐 `share.formSubmitView`、`share.copyView`、`share.buttonClickView`，share 的核心交互入口也已完成 v2 公开收口。
- 当前已补 `publishedApps.getRuntimeManifest`、`publishedApps.getNavigationModel`、`publishedApps.getNodeRuntime`，published app runtime 的基础 backend contract 已进入 `contract-http + api/v2`，并由 `BaseShareAuthService` + `BaseNodeService` 提供最小事实源。
- 当前又完成 workflow / share / comment / template / setting / published-app 高价值公开面的输出契约收口，`contract-http-implementation` handler 已清理宽泛返回签名；当前最新验证中，`v2-contract-http` 与 `v2-contract-http-implementation` 包级 typecheck 继续保持绿色，只剩 `table/dto.ts` 内 3 处动态配置边界保留宽泛表达。
- 已补 `share-published-governance-roadmap.md`，明确 share 交互入口和 published runtime contract 的持续治理顺序。
- 缺口本质
  - 用户面能力成熟，领域内核和新架构统一度不足。
- 影响
  - 公开访问链路后续扩展时，规则、权限、渲染和契约容易继续分散。
- 建议优先级：P0

### 2.4 系统管理类接口分布偏散

- 现状
  - 系统设置、Billing、Health、Pixel、Dashboard、搜索、聚合、DB 连接等能力都存在。
  - 这些能力在 feature 组织和 OpenAPI 子域上分散度较高。
- 缺口本质
  - 已有能力够用，但管理平面缺少更统一的能力边界。
- 影响
  - 后续做管理后台、权限治理、实例配置治理时成本偏高。
- 当前修订说明
  - 本轮盘点已经补齐系统管理类能力的文档侧索引和真实路径识别，例如 `admin/setting`、`billing/subscription`、`health`、`aggregation`、`chat` 等。
  - 当前剩余缺口主要是代码结构和治理边界的统一，而不再是“能力位置不可见”。
  - 本轮已新增 `settings.get`、`settings.getPublic` 两条 v2 公开入口，说明系统管理域已开始从 setting 读取面进入 `contract-http + api/v2` 迁移路径。
  - 当前又已统一 `packages/v2/contract-http-implementation/src/router.ts` 的 Nest-only 边界表达，并补齐 `tables` 域新增公开入口在 generic router 的接线；剩余 comment / share / published / template / setting / workflow 仍保留显式 Nest adapter 边界，当前已从“隐性不一致”转为“显式边界约束”。
  - 当前已进一步确认 `billing & usage` 在前端按 Cloud / EE 条件消费，但当前主仓 backend 未定位到稳定 controller / service 事实源，因此该域本轮收口为仓库边界受限项。
  - 已补 `peripheral-domain-roadmap.md` 与 `observability-and-adapter-validation-plan.md`，并将 billing、organization、外围命名、观测与适配验证正式收口到路线图治理与边界说明。
- 建议优先级：P1

## 3. 中优先级缺口

### 3.1 组织信息域是局部实现，离协作主链路仍有距离

- 现状
  - 组织、部门、用户信息查询能力存在。
  - 与 Space、协作者、邀请主链路相比，覆盖范围和集成深度较浅。
- 缺口本质
  - 组织域还没有形成与协作域同级的成熟业务面。
- 建议优先级：P1

### 3.2 Billing & Usage 能力更接近“外围查询接口”，还不是完整业务域

- 现状
  - 已有 `billing/subscription/*`、`usage/*` 的 openapi 契约。
  - 当前主仓中未定位到对应稳定 backend controller / service，实现面更接近前端消费的外围查询契约。
- 缺口本质
  - 计费域仍偏轻量，缺少更完整的业务闭环表达。
- 当前修订说明
  - 已补 `peripheral-domain-roadmap.md`，明确当前 billing 先维持查询型外围域定位，待后端事实源进一步明确后再进入深迁移。
  - 当前又确认前端消费存在 `useIsCloud()` / `useIsEE()` 门控，而主仓 backend 未定位到对应稳定 controller / service，说明该域当前还带有仓库边界限制。
- 建议优先级：P1

### 3.3 独立 Univer 插件已有代码基础，但产品化程度较低

- 现状
  - 存在 `packages/plugins/univer-plugins/`。
  - 与主插件系统相比，成熟度被识别为局部实现。
- 缺口本质
  - 仍像实验性能力，而不是平台主扩展面的一部分。
- 当前修订说明
  - 已补 `peripheral-domain-roadmap.md`，明确其继续保留实验性定位。
- 建议优先级：P2

### 3.4 OpenAPI 子域与后端 feature 命名体系存在历史包袱

- 现状
  - 多数链路已能对齐。
  - 部分系统接口和业务域在目录命名、controller 命名和 feature 命名上不完全直观。
- 缺口本质
  - 不是功能缺失，而是认知和治理成本偏高。
- 当前修订说明
  - 本轮已通过 `capability-inventory-final.md` 对多条高价值链路做了文件级校准。
  - 当前剩余缺口集中在“长期命名收束”和“索引维护机制”，而不再是盘点阶段的命名误判。
  - 已补 `peripheral-domain-roadmap.md`，把命名问题转入索引维护与后续专项治理。
- 建议优先级：P1

## 4. 架构级缺口

### 4.1 contract-http 还没有成为全站统一主契约层

- 现状
  - V1 OpenAPI 是当前最稳定主契约层。
  - V2 contract-http 已经可用，但覆盖面有限。
- 缺口本质
  - 新契约层方向明确，迁移仍在中段。
- 当前修订说明
   - 已通过 `v1-v2-coverage-matrix.md` 持续跟踪迁移状态，并通过多批高价值 v2 公开入口和专项路线图把后续治理事项收束为可执行 backlog。
- 建议优先级：P0

### 4.2 Ports / Adapters 的“理论完备性”高于“业务普及率”

- 现状
  - v2 已定义多种 port。
  - 但并非所有高价值业务链路都已完全迁入同一套 port 模式。
- 缺口本质
  - 架构设计充分，业务落地仍需推进。
- 当前修订说明
  - 已补 `ports-adapters-adoption-roadmap.md`，明确高核心域、读取域、外围域的采用顺序。
- 建议优先级：P1

### 4.3 公式到 SQL、计算字段、事件总线仍在增强阶段

- 现状
  - 三者都已有明确模块和代码组织。
  - 仍处于“能力存在但不算仓库主成熟面”的阶段。
- 缺口本质
  - 这些能力是未来高扩展性的重要抓手，目前还没有达到最核心主链路的成熟度。
- 当前修订说明
  - 当前已转入架构级路线图治理，不再作为本轮直接代码修复项。
- 建议优先级：P1

### 4.4 多数据库和多 HTTP 框架支持已见方向，仍需验证真实覆盖率

- 现状
  - v2 已声明 SQLite / PostgreSQL / MySQL 和 Express / Fastify 适配。
  - 但仓库主运行面仍围绕现有主后端栈。
- 缺口本质
  - 适配存在，规模化落地程度仍需继续验证。
- 当前修订说明
  - 已补 `observability-and-adapter-validation-plan.md`，明确最小 smoke 验证矩阵与后续产物建议。
- 建议优先级：P2

## 5. 系统支撑层缺口

### 5.1 观测能力存在，但产品级 SLA 视角仍未在能力清单中形成统一表达

- 现状
  - 有日志、OpenTelemetry、Sentry、健康检查。
- 缺口本质
  - 支撑能力存在，统一的运行指标视图和治理视角尚未显式收束。
- 当前修订说明
  - 观测能力已在最终能力清单和评审包中被显式列出。
  - 当前治理主题已从“是否可见”转为“是否形成统一运行治理视图”。
  - 已补 `observability-and-adapter-validation-plan.md`，把该项转入统一治理计划。
- 建议优先级：P1

### 5.2 队列与异步任务在结构图中明确存在，但业务域映射不够集中

- 现状
  - 结构图明确写到 BullMQ 队列角色。
  - 最终能力清单中更偏向“支撑能力说明”，没有形成清晰业务归口清单。
- 缺口本质
  - 异步执行基础存在，治理视图还可继续补强。
- 当前修订说明
  - 本轮已补 `async-task-business-mapping.md`，把 Mail Sender、Attachments Crop、Import CSV 的真实队列入口、处理器和业务归口显式收束。
   - 该项当前已从“缺少映射”转为“纳入后续新增队列时的持续维护规则”。
- 建议优先级：P2

### 5.3 对象存储接入已存在，但可抽象程度还有继续提升空间

- 现状
  - 附件上传链路完整。
  - 主要显式落在 attachments 域。
- 缺口本质
  - 文件能力对业务层已经可用，作为统一基础设施层仍可继续抽象。
- 当前修订说明
  - 本轮已补 `object-storage-governance-plan.md`，将业务入口层、业务编排层、存储能力层和 provider 适配层整理成统一治理视图。
   - 当前该项已从“缺少统一视图”转为“已纳入治理规则持续维护”。
- 建议优先级：已处理，转持续治理

## 6. 治理与文档缺口

### 6.1 已有成熟能力很多，但仓库级能力边界此前缺少统一目录

- 现状
  - 本次盘点前，能力主要散落在代码、OpenAPI、页面和 feature 目录中。
- 缺口本质
  - 能力可见性不足，评审和规划成本偏高。
- 当前处理
  - 已通过 `capability-inventory-final.md` 和 `capability-inventory-summary.md` 初步补齐。
- 当前修订结论
  - 该缺口已被以下产物实质性处理：
    - `capability-inventory-final.md`
    - `capability-inventory-summary.md`
    - `capability-inventory-presentation-outline.md`
    - `capability-gap-task-matrix.md`
    - `capability-review-pack-index.md`
   - 因此该项当前已经完成收口，并转入持续维护机制。
- 建议优先级：已处理，转长期维护

### 6.2 高价值链路已有目录，但缺少长期维护机制

- 现状
  - 当前已经生成高价值链路清单。
- 缺口本质
  - 后续如果能力持续变化，仍需要维护机制保证盘点文档不过期。
- 当前修订说明
  - 能力链路目录本身已建立，本轮已新增 `capability-maintenance-mechanism.md` 作为持续维护规则。
   - 当前执行重点是后续变更中持续遵循该机制。
- 建议优先级：P1

## 7. 历史处理顺序

### 第一阶段：先解决主链路统一问题

1. 提升 V2 在核心业务域的覆盖率
2. 收敛 Workflow 领域表达
3. 收敛 Share / Published 相关领域能力
4. 统一 contract-http 与 V1 OpenAPI 的迁移策略

### 第二阶段：再解决平台层治理问题

1. 收束系统管理类接口边界
2. 收束组织域与 Billing 域表达
3. 提升观测、异步任务、对象存储的统一治理视图

### 第三阶段：补齐长期机制

1. 将能力盘点纳入架构评审输入
2. 将高价值链路清单纳入版本迭代检查
3. 将成熟度标记纳入 roadmap 管理

## 8. 最终判断

1. 当前仓库最大的缺口不是“功能不够多”，而是“成熟主链路与新架构演进之间还没有完全统一”。
2. 当前仓库最值得优先投入的方向不是扩散新能力，而是统一 Base / Table / Field / Record / Share / Workflow 这些核心链路的架构表达。
3. 一旦 v2 覆盖率和系统治理边界继续提升，这个仓库会从“功能完整的协作平台”进一步演进成“结构统一、扩展性强的平台化内核”。

## 9. 本轮修订后的执行口径

当前清单的执行口径调整为：

1. 本轮已按结构性缺口完成主仓内可直接收口事项
   - 2.1 V1 / V2 双轨能力覆盖不一致
   - 2.2 Workflow 领域收敛
   - 2.3 Share / Published 统一度不足
   - 4.1 contract-http 仍不是全站主契约层
2. 已将通过盘点文档解决的“可见性问题”从未处理缺口中剥离
3. 后续将本清单与 `capability-gap-task-matrix.md` 配合使用，避免重复对已解决问题再次立项
4. 后续新增或更新盘点相关文档时，必须先声明所属层级
   - 正式标准：执行手册、提示词模板、准出规则
   - 正式输出：能力清单、缺口清单、任务矩阵、覆盖矩阵、汇报材料
   - 历史辅助输入：结构地图、历史初稿、旧扫描材料

## 10. 当前总状态

当前这份缺口清单的正式收口结论如下：

1. 主仓内可通过代码、文档、索引和路线图直接收口的事项已经完成
2. 剩余差异当前已经转入专项路线图、仓库边界说明或持续治理机制
3. 后续如果代码事实再次变化，应以 `capability-gap-task-matrix.md` 为状态主表重新开启对应专项盘点
