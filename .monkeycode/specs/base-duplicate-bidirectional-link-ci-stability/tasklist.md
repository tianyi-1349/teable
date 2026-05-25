# Base Duplicate Bidirectional Link CI Stability Tasklist

文档层级：正式输出

## 状态

| 字段 | 值 |
|---|---|
| 当前状态 | 主线绿灯，最新 `link-view-user-filter` 多用户 `Me` 过滤 CI 红灯已本地复核，CI 重跑待确认 |
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
| T9 | in_progress | L4 | 触发相关 GitHub Actions workflow | 记录 L4 证明句，状态升级为 CI 确认 |
| T10 | in_progress | L3 | 清理 Gap List 并检查临时观测代码 | 当前无临时观测代码，CI gap 待关闭 |

## 下一步执行

1. 提交并推送本轮 CI 稳定性修正。
2. 重新触发相关 GitHub Actions workflow，确认 CI 环境结果。
3. 若 workflow 通过，关闭 CI gap 并进入可交付状态。
4. 若 workflow 红灯，按失败链路四问继续收窄到最新命中层。

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
