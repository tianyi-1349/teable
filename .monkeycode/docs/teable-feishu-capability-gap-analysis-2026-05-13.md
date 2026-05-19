# Teable 与飞书多维表格能力缺口分析

## 目标

本文基于公开官方资料和当前仓库代码证据，对比 Teable 当前开源仓库与飞书多维表格的关键能力差距，并给出按全局性、一致性、稳定性排序的补充建议。

判断原则：

- 官方能力只引用公开官方资料。
- 本仓能力只按本地代码、schema、OpenAPI contract、前后端入口和项目规格文档判断。
- 未在代码中找到可靠证据的能力标记为“未发现代码证据”。
- 规划文档中的目标能力与已实现能力分开判断。

## 官方能力基线

### 飞书多维表格

公开官方资料显示，飞书多维表格的核心能力已经从表格数据库扩展到业务系统搭建平台：

- AI 智能搭建业务系统：可自动搭建数据表、配置业务视图、生成示例数据、设计仪表盘、搭建工作流、配置高级权限。
- 应用模式：支持以组件化方式搭建业务应用，包含列表、图表、视图、图片、标签页、插件、自定义插件和独立应用权限。
- 仪表盘：支持多种图表、视图组件、指标卡、切片器、TopN、图表联动、透视表、行列切换等分析能力。
- 视图组件：官方资料明确列出表格、看板、日历、甘特图、画册等组件能力。
- 高级权限：支持数据表、记录、字段、视图、仪表盘等更细粒度权限控制，并支持 AI 智能配置。
- 开放平台 bitable API：公开文档包含字段、记录等 API，带 access token 鉴权、scope 权限和频率限制说明。

代表性官方来源：

- `https://www.feishu.cn/hc/zh-CN/articles/882125125335-%E6%99%BA%E8%83%BD%E6%90%AD%E5%BB%BA%E5%A4%9A%E7%BB%B4%E8%A1%A8%E6%A0%BC%E4%B8%9A%E5%8A%A1%E7%B3%BB%E7%BB%9F`
- `https://www.feishu.cn/hc/zh-CN/articles/474779587401-%E4%BD%BF%E7%94%A8%E5%A4%9A%E7%BB%B4%E8%A1%A8%E6%A0%BC%E5%BA%94%E7%94%A8%E6%A8%A1%E5%BC%8F`
- `https://www.feishu.cn/hc/zh-CN/articles/161059314076-%E4%BD%BF%E7%94%A8%E5%A4%9A%E7%BB%B4%E8%A1%A8%E6%A0%BC%E4%BB%AA%E8%A1%A8%E7%9B%98`
- `https://www.feishu.cn/hc/zh-CN/articles/096700620400-%E4%BD%BF%E7%94%A8%E4%BB%AA%E8%A1%A8%E7%9B%98%E7%9A%84%E8%A7%86%E5%9B%BE%E7%BB%84%E4%BB%B6`
- `https://www.feishu.cn/hc/zh-CN/articles/804245947218-%E6%99%BA%E8%83%BD%E9%85%8D%E7%BD%AE%E5%A4%9A%E7%BB%B4%E8%A1%A8%E6%A0%BC%E9%AB%98%E7%BA%A7%E6%9D%83%E9%99%90`
- `https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-field/list`
- `https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create`

### Teable 官方文档

Teable 官方帮助中心公开索引位于 `https://help.teable.ai/llms.txt`。已抓取到的官方页面显示 Teable 有记录历史能力，并在记录历史权限说明中提及权限矩阵场景。

代表性官方来源：

- `https://help.teable.ai/llms.txt`
- `https://help.teable.ai/zh/basic/record/record-history`

## 当前仓库已有能力证据

### 核心表格数据库能力

当前仓库具备多维表格主干能力。

代码证据：

