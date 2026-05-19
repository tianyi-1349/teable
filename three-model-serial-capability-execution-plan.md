# Three Model Serial Capability Execution Plan

> 文档分层：正式输出。
>
> 本文定义当前能力盘点与缺口治理采用的三模型串行执行方案：`GPT-5.5 -> DeepSeek V4pro -> GPT-codex5.3 -> GPT-5.5`。

## 1. 目标

本方案用于把“全盘重新分析评估”与“后续工程实施”串成一条连续链路，同时满足：

1. 全局性
2. 一致性
3. 稳定性

## 2. 角色顺序

### Stage 1: GPT-5.5 主稿

- 目标：输出唯一主稿
- 输入：
  - 本地仓库代码
  - `capability-gap-list.md`
  - `capability-gap-task-matrix.md`
  - `v1-v2-coverage-matrix.md`
  - 各专项路线图与规格文档
- 输出：
  - 核心域 V1/V2 覆盖判断
  - 已收口项 / 边界项 / 未完成项清单
  - 主结论与优先级

### Stage 2: DeepSeek V4pro 边界复核

- 目标：只校验高不确定域
- 固定复核范围：
  - `billing & usage`
  - `Aggregation / Search`
  - `Undo / Redo`
  - `Share / Published` 统一语义边界
- 输出：
  - `Boundary Review Notes`
  - 是否建议修订主稿边界结论

### Stage 3: GPT-codex5.3 工程化拆解

- 目标：把仍成立的缺口拆成可执行工程任务
- 输出：
  - P0 / P1 / P2 任务树
  - 最小改动切口
  - 文件范围
  - 验证命令
  - 提交边界

### Stage 4: GPT-5.5 最终收口

- 目标：吸收边界复核与工程拆解结果，输出唯一正式版
- 输出：
  - 更新后的 gap list
  - 更新后的 task matrix
  - 更新后的 coverage matrix
  - 必要时更新路线图与 backlog

## 3. 执行原则

### 3.1 全局性

主稿必须覆盖：

1. backend feature
2. frontend app feature
3. openapi
4. v2 contract-http
5. v2 core
6. sdk
7. prisma / 数据模型
8. 规格与路线图文档

### 3.2 一致性

1. 主稿只有一份正式口径
2. 复核模型只改边界，不改主分类体系
3. 工程拆解模型只拆任务，不改正式结论
4. 最终只有主模型回写正式输出

### 3.3 稳定性

1. 结论优先依赖真实代码和真实契约
2. 边界项需要有代码证据或边界说明文档
3. 工程任务必须能落到具体文件和验证命令

## 4. 推荐产物

每轮串行执行后，至少更新以下产物中的必要部分：

1. `capability-gap-list.md`
2. `capability-gap-task-matrix.md`
3. `v1-v2-coverage-matrix.md`
4. 对应专项路线图
5. 工程拆解 backlog 文档

## 5. 当前结论

当前仓库阶段最适合采用三模型串行，而不是多模型并行全量重扫。

原因是：

1. 主稿统一口径比多模型并行更重要
2. 边界项复核比再次生成第二套主稿更有价值
3. 后续工作的关键瓶颈已经转成工程拆解，而不是继续扩模型数量
