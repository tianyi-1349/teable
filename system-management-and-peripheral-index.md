# System Management and Peripheral Interface Index

> 文档分层：正式输出。
> 
> 这份文档是系统管理与外围接口的正式索引，用于降低认知成本并统一入口理解。

## 1. 目的

这份索引用于收束 `capability-gap-list.md` 中与“系统管理类接口分布偏散”相关的认知缺口。

目标不是新增能力，而是把当前仓库里已经存在的系统管理与外围接口，按统一方式整理成：

- 面向谁
- 从哪里进入
- 对应哪些 OpenAPI 子域
- 后端真实落在哪个 feature
- 当前属于成熟主链路，还是外围管理能力

## 2. 总体结论

当前仓库的系统管理与外围接口具备两个特点：

1. 能力并不缺失
   - 系统设置、Dashboard、聚合、组织信息、回收站、Pin、健康检查、Billing 等都已有代码入口
2. 能力组织较分散
   - 有些以明确 OpenAPI 子域暴露
   - 有些主要以 backend controller 为真实入口
   - 有些名称与目录名并不完全直观对应

因此，本索引的作用是把“可见但分散”的外围接口收成一张统一地图。

## 3. 接口总表

| 能力域 | 主要用途 | 前端/调用入口 | OpenAPI 契约位置 | 后端真实入口 | 状态 |
|--------|----------|---------------|------------------|--------------|------|
| Admin Setting | 实例级系统设置、AI 配置、Logo、公共设置 | 管理后台设置页 | `packages/openapi/src/admin/setting/*` | `features/setting/open-api/setting-open-api.controller.ts` -> `api/admin/setting` | 成熟 |
| Admin Root | 管理后台通用入口 | 管理后台 | `packages/openapi/src/admin/index.ts` | `features/setting/open-api/admin-open-api.controller.ts` -> `api/admin` | 成熟 |
| Enterprise License | 企业许可证状态 | 管理后台企业能力 | `packages/openapi/src/admin/enterprise-license/*` | 归属 admin 体系 | 局部 |
| Billing Subscription | 订阅摘要与订阅列表 | 计费或订阅相关入口 | `packages/openapi/src/billing/subscription/*` | 当前能力盘点显示为 Billing 查询域 | 局部 |
| Dashboard | Dashboard CRUD 与插件化面板布局 | Base 下 Dashboard 页面 | `packages/openapi/src/dashboard/*` | `features/dashboard/dashboard.controller.ts` -> `api/base/:baseId/dashboard` | 成熟 |
| Aggregation | 聚合、行数、搜索索引、组点、任务状态 | 图表、聚合视图、统计查询 | `packages/openapi/src/aggregation/*` | `features/aggregation/open-api/aggregation-open-api.controller.ts` -> `api/table/:tableId/aggregation` | 成熟 |
| Organization | 组织、部门、组织用户信息 | 组织信息读取 | `packages/openapi/src/organization/*` | `features/organization/organization.controller.ts` -> `api/organization` | 局部 |
| Trash | 回收站恢复与永久删除 | Space / Base 回收站 | `packages/openapi/src/trash/*` | `features/trash/trash.controller.ts` -> `api/trash/` | 成熟 |
| Pin | 置顶固定 | 导航或资源固定入口 | `packages/openapi/src/pin/*` | `features/pin/pin.controller.ts` -> `api/pin` | 成熟 |
| DB Connection | 数据库连接管理 | 数据源管理入口 | `packages/openapi/src/db-connection/*` | 后端 feature 已存在；当前索引以 OpenAPI 子域为主 | 局部到较完整 |
| Chart Query | 图表相关数据查询 | 图表页面、插件图表 | 当前未见独立 `openapi/src/chart` 目录 | `features/chat/chat.controller.ts` -> `api/chart` | 成熟但命名不直观 |
| Health | 健康检查与 memory 信息 | 运维探针 | 当前未见独立 `openapi/src/health` 目录 | `features/health/health.controller.ts` -> `health` | 成熟 |

## 4. 分域详细说明

### 4.1 Admin Setting

- 用途
  - 管理实例级配置，含 AI、Logo、公共设置、API Key、传输配置等
- OpenAPI
  - `admin/setting/get.ts`
  - `update.ts`
  - `get-public.ts`
  - `upload-logo.ts`
  - `test-llm.ts`
  - `batch-test-llm.ts`
  - `test-api-key.ts`
  - `test-public-access.ts`
  - `set-transport-config.ts`
- Backend
  - `apps/nestjs-backend/src/features/setting/open-api/setting-open-api.controller.ts`
- 主入口
  - `api/admin/setting`
- 判断
  - 这是典型的系统管理成熟能力，但组织位置偏管理域，不属于产品主链路。

### 4.2 Billing Subscription

- 用途
  - 查询订阅摘要与订阅列表
- OpenAPI
  - `billing/subscription/get-subscription-summary.ts`
  - `get-subscription-summary-list.ts`
- Backend
  - 当前盘点中能明确识别其为 Billing 查询域，但不是完整计费产品域
  - 详见 `billing-usage-boundary-note.md`
- 判断
  - 能力存在，当前定位为边界受限的查询接口域。

