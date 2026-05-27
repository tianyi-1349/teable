# Base Duplicate Bidirectional Link CI Stability Tasklist

文档层级：正式输出

## 状态

| 字段 | 值 |
|---|---|
| 当前状态 | 主线绿灯，最新 integration 新暴露的 `record-typecast`、backend unit 装配、`test-e2e-cover`、`auto-number`、`record.e2e`、`table.service.spec`、`import-base.e2e` 清理超时，以及 backend unit coverage shard `1/4`、`2/4`、`3/4`、`4/4` 装配链红灯已本地复核关闭，CI 已确认全绿，可交付 |
| 当前主线 | `test/base-duplicate.e2e-spec.ts -t "should duplicate base with bidirectional link field"` |
| 当前完成门槛 | L2 相关测试通过、L3 focused e2e 通过、L4 related workflow 通过、Gap List 清零 |

## Tasks

| ID | 状态 | 证据等级 | 任务 | 完成判据 |
|---|---|---|---|---|
| T1 | completed | L1 | 读取主线交付协议和 GPT-5.5 实施手册 | 已读取两份正式标准 |
| T2 | completed | L1 | 创建轻量 SDD 三件套 | `requirements.md`、`design.md`、`tasklist.md` 已建立 |
| T3 | completed | L1 | 只读提取 `base-duplicate` e2e 调用时序 | 已得到 create/convert/insert/duplicate 调用图 |
| T4 | completed | L1 | 只读追踪 create/convert 持久化路径 | 已定位 OpenAPI、command、repository visitor 持久化链路 |
| T5 | completed | L1 | 只读追踪 repository 回读与 runtime insert 使用路径 | 已定位 repository rehydrate、`RecordInsertBuilder` 与 duplicate/import 使用路径 |
| T6 | completed | L2 | 根据证据命中层实施最小补丁 | 已覆盖 create/convert persistence、duplicate link field、duplicate data copy 层 |
| T7 | completed | L2 | 运行修改层相关 L2 测试 | 已记录 L2 证明句 |
| T8 | completed | L3 | 运行主线 focused e2e | 已记录 L3 证明句，状态升级为主线绿灯 |
| T9 | completed | L4 | 触发相关 GitHub Actions workflow | 记录 L4 证明句，状态升级为 CI 确认 |
| T10 | completed | L3 | 清理 Gap List 并检查临时观测代码 | Gap List 清零，当前无临时观测代码 |

## 下一步执行

1. 归档本轮 L4 workflow 证据到交付记录。
2. 基于当前可交付状态等待用户下一步指令。

## 证明句记录

