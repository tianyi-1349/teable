# 主线交付判定协议

文档层级：正式标准

## 适用场景

本协议用于复杂工程任务、CI 修复、跨层链路修复、E2E 回归修复，以及任何容易出现局部绿灯替代真实交付的任务。

核心目标：把交付判定绑定到主线真实行为，防止主线漂移、骨架式完成感、工程门禁替代验收。

## 当前任务主线卡

| 字段 | 内容 |
|---|---|
| 主线验收 | `test/base-duplicate.e2e-spec.ts -t "should duplicate base with bidirectional link field"` |
| 当前红灯 | record insert 使用单边 `junction_fld...`，数据库 relation 不存在 |
| 当前失败层 | record 写入前拿到的 link field config 或实际 junction 表名不一致 |
| 当前已证实 | OpenAPI/domain 层能生成或保留完整 manyMany junction config |
| 剩余 Gap | 落库值、回读值、实际建表名、insert 使用值 |
| 完成门槛 | focused e2e 通过，相关 L2 测试通过，integration workflow 通过，Gap 清零 |

## 状态词典

| 状态 | 使用条件 |
|---|---|
| 主线红灯 | 主线 focused e2e 仍失败 |
| 局部绿灯 | 单测、spec、局部 focused test 通过 |
| 主线绿灯 | 主线 focused e2e 通过 |
| CI 确认 | 相关 workflow 在目标分支通过 |
| 可交付 | 主线绿灯、CI 确认、Gap 清零同时满足 |

## 证据等级

| 等级 | 名称 | 示例 | 可证明内容 | 交付作用 |
|---|---|---|---|---|
| L1 | 静态正确性 | typecheck、lint、schema parse | 类型、格式、静态约束成立 | 支撑证据 |
| L2 | 局部逻辑 | unit、spec、handler mock test | 单层逻辑成立 | 局部证据 |
| L3 | 链路行为 | focused e2e、integration test | 用户路径或跨层链路成立 | 主线验收核心 |
| L4 | 环境确认 | GitHub Actions workflow、CI matrix | CI 环境下行为成立 | 发布确认 |

交付规则：复杂任务完成至少需要相关 L2 通过、主线 L3 通过、相关 L4 通过。

## 失败链路四问

每次主线红灯后，按固定顺序回答四个问题。

| 顺序 | 问题 | 对应层级 | 产出 |
|---:|---|---|---|
| 1 | 输入值正确吗 | API/service/command input | 输入 payload 证据 |
| 2 | 落库值正确吗 | persistence/update visitor | 数据库 row 证据 |
| 3 | 回读值正确吗 | repository/cache/mapper | domain object 证据 |
| 4 | 使用值正确吗 | runtime builder/handler | 运行时消费值证据 |

当前任务按以下观测点执行。

| 顺序 | 观测点 | 判断目标 |
|---:|---|---|
| 1 | createField 后数据库 `field.options` | 判断 create 是否落库完整 junction config |
| 2 | convertField 后数据库 `field.options` | 判断 convert 是否覆盖或丢失 junction config |
| 3 | repository 回读后的 `LinkField.fkHostTableName()` | 判断回读或缓存是否得到正确表名 |
| 4 | `RecordInsertBuilder` 接收到的 link field config | 判断写入层是否使用正确表名 |
| 5 | 实际数据库 junction 表名 | 判断建表名是否和 field config 一致 |

## 支线预算

复杂任务同时最多维护三类支线。

| 支线类型 | 定义 | 处理规则 |
|---|---|---|
| 强相关 | 直接影响主线失败链路 | 立即处理并补证据 |
| 间接相关 | 影响共享底层或 CI 执行环境 | 记录并等待触发条件 |
| 低相关 | 与当前主线验收关系弱 | 仅在 CI 阻塞时处理 |

当前任务支线分类。

| 修复主题 | 支线类型 | 处理方式 |
|---|---|---|
| link create/convert dbConfig | 强相关 | 保留并继续验证全链路 |
| v2 core manyMany create config | 强相关 | 保留 L2 证据 |
| repository field persistence | 强相关 | 继续查实际调用路径 |
| table meta update visitor | 强相关 | 继续查实际 convert 落库路径 |
| record link 写接口出口 | 间接相关 | 保留 response shape 证据 |
| rollup compatibility | 间接相关 | 共享 field mapping 时回看 |
| selection 稳定性 | 低相关 | 保留 CI 稳定性结论 |
| button workflow fixture | 低相关 | 保留 CI 稳定性结论 |
| auth token/encryptor | 低相关 | 保留 e2e 初始化结论 |

## 文件链路标签规则

| 路径特征 | 链路标签 |
|---|---|
| `open-api` | API 映射层 |
| `commands` | domain command 层 |
| `domain/table/fields` | domain field 层 |
| `adapter-repository` | 持久化与 repository 层 |
| `adapter-table-repository` | runtime table/record 层 |
| `test/*.e2e-spec.ts` | 行为验收层 |
| `.github/workflows` | CI 门禁层 |

