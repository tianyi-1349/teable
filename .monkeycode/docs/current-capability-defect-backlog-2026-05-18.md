# 当前功能缺陷与能力缺口执行清单

> 文档分层：正式输出。
>
> 本文基于当前本地仓库代码、正式盘点文档、规格文档与路线图文档，整理截至 2026-05-18 仍然成立的功能缺陷、能力缺口和未完成事项。

## 1. 判定口径

本清单只记录以下三类事项：

1. 代码中已经有事实证据，且功能能力仍未闭环
2. 已有正式规格或路线图，但代码实现尚未完整兑现
3. 会影响全局性、一致性、稳定性的结构性未完成项

以下内容不纳入本清单：

1. 已完成并已通过正式矩阵收口的事项
2. 纯记忆文件、调试产物或一次性过程信息
3. 没有代码证据、只有猜测的潜在方向

## 2. 总体判断

当前仓库已经完成一轮大规模收口，主干代码可以通过：

1. `pnpm g:typecheck`
2. `pnpm g:lint`
3. `pnpm g:lint-styles`

当前剩余缺口主要集中在以下五类：

1. Published App Runtime 主线已完成，剩余真实用户态访问模型治理尾差
2. Automation / Workflow 与官方能力仍有产品化差距
3. V2 契约统一与执行模型统一仍在过渡期
4. Ports / Adapters 在高层业务域的采用深度不一致
5. 多适配器与多运行组合缺少完整真实 smoke 验证

## 3. P0 清单

### P0-1 Published App Runtime 主线已完成，剩余统一治理尾差

- 类别：功能缺陷 + 能力缺口
- 约束维度：全局性 / 一致性 / 稳定性
- 当前证据：
  - `.monkeycode/specs/published-app-runtime/requirements.md`
  - `share-published-governance-roadmap.md`
  - `.monkeycode/docs/published-app-runtime-pr1-pr9-acceptance-report-2026-05-20.md`
- 当前状态：
  - backend 已具备 `publishedApps.getRuntimeManifest`、`getNavigationModel`、`getNodeRuntime` 入口
  - 当前 runtime manifest 已稳定提供 `defaultUrl`、`defaultNodeId`、`permissions`、`mode` 等字段
  - runtime 层 `defaultNodeId` 术语已与规格和前端 runtime consumer 对齐
  - authenticated `App` 路由与 share `App` 路由都已进入统一 Published Runtime 壳层
  - `PublishedAppContext`、navigation model、desktop / tablet / mobile / embed / PWA shell、preview / validation、resource renderer 已落地
  - PR1-PR9 已完成到当前规格范围内的可验收状态
  - 当前剩余缺口集中在 share / published / template 统一访问模型治理，不再是 Published Runtime 主线能力缺失
- 仍未完成的能力：
  - 仍缺基于真实登录、seed 数据和后端 route fixture 的全链路 e2e
  - share / published / template 的统一访问契约仍需要真实业务 fixture 持续验证
- 影响：
  - published app 主线产品面已经成型，后续风险集中在统一契约继续扩展时的命名分叉和入口分叉
  - share / published / template publish 的统一访问模型仍需继续收口
- 建议动作：
  - 将 Published Runtime 主线从 P0 闭环项下沉为统一治理尾差项
  - 后续聚焦真实登录、seed 数据和后端 route fixture 的全链路 e2e
  - 继续用 `defaultUrl + defaultNodeId + permission/mode` 维护 share / published / template 统一访问模型
- 建议验证：
  - `pnpm --filter @teable/app typecheck`
  - `E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-access-model.spec.ts e2e/pages/published/published-business-flow.spec.ts e2e/pages/published/published-route-entry.spec.ts --project='Desktop Chrome'`

### P0-2 Automation / Workflow 与官方能力仍有明显差距

- 类别：功能缺陷 + 能力缺口
- 约束维度：全局性 / 一致性 / 稳定性
- 当前证据：
  - `.monkeycode/specs/automation-official-parity/requirements.md`
  - `workflow-domain-governance-roadmap.md`