- `packages/db-main-prisma/prisma/postgres/schema.prisma` 包含 `Space`、`Base`、`TableMeta`、`Field`、`View`、`RecordHistory`、`Dashboard`、`Plugin`、`Workflow`、`BaseNode`、`BaseShare` 等模型。
- `apps/nestjs-backend/src/features` 包含 `base`、`table`、`field`、`view`、`record`、`dashboard`、`share`、`selection`、`import`、`export`、`workflow` 等业务域。
- `packages/openapi/src` 覆盖 table、field、record、view、dashboard、share、selection、automation 等 API contract。
- `packages/sdk/src` 提供前端 hooks、组件和插件桥接。

### Workflow 基础能力

当前仓库已经具备 workflow 的基础持久化、API、后端服务、base-node 集成和部分触发入口。

代码证据：

- `packages/db-main-prisma/prisma/postgres/schema.prisma` 已有 `Workflow`、`WorkflowNode`、`WorkflowSnapshot`、`WorkflowRun`、`WorkflowRunStep`。
- `packages/openapi/src/automation/index.ts` 导出 workflow create、get、get-list、update、delete、duplicate、activate、deactivate、test-run、run list、run detail、AI create draft。
- `apps/nestjs-backend/src/features/workflow/workflow.service.ts` 实现 workflow list、detail、run list、run detail、create 等基础逻辑。
- `apps/nestjs-backend/src/features/base-node/base-node.service.ts` 对 `BaseNodeResourceType.Workflow` 接入 create、duplicate、update、delete、resource list。
- `apps/nestjs-backend/src/features/record/open-api/record-open-api.service.ts` button 字段点击会调用 `workflowService.createButtonRun(...)`。
- `apps/nextjs-app/src/features/app/base-node/WorkflowPage.tsx` 已为 workflow route 预取 workflow list/detail，并渲染 `AutomationPage`。
- `apps/nextjs-app/src/features/app/automation/Pages.tsx` 已接入 workflow list/detail、AI draft、Run Script 编辑、action 配置、test run、activate/deactivate 和 run history UI。

### Published App Runtime 基础能力

当前仓库已有应用发布运行态基础结构。

代码证据：

- `apps/nextjs-app/src/pages/base/[baseId]/[[...slug]].tsx` 已 dispatch `BaseNodeResourceType.App` 到 `AppPage` 和 `getAppServerSideProps`。
- `apps/nextjs-app/src/pages/share/[shareId]/base/[baseId]/[[...slug]].tsx` 已包含 workflow 共享路由分发，需继续核对 App 分发细节。
- `apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx` 已使用 `PublishedAppProvider` 和 `PublishedAppRuntime`。
- `apps/nextjs-app/src/features/app/published-app/shell/PublishedAppShell.tsx` 已按 embed、PWA、mobile、tablet、desktop 分发 shell。
- `apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceRenderer.tsx` 已通过 `PublishedResourceErrorBoundary` 包裹发布态资源。
- `apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceErrorBoundary.tsx` 已提供资源级错误隔离。

### Dashboard 与发布态适配基础

当前仓库已有 Dashboard 模型和发布态上下文接入点。

代码证据：

- `packages/db-main-prisma/prisma/postgres/schema.prisma` 已有 `Dashboard`。
- `apps/nextjs-app/src/features/app/dashboard/DashboardMain.tsx` 使用 `useOptionalPublishedApp`。
- `apps/nextjs-app/src/features/app/dashboard/DashboardHeader.tsx` 使用 `useOptionalPublishedApp`。
- `apps/nextjs-app/src/features/app/dashboard/DashboardGrid.tsx` 使用 `useOptionalPublishedApp`。

### AI 能力基础

当前仓库已有 AI 模块、AI API 和局部 AI 辅助入口。

代码证据：

- `apps/nestjs-backend/src/features/ai/ai.service.ts` 存在 AI 后端服务。
- `packages/openapi/src/ai` 存在多类 AI API contract。
- `packages/openapi/src/automation/workflow/ai-create-draft.ts` 已提供 AI 创建 workflow draft 的 API contract。
- `packages/sdk/src/components/editor/formula/Editor.tsx` 已有公式编辑器 AI 入口。

## 主要能力缺口

