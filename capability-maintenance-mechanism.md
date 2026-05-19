# Capability Maintenance Mechanism

> 文档分层：正式标准。
> 
> 这份文档定义能力盘点文档体系的持续维护规则，用于约束何时更新、更新哪些文档以及按什么顺序更新。

## 0. 文档分层说明

当前能力盘点相关文档分为三类，维护时需要按层处理：

1. 正式标准
   - 包括执行手册和提示词模板
   - 这类文档变化时，代表盘点方法、角色分工或准出标准发生变化
2. 正式输出
   - 包括正式能力清单、缺口清单、任务矩阵、覆盖矩阵和汇报材料
   - 这类文档变化时，代表正式结论或当前状态发生变化
3. 历史辅助输入
   - 包括结构地图、历史能力初稿等早期扫描材料
   - 这类文档主要在需要补背景、补证据或回溯历史判断时更新

维护顺序建议是：先更新正式标准，再更新正式输出，最后按需补齐历史辅助输入的说明。

## 1. 目的

这份文档用于收口 `capability-gap-list.md` 中“高价值链路已有目录，但缺少长期维护机制”的剩余缺口。

当前仓库已经具备一组能力盘点产物，但还需要一套轻量维护机制，确保这些文档随着代码演进同步更新。

## 2. 适用范围

本机制覆盖以下文档：

- `capability-inventory-execution-playbook.md`
- `capability-prompts.md`
- `capability-inventory-final.md`
- `capability-inventory-summary.md`
- `capability-gap-list.md`
- `capability-gap-task-matrix.md`
- `v1-v2-coverage-matrix.md`
- `system-management-and-peripheral-index.md`
- `view-domain-repair-package.md`
- `async-task-business-mapping.md`
- `object-storage-governance-plan.md`
- `workflow-domain-governance-roadmap.md`
- `share-published-governance-roadmap.md`
- `ports-adapters-adoption-roadmap.md`
- `observability-and-adapter-validation-plan.md`
- `peripheral-domain-roadmap.md`

## 3. 维护触发条件

满足以下任一条件时，同步更新相关能力文档：

1. 新增高价值业务域接口
   - 例如新增 `contract-http`、OpenAPI 或 backend controller 主入口
2. 领域迁移状态发生变化
   - 例如某个域从 V1 主导变成 V2 局部覆盖，或从局部变成完整覆盖
3. 盘点执行方式发生变化
   - 例如主模型、复核模型、准出标准或提示词模板发生调整
4. 系统支撑层新增可感知能力
   - 例如新增队列、观测入口、附件处理链路、后台导入链路
5. 命名或入口发生迁移
   - 例如 controller、feature、OpenAPI 子域、前端页面入口重命名
6. 缺口状态发生变化
   - 例如某项从“可立即修复”变成“已修复，文档待同步”或“长期治理项”

## 4. 文档更新分工

### 4.1 总览事实源

- `capability-inventory-execution-playbook.md`
  - 记录能力盘点的固定执行方式与准出标准
- `capability-prompts.md`
  - 记录主盘点、边界复核、最终收口的提示词模板
- `capability-inventory-final.md`
  - 记录全仓库能力盘点事实
- `capability-inventory-summary.md`
  - 记录管理层摘要

### 4.2 缺口与执行源

- `capability-gap-list.md`
  - 记录缺口定义和当前修订说明
- `capability-gap-task-matrix.md`
  - 记录缺口对应的动作、状态、优先级

### 4.3 专项索引源

- `v1-v2-coverage-matrix.md`
  - 记录各业务域的 V1/V2 覆盖状态
- `system-management-and-peripheral-index.md`
  - 记录系统管理与外围接口统一索引
- `async-task-business-mapping.md`
  - 记录异步任务与业务映射
- `object-storage-governance-plan.md`
  - 记录对象存储能力的统一治理视图和后续维护规则
- `view-domain-repair-package.md`
  - 记录 View 域迁移状态和专项判断
- `workflow-domain-governance-roadmap.md`
  - 记录 workflow 领域后续推进顺序
- `share-published-governance-roadmap.md`
  - 记录 share / published 统一路线
- `ports-adapters-adoption-roadmap.md`
  - 记录 ports / adapters 采用策略
- `observability-and-adapter-validation-plan.md`
  - 记录观测治理与多适配验证计划
- `peripheral-domain-roadmap.md`
  - 记录 organization、billing、plugin 和命名治理路线图

## 5. 最小维护流程

每次发生高价值能力变更时，按以下顺序维护：

1. 先更新事实文档
   - 例如执行手册、提示词、能力清单、专项索引、覆盖矩阵
2. 再更新缺口文档
   - `capability-gap-list.md`
   - `capability-gap-task-matrix.md`
3. 最后更新状态结论
   - 标记为已修复、分阶段推进或长期治理项
4. 若属于长期治理类剩余项
   - 同步更新对应专项路线图文档

## 6. 推荐检查清单

每次做架构级或高价值能力变更后，至少检查以下问题：

1. 是否新增或移除了公开入口
2. 是否改变了 V1 / V2 覆盖判断
3. 是否改变了盘点执行方式、提示词模板或准出标准
4. 是否改变了系统管理或外围能力索引
5. 是否新增了异步任务、观测入口或后台支撑能力
6. 是否让已有缺口状态发生变化
7. 是否影响已有路线图的优先级、阶段或 owner

## 7. 当前执行口径

### 7.1 高优先同步项

以下变更发生时，建议在同一轮任务中同步更新文档：

- View / Share / Published / Workflow / Comment 这些高价值统一域
- `contract-http` 公开契约新增或下沉
- 盘点执行方式、提示词模板或准出标准发生变化
- 系统管理与外围接口命名调整
- BullMQ 队列新增、迁移或下线
- 路线图文档中的阶段状态发生变化

### 7.2 可延后一轮同步项

以下变更可在同一主题任务结束后统一同步：

- 文档内部表述优化
- 摘要版措辞更新
- 非主链路的说明性补充

## 8. 当前结论

当前仓库已经具备一套可工作的能力盘点文档体系。

剩余治理重点是把“文档存在”升级成“文档持续维护”，让每次高价值变更都能同步映射到：

- 事实清单
- 缺口状态
- 迁移矩阵
- 专项索引
- 领域路线图
