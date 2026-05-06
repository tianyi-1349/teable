# 用户指令记忆

本文件记录了用户的指令、偏好和教导，用于在未来的交互中提供参考。

## 格式

### 用户指令条目
用户指令条目应遵循以下格式：

[用户指令摘要]
- Date: [YYYY-MM-DD]
- Context: [提及的场景或时间]
- Instructions:
  - [用户教导或指示的内容，逐行描述]

### 项目知识条目
Agent 在任务执行过程中发现的条目应遵循以下格式：

[项目知识摘要]
- Date: [YYYY-MM-DD]
- Context: Agent 在执行 [具体任务描述] 时发现
- Category: [代码结构|代码模式|代码生成|构建方法|测试方法|依赖关系|环境配置]
- Instructions:
  - [具体的知识点，逐行描述]

## 去重策略
- 添加新条目前，检查是否存在相似或相同的指令
- 若发现重复，跳过新条目或与已有条目合并
- 合并时，更新上下文或日期信息
- 这有助于避免冗余条目，保持记忆文件整洁

## 条目

[维护 AGENTS.md 时优先覆盖全仓库高价值来源]
- Date: 2026-05-06
- Context: 用户要求创建或更新仓库级 `AGENTS.md`
- Instructions:
  - 维护 `AGENTS.md` 时优先覆盖仓库下的高价值文件和现有指令来源，避免只看局部模块

[Teable 仓库开发与校验约定]
- Date: 2026-05-06
- Context: Agent 在执行 AGENTS.md 维护任务时发现
- Category: 构建方法
- Instructions:
  - 根仓库只使用 `pnpm`，`packageManager` 固定为 `pnpm@9.13.0`，`npm` 被 engines 明确禁止
  - 本地开发按 `pnpm install` -> `make switch-db-mode` -> `cd apps/nestjs-backend && pnpm dev` 走，前端由 backend dev 流程自动拉起
  - CI 的 lint/type 顺序是 Prisma generate -> `pnpm -F "./packages/**" run build` -> `pnpm g:typecheck` -> `pnpm g:lint` -> `pnpm g:lint-styles`
  - backend e2e 依赖 `pre-test-e2e` 先执行 Prisma seed，重型集成链路走 `make postgres.integration.test`

[Teable 适合以项目自有 DESIGN.md 驱动页面改造]
- Date: 2026-05-06
- Context: Agent 在调研 `awesome-design-md` 并为当前仓库制定落地方案时发现
- Category: 代码模式
- Instructions:
  - 若在当前仓库引入 `DESIGN.md`，应优先放在 `.monkeycode/docs/design-system/` 下，作为项目内设计规范，而不是直接依赖外部链接
  - `DESIGN.md` 应与 `AGENTS.md` 配合使用：`AGENTS.md` 约束实现方式，`DESIGN.md` 约束视觉语言和交互风格
  - 最适合先试点的页面类型是 `dashboard`、`record detail`、`form` 和配置侧栏，不应一开始就覆盖表格主编辑区

[前端页面改造前先读取设计规范]
- Date: 2026-05-06
- Context: Agent 在建设项目内 DESIGN.md 规范时固化
- Category: 代码模式
- Instructions:
  - 当任务涉及 `apps/nextjs-app` 的页面视觉、布局或交互改造时，先读取 `.monkeycode/docs/design-system/DESIGN.md`
  - 若任务属于特定页面类型且 `.monkeycode/docs/design-system/page-recipes/` 下已有对应文档，再读取后开始改代码

[品牌化提示词包用于风格倾向，不覆盖产品约束]
- Date: 2026-05-06
- Context: Agent 为当前仓库生成可执行品牌化提示词包时固化
- Category: 代码模式
- Instructions:
  - VoltAgent 和 Apple 风格提示词只能作为页面改造的风格倾向输入，不能覆盖 `AGENTS.md`、`DESIGN.md` 和现有产品流程约束
  - 使用品牌化提示词时，优先级应始终保持为：产品流程 > 仓库约束 > 页面 recipe > 品牌风格

[品牌提示词按产品内页面与新入口页面分层使用]
- Date: 2026-05-06
- Context: Agent 补充落地页和登录页专用 prompt pack 时固化
- Category: 代码模式
- Instructions:
  - 对 `dashboard`、`form`、`detail`、`side panel` 等产品内页面，优先使用产品型 prompt pack
  - 对 landing page、login page、signup/access entry 等新入口页面，优先使用专用场景包