### P0：Workflow Run Script 沙箱与完整动作运行时

当前状态：基础 workflow 存在，完整自动化运行时仍需补齐。

关键证据：

- `apps/nestjs-backend/src/features/workflow/script/script-runtime.service.ts` 中 `execute()` 直接抛错：`Run Script workflow actions are disabled until a process-isolated sandbox is available`。

缺口影响：

- AI 生成 Run Script 的自动化主路径无法稳定执行。
- 复杂自动化动作难以统一抽象到脚本能力。
- 工作流执行安全边界、资源限制、错误隔离、日志脱敏缺少关键落点。

建议补充：

- 进程隔离脚本沙箱，包含 timeout、memory limit、capability allowlist。
- `records.query`、`records.create`、`records.update`、`mail.send`、`http.request`、`ai.generate` 等受控 API 注入。
- SSRF 防护、响应大小限制、协议 allowlist、secret 脱敏。
- workflow run step 级 input、output、error、duration 持久化。
- 测试覆盖 button click、manual test-run、失败动作、权限失效、资源超限。

### P0：Workflow 前端产品化与运行时一致性

当前状态：前端 workflow 工作区已经存在，仍需围绕完整运行时、节点能力和产品体验继续补齐。

关键证据：

- `apps/nextjs-app/src/features/app/base-node/WorkflowPage.tsx` 渲染 `AutomationPage`。
- `apps/nextjs-app/src/features/app/automation/Pages.tsx` 已包含 `aiCreateWorkflowDraft`、`testRunWorkflow`、`activateWorkflow`、`deactivateWorkflow`、Run Script 编辑和 run history 展示。

缺口影响：

- 前端已有配置入口，但后端 Run Script 沙箱禁用会让关键动作无法稳定运行。
- 复杂 trigger/action/logic、apply update、节点级测试和运行态错误解释仍需继续产品化。

建议补充：

- 将前端可配置的 action 与后端真实 action handler 能力对齐。
- 增加节点级 test、apply update、active snapshot diff 和运行前校验。
- 强化 run history 的错误解释、重试入口和 step output 审查。
- 为 recordCreated、recordUpdated、scheduled、webhook、formSubmitted、emailReceived 等触发器提供一致配置体验。
- 与沙箱、权限、quota、audit 联动，避免前端展示超出后端可执行范围的能力。

### P1：Published App 跨端 shell 与资源 renderer 完整度

当前状态：运行态目录和 shell 分发已有，多个 shell 仍偏骨架。

关键证据：

- `apps/nextjs-app/src/features/app/published-app/shell/PublishedAppShell.tsx` 已存在跨端分发。
- `apps/nextjs-app/src/features/app/published-app/shell/MobileShell.tsx`、`DesktopShell.tsx`、`TabletShell.tsx` 当前仅返回 children。
- `apps/nextjs-app/src/features/app/published-app/shell/PublishedAppBottomNav.tsx` 和 `PublishedAppDrawer.tsx` 当前返回 null。
- `apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceRenderer.tsx` 已有资源级 error boundary，但还未形成按 Table/Dashboard/Workflow/App 分派的资源 renderer。
- `.monkeycode/specs/published-app-runtime/requirements.md` 明确要求 desktop、tablet、mobile、embed、PWA 一致 runtime。

缺口影响：

- 应用模式在移动端、平板端、桌面端、嵌入态和 PWA 的体验一致性不足。
- 当前容易退化为编辑器视图的响应式补丁，难以达到业务应用运行态体验。

建议补充：

- DesktopShell：side navigation 或 split layout。
- TabletShell：adaptive drawer/split layout。
- MobileShell：application header、bottom navigation、page drawer、safe-area。
- EmbedShell：minimal chrome。
- PwaStandaloneShell：standalone display、safe-area、start URL 保持。
- PublishedResourceRenderer：Table、Dashboard、Workflow、App、Unsupported resource 统一渲染。

### P1：高级权限矩阵完整实现

当前状态：入口与部分引用存在，完整开源实现证据不足。

关键证据：

