# Observability and Adapter Validation Plan

> 文档分层：正式输出。
> 
> 这份文档是观测治理与多适配验证的正式计划，用于补齐验证路径和产品级表达。

## 1. 目的

这份文档用于收口 `capability-gap-task-matrix.md` 中以下治理主题：

- `4.4 多数据库 / 多 HTTP 适配覆盖率待验证`
- `5.1 观测能力缺少统一产品级表达`

## 2. 当前事实

### 2.1 观测能力已存在

- 日志
- OpenTelemetry
- Sentry
- 健康检查
- 队列与异步任务映射

### 2.2 适配方向已存在

- 数据库适配：SQLite / PostgreSQL / MySQL 方向已声明
- HTTP 适配：Express / Fastify 方向已声明

## 3. 当前治理主题

- 观测入口存在，当前已通过治理文档形成统一产品级治理说明
- 多数据库与多 HTTP 的“真实验证面”已被收束为后续 smoke 验证矩阵主题

## 4. 观测治理最小方案

### 4.1 建议统一分层

1. 产品可见状态
   - 健康检查
   - 后台任务状态
2. 研发运行状态
   - 日志
   - Tracing
   - Error reporting
3. 适配验证状态
   - 多数据库 smoke check
   - 多 HTTP router smoke check

### 4.2 建议验证矩阵

1. Express + PostgreSQL
2. Express + SQLite
3. Fastify + PostgreSQL

先覆盖主组合与一条替代组合，再决定是否扩展。

## 5. 产出建议

后续若触发专项验证，可新增：

1. `runtime-observability-index.md`
2. `multi-adapter-smoke-matrix.md`

## 6. 当前结论

这两项当前已经完成文档侧收口，后续按治理文档和 smoke 验证矩阵触发专项推进。
