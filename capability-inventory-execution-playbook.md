# Capability Inventory Execution Playbook

> 文档分层：正式标准。
> 
> 这份文档定义当前生效的仓库能力盘点执行标准，包括输入、角色分工、步骤、验证和准出要求。

## 1. 目标

这份文档定义后续仓库能力盘点的标准执行方式，用于替代早期的三模型全量串行方案。

当前采用的固定方案是：

1. `GPT-5.5` 作为唯一主模型，负责读取本地仓库代码与已有盘点文档，输出正式收口稿。
2. `DeepSeek v4pro` 只复核边界项和高不确定域。
3. `GPT-codex5.3` 负责将正式结论拆成可执行工程任务、最小改动批次与验证方案。
4. 主模型吸收边界复核与工程拆解结果，输出唯一正式版。

## 2. 适用范围

适用于以下任务：

1. 更新本仓库已经实现的功能能力明细。
2. 更新缺口清单和修复任务矩阵。
3. 对大规模代码修复后的能力版图做统一复盘。
4. 为评审会、roadmap 会议、架构复核提供正式盘点材料。

## 3. 固定原则

### 3.1 全局性

盘点必须覆盖以下信息源：

1. `apps/nestjs-backend/src/features/*`
2. `apps/nextjs-app/src/features/app/*`
3. `packages/openapi/src/*`
4. `packages/v2/contract-http/src/*`
5. `packages/v2/core/src/*`
6. `packages/sdk/src/*`
7. `packages/db-main-prisma/*`
8. 已有盘点与治理文档

### 3.2 一致性

正式能力口径只允许有一份主输出。

约束如下：

1. 能力名称使用同一套分类体系。
2. 成熟度判断使用同一套等级。
3. 缺口归类使用同一套矩阵字段。
4. 边界项在所有文档中使用同一结论。

### 3.3 稳定性

盘点结论必须优先依赖：

1. 真实代码入口。
2. 真实契约文件。
3. 真实 service、controller、handler。
4. 已通过验证的迁移结果。

## 4. 输入材料清单

正式执行前，先读取以下文件。

### 4.1 主盘点输入

1. `repo-structure-map.md`
2. `implemented-capabilities.md`
3. `capability-gap-list.md`
4. `capability-gap-task-matrix.md`
5. `v1-v2-coverage-matrix.md`
6. `capability-review-pack-index.md`

### 4.2 专项路线图输入

1. `workflow-domain-governance-roadmap.md`
2. `share-published-governance-roadmap.md`
3. `ports-adapters-adoption-roadmap.md`
4. `observability-and-adapter-validation-plan.md`
5. `peripheral-domain-roadmap.md`
6. `billing-usage-boundary-note.md`

### 4.3 代码域输入

1. `apps/nestjs-backend/src/features/v2/*`
2. `packages/v2/contract-http/src/*`
3. `packages/v2/contract-http-implementation/src/*`
4. `apps/nextjs-app/src/features/app/published-app/*`

## 5. 角色分工

### 5.1 GPT-5.5 主模型职责

负责以下事项：

1. 读取本地仓库与现有盘点文档。
2. 更新正式能力明细。
3. 更新缺口清单。
4. 更新修复任务矩阵。
5. 更新覆盖矩阵。
6. 更新专项路线图中的状态描述。
7. 产出唯一正式结论。

### 5.2 DeepSeek v4pro 复核职责

只复核以下高不确定区域：

1. `billing & usage`
2. `Aggregation / Search`
3. `Undo / Redo`
4. `Share / Published` 的边界语义
5. 命名不直观且容易误判的外围域

### 5.3 GPT-codex5.3 工程拆解职责

负责以下事项：

1. 将主稿中的 P0 / P1 / P2 事项转成工程任务。
2. 为每项任务标注最小改动切口。
3. 给出建议修改文件范围。
4. 给出建议验证命令。
5. 给出建议提交批次边界，避免把真实语义改动和规则化收尾混在一起。

## 6. 执行步骤

### Step 1：锁定正式输入版本

执行内容：

1. 确认本地工作区已经包含最新代码。
2. 确认以下文件已存在且可读：
   - `capability-gap-list.md`
   - `capability-gap-task-matrix.md`
   - `v1-v2-coverage-matrix.md`
3. 记录本轮盘点基线日期。

准出标准：

1. 输入文件路径完整。
2. 文档未缺失。

### Step 2：GPT-5.5 全仓主盘点

执行内容：

