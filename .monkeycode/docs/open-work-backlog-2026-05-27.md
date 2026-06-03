# 当前开放任务 Backlog（2026-05-27）

文档分层：正式输出。

## 1. 判定口径

本清单只保留当前仍成立的未完成事项，且必须满足以下条件之一：

1. 代码中存在明确 TODO、占位实现或已知能力缺口注释。
2. `.monkeycode/docs/` 或 `.monkeycode/specs/` 中存在正式文档，且明确记载该能力仍未闭环。
3. 会直接影响全局性、一致性、稳定性或主契约统一的结构性缺口。

以下内容不纳入本清单：

1. 已在正式任务清单中标记为 completed 的专项。
2. PR 模板、历史评论、过程性日志、测试数据常量。
3. 仅有方向性建议、缺少当前代码或正式文档证据的推测项。

## 2. 当前结论

当前仓库主干已经具备可持续开发状态，但仍存在一批真实开放任务。

最值得继续推进的主线有五项：

1. Published App Runtime 跨端闭环。
2. Automation / Workflow Phase 2-4 产品化闭环。
3. V2 主契约层继续统一。
4. 多适配器真实 smoke matrix。
5. backend 局部结构债与复杂字段链路性能债收口。

## 3. P0 Backlog

### P0-1 Published App 统一访问模型治理尾差

- 类别：平台级一致性缺口
- 主要证据：
  - `.monkeycode/docs/current-capability-defect-backlog-2026-05-18.md:40`
  - `.monkeycode/docs/published-app-access-model-minimal-integration-matrix-2026-05-27.md`
- 当前未完成内容：
  - 仍缺基于真实登录、seed 数据和后端 route fixture 的全链路 e2e；现有 browser monitor 与真实 auth route entry 矩阵已复跑并最终通过。
- 影响范围：
  - published runtime 主线已完成，`defaultActiveNodeId` / `defaultNodeId` 的前端单点兼容治理已完成，后续风险集中在统一访问模型继续扩展时的入口分叉。
  - share / published / template 统一访问模型仍会持续分叉。
  - 当前已具备真实页面入口 SSR 分流验证与业务级 browser flow 验证，剩余缺口进一步收缩到真实用户态和真实后端数据装配。
- 建议验证：
  - `pnpm --filter @teable/app typecheck`
  - `E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-access-model.spec.ts e2e/pages/published/published-business-flow.spec.ts e2e/pages/published/published-route-entry.spec.ts --project='Desktop Chrome'`
  - share / published / template 真实业务端到端联动验证

### P0-2 Automation / Workflow Phase 2-4 能力闭环

- 类别：平台级能力缺口
- 主要证据：
  - `.monkeycode/docs/current-capability-defect-backlog-2026-05-18.md:72`
- 当前未完成内容：
  - schedule 已补齐 interval、one-time、timezone、next-run 可见性、upcoming runs 真实未来运行时间列表、严格五段 cron 表达式校验，并可在 run history 中按 schedule trigger 与运行状态筛选历史记录；剩余产品化缺口集中在更丰富的日历布局视图。
  - webhook 后端签名辅助工具已抽出并有 focused spec 覆盖；`@teable/openapi` 已提供可复用签名 helper，并且 `triggerWebhookWorkflow` 可基于 `signatureSecret` 与 `rawBody` 自动生成默认或自定义签名头；基础签名/body/限流审计元数据已写入 run input，页面 run detail 已结构化展示签名 header、时间戳 header、签名验证、时间戳存在状态、body size 与 rate limit；run history 已支持 trigger/status/webhook audit 服务端筛选，并新增最近 100 条运行的 webhook audit summary 观测入口、签名失败/缺少时间戳/请求体大小统计维度与 webhook audit 分页明细接口；剩余缺口集中在真实产品报表页与更长周期趋势分析。
  - workflow logic/runtime 的更多产品能力，例如更真实分支控制与更强字段映射体验。
  - AI authoring 的 activation-ready 自动编排与 field mapping 自动补全增强。
- 影响范围：
  - workflow 当前已能运行，但距离完整产品能力仍有明显差距。
  - 前后端“能展示”和“能稳定执行”的边界还不完全对齐。
- 建议验证：
  - `pnpm --filter @teable/backend typecheck`
  - `pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-schedule.service.spec.ts src/features/workflow/workflow.service.spec.ts src/features/workflow/workflow-webhook-signature.spec.ts`
  - `pnpm --filter @teable/openapi exec vitest run src/automation/workflow/webhook-signature.spec.ts src/automation/workflow/trigger-webhook.spec.ts`
  - `pnpm --filter @teable/openapi typecheck`
  - `pnpm --filter @teable/app exec vitest run src/features/app/automation/Pages.spec.ts`
  - `pnpm --filter @teable/app typecheck`