- 当前状态：
  - workflow CRUD、读取、activate / deactivate、testRun 的第一批 v2 公开入口已存在
  - `workflows.aiCreateDraft` 已进入 `packages/v2/contract-http`、`contract-http-implementation` 与 Nest `api/v2` 主链路
  - 当前 AI draft 已可通过 v2 入口直接复用 `WorkflowService.aiCreateWorkflowDraft(...)`
  - `WorkflowService.updateWorkflow(...)` 已支持基于 `ro.nodes` 的 draft node editing，当前 v2 `workflows.update` 已可承载草稿节点增删改
  - `WorkflowService.applyUpdateWorkflow(...)` 已新增独立语义，当前 v2 `workflows.applyUpdate` 可将当前 draft 发布为新的 active snapshot 并保持激活态
  - `WorkflowRunnerService` 已写入 `workflowRunStep` 级别的 action history，`recordCreated`、`recordUpdated` 与 `recordMatchesConditions` 三类核心 trigger 已进入最小 runner 主链路
  - `schedule` 已进入后端直连运行链路，并已具备前端 draft 创建与页面手动触发入口
  - `schedule` 已新增最小正式调度基础设施：active workflow 在 backend 中可按 `manual / interval / cron` 配置同步 BullMQ repeat job，deactivate / delete 时自动撤销，应用启动时自动恢复
  - `webhook` 已进入最小后端直连运行链路，并已具备前端 draft 创建、URL 展示与页面手动触发入口
  - `webhook` 已新增更完整的最小正式契约面：支持可选 `secret`、可选 HMAC-SHA256 `signatureSecret` 校验、时间窗校验、公开 header 契约说明，以及 workflow 级 body size limit / rate limit / 分层错误语义
  - `form submitted` 已进入最小后端直连运行链路，并已具备前端 draft 创建与页面手动触发入口
  - `email received` 已进入最小后端直连运行链路，并已具备前端 draft 创建与页面手动触发入口
  - `workflow / node test` 已进入最小交互闭环：当前已具备 workflow test、自定义 JSON input、node test、节点级 `testStatus/testOutput` 回写与页面展示
  - workflow action runtime 已从 5 类扩到 9 类最小闭环：`runScript`、`aiGenerate`、`updateRecords`、`createRecords`、`queryRecords`、`sendEmail`、`httpRequest`、`condition`、`loop`，其中 `loop` 已进入最小 runtime 与前端工作区
  - AI authoring 已从固定 `buttonClick + runScript` 草稿提升到最小多形态草稿生成，当前可输出多类 trigger/action 组合草稿，并支持最小多节点 actions、`fieldMappings` 与 `testPlan(input / expectedActionKinds / activationChecks)`
  - 规格文档明确保留多项未来工作
- 仍未完成的能力：
  - schedule 的更完整产品化能力，例如更丰富日历布局展示
  - webhook 的更深正式化，例如真实产品报表页、长周期趋势分析与产品化观测面
  - workflow action 的更深产品化能力，例如更多逻辑节点、真实分支控制与更强字段映射体验
  - AI authoring 的更深能力，例如更稳定的 activation-ready 测试编排自动执行与更强 field mapping 自动补全
- 影响：
  - 当前 automation 已从“只有基础 CRUD / run 入口”推进到“含 AI draft 的 Phase 1.5 闭环”，距离官方产品能力仍有明显差距
  - 前后端展示能力与后端真实可执行能力仍有进一步对齐需求
- 建议动作：
  - 继续补 schedule 的更丰富日历布局展示
  - 继续扩 webhook 审计真实产品报表页与长周期趋势分析
  - 然后继续扩 workflow logic/runtime 的更深能力与 AI activation-ready 编排
- 建议验证：
  - `pnpm --filter @teable/backend typecheck`
  - `pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-schedule.service.spec.ts src/features/workflow/workflow.service.spec.ts`
  - `pnpm --filter @teable/app exec vitest run src/features/app/automation/Pages.spec.ts`
  - `pnpm --filter @teable/app typecheck`

### P0-3 V2 还未成为全站统一主契约层

- 类别：能力缺口
- 约束维度：全局性 / 一致性
- 当前证据：
  - `capability-gap-list.md`
  - `v1-v2-coverage-matrix.md`
  - `ports-adapters-adoption-roadmap.md`
- 当前状态：
  - 高价值入口已经大量进入 `packages/v2/contract-http`
  - workflow schedule 与 webhook trigger 的 v2 handler 契约测试已补齐
  - 多个高层域的真实执行仍依赖 Nest `api/v2` 与既有 V1 service
  - `Aggregation / Search` 的基础 4 个公开入口已进入 v2，但高级聚合仍停留在 v1
  - `Undo / Redo` 的主契约链路已在 v2 完整闭环，仅流式 SSE 仍停留在 v1/openapi 路径
- 仍未完成的能力：
  - share / workflow / template / setting 等域的更深统一执行模型
  - aggregation 高级聚合端点从 v1 向 v2 的继续迁移
  - 将 V2 从“公开入口层”推进到“主契约层 + 主执行层”
- 影响：
  - 同一能力在 V1 / V2 间的双轨维护成本持续存在
  - DTO、错误映射、权限边界和测试矩阵仍偏分散