- `apps/nextjs-app/src/features/app/blocks/AuthorityMatrix.tsx` 只显示企业版升级提示。
- `packages/core/src/utils/id-generator.ts` 有 authority matrix ID 相关能力。
- `packages/openapi/src/field/get-delete-references.ts` 有 `authorityMatrixRoles` 引用。

缺口影响：

- 与飞书高级权限的记录、字段、视图、仪表盘细粒度控制存在明显差距。
- AI 智能配置权限缺少可执行目标模型。
- 记录历史、分享、应用模式、自动化执行权限难以统一治理。

建议补充：

- Authority matrix schema 和 migration。
- Role、member、table permission、record condition、field permission、view permission、dashboard permission。
- 后端 policy enforcement，覆盖 read/write/delete/export/share/API/workflow。
- 前端矩阵编辑器与预览。
- AI 权限配置 draft、执行计划、撤销和审计。

### P1：Dashboard 高级分析组件

当前状态：Dashboard 基础存在，高级分析组件未发现可靠代码证据。

未发现代码证据：

- `gantt` / `Gantt` / `甘特`
- `pivot` / `Pivot` / `透视`
- `slicer` / `Slicer` / `切片器`
- `TopN` / `topN` / `top-n`
- 仪表盘 drill/down 产品级能力

缺口影响：

- 与飞书仪表盘的切片器、透视表、TopN、图表联动、甘特视图组件存在差距。
- 应用模式中可组合的业务组件丰富度不足。

建议补充：

- Slicer 组件：统一过滤上下文，可作用于多个 chart 和 view resource。
- Pivot table：基于现有 aggregation/query-builder 设计汇总能力。
- Gantt view：优先作为 view/dashboard resource，不直接侵入 grid 主编辑器。
- TopN：作为 chart query transform 或 dashboard widget filter。
- Chart interaction：联动筛选、点击 drill、移动端 touch 行为。

### P2：自定义记录详情页

当前状态：未发现明确产品级实现证据。

官方对比：

- 飞书资料提到自定义记录详情页，可用标签页、横向/纵向布局等组件重组详情页。

缺口影响：

- 应用模式缺少面向业务对象的详情页表达能力。
- 移动端记录浏览体验会依赖通用展开卡片，难以支撑复杂业务应用。

建议补充：

- Record detail layout schema。
- Field sections、tabs、two-column/single-column layout。
- Readonly/edit mode 分层。
- 与权限矩阵和 published app context 联动。

### P2：AI 业务系统生成器

当前状态：AI 能力分散存在，端到端业务系统生成编排仍需补齐。

代码证据：

- AI service、AI openapi、AI workflow draft、AI formula entry 已存在。

缺口影响：

- 与飞书“输入需求后生成表、视图、仪表盘、工作流、高级权限、示例数据”的完整体验存在差距。

建议补充：

- App builder orchestration 层。
- 生成 design draft，再生成 table/view/dashboard/workflow/permission/publish manifest。
- 所有 AI 生成结果进入可审查 draft，再由用户确认应用。
- 生成过程接入任务状态、可停止、可恢复、可追溯。

## 能力状态矩阵

| 能力 | 当前状态 | 代码证据 | 优先级 |
| --- | --- | --- | --- |
| 表格/字段/记录/视图 | 已有主干 | Prisma、backend features、OpenAPI、SDK | 已具备 |
| 导入导出 | 已有主干 | `features/import`、`features/export` | 已具备 |
| Dashboard 基础 | 已有 | Prisma `Dashboard`、frontend dashboard | 已具备 |
| Workflow 持久化/API | 已有基础 | Prisma workflow tables、OpenAPI automation、backend workflow service | 已具备 |
| Workflow Run Script | 禁用 | `script-runtime.service.ts` 抛错 | P0 |
| Workflow 前端工作区 | 已有基础，需产品化 | `AutomationPage` 接入 AI draft、test run、activate、run history | P0 |
| Published App Runtime | 部分已有 | `published-app` runtime/shell、App route、resource error boundary | P1 |
| 跨端真实 shell | 骨架 | `MobileShell` 空包装 | P1 |
| 高级权限矩阵 | 入口/引用存在 | `AuthorityMatrix.tsx` 企业版提示 | P1 |
| 切片器 | 未发现代码证据 | grep 未发现 | P1 |
| 透视表 | 未发现代码证据 | grep 未发现 | P1 |
| 甘特图 | 未发现代码证据 | grep 未发现 | P1 |
| TopN/图表联动/drill | 未发现完整证据 | grep 未发现产品级实现 | P1 |
| 自定义记录详情页 | 未发现明确证据 | grep 未发现产品级实现 | P2 |
| AI 业务系统生成器 | 局部 AI 已有 | AI service、AI workflow draft、AI formula | P2 |