### P0-3 V2 主契约层继续统一

- 类别：平台级一致性缺口
- 主要证据：
  - `.monkeycode/docs/current-capability-defect-backlog-2026-05-18.md:112`
- 当前未完成内容：
  - workflow schedule 与 webhook trigger 的 v2 handler 契约测试已补齐，share / workflow / template / setting 等域仍需要更深统一执行模型。
  - aggregation 高级聚合从 v1 向 v2 的继续迁移。
  - V2 从“公开入口层”继续推进到“主执行层”。
- 影响范围：
  - V1 / V2 双轨维护成本仍在。
  - DTO、错误映射、权限边界与测试矩阵持续分散。
- 建议验证：
  - `pnpm --filter @teable/v2-contract-http-implementation exec vitest run src/handlers/workflows/triggerScheduleWorkflow.spec.ts`
  - `pnpm --filter @teable/v2-contract-http-implementation exec vitest run src/handlers/workflows/triggerWebhookWorkflow.spec.ts src/handlers/workflows/triggerScheduleWorkflow.spec.ts`
  - `pnpm --filter @teable/v2-contract-http-implementation typecheck`
  - `pnpm --filter @teable/v2-contract-http typecheck`
  - 各高层域包级 typecheck
  - `pnpm g:typecheck`

## 4. P1 Backlog

### P1-1 Share / Published / Template 统一访问模型

- 类别：能力缺口
- 主要证据：
  - `.monkeycode/docs/current-capability-defect-backlog-2026-05-18.md:155`
- 当前未完成内容：
  - authenticated、share、template runtime 入口已落地，browser-level 与业务级 monitor 联动验证已补齐，share auth 真实浏览器入口也已补齐真实路由 e2e，当前 published browser matrix 已最终通过，仍缺真实登录与真实业务 fixture 的全链路 e2e。
- 影响范围：
  - 公开访问链路扩展时仍容易形成局部对齐逻辑。
- 建议验证：
  - `E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-access-model.spec.ts e2e/pages/published/published-business-flow.spec.ts e2e/pages/published/published-route-entry.spec.ts --project='Desktop Chrome'`

### P1-2 多适配器真实 smoke matrix

- 类别：稳定性缺口
- 主要证据：
  - `.monkeycode/docs/current-capability-defect-backlog-2026-05-18.md:186`
- 当前未完成内容：
  - Express + PostgreSQL 已固化为当前可验证组合。
  - V2 Express/Fastify/Hono contract adapters 已通过 workflow 或 settings/templates/share 代表路由独立 smoke 验证。
  - Express + SQLite
  - Fastify + PostgreSQL 主应用运行组合
  - Fastify + SQLite
  - `multi-adapter-smoke-matrix.md` 已创建，当前真实组合、V2 Fastify workflow contract smoke 与缺口组合已分层记录。
- 影响范围：
  - 已声明的适配能力缺少真实组合验证证据。
- 建议验证：
  - 最小 smoke matrix 跑通并固化成正式文档

### P1-3 运行可观测性产品化索引

- 类别：运行治理缺口
- 主要证据：
  - `.monkeycode/docs/current-capability-defect-backlog-2026-05-18.md:199`
- 当前未完成内容：
  - `runtime-observability-index.md` 已创建，产品可见状态、研发运行状态、适配验证状态已完成第一版分层统一。
    - schedule trigger 已具备 next-run preview、按 cron/timezone 计算的 upcoming runs 列表和 job payload metadata，run history 已支持 trigger/status/webhook audit 服务端筛选，webhook run input audit 已可见且包含自定义 header 与签名状态摘要，并新增 webhook audit summary 计数入口、签名失败/缺少时间戳/请求体大小统计维度与分页明细接口；剩余缺口集中在真实用户态 e2e、真实产品报表页、多适配器 smoke matrix 的 CI 化。
- 影响范围：
  - 研发侧可观测，产品级运行面仍偏散。
- 建议验证：
  - 文档闭环 + 对应观测入口抽样核对

## 5. P2 工程欠账

### P2-1 record 读取职责拆分已完成，复杂查询编排另列后续边界

- 类别：backend 结构债
- 代码证据：
  - `apps/nestjs-backend/src/features/record/record-query.service.ts`
  - `apps/nestjs-backend/src/features/record/record.service.ts`