### 4.3 Dashboard

- 用途
  - Dashboard CRUD、布局更新、插件安装与存储更新
- OpenAPI
  - `dashboard/create.ts`
  - `get.ts`
  - `get-list.ts`
  - `rename.ts`
  - `delete.ts`
  - `update-layout.ts`
  - `plugin-install.ts`
  - `plugin-get.ts`
  - `plugin-remove.ts`
  - `plugin-update-storage.ts`
  - `plugin-rename.ts`
- Backend
  - `apps/nestjs-backend/src/features/dashboard/dashboard.controller.ts`
- 主入口
  - `api/base/:baseId/dashboard`
- 判断
  - Dashboard 是外围业务能力里最成熟的一类。

### 4.4 Aggregation

- 用途
  - 聚合统计、搜索计数、索引读取、组点、任务状态
- OpenAPI
  - `aggregation/get-aggregation.ts`
  - `get-row-count.ts`
  - `get-search-count.ts`
  - `get-search-by-index.ts`
  - `get-record-index.ts`
  - `get-calendar-daily-collection.ts`
  - `get-group-points.ts`
  - `get-task-status-collection.ts`
- Backend
  - `apps/nestjs-backend/src/features/aggregation/open-api/aggregation-open-api.controller.ts`
- 主入口
  - `api/table/:tableId/aggregation`
- 判断
  - 聚合域能力成熟，但名称层面与搜索、组点、任务状态混杂在同一子域中，认知成本偏高。

### 4.5 Organization

- 用途
  - 查询组织、部门和组织用户
- OpenAPI
  - `packages/openapi/src/organization/*`
- Backend
  - `apps/nestjs-backend/src/features/organization/organization.controller.ts`
- 主入口
  - `api/organization`
- 判断
  - 存在明确入口，但业务覆盖深度低于 Space 协作主链路。

### 4.6 Trash / Pin

- 用途
  - Trash：恢复和永久删除资源
  - Pin：固定资源入口
- OpenAPI
  - `packages/openapi/src/trash/*`
  - `packages/openapi/src/pin/*`
- Backend
  - `features/trash/trash.controller.ts`
  - `features/pin/pin.controller.ts`
- 主入口
  - `api/trash/`
  - `api/pin`
- 判断
  - 两者都属于成熟外围管理能力。

### 4.7 DB Connection

- 用途
  - 管理数据库连接信息
- OpenAPI
  - `db-connection/create.ts`
  - `get.ts`
  - `delete.ts`
- Backend
  - 当前盘点中已有该能力项，但后端目录命名不如主链路直观
- 判断
  - 能力存在，适合纳入外围接口治理索引。

### 4.8 Chart Query

- 用途
  - 面向图表的数据查询能力
- OpenAPI
  - 当前未在 `packages/openapi/src` 下发现同名 `chart` 子目录
- Backend
  - `apps/nestjs-backend/src/features/chat/chat.controller.ts`
- 主入口
  - `api/chart`
- 判断
  - 这是当前最典型的“能力成熟但命名不直观”的外围接口。

### 4.9 Health

- 用途
  - 健康检查与 memory 信息
- OpenAPI
  - 当前未在 `packages/openapi/src` 下发现独立 `health` 子目录
- Backend
  - `apps/nestjs-backend/src/features/health/health.controller.ts`
- 主入口
  - `health`
- 判断
  - 运维入口明确，但不在产品主契约层显式建模。

## 5. 当前最值得关注的认知问题

### 5.1 同一“外围能力”分布在不同层次

例如：
- 有的以 OpenAPI 子域为主
- 有的以后端 controller 为主
- 有的前端页面存在，但契约目录名不直观

这会带来维护成本和定位成本。

### 5.2 命名和职责边界不总是直观

最典型例子：
- `api/chart` 对应 `features/chat/chat.controller.ts`
- `health` 作为运维入口存在，但没有在当前 OpenAPI 子域中同样显式出现

### 5.3 管理能力与产品主链路混用同一仓库层次

这本身不是错误，但需要通过总索引降低认知成本。

## 6. 建议的后续治理动作

1. 在评审文档中明确区分：
   - 产品主链路能力
   - 系统管理能力
   - 外围查询与运维能力
2. 对命名不直观的能力补“索引级说明”，而不是立即大规模改名
3. 后续如果进入重构阶段，再决定是否对 `chart/chat`、`health`、`db-connection` 等域做统一命名收束
4. 对 `billing/subscription` 与 `usage` 继续以 `billing-usage-boundary-note.md` 作为边界确认说明

## 7. 相关治理文档

- `async-task-business-mapping.md`
  - 用于补齐 BullMQ 队列与业务域之间的映射
- `capability-maintenance-mechanism.md`
  - 用于固化当前能力盘点文档体系的持续维护流程

## 7. 结论

这份索引证明了一点：

- 当前仓库的系统管理与外围接口能力本身已经比较丰富
- 当前主要缺口在“统一可见性和治理边界”
- 通过这份索引，`capability-gap-list.md` 中的 2.4 和部分 3.4、5.1、5.2 已经从“能力位置不清”升级为“治理收束问题”
