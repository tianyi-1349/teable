# Capability Review Pack Index

> 文档分层：正式输出。
> 
> 这份文档是能力盘点评审包的正式入口索引，用于组织阅读顺序、受众和配套材料。

## 0. 文档分层说明

当前能力盘点文档体系按三层组织：

1. 正式标准
   - 定义当前有效的执行方式、角色分工、步骤和提示词模板
   - 代表文件：`capability-inventory-execution-playbook.md`、`capability-prompts.md`
2. 正式输出
   - 定义当前正式结论、缺口、覆盖判断、任务矩阵和汇报材料
   - 代表文件：`capability-inventory-final.md`、`capability-inventory-summary.md`、`capability-gap-list.md`、`capability-gap-task-matrix.md`、`v1-v2-coverage-matrix.md`
3. 历史辅助输入
   - 保留早期扫描结果和能力初稿，主要用于补充背景上下文和历史证据
   - 代表文件：`repo-structure-map.md`、`implemented-capabilities.md`

阅读顺序建议是：先看正式标准，再看正式输出，最后按需回溯历史辅助输入。

## 1. 这份评审包包含什么

本评审包围绕“仓库已经实现了什么能力、哪些已经成熟、哪些还在演进、下一步该怎么投”组织，共包含 4 份主文档、一份执行手册和一组治理路线图文档：

1. 详细评审版
   - 文件：`/workspace/capability-inventory-final.md`
   - 作用：逐项核对仓库能力、链路、模块、契约、数据层
2. 管理层摘要版
   - 文件：`/workspace/capability-inventory-summary.md`
   - 作用：快速理解能力版图、成熟区域、演进方向
3. 汇报版 PPT 大纲
   - 文件：`/workspace/capability-inventory-presentation-outline.md`
   - 作用：作为评审会演讲提纲和汇报结构
4. 能力缺口清单
   - 文件：`/workspace/capability-gap-list.md`
   - 作用：反推后续 roadmap、技术债和 v2 迁移重点
5. 盘点执行手册
   - 文件：`/workspace/capability-inventory-execution-playbook.md`
   - 作用：固定 `GPT-5.5` 主盘点、`DeepSeek v4pro` 边界复核和最终收口的执行方式

治理路线图文档：
1. `capability-gap-task-matrix.md`
   - 作用：把缺口转成任务矩阵与状态管理
2. `v1-v2-coverage-matrix.md`
   - 作用：跟踪各业务域的 V1 / V2 覆盖状态
3. `workflow-domain-governance-roadmap.md`
   - 作用：定义 workflow 领域后续 read / CRUD / lifecycle 迁移顺序
4. `share-published-governance-roadmap.md`
   - 作用：定义 share / published 后续统一路线
5. `ports-adapters-adoption-roadmap.md`
   - 作用：定义 ports / adapters 逐域采用策略
6. `observability-and-adapter-validation-plan.md`
   - 作用：定义观测治理与多适配验证计划
7. `peripheral-domain-roadmap.md`
   - 作用：定义 organization、billing、plugin 与命名治理的外围路线图
8. `billing-usage-boundary-note.md`
   - 作用：沉淀 billing / usage 的主仓边界证据、阻塞原因与后续接入条件
9. `capability-prompts.md`
   - 作用：提供与执行手册一致的主盘点、边界复核、最终收口提示词模板
10. `object-storage-governance-plan.md`
   - 作用：沉淀对象存储能力的统一治理视图、抽象层次和后续维护规则

## 2. 推荐阅读顺序

### 顺序 A：管理层 / 业务负责人

推荐顺序：
1. `capability-inventory-summary.md`
2. `capability-inventory-presentation-outline.md`
3. `capability-gap-list.md`

适用场景：
- 先快速判断仓库是否已经具备完整产品闭环
- 再判断后续投入重点

### 顺序 B：研发负责人 / 技术负责人

推荐顺序：
1. `capability-inventory-summary.md`
2. `capability-inventory-final.md`
3. `capability-gap-list.md`

适用场景：
- 先把握整体能力
- 再逐项核对链路和实现面
- 最后讨论缺口与优先级

### 顺序 C：架构评审

推荐顺序：
1. `capability-inventory-final.md`
2. `capability-gap-list.md`
3. `capability-gap-task-matrix.md`
4. `v1-v2-coverage-matrix.md`
5. `capability-inventory-execution-playbook.md`
6. `capability-inventory-presentation-outline.md`

适用场景：
- 重点讨论 V1 / V2 双轨、契约层、领域收敛和迁移节奏