## 当前改动链路归类

| 文件 | 链路标签 | 主线相关性 | 当前证明范围 |
|---|---|---:|---|
| `apps/nestjs-backend/src/features/field/open-api/field-open-api-v2.service.ts` | API 映射层 | 强 | create/convert 可补齐或保留 link dbConfig |
| `apps/nestjs-backend/src/features/field/open-api/field-open-api-v2.service.spec.ts` | API 映射层测试 | 强 | L2 证明 API 层 payload 成立 |
| `packages/v2/core/src/commands/TableFieldSpecs.ts` | domain command 层 | 强 | create manyMany 生成 junction config |
| `packages/v2/core/src/commands/CreateFieldCommand.spec.ts` | domain command 测试 | 强 | L2 证明 core create 成立 |
| `packages/v2/core/src/commands/TableFieldUpdateSpecs.spec.ts` | domain update 测试 | 强 | L2 证明 same-type update 保留 config |
| `packages/v2/adapter-repository-postgres/src/repositories/TableFieldPersistenceBuilder.ts` | 持久化 row 构造层 | 强 | link field row 构造优先 domain options |
| `packages/v2/adapter-repository-postgres/src/repositories/TableFieldPersistenceBuilder.spec.ts` | 持久化 row 构造测试 | 强 | L2 证明 builder 单点序列化 |
| `packages/v2/adapter-repository-postgres/src/repositories/visitors/TableMetaUpdateVisitor.ts` | meta update 持久化层 | 强 | link config update 写完整 options |
| `packages/v2/adapter-repository-postgres/src/repositories/visitors/TableMetaUpdateVisitor.spec.ts` | meta update 测试 | 强 | L2 证明 SQL builder 参数 |
| `apps/nestjs-backend/src/features/record/open-api/record-open-api-v2.service.ts` | record 写接口出口层 | 间接 | response 归一化和 link title hydration |
| `apps/nestjs-backend/src/features/record/open-api/record-open-api-v2.service.spec.ts` | record 写接口测试 | 间接 | L2 证明返回 shape |
| `apps/nestjs-backend/test/selection.e2e-spec.ts` | 行为验收层 | 低 | CI 稳定性 |

## 测试证明句

每次执行测试后，必须记录一条证明句。

| 测试 | 等级 | 证明句 |
|---|---|---|
| `field-open-api-v2.service.spec.ts` | L2 | 证明 OpenAPI create/convert 能生成或保留 link dbConfig |
| `CreateFieldCommand.spec.ts` | L2 | 证明 core create 能生成 manyMany junction config |
| `TableFieldUpdateSpecs.spec.ts` | L2 | 证明 same-type link update 能保留 junction config |
| `TableFieldPersistenceBuilder.spec.ts` | L2 | 证明 field row 构造可序列化最新 link options |
| `TableMetaUpdateVisitor.spec.ts` | L2 | 证明 link config update 能写入最新 options 参数 |
| `record-open-api-v2.service.spec.ts` | L2 | 证明写接口返回值能归一化 link response shape |
| `link-api.e2e-spec.ts` focused | L3 | 证明部分 link typecast 写入路径成立 |
| `base-duplicate.e2e-spec.ts` focused | L3 | 证明双向 link base duplicate 主线行为成立 |
| integration workflow | L4 | 证明 CI 环境下 integration 行为成立 |

## 当前 Gap List

| Gap | 当前状态 | 需要的证据 |
|---|---|---|
| createField 后 DB options | 待证实 | `field.options` 包含 `fkHostTableName`、`selfKeyName`、`foreignKeyName`、`symmetricFieldId` |
| convertField 后 DB options | 待证实 | convert 后仍保留 junction config |
| repository 回读 LinkField | 待证实 | `fkHostTableName()` 返回 `junction_${fieldId}_${symmetricFieldId}` |
| 实际 junction table 名 | 待证实 | 数据库实际 relation 名和 config 一致 |
| record insert 使用值 | 待证实 | `RecordInsertBuilder` 读取到正确 `fkHostTableName()` |
| cache invalidation | 待证实 | create/convert 后 record insert 使用最新 table/field |

## 最小复验集

按顺序执行，前一步失败时先定位失败原因。