- 当前状态：
  - 低耦合读原语已迁入 `RecordQueryService`，覆盖 table name、record count、search fields、projection fields、record indexes、view index fields、record head 与 record existence 查询。
  - `RecordQueryService.getSnapshotBulk` 已复用统一 snapshot mapper，保留真实 version、name、autoNumber、createdBy 与 lastModifiedBy 元数据。
  - `RecordService` 中对应外部公开代理已删除，外部调用侧改为直接依赖 `RecordQueryService`。
  - `RecordQueryService` 依赖 `DataLoaderService`，`RecordModule` 与直接提供该服务的 `CalculationModule` 已显式导入 `DataLoaderModule`。
  - `buildFilterSortQuery`、`getGroupRelatedData`、`getDocIdsByQuery` 等复杂查询编排保留在 `RecordService`，作为后续更大粒度拆分候选。
- 影响范围：
  - record 低耦合读路径职责边界已收敛，复杂查询编排边界进入后续独立设计范围。
- 建议验证：
  - `pnpm --filter @teable/backend exec vitest run src/features/calculation/batch.service.spec.ts src/features/aggregation/aggregation.service.spec.ts src/features/share/share.service.spec.ts src/features/view/open-api/view-open-api.service.spec.ts src/features/record/record.service.spec.ts src/features/record/typecast.validate.spec.ts src/features/record/record-modify/record-modify.shared.service.spec.ts src/features/record/open-api/record-open-api.service.spec.ts src/features/selection/selection.service.spec.ts`
  - `NODE_OPTIONS="--max-old-space-size=6144" pnpm --filter @teable/backend typecheck`

### P2-2 link convert 性能与重名 title 准确性已完成

- 类别：复杂字段链路技术债
- 代码证据：
  - `apps/nestjs-backend/src/features/calculation/field-calculation.service.ts`
  - `apps/nestjs-backend/src/features/field/field-calculate/field-converting-link.service.ts`
  - `apps/nestjs-backend/src/features/field/field-calculate/field-converting-link.service.spec.ts`
- 当前状态：
  - link convert 已先从源记录提取候选 title，再按候选 title 读取 foreign records，避免 foreign table 全量读取。
  - title 到 id 的映射已改为仅唯一 title 可映射，重名 title 不再后写覆盖前写。
- 影响范围：
  - 大表转换性能风险已降低到候选 title 范围。
  - link convert 重名 title 场景避免产生错误链接。
- 建议验证：
  - `pnpm --filter @teable/backend exec vitest run src/features/field/field-calculate/field-converting-link.service.spec.ts src/features/calculation/field-calculation.service.spec.ts`

### P2-3 undo/redo update-records 字段过滤已完成

- 类别：行为一致性欠账
- 代码证据：
  - `apps/nestjs-backend/src/features/undo-redo/operations/update-records.operation.ts`
  - `apps/nestjs-backend/src/features/undo-redo/operations/update-records.operation.spec.ts`
- 当前状态：
  - undo / redo 回放前通过 `TableDomainQueryService` 过滤不存在字段与 computed fields。
  - order-only 操作中的同源误导 TODO 已移除。
- 影响范围：
  - undo/redo 记录回放避免携带不可写字段更新。
- 建议验证：
  - `pnpm --filter @teable/backend exec vitest run src/features/undo-redo/operations/update-records.operation.spec.ts`

### P2-4 share-db snapshot metadata 已完成

- 类别：适配层欠账
- 代码证据：
  - `apps/nestjs-backend/src/share-db/share-db.adapter.ts`
  - `apps/nestjs-backend/src/share-db/share-db.adapter.spec.ts`
- 当前状态：
  - share-db adapter 已统一通过 `toShareDbSnapshot` 构造 `Snapshot`。
  - readonly snapshot 返回的 `m` metadata 已透传到 `Snapshot.m`。
  - 缺少 metadata 的既有非空 snapshot 已补最小 legacy metadata，避免继续返回空 metadata 占位。
- 影响范围：
  - share-db 适配层快照元信息与 ShareDB `ctime`、`mtime`、`_create` 协议对齐。
- 建议验证：
  - `pnpm --filter @teable/backend exec vitest run src/share-db/share-db.adapter.spec.ts src/share-db/share-db.service.spec.ts src/share-db/share-db.spec.ts`

### P2-5 v2 updateField e2e helper 已完成

- 类别：测试基础设施欠账
- 代码证据：
  - `packages/v2/e2e/src/update-field/helpers.ts`
  - `packages/v2/e2e/src/update-field/event-shape.spec.ts`
- 当前状态：
  - `updateField` helper 已接入真实 `/tables/updateField` HTTP endpoint。
  - `updateFieldWithEvents` helper 已提供带 events 的响应解析能力。
  - `event-shape.spec.ts` 已复用 update-field helper，移除重复手写 fetch 逻辑。
- 影响范围：
  - v2 updateField e2e 复用工具链已可覆盖 table 与 event 响应。
