# Ports Adapters Adoption Roadmap

> 文档分层：正式输出。
> 
> 这份文档是 ports / adapters 采用策略的正式路线图，用于指导架构统一和领域落地顺序。

## 1. 目的

这份文档用于收口 `capability-gap-task-matrix.md` 中与 Ports / Adapters 采用相关的治理主题：

- `4.2 Ports / Adapters 普及率不足`
- `4.1 contract-http 还不是全站统一主契约层` 的架构支撑部分

## 2. 当前事实

- `packages/v2/core/src/ports/*` 已存在较丰富的抽象
- 高核心域中，table / record / field / view 已有更多 v2 落地
- share / workflow / template / setting 当前更多是 `Nest api/v2` 入口对既有 service 的封装

## 3. 当前治理主题

### 3.1 公开契约与领域端口同步度仍有提升空间

- 部分入口已经进入 `contract-http`
- 部分真实执行仍直接依赖既有 V1 service，而不是统一 port

### 3.2 适配层在领域间的采用深度不一致

- table / record / field / view 域更接近目标形态
- share / workflow / template / setting 当前仍以“adapter 边界 + Nest api/v2 承载真实执行”为主

## 4. 持续治理策略

### 第一类：核心交易域优先全端口化

- table
- record
- field
- view

### 第二类：公开读取域先走契约迁移，再逐步端口化

- share
- workflow
- template
- setting

### 第三类：外围域先保留服务封装

- organization
- billing
- admin peripheral

## 5. 最小治理原则

1. 先让入口稳定进入 `contract-http`
2. 再把高复用逻辑抽到 port
3. 最后把旧 service 替换为统一 adapter

## 6. 当前结论

当前这份路线图的执行口径如下：

1. 高核心域继续优先向统一 port 组织依赖收敛
2. 公开读取域继续维持 `contract-http + Nest api/v2` 的稳定公开面，再按事实源成熟度逐步 port 化
3. 外围域继续保留服务封装与边界治理，不在当前主仓强行做大面积 port 化重构
