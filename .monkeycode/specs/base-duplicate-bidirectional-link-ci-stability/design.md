# Base Duplicate Bidirectional Link CI Stability Design

文档层级：正式标准

## 主线约束

本设计遵循：

| 协议 | 路径 |
|---|---|
| 主线交付判定协议 | `.monkeycode/docs/mainline-delivery-gate-protocol.md` |
| GPT-5.5 主线代码实施手册 | `.monkeycode/docs/gpt55-mainline-coding-playbook.md` |

## 开工口令

| 字段 | 值 |
|---|---|
| 主线验收 | `base-duplicate` 双向 link focused e2e |
| 当前红灯 | `link-view-user-filter` 多用户 `hasAnyOf([Me])` 返回空结果 |
| 失败层级 | v2 查询执行前的 `Me` 标签归一化兼容层 |
| 本轮假设 | `query.filter` 与 link field 自带 filter 并存时，大写 `Me` 在 `ListTableRecordsHandler` 中漏过归一化，导致 user list filter 仍带标签进入查询层 |
| 目标观测点 | `query.filter` 值、link field filter 值、spec visitor 收到的 user ids |
| 允许改动层 | 只允许修改被证据命中的最小层 |
| 本轮退出条件 | 主线 focused e2e 通过，或出现更窄的新红灯 |

## 失败链路四问

| 顺序 | 问题 | 观测点 | 责任层候选 |
|---:|---|---|---|
| 1 | 输入值正确吗 | create/convert payload 与 command input | OpenAPI service、command spec |
| 2 | 落库值正确吗 | create/convert 后 DB `field.options` | persistence builder、meta update visitor |
| 3 | 回读值正确吗 | repository 回读 `LinkField.fkHostTableName()` | repository、mapper、domain rehydrate |
| 4 | 使用值正确吗 | `RecordInsertBuilder` 接收到的 field config | runtime record builder、cache/source |
| 5 | 实际资源正确吗 | 数据库实际 junction relation 名 | schema creation path |

## 只读定位顺序

| 顺序 | 文件或区域 | 目标 |
|---:|---|---|
| 1 | `apps/nestjs-backend/test/base-duplicate.e2e-spec.ts` | 提取 createField、convertField、createRecords 时序 |
| 2 | `apps/nestjs-backend/src/features/field/open-api/field-open-api.controller.ts` | 确认 v2 create/convert 入口 |
| 3 | `apps/nestjs-backend/src/features/field/open-api/field-open-api-v2.service.ts` | 确认 API payload 到 command 的字段 |
| 4 | `packages/v2/core/src/commands/CreateFieldHandler.ts` | 确认 create field 持久化调用 |
| 5 | `packages/v2/core/src/commands/UpdateFieldHandler.ts` | 确认 convert/update 持久化调用 |
| 6 | `packages/v2/adapter-repository-postgres/src/repositories/visitors/TableMetaUpdateVisitor.ts` | 确认 options update SQL 参数 |
| 7 | `packages/v2/adapter-repository-postgres/src/repositories/PostgresTableRepository.ts` | 确认回读 field options |
| 8 | `packages/v2/core/src/ports/mappers/defaults/DefaultTableMapper.ts` | 确认 DTO/domain 映射 |
| 9 | `packages/v2/adapter-table-repository-postgres/src/record/query-builder/insert/RecordInsertBuilder.ts` | 确认 insert 使用 `fkHostTableName()` 的位置 |
| 10 | schema repository | 确认 junction table create/drop 命名 |

## 最小补丁策略

| 命中层 | 允许改动 | 必补证据 |
|---|---|---|
| create 持久化 | create field row 构造或 create handler 单层 | L2 create/persistence spec |
| convert 持久化 | update visitor 或 update handler 单层 | L2 update/meta visitor spec |
| repository 回读 | repository mapper 或 rehydrate 单层 | L2 repository/mapper spec |
| runtime 使用 | record builder 上游或 cache invalidation 单层 | L2 record/cache spec |
| schema 建表 | schema creation path 单层 | L2 schema repository spec |
| record typecast select 写入 | `FieldToSpecVisitor` 单层 | L2 field-to-spec spec 与 L3 record focused e2e |
| force-v2 header 期望 | 命中的 e2e 断言单层 | L3 record focused e2e 覆盖行为断言与 header 期望 |
| table trash 字段恢复 | `TrashService.restoreTableResource` 记录过滤单层 | L3 table-trash focused e2e 覆盖字段恢复与已删除 record 共存场景 |
| attachment preview URL 缓存响应 | `AttachmentsStorageService` 与 `RecordService` 缓存读取单层 | L3 attachment focused e2e 覆盖 cookie 写入相对 URL 后 Bearer token API 读取绝对 URL |
| link-view-user-filter `Me` 归一化 | `ListTableRecordsHandler` 单层 | L2 handler spec 与 L3 focused e2e 覆盖大写 `Me` 和历史小写 `me` 兼容 |

## 验证策略

| 等级 | 命令 | 证明范围 |
|---|---|---|
| L2 | 修改层对应 spec | 单层逻辑成立 |
| L3 | `pnpm pre-test-e2e` + focused `base-duplicate` e2e | 主线真实行为成立 |
| L4 | related GitHub Actions workflow | CI 环境成立 |

## 反漂移规则

| 风险 | 约束 |
|---|---|
| 局部绿灯误判 | L2 通过只能标记为局部绿灯 |
| 横向扩散 | 每轮只改证据命中的最小层 |
| debug 残留 | 临时观测代码必须在主线绿灯前移除 |
| 旧缓存掩盖 | 必须证实 create/convert 后 record insert 使用最新 field |
