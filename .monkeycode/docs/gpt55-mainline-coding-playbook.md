# GPT-5.5 主线代码实施手册

文档层级：正式标准

关联文档：`.monkeycode/docs/mainline-delivery-gate-protocol.md`

## 目标

本手册用于指导 GPT-5.5 在复杂修复任务中更快、更准地落代码。

核心目标：先锁定主线红灯，再用最小代码改动打通真实行为链路，避免横向扩散、局部绿灯误判、重复试错。

## 开工口令

每次进入代码实施阶段，先填写以下内容。

```md
主线验收：
当前红灯：
失败层级：
本轮假设：
目标观测点：
允许改动层：
本轮退出条件：
```

当前任务默认值：

| 字段 | 值 |
|---|---|
| 主线验收 | `base-duplicate` 双向 link focused e2e |
| 当前红灯 | record insert 使用单边 `junction_fld...` |
| 失败层级 | record 写入前的 field config 或 junction relation 不一致 |
| 本轮假设 | create/convert 后持久化、回读、缓存、建表任一环节丢失 manyMany junction config |
| 目标观测点 | 落库值、回读值、建表名、insert 使用值 |
| 允许改动层 | 只允许修改被证据命中的最小层 |
| 本轮退出条件 | 主线 focused e2e 通过，或出现更窄的新红灯 |

## 代码实施总流程

| 阶段 | 动作 | 产出 | 进入下一阶段条件 |
|---|---|---|---|
| 1 | 复现主线红灯 | 错误信息和失败栈 | 错误稳定复现 |
| 2 | 建立链路假设 | 四问定位表 | 有明确目标观测点 |
| 3 | 只读定位 | 文件路径和调用链 | 找到最可能责任层 |
| 4 | 最小补丁 | 单层最小 diff | 对应 L2 测试可覆盖 |
| 5 | 局部验证 | L2 证明句 | 局部绿灯 |
| 6 | 主线验证 | L3 focused e2e 证明句 | 主线绿灯或新红灯 |
| 7 | CI 确认 | L4 workflow 证明句 | 可交付 |

## 四问到代码路径映射

| 四问 | 优先读的代码 | 典型责任文件 | 修改优先级 |
|---|---|---|---|
| 输入值正确吗 | API service、command schema、mapper | `field-open-api-v2.service.ts`、`CreateFieldCommand.ts`、`TableFieldSpecs.ts` | payload 错时改 |
| 落库值正确吗 | persistence builder、meta visitor、handler | `TableFieldPersistenceBuilder.ts`、`TableMetaUpdateVisitor.ts`、create/update field handler | 高 |
| 回读值正确吗 | repository、mapper、domain rehydrate | `PostgresTableRepository.ts`、`DefaultTableMapper.ts`、`LinkFieldConfig.ts` | 高 |
| 使用值正确吗 | record builder、schema builder、runtime handler | `RecordInsertBuilder.ts`、schema repository、record command handler | 高 |

## 当前任务最快定位路径

| 顺序 | 问题 | 目标值 | 判断 |
|---:|---|---|---|
| 1 | create 后 DB `field.options` 是什么 | `fkHostTableName = bse...junction_${fieldId}_${symmetricFieldId}` | 错则 create 持久化层负责 |
| 2 | convert 后 DB `field.options` 是什么 | 仍保留完整 junction config | 错则 update/meta visitor 负责 |
| 3 | repository 回读 `LinkField` 是什么 | `fkHostTableName()` 返回完整 junction config | 错则 repository/mapper 负责 |
| 4 | record insert 收到什么 | `RecordInsertBuilder` 的 field config 正确 | 错则 cache/table source 负责 |
| 5 | DB 实际有哪些 junction relation | relation 名和 config 一致 | 错则 schema creation 负责 |

## 修改决策树

```text
focused e2e 失败
  -> 错误仍是单边 junction relation 不存在
    -> DB field.options create 后正确吗
      -> 错：修改 create 持久化路径
      -> 对：检查 convert 后 field.options
    -> convert 后仍正确吗
      -> 错：修改 update/meta visitor 路径
      -> 对：检查 repository 回读
    -> repository 回读正确吗
      -> 错：修改 repository/mapper rehydrate 路径
      -> 对：检查 RecordInsertBuilder 使用值
    -> RecordInsertBuilder 使用值正确吗
      -> 错：修改 cache/source invalidation 或 record builder 上游
      -> 对：检查实际 junction relation
    -> 实际 junction relation 正确吗
      -> 错：修改 schema creation 路径
      -> 对：检查测试数据时序和事务可见性
  -> 错误形态变化
    -> 记录新红灯，重新执行四问
```

## 最小补丁规则

