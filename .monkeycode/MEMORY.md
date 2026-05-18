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

[收到继续执行指令后持续推进直至任务完成]
- Date: 2026-05-17
- Context: 用户多次要求继续执行并直至剩余任务全部正确完成，中间不必停留
- Instructions:
  - 收到继续执行指令后，持续推进后续修复、验证和收口，直到当前任务完整完成
  - 中途仅在真实阻塞、冲突或信息不足时停下询问
  - 对之前未完成的任务继续执行，直到全部正确完成为止

[修复与提交前必须先满足全局性一致性稳定性]
- Date: 2026-05-17
- Context: 用户要求在本地仓库全部重新检测后，只有在全面修复且完全准确的前提下才进入提交，并同意持续执行全部任务直至全部精准高效完成
- Instructions:
  - 对准备提交的改动先做全局性检查，确认上下游链路和相邻模块一起收口
  - 对准备提交的改动先做一致性检查，确认命名、契约、实现边界和导出面统一
  - 对准备提交的改动先做稳定性检查，确认关键 typecheck、测试和运行门禁已经验证通过
  - 在上述三项约束满足前，不进入提交阶段
  - 对已确认的后续任务持续执行直至全部精准高效完成，中途不重复询问是否继续

[能力缺口修复需优先满足全局性、一致性、稳定性]
- Date: 2026-05-15
- Context: 用户要求基于 `capability-gap-list.md` 从全局性、一致性、稳定性三个前提条件出发推进能力缺口修复
- Instructions:
  - 修复能力缺口时优先选择能提升全仓库统一性的改动，而不是局部补丁
  - 同一能力涉及前端、后端、契约、数据层时，应按统一链路收口并校验命名和边界一致性
  - 优先推进稳定可验证的修复包，避免在单次任务中引入大范围不可控重构

[应用模式页面必须按跨端自适应架构设计]
- Date: 2026-05-12
- Context: 用户补充应用模式能力对齐飞书多维表格时的核心架构要求
- Instructions:
  - 应用模式的页面必须按跨端、多端自适应架构设计，不应只做移动端 CSS 补丁
  - 相关实施方案需同时考虑桌面端、平板端、移动端、嵌入态和分享发布态的一致运行体验
  - 应用模式运行态应以统一 runtime、统一资源解析、统一导航模型和响应式布局策略为基础

[小程序适配能力只预留不实施]
- Date: 2026-05-12
- Context: 用户明确应用模式能力规划中保留微信小程序适配能力，但当前不具体进行小程序适配
- Instructions:
  - 当前应用模式落地主线聚焦跨端 Web、移动端友好、嵌入态和 PWA/可安装 Web App
  - 微信小程序只保留 headless contract、manifest、导航模型和 renderer adapter 边界，不新建小程序工程或实现小程序 renderer
  - 后续设计不得把运行时强绑定 Next.js URL、DOM、iframe 或 Web-only 状态，以免阻断未来小程序接入

[自动化任务需精简上下文并持续收口]
- Date: 2026-05-11
- Context: 用户指出平台出现 `Input exceeds context window of this model`，并要求修复错误后继续执行所有既定任务直到本次计划完整结束
- Instructions:
  - 后续自动化任务回复必须避免输出超长历史汇总，只保留必要进度、验证结果和提交信息
  - 对已规划的自动化官方能力对齐工作持续推进、修复、验证和提交，除非遇到真实阻塞或冲突，不反复询问是否继续
  - 若需要总结历史进度，使用短摘要而不是粘贴完整上下文

[v2-core typecheck 与声明打包需区分源码边界和跨包类型依赖]
- Date: 2026-05-06
- Context: Agent 在清理 `packages/v2/core` 的 typecheck 与 build warning 时发现
- Category: 构建方法
- Instructions:
  - `packages/v2/core` 的 `typecheck` 需要显式补齐 `@teable/core` path 和 `../../core/src` include，否则会把上游类型解析成缺失依赖
  - `packages/v2/core` 的 `tsconfig.json` 应排除 `src/**/*.spec.ts`、`src/**/*.test.ts` 和 `src/testkit/**`，避免生产源码 typecheck 被测试桩拖垮
  - `rolldown-plugin-dts` 对跨包接口和值导出较敏感，端口接口和 visitor 类型应优先使用 `import type`
  - `IExecutionContext.$t` 作为通用执行上下文翻译钩子可接受 `string` key，不必在 `v2-core` 声明层强绑定 `@teable/i18n-keys` 类型导出