## 对全局性、一致性、稳定性的影响

### 全局性

优先补 workflow runtime、published app runtime、authority matrix，可以形成全局平台能力：

- workflow 连接字段、记录、表、通知、AI、外部系统。
- published app 连接 base-node、share、dashboard、table、workflow、app。
- authority matrix 统一 read/write/export/share/API/workflow 权限判断。

### 一致性

跨端应用模式需要统一 manifest、navigation、context、resource renderer。各端 shell 只负责布局和导航形态，资源语义保持一致。

权限一致性需要后端 policy 作为权威来源，前端只做交互收敛和可见性优化。

Workflow 一致性需要 draft、active snapshot、run history 三层模型稳定分离，避免编辑态影响运行态。

### 稳定性

稳定性风险最大的点是脚本执行、HTTP request、AI action、跨 base 操作和第三方插件。补齐时需要优先建立：

- 进程隔离。
- 超时和内存限制。
- SSRF 防护。
- secret 脱敏。
- run history 错误可观测。
- plugin/resource error boundary。
- 发布态只读和权限边界。

## 建议路线

### 第一阶段：自动化稳定闭环

- 实现 Run Script 沙箱最小可用版本。
- 补 workflow action handler interface。
- 补 button click -> active snapshot -> run -> step history 的真实执行链路。
- 补 workflow run history UI。
- 验证：backend workflow focused tests、record button click tests、OpenAPI typecheck。

### 第二阶段：应用模式跨端运行态

- 完成 manifest/context/navigation/resource renderer。
- 完成 desktop/tablet/mobile/embed/PWA shell。
- Dashboard 发布态禁用编辑交互，增加 plugin card error boundary。
- Table/Form/View 增强移动端可用性。
- 验证：`pnpm --filter @teable/app typecheck` 和 Chart focused tests。

### 第三阶段：权限矩阵治理

- 建 authority matrix 数据模型。
- 接入 base/table/record/field/view/dashboard/workflow 权限判断。
- 接入 share、published app、OpenAPI、export、record history。
- 增加 AI 权限配置 draft。

### 第四阶段：高级分析组件

- 先做 slicer 和 TopN，利用现有 dashboard/chart 查询链路。
- 再做 pivot，复用 aggregation/query-builder。
- 甘特图作为 view/dashboard resource 实现。

### 第五阶段：AI 业务系统生成器

- 基于 design draft 编排 table/view/dashboard/workflow/permission/published app。
- 生成内容全部可审查、可回滚、可追踪。

## 需进一步代码验证清单

- 后端 workflow action handler 对 `runScript`、`aiGenerate`、`updateRecords`、`createRecords`、`queryRecords` 的真实执行覆盖度。
- `apps/nextjs-app/src/features/app/published-app` 是否已有未命名为 `resources` 的 Table/Dashboard/Workflow/App 资源分派实现；当前 `PublishedResourceRenderer.tsx` 仅做 error boundary 包裹。
- Dashboard 是否已有 hidden 的 slicer、TopN、chart interaction 实现路径。
- 权限矩阵是否存在于企业版 override 或未纳入当前开源目录的包中。
- share route 与 authenticated route 当前都已 dispatch App resource，仍需继续验证 SSR 数据、权限和 published app runtime 语义是否完全一致。
