# Workflow Domain Governance Roadmap

> 文档分层：正式输出。
> 
> 这份文档是 workflow 领域后续治理与迁移的正式路线图，用于支撑缺口收口和执行排序。

## 1. 目的

这份文档用于收口 `capability-gap-task-matrix.md` 中与 workflow 相关的治理主题：

- `2.2 Workflow 领域架构表达仍偏分散`
- `4.1 contract-http 还不是全站统一主契约层` 中与 workflow 相关的部分
- `4.2 Ports / Adapters 普及率不足` 中与 workflow 相关的部分

当前 workflow 的主公开链路已经完成本轮收口，更深层领域化统一事项转入后续治理。

## 2. 当前事实

### 2.1 已有 V1 成熟链路

- OpenAPI：`packages/openapi/src/automation/workflow/*`
- Backend：`apps/nestjs-backend/src/features/workflow/*`
- 前端入口：`apps/nextjs-app/src/features/app/automation/*`

### 2.2 已有 V2 公开面

- `packages/v2/contract-http/src/workflow/aiCreateDraftWorkflow.ts`
- `packages/v2/contract-http/src/workflow/listWorkflows.ts`
- `packages/v2/contract-http/src/workflow/createWorkflow.ts`
- `packages/v2/contract-http/src/workflow/activateWorkflow.ts`
- `packages/v2/contract-http/src/workflow/updateWorkflow.ts`
- `packages/v2/contract-http/src/workflow/deactivateWorkflow.ts`
- `packages/v2/contract-http/src/workflow/deleteWorkflow.ts`
- `packages/v2/contract-http/src/workflow/duplicateWorkflow.ts`
- `packages/v2/contract-http/src/workflow/getWorkflowById.ts`
- `packages/v2/contract-http/src/workflow/getWorkflowCapabilities.ts`
- `packages/v2/contract-http/src/workflow/listWorkflowRuns.ts`
- `packages/v2/contract-http/src/workflow/getWorkflowRun.ts`
- `packages/v2/contract-http/src/workflow/testRunWorkflow.ts`
- `apps/nestjs-backend/src/features/v2/v2.controller.ts`
  - `workflows.aiCreateDraft`
  - `workflows.activate`
  - `workflows.create`
  - `workflows.deactivate`
  - `workflows.list`
  - `workflows.update`
  - `workflows.delete`
  - `workflows.duplicate`
  - `workflows.getById`
  - `workflows.getCapabilities`
  - `workflows.listRuns`
  - `workflows.getRun`
  - `workflows.testRun`

### 2.3 当前治理主题

- 后端 workflow 公开契约主链路已经完成本轮收口
- generic router 仍保留 adapter 边界，真实执行继续由 Nest `api/v2` 承载
- 前端 automation 运行时仍主要停留在已有入口与占位页之间，统一 workflow 领域工作区属于后续专项治理主题

## 3. 目标分层

### 第一层：公开读取面补齐

本层当前已完成，已补齐最稳定的只读入口：

1. `workflows.getById`
2. `workflows.listRuns`
3. `workflows.getRun`

### 第二层：主写入链路补齐

本层当前已完成主写入入口，并补入第一批 draft authoring 入口：

1. `workflows.aiCreateDraft`
1. `workflows.create`
2. `workflows.update`
3. `workflows.delete`
4. `workflows.duplicate`
5. `workflows.applyUpdate`

当前仍未进入本层的能力：

1. 更细粒度的 draft authoring contract 分层
2. apply-update 的前端 UX 与差异展示

### 第三层：运行态与生命周期统一

本层当前已完成：

1. `workflows.activate`
2. `workflows.deactivate`

3. `workflows.testRun`
4. `recordCreated` / `recordUpdated` / `recordMatchesConditions` 最小 trigger runner
5. action 级 `workflowRunStep` history 写入

## 4. 推荐实施顺序

### 4.1 先补读取入口

原因：

- 依赖最少
- 最适合继续沿用当前 `Nest api/v2 + adapter 边界` 模式
- 能快速提升覆盖矩阵中的公开面完整度

当前状态：

- 已完成 `getById`、`listRuns`、`getRun` 三条只读入口

### 4.2 再补写入入口