[设计系统收敛执行顺序需先 ai-config 后其他邻接页面]
- Date: 2026-05-06
- Context: 用户在继续推进第三轮共享语义类收敛时明确要求执行顺序
- Instructions:
  - 继续扫 `apps/nextjs-app/src/features/app/blocks/admin/setting/components/ai-config` 目录，把剩余零散 `transition-colors` / `transition-all` 先收一批
  - 完成 `ai-config` 收口后，再回到 `publish` / `form` / `settings` 其他邻接页面继续铺开相同语义类

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
  - 当前仓库中 `AutomationPage` 定义在 `apps/nextjs-app/src/features/app/automation/Pages.tsx`，已是实际 workflow 页面实现，并由 `apps/nextjs-app/src/features/app/base-node/WorkflowPage.tsx` 直接渲染
  - `apps/nextjs-app/src/features/app/automation/workflow-panel/WorkFlowPanel.tsx` 已暴露 `getWorkflow`、`checkCanActive`、`activeWorkflow` 等实际运行时方法
  - 后续增强 `WorkFlowPanelRef` 时应基于现有真实页面与运行时方法扩展，避免回退到占位页假设

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
  - 当前仓库前端已存在真实 workflow 页面入口与运行时方法，`WorkFlowPanel` 既承载 workflow 上下文，也承载实际查询与激活动作
  - `WorkFlowPanel` 仍适合作为 workflow 上下文、入口动作和右侧 `app-mode` 配置的统一工作区，并继续避免引入脱离现有页面模型的额外伪接口
  - 当从按钮字段配置进入 workflow 面板时，优先展示 `workflowId`、`baseId`、触发字段等上下文，帮助用户把 automation 配置与 app-mode 治理放在同一工作区理解

[用户要求连续执行直到修复完成]
- Date: 2026-05-06
- Context: 用户在 PR 自检后要求继续修复所有发现的问题
- Instructions:
  - 对已识别的问题持续执行修复、验证和收口，直到全部处理完成
  - 中间不必重复询问用户是否继续，除非遇到真实阻塞或冲突

[v2-contract-http 跨包类型依赖需要显式补 path 与 DOM iterable]
- Date: 2026-05-16
- Context: Agent 在补齐 `packages/v2/contract-http` 与 `packages/v2/contract-http-implementation` 的 Aggregation/Search、Undo/Redo 公开层并恢复包级 typecheck 时发现
- Category: 构建方法
- Instructions:
  - 当 `packages/v2/contract-http` 或 `packages/v2/contract-http-implementation` 直接引用 `@teable/openapi` 源码类型时，需要在各自 `tsconfig.json` 的 `paths` 中显式补 `@teable/openapi: ["../../openapi/src"]`
  - 同时需要把 `../../openapi/src` 加入 `include`，否则包级 `typecheck` 在 `moduleResolution: bundler` 下会把 `@teable/openapi` 解析成缺失依赖
  - 这两个包的 `compilerOptions.lib` 需要包含 `dom.iterable`，否则在编译 `packages/openapi/src/utils/sse.ts` 时会丢失 `Headers.entries()` 的类型定义
  - 当新增跨包源码类型依赖时，除了 `package.json` 依赖声明，还要同步检查 `tsconfig` 的 `paths`、`include` 与标准库声明是否完整

