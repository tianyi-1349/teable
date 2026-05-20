# GPT-5.5 独立审计 + 交叉验证提示词

按顺序依次粘贴执行，每步不跳过、不合并。每个代码块悬停后可点击复制按钮。

---

## 第一步：独立代码库探索

```
你需要对 /workspace 仓库中的 Teable 项目进行一次独立的、完整的架构审计。

请逐步执行以下探索任务，不要跳过任何一步：

### 1.1 项目概览
- 读取 /workspace/AGENTS.md
- 读取 /workspace/package.json，理解 monorepo 结构
- 读取 /workspace/README.md（如有）

### 1.2 V1 架构探索（NestJS 后端）
- 列出 /workspace/apps/nestjs-backend/src/features/ 下的所有子目录及数量
- 对每个子目录，检查是否存在 controller、service、module 文件及其代码行数
- 特别关注以下模块的实际代码行数和业务逻辑深度：
  - organization/
  - billing/（如果存在）
  - authority-matrix/
  - dashboard/
  - workflow/
  - import/
  - export/
  - notification/
  - aggregation/

### 1.3 V2 架构探索（DDD + CQRS）
- 列出 /workspace/packages/v2/core/src/commands/ 下的所有文件及数量
- 列出 /workspace/packages/v2/core/src/queries/ 下的所有文件及数量
- 列出 /workspace/packages/v2/core/src/domain/ 下的子目录结构
- 列出 /workspace/packages/v2/core/src/ports/ 下的所有文件
- 列出 /workspace/packages/v2/contract-http/src/ 下的所有领域子目录
- 列出 /workspace/packages/v2/contract-http-implementation/src/handlers/ 下的所有文件
- 列出 /workspace/packages/v2/ 下所有 adapter-* 目录

### 1.4 版本间关系
- 搜索 V2 代码中 import 或 require 自 V1（nest-app）的语句
- 搜索 V1 代码中 import V2 模块的语句
- 列出所有跨 V1/V2 边界直接导入的文件及其路径

### 1.5 字段类型和计算引擎
- 列出 /workspace/packages/core/src/models/field/derivate/ 下的所有子目录
- 检查每种字段类型是否有 .field.ts 和 .spec.ts
- 读取 /workspace/packages/v2/formula-sql-pg/ 或类似公式引擎目录，了解公式引擎深度

### 1.6 数据库和基础设施
- 读取 /workspace/packages/db-main-prisma/ 目录，了解 Prisma schema 结构
- 检查 /workspace/packages/common-i18n/src/locales/ 的语言包覆盖
- 检查是否存在备份/恢复、审计日志、速率限制相关的模块实现

### 1.7 搜索关键功能是否存在
在代码库中搜索以下关键词，确认是否有对应实现：
- "backup" 或 "restore" 或 "snapshot"（数据备份恢复）
- "ThrottlerGuard" 或 "RateLimiter" 或 "throttle"（全局速率限制）
- "AuditLog" 或 "audit-log" 或 "audit_log"（审计日志持久化）
- "excel" 或 "xlsx" 或 "json" 或 "csv" 在 export/ 和 import/ 相关目录（导入导出格式）
- "slack" 或 "webhook" 或 "email" 在 notification/ 相关目录（通知渠道）
- "billing" 或 "subscription" 或 "stripe" 或 "plan"（计费模块）

### 1.8 e2e 测试覆盖
- 列出 /workspace/apps/nestjs-backend/test/ 下所有 .e2e-spec.ts 文件及其数量
- 按模块分类统计测试文件分布

## 返回格式

请将以上探索结果组织为一个结构化的发现清单，每一项包含：
- 文件路径
- 关键代码行数
- 存在的业务逻辑 / 缺失的能力
- 你对该模块实现深度的判定（完整 / 局限 / 骨架 / 空壳 / 不存在）

不要做评价性判断，只报告事实发现。
```

---

## 第二步：三维度独立审计

```
基于你第一步的代码探索发现，请从以下三个约束维度对 Teable 项目进行独立审计。

## 审计框架

### 维度一：全局性（Globality）
- 核心数据链路（Space → Base → Table → Field → Record）是否完整？
- 各模块的实现深度是否足够支撑生产使用？
- 是否存在仅返回硬编码数据或空值的"空壳"模块？
- 哪些企业级能力（组织管理、计费、权限矩阵、审计日志、速率限制）缺失或不完整？

### 维度二：一致性（Consistency）
- V1（NestJS feature module）和 V2（DDD + CQRS）的 API 风格、错误处理模式是否统一？
- V2 的 contract-http 和 contract-http-implementation 是否 1:1 对应？
- 是否存在 V2 Handler 直接调用 V1 Service 的"假性迁移"？
- V2 commands 目录的文件组织是否按领域分层？
- 是否存在跨 V1/V2 的直接 import 依赖？如果有，方向是什么？

### 维度三：稳定性（Stability）
- 核心 CRUD 操作是否经过充分的测试覆盖？
- V1/V2 双路径共存是否存在行为差异风险？
- 是否存在全局速率限制、数据备份恢复、审计日志等安全保障机制？
- 错误处理体系是否统一？
- pnpm workspace 中的包依赖关系是否存在循环或冗余？

## 输出要求

生成一份独立的审计报告，包含：
1. 全局性评估（含每个模块的深度评分）
2. 一致性评估（含 V1/V2 断裂点清单）
3. 稳定性评估（含风险清单）
4. 你的改进建议（按优先级 P0 / P1 / P2 分类）

## 重要约束

- 不要参考任何已有的审计文档或报告
- 所有结论必须基于你第一步自己探索的代码证据
- 每个判定必须附带具体的文件路径和代码行数作为证据
```

---

## 第三步：交叉验证对比

```
现在请阅读 /workspace/.monkeycode/docs/architecture-audit-report.md（由 deepseek V4pro 生成的审计报告）。

## 对比任务

将你的独立审计结果与 deepseek V4pro 的报告进行逐项对比，找出：

### 1. 共识点（双方一致）
列出两方报告达成一致的发现。这些是高置信度结论。

### 2. 你发现但 deepseek 未发现
列出你在独立探索中发现的、但 deepseek 报告中未提及的问题。
每个发现注明：你的代码证据 vs deepseek 是否覆盖了该模块。

### 3. deepseek 发现但你不同意的
列出 deepseek 报告中的结论你基于独立代码探索不同意的部分。
每个分歧点注明：deepseek 的判定 vs 你的代码证据 vs 你的修正判定。

### 4. deepseek 报告中的数据准确性
检查 deepseek 报告中的具体代码行数、文件计数等数值是否准确。
如果发现差异，列出具体修正。

### 5. 综合评估
- deepseek 报告的总体质量评分（1-10）
- 哪些维度分析得最好？
- 哪些维度有遗漏或偏差？
- 如果以你的报告为主、deepseek 报告为辅，综合结论会有什么不同？

## 输出格式

每个对比维度用表格呈现：

| 对比项 | deepseek 判定 | 你的判定 | 是否一致 | 不一致时的修正依据 |
|--------|-------------|---------|:---:|------|
| ... | ... | ... | ... | ... |
```