```bash
# API 映射层 L2
pnpm --filter @teable/backend exec vitest run src/features/field/open-api/field-open-api-v2.service.spec.ts

# domain create L2
pnpm exec vitest run src/commands/CreateFieldCommand.spec.ts

# domain update L2
pnpm exec vitest run src/commands/TableFieldUpdateSpecs.spec.ts

# persistence builder L2
pnpm exec vitest run src/repositories/TableFieldPersistenceBuilder.spec.ts

# meta update visitor L2
pnpm exec vitest run src/repositories/visitors/TableMetaUpdateVisitor.spec.ts

# 主线 focused e2e L3
pnpm pre-test-e2e
env CI=1 SECRET_KEY=test-secret FORCE_V2_ALL=true V2_COMPUTED_UPDATE_MODE=sync pnpm exec vitest run --config ./vitest-e2e.config.ts test/base-duplicate.e2e-spec.ts -t "should duplicate base with bidirectional link field"
```

工作目录要求：

| 命令 | 工作目录 |
|---|---|
| backend service spec | `/workspace` |
| v2 core specs | `/workspace/packages/v2/core` |
| adapter repository specs | `/workspace/packages/v2/adapter-repository-postgres` |
| backend e2e | `/workspace/apps/nestjs-backend` |

## 执行流程

### 阶段 1：主线锁定

| 步骤 | 动作 | 产出 |
|---:|---|---|
| 1 | 填写主线卡 | 主线目标、当前红灯、完成门槛 |
| 2 | 标记当前状态 | 主线红灯、局部绿灯、CI 确认之一 |
| 3 | 列出允许支线 | 强相关、间接相关、低相关 |

### 阶段 2：失败链路定位

| 步骤 | 动作 | 产出 |
|---:|---|---|
| 1 | 确认输入值 | API payload 证据 |
| 2 | 确认落库值 | DB row 证据 |
| 3 | 确认回读值 | domain field 证据 |
| 4 | 确认使用值 | runtime builder 证据 |
| 5 | 确认实际资源 | junction relation 证据 |

### 阶段 3：修复判定

| 步骤 | 动作 | 产出 |
|---:|---|---|
| 1 | 将改动文件打链路标签 | 文件链路表 |
| 2 | 运行对应 L2 测试 | 证明句 |
| 3 | 运行主线 L3 focused e2e | 主线绿灯或新红灯 |
| 4 | 更新 Gap List | 清零或收敛 |
| 5 | 触发 L4 workflow | CI 确认 |

### 阶段 4：交付判定

| 判定项 | 要求 |
|---|---|
| 主线验收 | focused e2e 通过 |
| 局部证据 | 相关 L2 测试通过 |
| CI 环境 | 相关 workflow 通过 |
| Gap List | 清零或有明确风险记录 |
| 状态 | 标记为可交付 |

## 当前任务下一步

按以下顺序只读定位。

| 顺序 | 文件或模块 | 目标 |
|---:|---|---|
| 1 | `apps/nestjs-backend/test/base-duplicate.e2e-spec.ts` | 确认失败用例 create/convert/insert 时序 |
| 2 | v2 create field handler | 确认 create 实际持久化路径 |
| 3 | v2 update field handler 与 `TableMetaUpdateVisitor` | 确认 convert 实际落库路径 |
| 4 | `PostgresTableRepository` | 确认 field options 如何回读成 `LinkFieldConfig` |
| 5 | `RecordInsertBuilder` 上游 | 确认 insert 使用的 table/field 来源 |
| 6 | schema repository junction 建表逻辑 | 对比建表名与 config 命名 |
| 7 | field/table cache invalidation | 确认 create/convert 后 record insert 使用最新 field |

## 提交前检查

提交或推送前必须确认以下项目。

| 检查项 | 状态 |
|---|---|
| 主线卡已更新 | 待填 |
| 改动文件已打链路标签 | 待填 |
| 相关 L2 测试通过 | 待填 |
| 主线 L3 focused e2e 通过 | 待填 |
| L4 workflow 已规划或已通过 | 待填 |
| Gap List 已清零或记录风险 | 待填 |
| 最终状态使用状态词典表述 | 待填 |

## 反模式检查

| 反模式 | 检查方式 | 处理方式 |
|---|---|---|
| 主线漂移 | 当前动作无法映射到主线卡 | 停止支线，回到主线失败链路 |
| 骨架冒充完成 | 只有代码改动或局部测试通过 | 标记为局部绿灯 |
| 工程门禁替代验收 | 只提供 typecheck/lint/build 结果 | 补 L3 主线行为验证 |
| 模糊完成状态 | 使用“基本完成”“应该好了” | 改用状态词典 |
| 测试证明范围过大 | 单测被描述为端到端证明 | 写证明句并限定层级 |

## 最终交付模板

```md
状态：可交付 / 主线红灯 / 局部绿灯 / CI 确认

主线验收：
- [focused e2e 名称]

本轮改动层级：
- [API/domain/persistence/repository/runtime/CI]

验证结果：
- L2：[测试命令]，[证明句]
- L3：[测试命令]，[证明句]
- L4：[workflow run]，[证明句]

Gap List：
- [已清零或剩余风险]

交付判定：
- [明确是否可交付]
```