[generic v2 router 对高层域使用显式 Nest adapter 边界]
- Date: 2026-05-16
- Context: Agent 在统一 `packages/v2/contract-http-implementation/src/router.ts` 的边界表达时发现
- Category: 代码结构
- Instructions:
  - `createV2OrpcRouter` 当前对 comment、share、publishedApps、settings、templates、workflows 保留显式 Nest adapter 边界，这些域的真实执行主链路仍由 Nest `api/v2` 承载
  - `tables`、`views`、`bases` 等通用可执行域应优先接入 shared router，避免 contract 已公开但 generic router 缺失入口
  - 对 Nest-only 域的报错实现应统一通过 helper 表达，避免在 `router.ts` 中散落重复的 `throw new ORPCError('INTERNAL_SERVER_ERROR', ...)` 片段

[缺口清单修复任务需连续执行直至矩阵收口]
- Date: 2026-05-15
- Context: 用户要求把缺口清单生成的“修复任务矩阵”剩余任务继续执行，中间不必停留询问，直到本任务全部完成
- Instructions:
  - 按修复任务矩阵剩余项连续推进代码、验证和文档同步，不在中途停下来确认
  - 优先选择高核心域的最小稳定切口逐步收口，例如 comment、share、workflow、published
  - 每完成一批代码改动后立即运行类型校验并同步矩阵、缺口清单和覆盖文档

[用户要求按 SDD 模式继续全量执行]
- Date: 2026-05-07
- Context: 用户要求围绕 PDF 预览与关联字段导航继续执行全部工作
- Instructions:
  - 按 SDD 模式同时维护规格文档与代码实现，不只停留在分析
  - 在没有真实阻塞前持续推进后续改造、测试与验证，不重复询问是否继续

[backend 单文件 e2e 需要补齐 seed 与 SQL executor 环境开关]
- Date: 2026-05-07
- Context: Agent 在新增 PDF attachment e2e 并单独运行 `apps/nestjs-backend/test/attachment.e2e-spec.ts` 时发现
- Category: 测试方法
- Instructions:
  - backend 单文件 e2e 不能直接裸跑；至少要先执行 `pnpm pre-test-e2e`，确保 `globalThis.testConfig` 对应的测试账号和 base 已 seed 完成
  - 当前受限本地 Postgres 环境里，若缺少 `CREATE ROLE` 权限，需要为 e2e 临时加 `DISABLE_PRE_SQL_EXECUTOR_CHECK=true`，跳过 `BaseSqlExecutorService` 的只读角色预检查
  - `apps/nestjs-backend/test/attachment.e2e-spec.ts` 的 PDF thumbnail 断言应以“至少一个 thumbnail URL 已生成，且不回退到原始 `presignedUrl`”为准，不应强制要求 `lgThumbnailUrl` 必然存在

[AI Chat 后端复用现有模型配置和 AI SDK 工具类型]
- Date: 2026-05-09
- Context: Agent 在修复 AI Chat 后端 typecheck 与 Tool Calling 时发现
- Category: 代码模式
- Instructions:
  - `apps/nestjs-backend` 的 AI Chat 流式模型应复用 `AiService.getAIConfig(baseId)` 和 `AiService.getModelInstance(modelKey, llmProviders)`，不要绕过现有 provider 配置重新组装模型
  - AI SDK v6 工具应在服务里直接返回 `tool({ inputSchema, execute })` 对象，避免把 schema/execute 拆成自定义定义后再包装导致 `Tool<never>` 推断错误
  - AI SDK v6 `streamText` 文本分片当前使用 `chunk.type === 'text-delta'` 且读取 `chunk.text`，多步工具调用使用 `stopWhen: stepCountIs(5)`
  - AI Chat 记录读写应走 `RecordService` / `RecordOpenApiService`，不要直接 SQL 操作不存在的通用 `table_records` 表

[当前仓库自动化运行时为占位与企业版外接边界]
- Date: 2026-05-10
- Context: Agent 在对照 Teable 官方自动化文档评估本仓库实现时发现
- Category: 代码结构
- Instructions:
  - 当前开源仓库已具备 workflow 页面入口、`WorkFlowPanel` 本地实现和 `getWorkflow`、`checkCanActive`、`activeWorkflow` 等运行时方法，前端不再属于纯占位页状态
  - Prisma 当前 schema 不包含可用 Workflow model；旧 `automation_workflow*` 表在后续迁移中被删除，后续迁移只兼容检测可能存在的企业版 `workflow` 表
  - 若要进一步补齐官方自动化能力，重点仍在统一 workflow 存储、触发器、动作、测试、发布、运行历史和执行器，而不是只追加前端表层交互

