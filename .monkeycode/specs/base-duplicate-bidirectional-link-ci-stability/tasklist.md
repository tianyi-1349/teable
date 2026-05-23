# Base Duplicate Bidirectional Link CI Stability Tasklist

文档层级：正式输出

## 状态

| 字段 | 值 |
|---|---|
| 当前状态 | 主线绿灯，CI 待确认 |
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
| T9 | pending | L4 | 触发相关 GitHub Actions workflow | 记录 L4 证明句，状态升级为 CI 确认 |
| T10 | in_progress | L3 | 清理 Gap List 并检查临时观测代码 | 临时观测代码已清理，CI gap 待关闭 |

## 下一步执行

1. 触发相关 GitHub Actions workflow，确认 CI 环境结果。
2. 若 workflow 通过，关闭 CI gap 并进入可交付状态。
3. 若 workflow 红灯，按失败链路四问继续收窄到最新命中层。

## 证明句记录

| 时间 | 等级 | 命令或证据 | 证明句 |
|---|---|---|---|
| 2026-05-23 | L1 | SDD 文档创建 | 证明本任务已锁定主线验收卡、失败链路四问、Gap List 和轻量 SDD 执行边界。 |
| 2026-05-23 | L2 | `pnpm --filter @teable/backend exec vitest run src/features/field/open-api/field-open-api-v2.service.spec.ts src/features/record/open-api/record-open-api-v2.service.spec.ts` | 证明 backend OpenAPI link/record 兼容层回归通过，78 tests passed。 |
| 2026-05-23 | L2 | `pnpm exec vitest run src/repositories/TableFieldPersistenceBuilder.spec.ts src/repositories/visitors/TableMetaUpdateVisitor.spec.ts` | 证明 v2 repository persistence/update visitor 回归通过，17 tests passed。 |
| 2026-05-23 | L2 | `pnpm exec vitest run src/commands/CreateFieldCommand.spec.ts src/commands/TableFieldUpdateSpecs.spec.ts` | 证明 v2 core create/update link config 回归通过，42 tests passed。 |
| 2026-05-23 | L3 | `pnpm pre-test-e2e && env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/base-duplicate.e2e-spec.ts -t "should duplicate base with bidirectional link field"` | 证明主线双向 link base duplicate 行为通过，1 test passed，20 skipped。 |
| 2026-05-23 | L2 | `env NODE_OPTIONS=--max-old-space-size=4096 pnpm --filter @teable/backend typecheck` | 证明 backend 类型边界通过；默认 heap 下 OOM，提升 Node heap 后无类型错误。 |
