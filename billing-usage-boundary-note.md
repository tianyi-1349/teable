# Billing / Usage Boundary Note

> 文档分层：正式输出。
> 
> 这份文档是 billing / usage 主仓边界判断的正式说明，用于沉淀阻塞证据和后续推进条件。

## 1. 目的

这份说明用于收口当前修复任务矩阵中最后一类未能在主仓直接落地的边界项：

- `billing/subscription`
- `usage`

目标是明确：

1. 当前仓库里已经确认了什么事实
2. 为什么这两类能力没有继续补进 `contract-http + api/v2`
3. 后续要满足什么条件才能继续推进

## 2. 已确认事实

### 2.1 前端存在真实消费

当前主仓前端已经有明确调用：

- `apps/nextjs-app/src/features/app/hooks/useBillingLevel.ts`
- `apps/nextjs-app/src/features/app/hooks/useBaseUsage.ts`
- `apps/nextjs-app/src/backend/api/rest/ssr-api.ts`

对应消费的 OpenAPI 路径包括：

- `GET_SUBSCRIPTION_SUMMARY`
- `GET_SUBSCRIPTION_SUMMARY_LIST`
- `GET_INSTANCE_USAGE`
- `GET_SPACE_USAGE`
- `GET_BASE_USAGE`

### 2.2 消费存在明确环境门控

相关前端逻辑已明确区分：

- `useIsCloud()`
- `useIsEE()`

这说明这两类能力当前并不属于主仓中无条件可用的通用主链路。

### 2.3 主仓 backend 中未定位到稳定事实源

当前已经反查：

- `apps/nestjs-backend/src/features/*`
- 相关 controller / service 命名
- OpenAPI 路径与返回结构关键字

结果是：

- 没有定位到与 `GET_SUBSCRIPTION_SUMMARY`、`GET_SUBSCRIPTION_SUMMARY_LIST` 对应的稳定 backend controller / service
- 没有定位到与 `GET_INSTANCE_USAGE`、`GET_SPACE_USAGE`、`GET_BASE_USAGE` 对应的稳定 backend controller / service

## 3. 当前结论

在当前仓库范围内，`billing/subscription` 与 `usage` 更适合被视为：

- 查询型外围能力
- 带有 Cloud / EE 边界的能力面
- 当前主仓未包含完整 backend 事实源的阻塞项

因此，本轮不继续做猜测式接线。

## 4. 为什么当前不直接补代码

如果继续在当前主仓内强行补 `contract-http + api/v2`，会出现以下问题：

1. 无法确认真实后端事实源
2. 无法确认返回语义是否和 Cloud / EE 实现一致
3. 容易生成“形状相似但语义不一致”的伪接口

这会让能力矩阵表面上更完整，但会降低整体可信度。

## 5. 后续触发条件

满足以下任一条件后，可以重新打开该专项：

1. 提供对应 Cloud / EE backend 仓库或模块
2. 提供当前环境中这几条接口真实的 controller / service 位置
3. 明确允许在主仓内重建一套新的、与现有前端消费对齐的替代实现

## 6. 当前建议

当前最合理的处理方式是：

1. 把这两类能力保留在外围域路线图中
2. 在系统管理与外围索引中显式标记为边界受限项
3. 将事实源明确作为后续专项重新打开的触发条件