| 时间 | 等级 | 命令或证据 | 证明句 |
|---|---|---|---|
| 2026-05-23 | L1 | SDD 文档创建 | 证明本任务已锁定主线验收卡、失败链路四问、Gap List 和轻量 SDD 执行边界。 |
| 2026-05-23 | L2 | `pnpm --filter @teable/backend exec vitest run src/features/field/open-api/field-open-api-v2.service.spec.ts src/features/record/open-api/record-open-api-v2.service.spec.ts` | 证明 backend OpenAPI link/record 兼容层回归通过，78 tests passed。 |
| 2026-05-23 | L2 | `pnpm exec vitest run src/repositories/TableFieldPersistenceBuilder.spec.ts src/repositories/visitors/TableMetaUpdateVisitor.spec.ts` | 证明 v2 repository persistence/update visitor 回归通过，17 tests passed。 |
| 2026-05-23 | L2 | `pnpm exec vitest run src/commands/CreateFieldCommand.spec.ts src/commands/TableFieldUpdateSpecs.spec.ts` | 证明 v2 core create/update link config 回归通过，42 tests passed。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/base-duplicate.e2e-spec.ts -t "should duplicate base with bidirectional link field"` | 证明主线双向 link base duplicate 行为通过，1 test passed，20 skipped。 |
| 2026-05-23 | L2 | `env NODE_OPTIONS=--max-old-space-size=4096 pnpm --filter @teable/backend typecheck` | 证明 backend 类型边界通过；默认 heap 下 OOM，提升 Node heap 后无类型错误。 |
| 2026-05-23 | L4 红灯分析 | Integration Tests run `26331170710` failed jobs `77517420959`、`77517420962`、`77517420967` | 证明 CI 红灯集中在 OpenAPI v1/v2 兼容映射层：one-way manyMany junction 命名、conditional rollup 动态 filter timeZone 回读、link convert foreign table 切换时 stale lookupFieldId。 |
| 2026-05-23 | L2 | `pnpm --filter @teable/backend exec vitest run src/features/field/open-api/field-open-api-v2.service.spec.ts` | 证明字段 OpenAPI 兼容映射回归通过，64 tests passed。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/link-api.e2e-spec.ts -t "should create one way, many many link"` | 证明 one-way manyMany legacy junction 命名行为通过，1 test passed，107 skipped。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/conditional-rollup.e2e-spec.ts -t "should honor today filters in conditional rollups"` | 证明 conditional rollup 动态 date filter 的 `utc` 回读保真行为通过，1 test passed，74 skipped。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/undo-redo.e2e-spec.ts -t "should undo / redo convert link when convert link from one table to another"` | 证明 link convert 切换 foreign table 时不再沿用 stale lookupFieldId，1 test passed，30 skipped。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/base-duplicate.e2e-spec.ts -t "should duplicate base with bidirectional link field"` | 证明本轮兼容映射补丁未破坏主线双向 link base duplicate 行为，1 test passed，20 skipped。 |
| 2026-05-23 | L2 | `env NODE_OPTIONS=--max-old-space-size=4096 pnpm --filter @teable/backend typecheck` | 证明本轮兼容映射补丁通过 backend 类型边界。 |
| 2026-05-23 | L4 红灯分析 | Integration Tests run `26331579419` failed job `77518460586` | 证明最新 CI 红灯集中在 v2 record typecast select 写入层：`preventAutoNewOptions: true` 时 invalid single select 被显式写成 `null`，legacy 兼容期望省略该字段；multiple select 期望只保留有效选项。 |
| 2026-05-23 | L2 | `pnpm exec vitest run src/domain/table/fields/visitors/FieldToSpecVisitor.spec.ts` | 证明 v2 field-to-spec 在 preventAutoNewOptions 下会把 invalid single select 映射为 noop，multiple select 混合输入只保留有效选项，70 tests passed。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/record.e2e-spec.ts -t "should not auto create options when preventAutoNewOptions is true"` | 证明 OpenAPI v2 explicit update 在真实 backend + DB 下满足 preventAutoNewOptions 兼容语义，1 test passed，44 skipped。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/base-duplicate.e2e-spec.ts -t "should duplicate base with bidirectional link field"` | 证明本轮 v2 record typecast 修复未破坏主线双向 link base duplicate 行为，1 test passed，20 skipped。 |
| 2026-05-23 | L2 | `env NODE_OPTIONS=--max-old-space-size=4096 pnpm --filter @teable/backend typecheck` | 证明本轮 v2 record typecast 修复通过 backend 类型边界。 |
| 2026-05-23 | L4 红灯分析 | Integration Tests run `26332102772` failed job `77519742554` | 证明最新 CI 红灯集中在 FORCE_V2_ALL 环境下 sparse single select batch update 用例的 header 期望漂移：CI 返回 `X_TEABLE_V2_HEADER: true`，测试仍按 v1-only header 断言，但省略字段行为断言需要保留。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/record.e2e-spec.ts -t "preserves omitted singleSelect values in sparse explicit batch updates for v1"` | 证明 FORCE_V2_ALL 下 sparse single select batch update header 期望与 CI 一致，且 omitted singleSelect 值保留行为通过，1 test passed，44 skipped。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/record.e2e-spec.ts -t "does not fail required singleSelect validation when omitted in another batch row for v1"` | 证明 FORCE_V2_ALL 下 required singleSelect sparse batch update header 期望与 CI 一致，且 omitted row 不触发 required validation，1 test passed，44 skipped。 |
| 2026-05-23 | L4 红灯分析 | Integration Tests run `26332334293` failed job `77520343947` | 证明最新 CI 红灯集中在 table trash 字段恢复层：字段删除后又删除部分 record，restore 字段值时应跳过已删除 record。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/table-trash.e2e-spec.ts -t "should restore field when some records were deleted after field deletion"` | 证明 table trash 字段恢复在真实 backend + DB 下只更新仍存在的 record，1 test passed，12 skipped。 |
| 2026-05-23 | L2 | `env NODE_OPTIONS=--max-old-space-size=4096 pnpm --filter @teable/backend typecheck` | 证明本轮 table trash 字段恢复修复通过 backend 类型边界。 |
| 2026-05-23 | L4 红灯分析 | Integration Tests run `26332695583` failed job `77521282937` | 证明最新 CI 红灯集中在 attachment preview URL cache/response 装饰层：cookie 写入路径先缓存 local 相对 URL 后，Bearer token API 读取 record 时仍需要按 `storagePrefix` 返回绝对 `presignedUrl`。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/attachment.e2e-spec.ts -t "should get attachment absolute url by token"` | 证明 attachment token API 在真实 backend + DB 下返回以 `appUrl` 开头的 local absolute `presignedUrl`，1 test passed，4 skipped。 |
| 2026-05-23 | L2 | `env SECRET_KEY=test-secret pnpm exec vitest run src/features/attachments/plugins/local.spec.ts` | 该 L2 辅助用例在 Nest 模块扫描阶段因既有 `RecordOpenApiModule` imports 循环失败，17 个用例均未进入断言，不能作为本轮修复行为证据。 |
| 2026-05-23 | L2 | `env NODE_OPTIONS=--max-old-space-size=4096 pnpm --filter @teable/backend typecheck` | 证明本轮 attachment preview URL cache/response 修复通过 backend 类型边界。 |
| 2026-05-25 | L2 | `pnpm --filter @teable/v2-core exec vitest run src/queries/ListTableRecordsHandler.spec.ts` | 证明 `ListTableRecordsHandler` 已统一兼容大写 `Me` 与历史小写 `me`，并在 `query.filter` 与 `filterLinkCellCandidate` 组合链路中把 user filter 值归一化为 `actorId`，25 tests passed。 |
| 2026-05-25 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/link-view-user-filter.e2e-spec.ts -t "should return only records assigned to current user"` | 证明多用户 `hasAnyOf([Me])` 在真实 backend + DB 下返回当前用户可见候选记录，1 test passed，2 skipped。 |
| 2026-05-25 | L4 红灯分析 | Integration Tests run `26377517159` failed jobs `77640356420`、`77640356455`、`77640356475`、`77640356499` | 证明本轮 CI 新红灯分成两类：v2 single select `'' + typecast` 被写成 `null` 的 legacy omitted 兼容回归，以及两条 backend unit spec 仍走整模块扫描导致 `RecordOpenApiModule` imports 循环装配失败。 |
| 2026-05-25 | L2 | `pnpm --filter @teable/v2-core exec vitest run src/domain/table/fields/visitors/FieldToSpecVisitor.spec.ts` | 证明 single select 在 `typecast: true` 且输入空字符串时返回 `NoopCellValueSpec`，保持 legacy omitted 语义，71 tests passed。 |
| 2026-05-25 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/record-typecast.e2e-spec.ts -t "should create a record with typecast"` | 证明 single select `'' + typecast` 在真实 backend + DB 下回到省略更新语义，record 字段返回 `undefined`，1 test passed，5 skipped。 |
| 2026-05-25 | L2 | `pnpm exec vitest run src/features/collaborator/collaborator.service.spec.ts` | 证明 collaborator service spec 已收敛为最小 provider 装配，不再被 `RecordOpenApiModule` 循环扫描阻塞，2 tests passed。 |
| 2026-05-25 | L2 | `pnpm exec vitest run src/features/oauth/oauth-server.service.spec.ts` | 证明 OAuth server service spec 已收敛为最小 provider 装配，且脆弱 mock 清理已修复，23 tests passed。 |
| 2026-05-25 | L4 红灯分析 | Integration Tests run `26378647845` failed job `77643538056` | 证明新一轮 CI 红灯已收窄到 `field.service.spec.ts`、`local.helper.spec.ts`、`test-e2e-cover` 的 worker 稳定性、`auto-number` 返回体缺失 snapshot 字段，以及 `record.e2e` user typecast 歧义输入。 |
| 2026-05-25 | L2 | `pnpm exec vitest run src/features/field/field.service.spec.ts` | 证明 `field.service.spec.ts` 已改为最小 provider 装配，不再依赖整模块扫描，3 tests passed。 |
| 2026-05-25 | L2 | `pnpm exec vitest run src/features/attachments/plugins/local.helper.spec.ts` | 证明 `local.helper.spec.ts` 已对齐当前 helper 的错误语义，21 tests passed。 |
| 2026-05-25 | L2 | `pnpm exec vitest run src/features/record/open-api/record-open-api-v2.service.spec.ts` | 证明 v2 `createRecords` 在 payload 缺失 snapshot 字段或 `autoNumber` 时会触发按需回读，而字段完整时保持直返，19 tests passed。 |
| 2026-05-25 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/auto-number.e2e-spec.ts` | 证明 auto-number create 链路在真实 backend + DB 下返回连续 `autoNumber`，focused e2e 通过。 |
| 2026-05-25 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/record.e2e-spec.ts -t "should update and typecast record"` | 证明 user typecast 用例改用唯一邮箱输入后在真实 backend + DB 下稳定命中当前用户，focused e2e 通过。 |
| 2026-05-25 | L3 | `env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts --coverage --bail 1 --shard=2/4` | 证明 `vitest-e2e.config.ts` 切换 `pool: 'forks'` 后 `test-e2e-cover` shard `2/4` 完整通过，38 files passed，526 tests passed。 |
| 2026-05-25 | L4 红灯分析 | Integration Tests run `26394055409` failed jobs `77690379414`、`77690379426`、`77690379437`、`77690379448`、`77690379460`、`77690379472`、`77690379484`、`77690379496` | 证明最新 CI 真实红灯已收敛到两处：`table.service.spec.ts` 仍走整模块扫描触发 `RecordOpenApiModule` imports 循环装配失败，以及 `import-base.e2e-spec.ts` 的 `afterAll` 在 CI 覆盖路径下清理超时。 |
| 2026-05-25 | L2 | `pnpm exec vitest run src/features/table/table.service.spec.ts` | 证明 `table.service.spec.ts` 已改为纯实例化最小依赖装配，不再受 `RecordOpenApiModule` 循环扫描影响，5 tests passed。 |
| 2026-05-25 | L2 | `pnpm exec vitest run --coverage src/features/table/table.service.spec.ts` | 证明 `table.service.spec.ts` 在 coverage 路径下同样通过，1 file passed，5 tests passed。 |
| 2026-05-25 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/import-base.e2e-spec.ts -t "import base with multiple link fields targeting the same table"` | 证明 `import-base.e2e` 多 link 同表导入场景在真实 backend + DB 下通过，且放宽 `afterAll` 超时后清理链路可完成，1 test passed，7 skipped。 |
| 2026-05-25 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts --coverage test/import-base.e2e-spec.ts -t "import base with multiple link fields targeting the same table"` | 证明 `import-base.e2e` 多 link 同表导入场景在 coverage 路径下同样通过，1 file passed，1 test passed，7 skipped。 |
| 2026-05-25 | L2 | `pnpm exec vitest run src/features/attachments/attachments.service.spec.ts src/features/field/field-calculate/field-deleting.service.spec.ts src/features/calculation/batch.service.spec.ts src/features/plugin/plugin.service.spec.ts src/features/view/view.service.spec.ts src/features/user/user.service.spec.ts` | 证明 6 个 backend unit spec 已收敛为直接实例化的最小依赖装配，普通路径通过。 |
| 2026-05-25 | L2 | `pnpm exec vitest run --coverage --shard=2/4 src/features/attachments/attachments.service.spec.ts src/features/field/field-calculate/field-deleting.service.spec.ts src/features/calculation/batch.service.spec.ts src/features/plugin/plugin.service.spec.ts src/features/view/view.service.spec.ts src/features/user/user.service.spec.ts` | 证明 6 个 backend unit spec 在 coverage shard `2/4` 路径下同样通过，装配链已从整模块扫描收敛到最小依赖实例化。 |
| 2026-05-25 | L2 | `pnpm test-unit --coverage --shard=2/4` | 证明 backend unit coverage shard `2/4` 本地完整通过，28 files passed，163 tests passed，当前 CI 剩余 gap 收敛到 L4 workflow 确认。 |
| 2026-05-27 | L2 | `pnpm exec vitest run src/features/field/open-api/field-open-api.service.spec.ts src/features/aggregation/open-api/aggregation-open-api.service.spec.ts src/features/calculation/field-calculation.service.spec.ts src/features/field/field-calculate/field-creating.service.spec.ts src/features/auth/auth.service.spec.ts src/features/base/db-connection.service.spec.ts src/features/base/base-duplicate.service.spec.ts src/features/graph/graph.service.spec.ts src/features/chat/chat.service.spec.ts` | 证明 backend unit coverage shard `1/4` 命中的 9 个纯存在性 spec 已收敛为最小依赖直接实例化，定向验证通过。 |
| 2026-05-27 | L2 | `pnpm test-unit --coverage --shard=1/4` | 证明 backend unit coverage shard `1/4` 本地完整通过，28 files passed，146 tests passed，当前 `1/4` 装配链 gap 已闭合。 |
| 2026-05-27 | L2 | `pnpm exec vitest run src/features/calculation/link.service.spec.ts src/features/auth/session/session-store.service.spec.ts src/features/auth/permission.service.spec.ts src/features/attachments/attachments-table.service.spec.ts src/features/field/field-calculate/field-converting.service.spec.ts src/features/record/record.service.spec.ts src/features/space/space.service.spec.ts` | 证明 backend unit coverage shard `3/4` 命中的 7 个 spec 已收敛为最小依赖直接实例化或实现契约对齐 mock，定向验证通过。 |
| 2026-05-27 | L2 | `pnpm test-unit --coverage --shard=3/4` | 证明 backend unit coverage shard `3/4` 本地完整通过，且 coverage 临时目录写盘问题已通过 `vitest.config.ts` 顶层预建目录与 `coverage.tempDirectory` 固化修复。 |
| 2026-05-27 | L2 | `pnpm exec vitest run src/features/selection/selection.service.spec.ts src/features/invitation/invitation.service.spec.ts src/features/auth/strategies/local.strategy.spec.ts src/features/access-token/access-token.service.spec.ts src/share-db/share-db.spec.ts src/features/field/field-calculate/field-converting-link.service.spec.ts src/features/view/open-api/view-open-api.service.spec.ts src/features/aggregation/aggregation.service.spec.ts src/features/dashboard/dashboard.service.spec.ts src/features/oauth/oauth.service.spec.ts src/features/share/share.service.spec.ts src/features/base/base.service.spec.ts` | 证明 backend unit coverage shard `4/4` 命中的 12 个 spec 已收敛为最小依赖直接实例化，定向验证通过。 |
| 2026-05-27 | L2 | `pnpm test-unit --coverage --shard=4/4` | 证明 backend unit coverage shard `4/4` 本地完整通过，当前 backend unit coverage 四个分片均已闭合，剩余 gap 收敛到 L4 workflow 确认。 |
| 2026-05-27 | L4 | GitHub Actions run `26493173331` | 证明 related integration workflow 已在 CI 环境全绿通过，`1/4 v1`、`1/4 v2`、`2/4 v1`、`2/4 v2`、`3/4 v1`、`3/4 v2`、`4/4 v1`、`4/4 v2` 与 `finish` job 全部 success，Gap List 清零。 |