- 建议验证：
  - `FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm --filter @teable/v2-e2e exec vitest run src/update-field/event-shape.spec.ts`

### P2-6 局部 UI / 性能 TODO 已完成

- 类别：局部体验与性能欠账
- 代表证据：
  - `packages/sdk/src/components/grid/renderers/layout-renderer/overlay-renderer.ts`
  - `apps/nestjs-backend/src/features/record/typecast.validate.ts`
  - `apps/nestjs-backend/src/features/record/typecast.validate.spec.ts`
  - `apps/nextjs-app/src/features/app/blocks/chart/components/chart/ChartQuery.tsx`
  - `apps/nextjs-app/src/features/app/blocks/chart/components/chart/chart-config/form/ComboForm.tsx`
- 当前状态：
  - grid collaborator overlay 已移除每个可见 cell 的深拷贝热点，仅复制需要更新 activeCell 的首个 collaborator。
  - select typecast 自动创建 options 的 `stageAnalysis -> stageAlter` 链路已用测试固定，误导 TODO 已移除。
  - `ChartQuery` 已移除无界 `setTimeout` 初始化，改为带 cleanup 的 `requestAnimationFrame`。
  - `ComboForm` 已将单 x-axis 约束显式化，与当前 `Combo` 渲染层只读取首个 x-axis 的行为一致。
- 影响范围：
  - 局部交互体验、性能和实现简洁度已收口。
- 建议验证：
  - `pnpm --filter @teable/sdk exec vitest run src/components/grid/renderers/layout-renderer/layoutRenderer.spec.ts`
  - `pnpm --filter @teable/sdk typecheck`
  - `pnpm --filter @teable/backend exec vitest run src/features/record/typecast.validate.spec.ts`
  - `pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx`
  - `pnpm --filter @teable/app typecheck`

### P2-7 backend typecheck 基线已清零

- 类别：工程门禁欠账
- 代码证据：
  - `apps/nestjs-backend/src/features/base/base.service.spec.ts`
  - `apps/nestjs-backend/src/features/dashboard/dashboard.service.spec.ts`
  - `apps/nestjs-backend/src/features/field/open-api/field-open-api.service.spec.ts`
  - `apps/nestjs-backend/src/features/oauth/oauth.service.spec.ts`
  - `apps/nestjs-backend/src/features/space/space.service.spec.ts`
  - `apps/nestjs-backend/src/features/table/table.service.spec.ts`
  - `apps/nestjs-backend/src/share-db/share-db.spec.ts`
  - `apps/nestjs-backend/vitest.config.ts`
  - `packages/v2/core/src/queries/ListTableRecordsHandler.ts`
- 当前状态：
  - backend spec 中 `ClsService` mock 已统一为 `ClsService<IClsStore>`，与服务构造器签名一致。
  - `FieldOpenApiService` smoke spec 已补齐构造器依赖占位参数。
  - `ShareDbService` smoke spec 的 `ICacheConfig` mock 已对齐当前 cache config 结构。
  - backend `vitest.config.ts` coverage 配置已对齐 Vitest 当前类型定义。
  - v2 list records filter 中 `me` 值归一化已通过 `recordFilterValueSchema` 收窄，保持 DTO 与 domain filter 类型一致。
- 影响范围：
  - backend typecheck 基线从已知失败恢复为通过，可继续作为后续工程门禁使用。
- 建议验证：
  - `NODE_OPTIONS="--max-old-space-size=6144" pnpm --filter @teable/backend typecheck`
  - `pnpm --filter @teable/backend exec vitest run src/share-db/share-db.spec.ts src/features/field/open-api/field-open-api.service.spec.ts src/features/base/base.service.spec.ts src/features/dashboard/dashboard.service.spec.ts src/features/oauth/oauth.service.spec.ts src/features/space/space.service.spec.ts src/features/table/table.service.spec.ts`

## 6. 已完成专项排除项

以下专项本次检索中已确认完成，不属于开放 backlog：

1. `base-duplicate-bidirectional-link-ci-stability`
   - 证据：`.monkeycode/specs/base-duplicate-bidirectional-link-ci-stability/tasklist.md`
   - 状态：`T1` 到 `T10` 全部 completed

## 7. 推荐执行顺序

### 第一优先级

1. Published App Runtime 跨端闭环。
2. Automation / Workflow Phase 2-4 产品化闭环。

### 第二优先级

1. V2 主契约层继续统一。
2. Share / Published / Template 统一访问模型。
3. 多适配器 smoke matrix。

### 第三优先级

1. 继续处理新发现的主线缺口，并为每个缺口补齐代码证据、行为证据和验证证据。