[本轮能力缺口修复需连续执行直至全部完成]
- Date: 2026-05-15
- Context: 用户要求把剩余任务全部执行，中间不必停下来询问，直至全部完成为止
- Instructions:
  - 对当前能力缺口收敛任务持续执行，优先自行拆解并直接落地可验证改动
  - 在没有真实阻塞、冲突或缺失前置条件时，持续推进代码、文档、校验和状态同步，不中途征求是否继续
  - 完成每一轮收口后，应同步更新缺口文档、任务矩阵和相关索引，避免状态漂移

[仓库能力盘点采用单主模型收口与单复核模型校边界]
- Date: 2026-05-16
- Context: 用户要求后续继续盘点仓库功能能力明细时采用更稳定的一主一复核方案，并形成具体可执行细节
- Instructions:
  - 正式盘点主稿统一由 `GPT-5.5` 负责，保证全局口径、一致性和稳定性
  - `DeepSeek v4pro` 只用于复核边界项和高不确定域，不再做三模型全量并行盘点
  - 盘点执行需形成可落地工程文档，明确输入、输出、步骤、验证和准出标准

[能力盘点文档必须先声明分层并同步标准与输出]
- Date: 2026-05-16
- Context: 用户要求继续执行直到全部任务完成，Agent 在收口盘点文档体系时固化
- Category: 代码模式
- Instructions:
  - 能力盘点相关文档必须先声明所属层级：正式标准、正式输出、历史辅助输入
  - 若执行方式发生变化，需同轮同步更新 `capability-inventory-execution-playbook.md` 与 `capability-prompts.md`
  - 若正式输出发生变化，需同步更新缺口清单、任务矩阵、覆盖矩阵、索引和相关路线图文档

[一致性与稳定性修复按 SDD 连续执行直至全部完成]
- Date: 2026-05-16
- Context: 用户要求从全局一致性与稳定性角度，把 5 个修复点按 SDD 模式连续执行，直到全部完成修复
- Instructions:
  - 对 `v2.controller.ts` 类型安全、generic router 边界表达、workflow 知识沉淀、Aggregation/Search v2 公开层、Undo/Redo v2 公开契约层按统一工程任务连续推进
  - 执行过程中同时维护代码、文档、记忆和验证结果，不停留在方案讨论
  - 每完成一个修复包后立即同步相关正式输出，避免代码事实与盘点文档再次漂移

[最终收口任务需直接执行直至远端 PR 完整建立]
- Date: 2026-05-17
- Context: 用户要求继续执行全部任务直到完成所有任务为止，中间不必询问不必停留，并强调必须高度正确
- Instructions:
  - 对本轮剩余收口任务直接执行到远端分支与 PR 状态完整闭环
  - 优先保证全局性、一致性、稳定性，必要时先补全校验再执行分支拆分、推送和建 PR
  - 中间不必停留询问，除非出现真实冲突、权限问题或外部平台阻塞

[lint 校验使用低并发方式执行]
- Date: 2026-05-17
- Context: 用户要求继续执行下一步，并明确 lint 时不要起太多进程
- Instructions:
  - 执行 lint 时优先使用低并发或单并发方式，避免同时拉起大量子进程
  - 当需要替代仓库默认并行脚本时，保持校验范围一致，优先调整并发度而不是缩小检查范围

[根脚本并发上限控制为 2]
- Date: 2026-05-17
- Context: 用户要求修改根 `package.json` 中高并发脚本，统一限制最多不超过 2 个进程
- Instructions:
  - 根 `package.json` 中会并发跑 workspace 任务的脚本优先使用 `pnpm --workspace-concurrency=2`
  - 对长期运行、lint、typecheck、test-unit、build、clean 等全仓脚本，默认将并发上限控制在 2
