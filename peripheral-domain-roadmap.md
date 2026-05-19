# Peripheral Domain Roadmap

> 文档分层：正式输出。
> 
> 这份文档是外围域治理的正式路线图，用于说明组织、billing、插件和命名治理的后续安排。

## 1. 目的

这份文档用于收口 `capability-gap-task-matrix.md` 中以下外围域治理主题：

- `3.1 组织信息域较浅`
- `3.2 Billing & Usage 更接近外围查询接口`
- `3.3 独立 Univer 插件产品化程度低`
- `3.4 OpenAPI 子域与后端 feature 命名体系有历史包袱`

## 2. 组织信息域

### 当前状态

- 有明确 OpenAPI 与 backend controller
- 与协作主链路相比，覆盖深度偏浅

### 建议

1. 保持独立业务域定位
2. 后续仅在协作主链路确实需要时再触发收敛

## 3. Billing & Usage 域

### 当前状态

- 当前更像订阅摘要查询层
- 后端事实源不如其他成熟域直观
- 前端消费存在明确 Cloud / EE 门控：`apps/nextjs-app/src/features/app/hooks/useBillingLevel.ts`、`useBaseUsage.ts`
- 当前主仓 `apps/nestjs-backend/src/features/*` 下未定位到与 `GET_SUBSCRIPTION_SUMMARY`、`GET_SUBSCRIPTION_SUMMARY_LIST`、`GET_INSTANCE_USAGE`、`GET_SPACE_USAGE`、`GET_BASE_USAGE` 对应的稳定 controller / service 事实源

### 建议

1. 先把它定义为查询型外围域
2. 把当前阻塞明确标记为“主仓未包含稳定 backend 事实源，疑似 Cloud / EE 边界”
3. 将事实源明确作为后续触发条件，再决定是否进入 `contract-http`

### 当前结论

当前仓库范围内，Billing / Usage 更适合作为边界受限的外围查询域处理。

继续在当前主仓中直接补 `contract-http + api/v2` 会进入猜测式接线，因此本轮以事实源确认和文档收口为完成条件。

当前边界说明文档：

- `billing-usage-boundary-note.md`

## 4. Univer 插件域

### 当前状态

- 已有代码基础
- 产品化成熟度较低

### 建议

1. 继续保留实验性标签
2. 不把它纳入当前主迁移闭环

## 5. 命名历史包袱

### 当前状态

- 通过索引文档已显著降低误判
- 仓库中仍存在少量命名不直观情况，例如 `chart` / `chat` 映射关系

### 建议

1. 先以索引文档维持可读性
2. 真正重命名动作保留到后续专项治理触发时处理

## 6. 当前结论

这些外围域当前最适合的执行方式是：

- 明确定位
- 固化索引
- 保留后续触发型路线图

不在本轮强行推进成主链路重构。