- 建议动作：
  - 继续按照领域收口顺序推进 V2 主执行模型
  - 新增能力优先落在 `contract-http + v2 core` 链路
- 建议验证：
  - `pnpm --filter @teable/v2-contract-http-implementation exec vitest run src/handlers/workflows/triggerScheduleWorkflow.spec.ts`
  - `pnpm --filter @teable/v2-contract-http-implementation typecheck`
  - `pnpm --filter @teable/v2-contract-http typecheck`
  - 各高层域包级 typecheck
  - `pnpm g:typecheck`

## 4. P1 清单

### P1-1 Ports / Adapters 在高层域采用不均衡

- 类别：架构缺口
- 当前证据：`ports-adapters-adoption-roadmap.md`
- 当前状态：
  - table / record / field / view 较深
  - share / workflow / template / setting 更偏 `Nest api/v2 + adapter 边界`
- 影响：
  - 不同域的依赖组织方式不统一
  - 长期会放大维护和替换成本
- 建议动作：
  - 优先把公开读取域中高复用逻辑抽到 port
  - 再逐步把旧 service 切到统一 adapter

### P1-2 Share / Published / Template 统一访问模型仍未完成

- 类别：能力缺口
- 当前证据：`share-published-governance-roadmap.md`
- 当前状态：
  - 已共享 `defaultUrl` 语义
  - published runtime 与 template publish 已围绕默认激活节点 URL 形成最小共享语义
  - authenticated `App` 路由已经接入 `PublishedAppProvider + PublishedAppRuntime`
  - `template` mode 已接入独立 Published Runtime 消费入口
  - browser-level 与业务级 monitor 联动验证已补齐，share auth 真实浏览器入口也已补齐真实路由 e2e
  - 仍缺真实登录与真实业务 fixture 的全链路 e2e
- 影响：
  - 公开访问链路扩展时容易继续形成局部对齐逻辑
- 建议动作：
  - 以 `defaultUrl + defaultNodeId + permission/mode` 形成统一访问模型

### P1-3 Frontend workflow 工作区仍未成熟闭环

- 类别：功能缺陷
- 当前证据：`workflow-domain-governance-roadmap.md`
- 当前状态：
  - 后端入口已形成第一批闭环
  - 前端已具备 list / detail / test / run history 的最小一体化工作区，run history 已支持按 trigger 和 status 筛选并区分无运行记录与无筛选结果
  - workflow 页面已新增 `Apply update` 入口，可将 active workflow 的当前 draft 发布为新的 active snapshot
  - 节点级编辑当前稳定覆盖 `recordCreated` / `recordUpdated` / `recordMatchesConditions` trigger scope、Run Script、AI Generate，以及 `updateRecords` / `createRecords` / `queryRecords` 的结构化 editor + JSON editor
  - workflow 页面已支持 `test run` 自定义 JSON input 编辑，可直接验证不同触发输入形态
  - workflow 页面已显示节点级 `testStatus / testOutput` 与最近一次选中节点运行结果，调试可见性已提升
- 影响：
  - 编辑、测试、启停、运行历史和 AI 创建的用户体验不完整
- 建议动作：
  - 继续把 record actions 的结构化 editor 从最小字段面推进到更完整字段映射体验
  - 将前端可配置节点与后端真实 action / trigger 能力继续对齐

### P1-4 多数据库 / 多 HTTP 适配缺少真实 smoke 验证

- 类别：稳定性缺口
- 当前证据：`observability-and-adapter-validation-plan.md`
- 当前状态：
  - `multi-adapter-smoke-matrix.md` 已创建
  - Express + PostgreSQL 已固化为当前可验证组合
  - V2 Express/Fastify/Hono contract adapters 已通过 workflow 或 settings/templates/share 代表路由独立 smoke 验证
  - Express + SQLite、Fastify + PostgreSQL、Fastify + SQLite 仍缺正式 smoke 入口
- 影响：
  - 适配声明存在，真实组合稳定性缺少证据
- 建议动作：
  - 继续补 Express + SQLite、Fastify + PostgreSQL、Fastify + SQLite 的正式 smoke 入口与 CI 化验证

### P1-5 观测能力已完成第一版统一索引，剩余产品级深化入口