[record detail 与 form 已有页面级品牌执行包]
- Date: 2026-05-06
- Context: Agent 为新增 page recipe 接入 VoltAgent / Apple 页面级执行 prompt 时固化
- Category: 代码模式
- Instructions:
  - 当任务是 `record detail` 页面改造时，可直接使用品牌提示词文档中的 VoltAgent / Apple record detail 执行包
  - 当任务是 `form` 页面改造时，可直接使用品牌提示词文档中的 VoltAgent / Apple form 执行包

[按 SDD 模式执行品牌风格落地]
- Date: 2026-05-06
- Context: 用户要求按 SDD 模式完整执行 VoltAgent / Apple 风格落地
- Category: 代码模式
- Instructions:
  - 执行顺序按设计资产落库、项目映射、试点选择、代码实施、验证收口推进，不跳过中间产物
  - 品牌风格落地需要同时产出规范文档与实际代码改造，而不只停留在 prompt 或分析阶段

[VoltAgent / Apple 已有第一轮真实页面试点]
- Date: 2026-05-06
- Context: Agent 按 SDD 模式完成第一轮品牌风格代码落地时发现
- Category: 代码模式
- Instructions:
  - VoltAgent 第一轮试点页面为 `apps/nextjs-app/src/features/app/dashboard/DashboardHeader.tsx`
  - Apple 第一轮试点页面为 `apps/nextjs-app/src/features/app/components/setting/integration/third-party-integrations/Detail.tsx`
  - 当前环境未安装依赖，`pnpm --filter @teable/app typecheck` 会因缺少 `tsc` 和 `node_modules` 阻塞，验证前需先完成依赖安装

[automation overridable 组件通过 tsconfig paths 指向本地实现]
- Date: 2026-05-06
- Context: Agent 在修复 `WorkFlowPanel` 类型断层并追查 automation override 架构时发现
- Category: 代码结构
- Instructions:
  - `apps/nextjs-app/tsconfig.json` 中 `@overridable/WorkFlowPanel` 直接映射到 `./features/app/automation/workflow-panel/WorkFlowPanel`
  - 当前仓库中 `AutomationPage` 定义在 `apps/nextjs-app/src/features/app/automation/Pages.tsx`，是无参占位页，不提供 `AutomationPageApi` 或 `onRegisterApi`
  - 如果后续恢复真实 automation 运行时，需先补齐 `Pages.tsx` 的真实实现或重新接回兼容接口，再增强 `WorkFlowPanelRef`

[前端 typecheck 可能被跨包断链阻塞]
- Date: 2026-05-06
- Context: Agent 在修复 `WorkFlowPanel` 后重新执行 `pnpm --filter @teable/app typecheck` 时发现
- Category: 依赖关系
- Instructions:
  - `packages/openapi/src/automation/index.ts` 当前导出了不存在的 `./workflow/types`、`./workflow/get`、`./workflow/get-execution-list`、`./workflow/update`、`./workflow/delete`
  - `packages/sdk/src/hooks/index.ts` 当前导出了不存在的 `./use-ai-record-operations`
  - 前端 typecheck 失败不一定来自页面改动，需同时检查被 `paths` 引入的 workspace 包源码导出是否仍然存在

[前端测试 mock 需跟随 core schema 演进同步更新]
- Date: 2026-05-06
- Context: Agent 在清理 `@teable/app` 前端 typecheck 阻塞时发现
- Category: 测试方法
- Instructions:
  - `selectionViewQuery` 相关测试里的排序值应优先使用 `@teable/core` 的 `SortFunc` 枚举，而不是裸字符串字面量
  - `FieldSetting` 相关 lookup mock 需要跟随 `IFieldVo.lookupOptions` 的 schema 演进，同步补齐 `relationship`、`fkHostTableName`、`selfKeyName`、`foreignKeyName` 等必填字段
  - `DeleteSelectionProgressDialog` 测试应匹配 UI 适配层收窄后的 phase，当前对话框层只接受 `preparing`/`deleting` 源事件并映射到内部 phase

[workflow 面板当前应作为上下文工作区而非伪造编辑器]
- Date: 2026-05-06
- Context: Agent 在继续推进 `WorkFlowPanel` 接近真实运行时时发现
- Category: 代码结构
- Instructions:
  - 当前仓库前端存在 `createWorkflow` 接口和 workflow 路由入口，但 `apps/nextjs-app/src/features/app/automation/Pages.tsx` 仍是企业版占位页，不存在真实 workflow 编辑运行时组件
  - 在没有真实 automation 编辑器实现前，`WorkFlowPanel` 最合理的职责是承载 workflow 上下文、入口动作和右侧 `app-mode` 配置，而不是伪造不存在的 `AutomationPageApi`
  - 当从按钮字段配置进入 workflow 面板时，优先展示 `workflowId`、`baseId`、触发字段等上下文，帮助用户把 automation 配置与 app-mode 治理放在同一工作区理解