1. 读取代码结构和现有盘点文档。
2. 对照以下域逐项校正：
   - Base
   - Table
   - Field
   - Record
   - View
   - Comment
   - Share / Published
   - Workflow
   - Undo / Redo
   - Aggregation / Search
   - Admin / Setting / Billing / Usage
3. 对每个域给出：
   - V1 覆盖状态
   - V2 覆盖状态
   - 当前真实结论
   - 是否存在剩余缺口

准出标准：

1. 每个核心域都有真实代码证据。
2. 没有同一能力出现多种命名口径。
3. 已完成项和边界项有明确区分。

### Step 3：DeepSeek v4pro 定向复核边界项

执行内容：

只给 DeepSeek 提供以下输入：

1. GPT-5.5 主稿中与边界项相关的片段。
2. 真实代码路径。
3. 边界说明文档。

复核问题固定为：

1. `billing / usage` 是否仍然只能判定为主仓边界受限项。
2. `Aggregation / Search` 是否应细化为“基础 4 个公开入口已闭环，高级聚合仍停留在 v1”。
3. `Undo / Redo` 是否已经形成完整公开契约层，剩余差异是否只在 SSE stream。
4. `Share / Published` 是否仍存在 `authenticated/template` mode 未落地、`defaultNodeId` 命名未统一与统一 runtime 访问模型未成型的缺口。

准出标准：

1. 复核范围限制在边界项。
2. 不生成新的全量主稿。

### Step 4：GPT-codex5.3 工程化拆解

执行内容：

1. 读取 GPT-5.5 主稿与 DeepSeek 边界复核说明。
2. 只对仍成立的未完成项做工程化拆解。
3. 对每项给出：
   - 最小改动切口
   - 涉及文件范围
   - 依赖前置条件
   - 建议验证命令
   - 建议提交边界

准出标准：

1. 每项任务都可直接进入工程执行。
2. 没有把边界说明项误拆成代码任务。
3. 没有把多个高风险域无界限地混成一个大任务。

### Step 5：主模型吸收复核与拆解结果

执行内容：

1. 逐条处理复核意见。
2. 吸收工程拆解中有代码证据支撑的任务边界建议。
3. 只修订存在明确代码证据支撑的结论。
4. 保持主稿唯一口径。

准出标准：

1. 主稿中不存在彼此冲突的结论。
2. 边界项结论和 `billing-usage-boundary-note.md` 一致。

### Step 6：矩阵状态回写

执行内容：

1. 更新 `capability-gap-list.md`。
2. 更新 `capability-gap-task-matrix.md`。
3. 更新 `v1-v2-coverage-matrix.md`。
4. 如有必要，更新专项路线图。
5. 如有必要，更新工程拆解清单或 backlog 文档。

准出标准：

1. 三份主文档状态一致。
2. 已修复项、进行中项、边界项表达一致。

## 7. 文档输出物清单

本流程执行完成后，至少应产出或更新以下文件：

1. `capability-gap-list.md`
2. `capability-gap-task-matrix.md`
3. `v1-v2-coverage-matrix.md`
4. `share-published-governance-roadmap.md`
5. `peripheral-domain-roadmap.md`
6. `billing-usage-boundary-note.md`
7. 面向工程执行的 backlog / task 拆解文档

## 8. 统一成熟度口径

正式盘点统一使用以下等级：

1. `完整`
2. `较完整`
3. `局部`
4. `未见稳定覆盖`

## 9. 边界项处理规则

满足以下任一条件时，标记为边界项：

1. 前端有消费，但主仓 backend 无稳定事实源。
2. 只看到 OpenAPI 路径，未看到 controller、service、handler。
3. 能力受 `Cloud / EE` 门控。
4. 当前仓库只包含占位、桥接或文档说明。

当前已确认的边界项：

1. `billing & usage`

## 10. 执行命令建议

若本轮涉及代码变更，最小验证顺序如下：

```bash
pnpm --filter @teable/v2-contract-http typecheck
pnpm --filter @teable/v2-contract-http-implementation typecheck
NODE_OPTIONS="--max-old-space-size=6144" pnpm --filter @teable/backend typecheck
```

如涉及前端 published runtime 或 automation 侧行为，再按需补：

```bash
pnpm --filter @teable/app typecheck
```

## 11. 默认执行策略

后续继续做能力盘点时，默认按以下策略执行：

1. 优先增量更新现有文档。
2. 优先围绕真实缺口补证据和状态。
3. 优先保持单一正式口径。
4. 不再回到三模型全量盘点。