| 规则 | 要求 |
|---|---|
| 单层修复 | 一次只改当前证据命中的层 |
| 单一目标 | 一个补丁只解决一个红灯原因 |
| 复用现有模型 | 优先使用已有 `LinkFieldConfig`、mapper、visitor |
| 保留现有行为 | 对低相关路径只补测试证据，不扩大改动 |
| 失败驱动测试 | 新测试必须复现或覆盖本次红灯链路的一层 |
| 临时观测可回收 | debug log、临时查询、临时 throw 必须在交付前移除 |

## 测试选择规则

| 修改层 | 必跑 L2 | 必跑 L3 |
|---|---|---|
| OpenAPI field service | `field-open-api-v2.service.spec.ts` | `base-duplicate` focused e2e |
| v2 core create/update | `CreateFieldCommand.spec.ts`、`TableFieldUpdateSpecs.spec.ts` | `base-duplicate` focused e2e |
| repository persistence | `TableFieldPersistenceBuilder.spec.ts`、`TableMetaUpdateVisitor.spec.ts` | `base-duplicate` focused e2e |
| record write path | `record-open-api-v2.service.spec.ts` 或 focused record spec | `base-duplicate` focused e2e |
| schema/junction creation | schema repository spec | `base-duplicate` focused e2e |
| cache/invalidation | 对应 service spec 或 integration focused | `base-duplicate` focused e2e |

## 证明句模板

```md
L2 证明：`[测试命令]` 证明 [具体层级] 在 [具体输入] 下会产出 [具体输出]。
L3 证明：`[focused e2e]` 证明 [主线用户路径] 在真实 app + DB 下通过。
L4 证明：`[workflow run]` 证明目标分支在 CI 环境通过。
```

## 代码阅读顺序模板

| 顺序 | 读什么 | 退出条件 |
|---:|---|---|
| 1 | 失败 e2e 用例 | 画出 API 调用时序 |
| 2 | controller/service 入口 | 找到 command 或 handler |
| 3 | command schema/spec | 确认 input 是否保留关键字段 |
| 4 | handler | 找到 domain table mutation 和 repository 调用 |
| 5 | persistence visitor/builder | 确认落库字段如何序列化 |
| 6 | repository read mapper | 确认 DB row 如何 rehydrate |
| 7 | runtime builder | 确认最终消费哪个 field object |
| 8 | cache invalidation | 确认更新后是否读旧值 |

## 当前任务代码阅读清单

| 顺序 | 文件 | 目标 |
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

## 观测点实现策略

| 观测点 | 推荐方式 | 临时方式 | 删除要求 |
|---|---|---|---|
| DB `field.options` | focused integration 断言或 test helper 查询 | 临时 debug log | 主线绿灯前移除 |
| repository 回读值 | repository spec 或 service spec mock 断言 | 临时 console/debug | 主线绿灯前移除 |
| insert 使用值 | builder spec 断言传入 field | 临时 throw/debug | 主线绿灯前移除 |
| actual relation | schema repository spec 或 DB metadata 查询 | 临时 SQL 查询 | 主线绿灯前移除 |

## 提交前代码自检

| 检查项 | 标准 |
|---|---|
| 主线映射 | 每个改动文件能映射到主线链路 |
| 补丁范围 | 修改层级和证据命中层一致 |
| 测试覆盖 | 至少一条 L2 覆盖修改层 |
| 主线验证 | L3 focused e2e 通过 |
| 回归风险 | 低相关文件无额外改动 |
| 临时观测 | debug 代码已移除 |
| 状态表述 | 使用状态词典 |

## PR/CI 执行顺序

| 顺序 | 动作 | 目的 |
|---:|---|---|
| 1 | 跑修改层 L2 测试 | 证明局部修复 |
| 2 | 跑主线 L3 focused e2e | 证明真实行为 |
| 3 | 查看 `git diff --stat` | 控制补丁范围 |
| 4 | 提交强相关修复 | 保持提交语义聚焦 |
| 5 | 推送分支 | 更新 PR |
| 6 | 触发相关 workflow | 获取 L4 证据 |
| 7 | 记录证明句和剩余 Gap | 更新交付状态 |

## 当前任务推荐下一步

当前主线仍红灯，下一轮先做只读定位。

| 顺序 | 动作 | 产出 |
|---:|---|---|
| 1 | 读取失败 e2e 用例时序 | create/convert/insert 调用图 |
| 2 | 读取 create/update handler | 持久化入口路径 |
| 3 | 读取 repository 回读路径 | options rehydrate 路径 |
| 4 | 读取 RecordInsertBuilder 上游 | field 来源路径 |
| 5 | 基于证据选择一个责任层 | 单层最小补丁计划 |

## 最终落代码模板

```md
本轮链路层：
证据命中点：
修改文件：
修改内容：
L2 测试：
L2 证明句：
L3 测试：
L3 证明句：
剩余 Gap：
```