### 顺序 D：迁移治理与执行跟踪

推荐顺序：
1. `capability-inventory-execution-playbook.md`
2. `capability-gap-task-matrix.md`
3. `v1-v2-coverage-matrix.md`
4. `workflow-domain-governance-roadmap.md`
5. `share-published-governance-roadmap.md`
6. `ports-adapters-adoption-roadmap.md`
7. `observability-and-adapter-validation-plan.md`
8. `peripheral-domain-roadmap.md`

适用场景：
- 讨论后续具体优先治理哪些域
- 给 roadmap、架构治理和执行跟踪提供统一入口

## 3. 每份文档适合谁看

### `capability-inventory-final.md`
- 适合：研发负责人、架构师、核心开发
- 价值：最完整，适合做事实核对

### `capability-inventory-summary.md`
- 适合：产品负责人、业务负责人、管理层
- 价值：最省时间，适合快速达成共识

### `capability-inventory-presentation-outline.md`
- 适合：主持评审的人、汇报人、项目负责人
- 价值：可以直接拿去讲

### `capability-gap-list.md`
- 适合：技术负责人、架构师、roadmap 制定者
- 价值：直接对应后续治理动作

### `capability-gap-task-matrix.md`
- 适合：研发负责人、项目经理、执行 owner
- 价值：把缺口状态映射成可跟踪任务

### `capability-inventory-execution-playbook.md`
- 适合：主盘点执行人、架构师、复核人
- 价值：固定盘点输入、步骤、角色分工和准出标准

### `v1-v2-coverage-matrix.md`
- 适合：架构师、v2 迁移负责人
- 价值：判断哪些域已经完成迁移，哪些域还在中段

### 各专项路线图文档
- 适合：领域 owner、架构师、执行人
- 价值：用于持续治理 workflow、share/published、ports/adapters、观测和外围域主题

## 4. 会议建议讲法

### 第一阶段：先讲现状

使用文档：`capability-inventory-summary.md`

目标：
- 让参会人快速知道仓库已经具备哪些核心能力
- 建立对仓库整体价值的统一认识

建议时间：10 分钟

### 第二阶段：再讲能力结构

使用文档：`capability-inventory-presentation-outline.md`

目标：
- 解释能力版图、核心链路、架构现状和演进能力

建议时间：15 到 20 分钟

### 第三阶段：讲缺口和优先级

使用文档：`capability-gap-list.md`

目标：
- 把讨论从“有没有功能”转到“下一步先统一什么、先建设什么”

建议时间：15 分钟

### 第四阶段：需要时进入逐项核对

使用文档：`capability-inventory-final.md`

目标：
- 对存在争议的能力项做事实核对
- 对高价值链路做文件级确认

建议时间：按需

## 5. 这次评审最好产出什么决策

建议至少形成 3 类决策：

### 决策 1：确认仓库当前的核心能力范围

建议结论：
- 把 `Base / Table / Field / Record`
- 多视图
- 分享与 Published
- Workflow
- 评论通知与实时协作

确认为当前仓库的核心产品能力主链路。

### 决策 2：确认后续技术优先级

建议结论：
1. 巩固主链路
2. 推进 v2 覆盖率
3. 收束系统管理与支撑层边界

### 决策 3：确认长期治理机制

建议结论：
- 每次大的架构演进或重要版本评审时，更新一次能力盘点清单
- 将高价值能力链路纳入长期维护对象
- 将缺口清单纳入 roadmap 管理

### 决策 4：确认专项路线图 owner

建议结论：
- 为 workflow、share/published、ports/adapters、观测验证、外围域治理分别指定 owner
- 以后续路线图文档作为统一跟踪入口

## 6. 建议的会议输出物

评审结束后，建议沉淀以下内容：

1. 一个确认版能力边界清单
2. 一个后续优先级排序表
3. 一个 v2 迁移范围说明
4. 一个需要持续维护的高价值链路列表
5. 一组按领域拆分的治理路线图 owner 和里程碑

## 7. 一页式使用建议

如果时间很短，按下面顺序用：

1. 先读 `capability-inventory-summary.md`
2. 讲 `capability-inventory-presentation-outline.md`
3. 用 `capability-gap-list.md` 收口讨论
4. 有争议时翻 `capability-inventory-final.md`

这套顺序最适合高效开会。

如果目标是继续执行迁移与治理，直接从 `capability-gap-task-matrix.md` 和 `v1-v2-coverage-matrix.md` 开始最有效。
