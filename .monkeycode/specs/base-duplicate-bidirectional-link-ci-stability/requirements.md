# Base Duplicate Bidirectional Link CI Stability Requirements

文档层级：正式标准

## 主线验收卡

| 字段 | 内容 |
|---|---|
| 主线验收 | `test/base-duplicate.e2e-spec.ts -t "should duplicate base with bidirectional link field"` |
| 当前状态 | 主线绿灯，最新 attachment token absolute URL CI 红灯已本地复核，CI 重跑待确认 |
| 当前红灯 | 无本地主线红灯 |
| 当前失败层 | 最新 CI integration 红灯已定位到 attachment preview URL cache/response 装饰层：Bearer token API 读取 record 时 local attachment `presignedUrl` 应返回绝对 URL |
| 当前已证实 | create/update persistence、repository 回读、duplicate/import、普通数据复制、junction 复制主线链路、one-way manyMany legacy junction 命名、conditional rollup filter timeZone 回读、link convert foreign table 切换、preventAutoNewOptions 无效选项省略语义、sparse single select batch update 省略字段兼容语义、table trash 字段恢复跳过已删除 record、attachment token API 绝对 URL 均已通过 focused e2e |
| 完成门槛 | L2 相关测试通过、主线 focused e2e 通过、相关 CI workflow 通过、Gap List 清零 |

## Requirements

### R1: Mainline Behavior

WHEN the backend e2e test creates a base with a bidirectional many-many link field, converts that field, writes records, and duplicates the base, THE SYSTEM SHALL complete `should duplicate base with bidirectional link field` without attempting to access a stale single-sided junction table.

验收证据：L3 `base-duplicate` focused e2e 通过。

### R2: Junction Config Persistence

WHEN a bidirectional many-many link field is created, THE SYSTEM SHALL persist `field.options` with `symmetricFieldId`, `fkHostTableName`, `selfKeyName`, and `foreignKeyName` using the canonical junction table naming for both sides.

验收证据：createField 后 DB `field.options` 包含完整 junction config。

### R3: Convert Preservation

WHEN the same bidirectional many-many link field is converted or updated, THE SYSTEM SHALL preserve existing junction config rather than replacing it with a single-field junction name.

验收证据：convertField 后 DB `field.options` 仍包含完整 junction config。

### R4: Repository Rehydration

WHEN the table repository reads the link field back from persistence, THE SYSTEM SHALL rehydrate a `LinkField` whose `fkHostTableName()` returns the persisted canonical junction table name.

验收证据：repository 回读后的 domain field 值正确。

### R5: Runtime Consumption

WHEN record insert builds SQL for a bidirectional many-many link field, THE SYSTEM SHALL use the same canonical junction table name that exists in the database schema.

验收证据：`RecordInsertBuilder` 使用值与实际 relation 名一致。

### R6: Delivery Gate

WHEN local L2 tests pass, THE SYSTEM SHALL keep the task status as 局部绿灯 until L3 focused e2e and L4 related workflow pass and Gap List is cleared.

验收证据：证明句覆盖 L2、L3、L4，Gap List 全部关闭。

## Gap List

| Gap | 状态 | 需要的证据 |
|---|---|---|
| createField 后 DB options | 已闭合 | v2 core create spec 与 focused e2e 证明完整 junction config 可创建并被主线使用 |
| convertField 后 DB options | 已闭合 | v2 update/repository visitor spec 与 focused e2e 证明 convert 后仍保留 junction config |
| repository 回读 LinkField | 已闭合 | repository persistence/update visitor spec 与 record insert 主线 e2e 证明回读值可被运行时使用 |
| 实际 junction table 名 | 已闭合 | focused e2e 通过，证明实际 relation 与 config 在 duplicate 主线中一致 |
| record insert 使用值 | 已闭合 | focused e2e 通过，证明 `RecordInsertBuilder` 使用值已不再指向 stale single-sided junction table |
| cache invalidation | 已闭合 | focused e2e 在 create、convert、insert、duplicate 连续链路中通过，证明当前链路使用最新 table/field |
| one-way manyMany legacy junction 命名 | 已闭合 | `test/link-api.e2e-spec.ts -t "should create one way, many many link"` 通过，证明 one-way manyMany 仍使用单字段 junction 名且不暴露 symmetricFieldId |
| conditional rollup dynamic filter timeZone 回读 | 已闭合 | `test/conditional-rollup.e2e-spec.ts -t "should honor today filters in conditional rollups"` 通过，证明 filter 内 `timeZone: 'utc'` 回读保持原值 |
| link convert foreign table stale lookupFieldId | 已闭合 | `test/undo-redo.e2e-spec.ts -t "should undo / redo convert link when convert link from one table to another"` 通过，证明切换 foreign table 时不沿用旧 lookupFieldId |
| select preventAutoNewOptions invalid option should be omitted | 已闭合 | `FieldToSpecVisitor.spec.ts` 与 `test/record.e2e-spec.ts -t "should not auto create options when preventAutoNewOptions is true"` 通过，证明 invalid single select 省略更新，multiple select 只保留有效选项 |
| FORCE_V2_ALL sparse single select header expectation | 已闭合 | `test/record.e2e-spec.ts` 两个 sparse single select focused e2e 在 `FORCE_V2_ALL=true` 下通过，证明 header 期望与 force-v2 CI 环境一致且行为断言仍成立 |
| table trash field restore skips deleted records | 已闭合 | `test/table-trash.e2e-spec.ts -t "should restore field when some records were deleted after field deletion"` 在 `FORCE_V2_ALL=true` 下通过，证明字段恢复只更新仍存在的 record |
| attachment token API returns absolute local preview URL | 已闭合 | `test/attachment.e2e-spec.ts -t "should get attachment absolute url by token"` 在 `FORCE_V2_ALL=true` 下通过，证明 Bearer API 读取 record 时 local attachment `presignedUrl` 按 `storagePrefix` 返回绝对 URL |
| related CI workflow | 待确认 | 需要重新触发并记录相关 GitHub Actions workflow 结果 |