- 类别：能力缺口
- 当前证据：`observability-and-adapter-validation-plan.md`
- 当前状态：
  - 日志、OTel、Sentry、health 已存在
  - `runtime-observability-index.md` 已创建，产品可见状态、研发运行状态、适配验证状态已完成第一版分层统一
  - schedule next-run preview、按 cron/timezone 计算的 upcoming runs 列表和 webhook run input audit 已可见，webhook run detail 已结构化展示签名 header、时间戳 header、签名验证状态、body size 与 rate limit，run history 已支持 trigger/status/webhook audit 服务端筛选
  - webhook 后端签名辅助工具已单点化，覆盖 payload 拼接、HMAC-SHA256、`sha256=` 前缀兼容、timestamp tolerance 和自定义签名 header 读取
  - `@teable/openapi` 已提供 webhook 签名 helper，`triggerWebhookWorkflow` 可自动生成默认或自定义签名头
  - 剩余缺口集中在真实用户态 e2e、webhook 审计分页/聚合报表、多适配器 smoke matrix 的 CI 化
- 影响：
  - 研发侧可观测，产品级运行状态表达仍偏散
- 建议动作：
  - 继续把 webhook 审计分页/聚合报表和多适配器 smoke matrix CI 化纳入统一索引

### P1-6 Billing & Usage 仍是边界受限的外围查询域

- 类别：能力缺口
- 当前证据：
  - `capability-gap-list.md`
  - `peripheral-domain-roadmap.md`
- 当前状态：
  - 前端消费存在 Cloud / EE 门控
  - 当前主仓仅有 openapi 契约与前端门控
  - 当前主仓 backend 未定位到稳定 controller / service 事实源
- 影响：
  - 当前域无法自然推进到 `contract-http + api/v2` 主链路
- 建议动作：
  - 先保持边界说明
  - 以后端事实源明确作为重新立项条件

## 5. P2 与局部工程欠账

### P2-1 v2 `updateField` e2e helper 已完成

- 文件：`packages/v2/e2e/src/update-field/helpers.ts`
- 证据：`updateField` helper 已接入真实 `/tables/updateField` HTTP endpoint，`event-shape.spec.ts` 已复用 helper
- 建议动作：后续新增 update-field e2e 场景继续复用 helper

### P2-2 record 低耦合读取职责已拆分，复杂查询编排进入后续边界

- 文件：`apps/nestjs-backend/src/features/record/record-query.service.ts`
- 证据：低耦合读取原语已迁入 `RecordQueryService`，文件头 read related TODO 已移除
- 建议动作：后续单独评估 `buildFilterSortQuery`、`getGroupRelatedData`、`getDocIdsByQuery` 等复杂查询编排边界

### P2-3 前端若干功能局部欠账已部分收口

- 代表文件：
  - `apps/nextjs-app/src/features/app/blocks/chart/components/chart/ChartQuery.tsx`
  - `apps/nextjs-app/src/features/app/blocks/chart/components/chart/chart-config/form/ComboForm.tsx`
  - `apps/nextjs-app/src/features/app/blocks/import-table/field-config-panel/inplace-panel/InplacePreviewColumn.tsx`
  - `apps/nextjs-app/src/features/app/components/plugin/hooks/useUtilsEvent.ts`
  - `apps/nextjs-app/src/features/app/components/field-setting/options/UserOptions.tsx`
- 影响：
  - chart 初始化、combo x-axis 约束和 grid collaborator overlay 性能热点已收口
- 建议动作：
  - 剩余 import / plugin / user options 等局部体验按业务域小批次收口

### P2-4 公式 / 计算字段 / 事件总线仍有局部增强点

- 代表文件：
  - `apps/nestjs-backend/src/features/field/open-api/field-open-api.service.ts`
  - `apps/nestjs-backend/src/features/field/field-calculate/field-converting-link.service.ts`
  - `packages/v2/adapter-table-repository-postgres/src/record/visitors/CellValueMutateVisitor.ts`
- 影响：
  - 边界场景和复杂字段行为仍有增强空间
- 建议动作：
  - 结合真实 bug / 需求单独开专项，不与主迁移任务混做

## 6. 推荐执行顺序

### 第一优先级

1. Published App Runtime 跨端闭环
2. Automation / Workflow Phase 2-4 能力闭环

### 第二优先级

1. Share / Published / Template 统一访问模型
2. 高层域 Ports / Adapters 深化
3. 多适配器 smoke matrix

### 第三优先级

1. 命名、索引、局部 TODO、体验细节收尾
2. billing / peripheral / plugin 等边界受限域的触发型治理

## 7. 当前结论

当前项目代码的主干稳定性已经达标，但平台级能力闭环还没有完全结束。

最值得继续投入的两条主线是：

1. Published App Runtime 从 backend contract 走到真正的跨端运行时产品闭环
2. Automation / Workflow 从 Phase 1 基础入口走到完整可测试、可运行、可追踪的产品能力闭环