原因：

- 需要校验持久化模型、命令边界和错误映射
- 需要更明确的数据模型与执行上下文

当前状态：

- 已完成 `create`、`update`、`delete`、`duplicate` 四条主写入入口
- 已完成 `aiCreateDraft` 入口接线，直接复用 `WorkflowService.aiCreateWorkflowDraft(...)`
- `updateWorkflow` 已承载 draft node editing 语义，当前通过 `ro.nodes` 完成草稿节点增删改
- 已完成 `applyUpdate` 独立入口接线，用于将当前 draft 发布为新的 active snapshot，并保持 workflow 激活态

### 4.3 最后统一前端入口

原因：

- 当前前端 automation 仍受占位页和企业版能力边界影响
- 应在后端契约稳定后再做前端领域工作区收口

当前状态：

- 已形成 list / detail / test / history 的最小 workflow 工作区
- 已补 `Apply update` 页面入口，用于把当前 draft 发布到 active snapshot
- 已补 `recordMatchesConditions` 的前端创建与编辑入口，当前 record trigger 页面能力已与后端最小 trigger runner 对齐
- 已补 `updateRecords` / `createRecords` / `queryRecords` 的结构化 editor + JSON editor，当前 record actions 页面能力已与后端现有 runtime 对齐
- 已补 `test run` 自定义 JSON input editor，当前 workflow test 已可覆盖不同输入载荷
- 已补节点级 `testStatus / testOutput` 与最近一次选中节点运行结果展示，当前 node debug 可见性已形成最小闭环
- 已补页面内 `Test node` 入口与后端 `manualNodeTest` 链路，当前可直接对选中 action node 执行节点测试并回写节点调试状态
- 已补 `schedule` 的最小后端运行入口与前端 draft 创建/页面触发入口，当前可从 workflow 页面创建并手动触发 schedule workflow
- 已补 `schedule` 的最小正式调度基础设施，当前 active workflow 已可按 `manual / interval / cron` 配置同步 backend repeat job
- 已补 `webhook` 的最小后端运行入口与前端 draft 创建/URL 展示/页面触发入口，当前可从 workflow 页面创建并调试 webhook workflow
- 已补 `webhook` 的最小安全面与 v2 主契约接线，当前已具备可选 secret、workflow 级速率限制与 `workflows.triggerWebhook` v2 入口
- 已补 `webhook` 的最小正式契约面，当前已具备可选 HMAC-SHA256 signature 校验、时间窗校验、公开 header 契约说明与 workflow 级 body size limit / rate limit / 分层错误语义
- 已补 `formSubmitted` 的最小后端运行入口与前端 draft 创建/页面触发入口，当前可从 workflow 页面创建并手动触发 form-submitted workflow
- 已补 `emailReceived` 的最小后端运行入口与前端 draft 创建/页面触发入口，当前可从 workflow 页面创建并手动触发 email-received workflow
- 已补 `sendEmail`、`httpRequest`、`condition`、`loop` 四类新增最小 action runtime，并与前端 workflow 工作区形成可编辑闭环；当前 logic/loop 已具备最小编排表达
- 已补 AI authoring 最小多形态草稿生成，当前 AI draft 已可生成多类 trigger/action 组合、最小多节点 actions、`fieldMappings` 与 activation-ready `testPlan`，而非固定 `buttonClick + runScript`

## 5. 完成判定

workflow 领域从“分阶段推进”升级到“基础闭环已形成”的最小条件如下：

1. 具备完整只读入口
2. 具备 CRUD 主写入入口
3. 具备 activate / deactivate / run history 入口
4. `v1-v2-coverage-matrix.md` 中 Workflow 可从“局部”提升到“较完整”

当前进度：

- 条件 1 已满足
- 条件 2 已满足
- 条件 3 已满足

## 6. 当前结论

Workflow 当前最合适的执行口径是：

- 继续保留 `generic router` 的 adapter 边界
- 通过 `Nest api/v2` 维持稳定公开入口
- 在读取、主写入面、draft editing、apply-update 与最小 runner/history 已经稳定、AI draft 入口已公开的基础上，将剩余 trigger、前端工作区与更深的 port 化统一转入后续专项治理
