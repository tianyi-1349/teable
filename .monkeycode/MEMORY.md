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

[base-duplicate CI 稳定性任务使用轻量 SDD 与主线交付协议]
- Date: 2026-05-23
- Context: 用户明确要求本任务启动轻量 SDD 模式，并指定遵循主线交付判定协议与 GPT-5.5 主线代码实施手册
- Instructions:
  - 处理 `base-duplicate` 双向 link CI 稳定性任务时，先维护 `.monkeycode/specs/base-duplicate-bidirectional-link-ci-stability/requirements.md`、`design.md`、`tasklist.md`
  - 执行过程必须引用 `.monkeycode/docs/mainline-delivery-gate-protocol.md` 和 `.monkeycode/docs/gpt55-mainline-coding-playbook.md`
  - 状态判定使用主线验收卡、证据等级、失败链路四问、最小补丁规则、证明句和 Gap List
  - 局部绿灯只作为 L2 证据，只有主线 focused e2e 与相关 CI workflow 通过且 Gap List 清零后才能进入可交付状态

[Grid runtime 预览验收依赖本地 monitor 页面与聚焦测试集]
- Date: 2026-05-22
- Context: Agent 在执行 Grid 运行时真实浏览器收口与 SDK 测试类型清理时发现
- Category: 测试方法
- Instructions:
  - Grid runtime 的真实浏览器验收基线使用 `apps/nextjs-app/src/pages/_monitor/preview/grid-runtime.tsx` 作为监控页，并通过 `data-testid` 暴露交互、滚动、bounds 和可视区域信号
  - 该验收路径使用本地 Next dev 服务端口 `3100`，目标浏览器用例为 `apps/nextjs-app/e2e/pages/grid/grid-runtime.spec.ts`
  - SDK Grid 相关收口后，优先回归 `InteractionLayer.spec.tsx`、`Grid.spec.tsx`、`interaction-layer-helpers.spec.ts`、`renderers/layout-renderer/*` 和 `utils/region.spec.ts`

[继续执行指令视为进入更高一级全局回归收口]
- Date: 2026-05-22
- Context: 用户再次要求继续执行剩余的所有任务，直到彻底、精准、高效、准确地完成为止，中间不必停留
- Instructions:
  - 当局部主线修复已经闭环后，继续执行指令默认进入更高一级的全局回归、类型检查、lint 和相关测试收口
  - 仅在完成更高一级验证或发现真实阻塞后，才结束当前轮任务

[Grid 运行时收口任务默认连续推进直到真实闭环]
- Date: 2026-05-22
- Context: 用户要求继续执行剩余的所有任务，直到彻底、精准、高效、准确地完成为止，中间不必停留
- Instructions:
  - 对当前 Grid 运行时收口任务沿既定主线持续推进，不把中间进度同步当作暂停点
  - 优先完成剩余结构收口、自动验证和行为证据整理，直到达到真实完成判定边界
  - 仅在真实冲突、硬阻塞或关键输入缺失时暂停询问

[本轮国际化任务先做判断分析再实施]
- Date: 2026-05-21
- Context: 用户要求先扫描本地仓库并完成判断分析，暂不落代码执行
- Instructions:
  - 处理本轮前端中文国际化补全任务时，先输出范围判断、现状分析、风险和实施顺序
  - 在用户确认进入实施前，保持只读分析，不进行代码修改

[复杂任务交付判定机制必须强约束主线目标真实行为验收口径]
- Date: 2026-05-21
- Context: 用户要求在全局性、一致性、稳定性、可维护性四个约束条件下继续执行所有剩余修复任务，直到全部彻底精准高效准确完成，并强调不能出现主线漂移、骨架冒充完成、验证只停留在工程门禁
- Instructions:
  - 复杂任务推进时，必须持续对齐主线目标、真实行为和验收口径，避免把代码出现、页面可开或 typecheck 通过当成完成信号
  - 对未完成任务的判定必须使用强约束交付标准，持续识别并修复主线漂移、骨架式完成和仅靠工程门禁的弱验收
  - 每个剩余修复项都必须同时满足全局链路闭环、一致契约闭环、稳定行为闭环和后续维护可复用性，才能标记完成

[复杂任务完成判定必须同时满足全局性一致性稳定性可维护性]
- Date: 2026-05-21
- Context: 用户要求从全局性、一致性、稳定性、可维护性四个约束条件继续执行所有剩余修复任务，并强调不能出现主线漂移、骨架冒充完成、只用工程门禁代替交付验收
- Instructions:
  - 复杂任务的完成判定必须同时检查全局链路收口、一致契约、稳定行为和后续维护成本
  - 主线修复需优先选择可复用、可验证、边界清晰的行为切片，避免继续堆积超大函数或超大组件
  - 每个剩余任务都要补足真实行为验证，工程门禁只作为辅助证据
  - 交付结果需保持实现简洁、职责清晰、后续同类问题可沿相同模式继续收敛

[前端中文国际化交付以全局复扫和真实页面验收闭环判定]
- Date: 2026-05-21
- Context: 用户要求继续执行 `/workspace/I18N_ZH_EXECUTION_PLAN.md`，并强调必须在全局性、一致性、稳定性、可维护性四个约束下完成，不允许主线漂移、骨架冒充完成、只停留在工程门禁
- Instructions:
  - 前端中文国际化任务必须严格按 `/workspace/I18N_ZH_EXECUTION_PLAN.md` 的阶段边界推进：先资源层补齐，再源码层收口，最后做全局验收
  - 完成判定必须同时具备全仓英文硬编码复扫结果、缺失翻译键复扫结果、关键页面真实可见文案验收结果和必要的工程验证结果
  - 对协议字段值、代码注释、开发日志和测试 mock 保持边界清晰，只处理真实用户可见展示文案
  - 每一轮局部收口后都要回到全局术语、一致翻译和可维护 key 归档上复核，避免局部最优导致全局漂移

[I18N_ZH_EXECUTION_PLAN 作为后续中文文案的根级执行基线]
- Date: 2026-05-21
- Context: 用户明确希望将 `/workspace/I18N_ZH_EXECUTION_PLAN.md` 作为后续新增功能与扩展的根级约束文件
- Instructions:
  - 后续新增功能、扩展功能和新增文案默认沿用 `/workspace/I18N_ZH_EXECUTION_PLAN.md` 的规则产出中文文案
  - 处理前端相关代码时，先按该文件的资源层补齐、源码层收口、全局验收三阶段推进
  - 当新文案属于现有 namespace 范围时，优先复用既有规则与术语表，不重新定义一套新的翻译流程

[复杂任务剩余修复需一次性连续收口到真实验收]
- Date: 2026-05-21
- Context: 用户要求在全局性、一致性、稳定性、可维护性四个约束下继续执行所有未完成修复任务，直到全部彻底精准高效准确完成
- Instructions:
  - 剩余修复任务需要沿主线目标连续推进到真实行为验收完成，不以代码出现、页面可开或 typecheck 通过作为单独完成信号
  - 对重复控制流、跨模块契约和潜在一致性风险，优先做统一收口，再补行为验证与证据整理
  - 交付判定必须同时具备代码证据、行为证据、验证证据和后续维护上的可复用模式

[复杂任务交付必须以主线行为和验收闭环判定]
- Date: 2026-05-20
- Context: 用户要求继续执行剩余所有修复任务，并明确禁止主线漂移、骨架冒充完成、只用工程门禁代替交付验收
- Instructions:
  - 复杂修复任务必须围绕主线目标推进，避免只完成局部代码形态而偏离真实交付目标
  - 不将“代码已出现”“页面能打开”“typecheck 通过”单独视为完成，必须同时确认真实行为与验收口径闭环
  - 对骨架接线、占位透传、局部可运行状态保持未完成判断，直到行为级结果与验收证据成立
  - 每个主线修复项都要同时产出代码证据、行为证据、验证证据，再标记完成

[继续执行指令默认直接推进剩余阻塞直至闭环]
- Date: 2026-05-20
- Context: 用户要求继续执行剩余所有任务直到彻底精准高效准确地全部完成，中间不必停留
- Instructions:
  - 收到继续执行指令后，直接推进当前主阻塞与后续闭环步骤
  - 中途仅在真实冲突、硬阻塞或关键输入缺失时暂停

[复杂任务按行为切片与验收证据推进]
- Date: 2026-05-20
- Context: 用户要求按“防止主线漂移、骨架冒充完成、验证只停留在工程门禁”的方法继续落地具体有效精准方案
- Instructions:
  - 复杂任务先按行为级子项拆解，再进入实现，避免按文件骨架或目录结构判定完成
  - 每个子项必须同时具备代码证据、验证证据和行为结论，才能标记完成
  - 骨架类接线改动默认只视为 wired，直到行为闭环和验收闭环成立
  - 自动验证与手工验证分开记录，最终完成判定以规格原句对应的行为结果为准

[复杂任务必须采用规格驱动交付判定以防主线漂移和AI幻觉]
- Date: 2026-05-21
- Context: 用户要求综合分析如何防止主线漂移、AI 幻觉、骨架冒充完成和只停留在工程门禁的弱交付
- Instructions:
  - 复杂任务从下一轮开始先按规格拆成行为级子项，再进入实现和汇报
  - 每个行为级子项都要分别记录代码证据和验证证据，避免用结构描述替代行为结论
  - 骨架类改动统一标记为 wired，只有行为结果成立后才能升级为 completed
  - 自动验证和手工验证分开记录，最终完成判定必须直接对照规格原句给出
  - 交付机制优先防止主线漂移、AI 幻觉和弱验收，重点识别行为空洞而非表面代码空洞

[复杂任务先写可执行实施文档并在落代码前等待确认]
- Date: 2026-05-21
- Context: 用户要求在落代码前，先把更详细的工程可执行细节整理为 .md 文件，便于高效准确实施，并在真正改代码前先提示等待确认
- Instructions:
  - 对复杂实施任务，优先先产出更详细的工程可执行 .md 文档，再进入代码修改
  - 文档内容应覆盖实施步骤、文件级改动顺序、验证方式、暂停检查点和完成判定
  - 在任何实际代码修改前，先单独提示当前将开始落代码，并等待用户确认
  - 未获得确认前，保持只读分析和文档整理，不自作主张直接改代码

[复杂任务实施必须严格遵守四项硬约束并写入仓库根目录]
- Date: 2026-05-22
- Context: 用户确认开始落代码，并要求所有执行严格遵守全局性、一致性、稳定性、可维护性四个约束条件，同时写入仓库根目录
- Instructions:
  - 所有复杂任务实施必须同时满足全局性、一致性、稳定性、可维护性四项硬约束
  - 在实施轮次中将该约束写入仓库根目录的文档文件，作为执行基线
  - 代码实施保持高效准确，只覆盖当前确认的行为子项，不向无关范围扩散

[当前轮次需持续执行剩余 P0 任务直至全部完成]
- Date: 2026-05-18
- Context: 用户再次要求继续执行当前所有剩下未完成的任务，直到全部正确完成为止，中间不必停留
- Instructions:
  - 当前轮次围绕剩余 P0 任务持续推进实现、验证和文档回写，直到该批任务全部完成
  - 执行过程中优先直接落代码和验证，只有在真实冲突、阻塞或信息缺失时停下

[v2 contract-http 直接依赖 core]
- Date: 2026-05-22
- Context: Agent 在修复 `@teable/v2-contract-http` 的 CI 模块解析失败时发现
- Category: 依赖关系
- Instructions:
  - `packages/v2/contract-http/src/share/formSubmitShareView.ts` 直接导入 `@teable/core`
  - `packages/v2/contract-http/package.json` 需要显式声明 `@teable/core` 的 workspace 依赖，才能保证 CI 和本地解析一致

[published-app 预览与 shell 收口优先保证发布拦截和离线体验]
- Date: 2026-05-20
- Context: 用户要求继续执行 published-app 剩余任务并推进 PR7/PR8/PR9 收口
- Instructions:
  - 处理 published-app 预览与 shell 收口时，优先保证 fatal 校验能阻断发布、越界访问有明确拒绝态、PWA standalone 有安全区和离线提示
  - 同一轮任务优先把 preview、runtime、shell、dialog 的联动链路一起收口，再做 typecheck 验证

[剩余任务默认一次性连续执行到完成]
- Date: 2026-05-19
- Context: 用户要求把剩下的任务一次性全部执行完成，中间不必停留
- Instructions:
  - 对当前已识别的剩余任务按完整链路连续执行到完成，覆盖实现、验证和文档回写
  - 中间进度更新只用于同步事实，不作为暂停点

[收到继续执行指令后持续推进直至任务完成]
- Date: 2026-05-17
- Context: 用户多次要求继续执行并直至剩余任务全部正确完成，中间不必停留
- Instructions:
  - 收到继续执行指令后，持续推进后续修复、验证和收口，直到当前任务完整完成
  - 中途仅在真实阻塞、冲突或信息不足时停下询问
  - 对之前未完成的任务继续执行，直到全部正确完成为止

[继续执行时优先推进，遇到真实不确定再提问]
- Date: 2026-05-20
- Context: 用户再次要求继续执行当前任务，并说明有下一步就继续，不确定时再询问
- Instructions:
  - 当仍有明确下一步时，直接继续推进任务
  - 仅在真实不确定或需要澄清关键决策时再停下询问

[修复与提交前必须先满足全局性一致性稳定性]
- Date: 2026-05-17
- Context: 用户要求在本地仓库全部重新检测后，只有在全面修复且完全准确的前提下才进入提交，并同意持续执行全部任务直至全部精准高效完成
- Instructions:
  - 对准备提交的改动先做全局性检查，确认上下游链路和相邻模块一起收口
  - 对准备提交的改动先做一致性检查，确认命名、契约、实现边界和导出面统一
  - 对准备提交的改动先做稳定性检查，确认关键 typecheck、测试和运行门禁已经验证通过
  - 在上述三项约束满足前，不进入提交阶段
  - 对已确认的后续任务持续执行直至全部精准高效完成，中途不重复询问是否继续

[V2 路由收口优先抽统一执行辅助]
- Date: 2026-05-19
- Context: Agent 在收敛 `packages/v2/contract-http-implementation/src/router.ts` 时发现
- Category: 代码模式
- Instructions:
  - 面对大量重复的 V2 handler 适配逻辑时，优先抽出统一执行辅助层，统一容器解析、执行上下文创建和错误映射
  - 保持各 endpoint 的输入输出和状态码语义不变，只收口重复控制流
  - 抽象后立即运行对应包的 typecheck，确认 helper 的泛型边界与既有端点兼容

[先做方案不落代码]
- Date: 2026-05-19
- Context: 用户要求基于全局性、一致性、稳定性先产出工程化拆解实施方案，确认后再进入代码实现
- Instructions:
  - 接到此类任务时，先输出方案拆解、依赖关系、实施顺序和验收门禁，不直接改代码
  - 方案确认后再进入实现阶段，按模块逐步落地

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

[多模型 review 按串行顺序执行并在切换前提示]
- Date: 2026-05-21
- Context: 用户确定本次 review 采用 `GPT-CODEX5.3 + GPT-5.5` 组合，并要求因手动切换模型而按先后顺序执行
- Instructions:
  - 多模型 review 采用串行执行，先完成第一模型阶段，再进入第二模型阶段
  - 当需要用户手动切换模型时，先明确提示切换，再继续后续 review 流程

[Teable 仓库开发与校验约定]
- Date: 2026-05-06
- Context: Agent 在执行 AGENTS.md 维护任务时发现
- Category: 构建方法
- Instructions:
  - 根仓库只使用 `pnpm`，`packageManager` 固定为 `pnpm@9.13.0`，`npm` 被 engines 明确禁止
  - 本地开发按 `pnpm install` -> `make switch-db-mode` -> `cd apps/nestjs-backend && pnpm dev` 走，前端由 backend dev 流程自动拉起
  - CI 的 lint/type 顺序是 Prisma generate -> `pnpm -F "./packages/**" run build` -> `pnpm g:typecheck` -> `pnpm g:lint` -> `pnpm g:lint-styles`
  - backend e2e 依赖 `pre-test-e2e` 先执行 Prisma seed，重型集成链路走 `make postgres.integration.test`
  - `packages/v2` 入口导出面收敛后，可用 `pnpm -r --filter "./packages/v2/**" typecheck` 做一次性全量验证，适合在大批量导出重构后确认跨包类型链路是否稳定

[后端开发服务需在子目录启动]
- Date: 2026-05-20
- Context: Agent 在本地预览启动过程中发现
- Category: 构建方法
- Instructions:
  - 启动后端开发服务时使用 `pnpm -C apps/nestjs-backend dev`
  - 在仓库根目录直接执行 `pnpm dev` 会找不到对应脚本

[后端启动循环需按模块图逐层拆解]
- Date: 2026-05-20
- Context: Agent 在排查 `pnpm -C apps/nestjs-backend start` 启动失败时发现
- Category: 依赖关系
- Instructions:
  - 后端启动时如果出现 `Cannot access ... before initialization`，优先按 Nest 模块图逐层拆解循环引用
  - 入口模块之间的 `imports` 可优先改成 `forwardRef(() => XxxModule)`，再复测启动
  - 需要持续跑 `pnpm --filter @teable/backend typecheck` 和 `pnpm -C apps/nestjs-backend start`，直到启动链稳定

[v2Contract 大对象导出需保留精确路由形状]
- Date: 2026-05-20
- Context: Agent 在收敛 `packages/v2/contract-http/src/contract.ts` 时发现
- Category: 构建方法
- Instructions:
  - `v2Contract` 这类大路由对象适合先定义内部 `const`，再导出单独的 `type` 别名和同名值，兼顾 `tsdown` 序列化限制和下游精确类型访问
  - 当对象体积过大触发 `TS7056` 时，优先收紧导出面而不是直接把类型宽化成 `AnyContractRouter`
  - 下游 controller 和 router 依赖精确嵌套路由属性，导出类型需要保留这些属性可见性

[v2 contract-http 当前优先用 JS 构建]
- Date: 2026-05-20
- Context: Agent 在排查 `packages/v2/contract-http` 构建失败时发现
- Category: 构建方法
- Instructions:
  - `packages/v2/contract-http` 当前先关闭 `tsdown` 的 d.ts 生成，优先保证 JS 构建和运行时可用
  - 这个包的类型入口仍由源码 `src/index.ts` 提供，后续再单独收口声明生成

[后端本地启动需要 SECRET_KEY]
- Date: 2026-05-20
- Context: Agent 在重启 `apps/nestjs-backend` 开发服务时发现
- Category: 环境配置
- Instructions:
  - 后端开发启动会读取 `SECRET_KEY`，并将其作为 `BACKEND_JWT_SECRET`、`BACKEND_SESSION_SECRET`、`BACKEND_ACCESS_TOKEN_ENCRYPTION_KEY` 和 `BACKEND_ACCESS_TOKEN_ENCRYPTION_IV` 的默认回退值
  - 本地调试时只要注入一个稳定的开发密钥即可通过 auth 配置校验

[ShareAuthModule 需要显式引入 PermissionModule]
- Date: 2026-05-20
- Context: Agent 在修复 `V2Module` 对 `ShareAuthService` 的 Nest DI 链路时发现
- Category: 依赖关系
- Instructions:
  - `ShareAuthService` 直接依赖 `PermissionService`，`ShareAuthModule` 需要显式引入 `PermissionModule`
  - 即使 `AuthModule` 也导入了 `PermissionModule`，当前模块自己的 provider 依赖仍应在本模块 imports 中声明，避免 `V2Module` 这类直接消费 `ShareAuthService` 的场景出现依赖解析缺口

[当前后端启动门槛已从模块图切换到本地数据库]
- Date: 2026-05-20
- Context: Agent 在修复 `ShareAuthService` 依赖链后复跑 `pnpm -C apps/nestjs-backend dev` 时发现
- Category: 环境配置
- Instructions:
  - 当 Nest 已完成路由映射且启动最终失败在 `PrismaClientInitializationError: Can't reach database server at 127.0.0.1:5432`，说明当前代码侧模块图阻塞已清空
  - 这一步之后的本地启动前置条件是确保 PostgreSQL 已运行并可从 `127.0.0.1:5432` 访问

[本地数据库可直接用系统 PostgreSQL 15 集群]
- Date: 2026-05-20
- Context: Agent 在处理本地后端启动环境时发现
- Category: 环境配置
- Instructions:
  - 当前环境可直接使用系统安装的 PostgreSQL 15 集群，路径为 `/var/lib/postgresql/15/main`
  - `service postgresql start` 或 `pg_ctlcluster 15 main start` 可把集群拉起到 `127.0.0.1:5432`
  - 当服务状态显示 `15/main (port 5432): online` 后，后端 `pnpm dev` 能继续完成初始化并进入 `Ready on http://localhost:3000`

[本地后端启动验证命令与成功判据已确认]
- Date: 2026-05-20
- Context: Agent 在完成 Nest 模块图修复和数据库拉起后验证启动结果时发现
- Category: 构建方法
- Instructions:
  - 后端本地验证命令使用 `SECRET_KEY=defaultSecretKey BACKEND_JWT_SECRET=defaultSecretKey BACKEND_SESSION_SECRET=defaultSecretKey BACKEND_ACCESS_TOKEN_ENCRYPTION_KEY=defaultSecretKey BACKEND_ACCESS_TOKEN_ENCRYPTION_IV=defaultSecretKey pnpm -C apps/nestjs-backend dev`
  - 成功判据是日志出现 `Nest application successfully started` 和 `Ready on http://localhost:3000`
  - 当前环境里的 `ELIFECYCLE` 出现在工具超时发送 `SIGTERM` 之后，不代表启动失败

[本地联调可直接复用后台后端与预览地址]
- Date: 2026-05-20
- Context: Agent 在完成后端类型检查并以后台方式常驻启动服务时发现
- Category: 构建方法
- Instructions:
  - 后端可通过后台命令常驻运行：`SECRET_KEY=defaultSecretKey BACKEND_JWT_SECRET=defaultSecretKey BACKEND_SESSION_SECRET=defaultSecretKey BACKEND_ACCESS_TOKEN_ENCRYPTION_KEY=defaultSecretKey BACKEND_ACCESS_TOKEN_ENCRYPTION_IV=defaultSecretKey pnpm -C /workspace/apps/nestjs-backend dev`
  - 本次后台终端日志确认服务稳定进入 `Ready on http://localhost:3000`
  - 当前平台可为 `3000` 端口申请在线预览地址用于联调验证

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

[publishedApps 公开入口只保留精确路由]
- Date: 2026-05-20
- Context: Agent 在收敛 `auth.guard.ts` 与 `permission.guard.ts` 的公开访问策略时发现
- Category: 依赖关系
- Instructions:
  - `publishedApps` 公开访问只保留 `getNavigationModel`、`getNodeRuntime`、`getRuntimeManifest` 三条精确路由
  - 守卫侧优先依赖 `@Public()` 和精确路径列表，不使用宽泛的路径前缀放行
  - 当 publishedApps 新增公开接口时，先补精确路由白名单，再补回归测试

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

[published-app shell 具有显式回滚开关]
- Date: 2026-05-20
- Context: Agent 在收口 published-app runtime 与 PWA shell 时发现
- Category: 代码模式
- Instructions:
  - `NEXT_PUBLIC_PUBLISHED_APP_SHELL_DISABLED` 用作 published app shell 的显式回滚开关
  - 开关关闭时使用 published app shell，开关打开时回退到原有 share/base 布局
  - 新增 published app runtime 行为时应保留该回滚路径，方便快速止血

[published-app runtime 的验收验证优先用分层 typecheck + 定点 vitest]
- Date: 2026-05-20
- Context: Agent 在收口 published-app runtime PR1-PR9 并确认验收状态时发现
- Category: 测试方法
- Instructions:
  - published-app runtime 的收口验证优先跑 `pnpm --filter @teable/app typecheck`、`pnpm --filter @teable/openapi typecheck`、`pnpm --filter @teable/sdk typecheck` 和 `NODE_OPTIONS=--max-old-space-size=6144 pnpm --filter @teable/backend typecheck`
  - 前端回归优先用定点 vitest 覆盖 published app 相关 spec，再补 backend 守卫 spec
  - 当这组验证全部通过时，可将 published-app runtime 视为进入可验收状态

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
- Context: 用户要求继续执行全部任务直到完成所有任务为止，中间不必询问不必停留，并强调必须高度正确；随后进一步要求把主线功能中的真实语义改动继续压成最小提交候选，并把规则化收尾单独归组
- Instructions:
  - 对本轮剩余收口任务直接执行到远端分支与 PR 状态完整闭环
  - 优先保证全局性、一致性、稳定性，必要时先补全校验再执行分支拆分、推送和建 PR
  - 中间不必停留询问，除非出现真实冲突、权限问题或外部平台阻塞
  - 对主线功能批次继续拆分，优先抽出真实语义改动形成最小提交候选
  - 将命名、导入顺序、lint 规约、测试夹具整理等规则化收尾改动单独归组，避免混入功能提交
  - 在每轮分组后保持 typecheck 与聚焦测试结果稳定，直到剩余改动全部具备清晰提交边界

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

[未进 PR 的内容需按全局性一致性稳定性重检后再决定是否提交]
- Date: 2026-05-18
- Context: 用户要求对所有尚未提交到远端 PR 的内容重新检测、准确修复，并以全局性、一致性、稳定性为前提判断是否达到提交 PR 标准
- Instructions:
  - 先识别哪些内容尚未进入远端 PR，再逐项判断是否属于业务改动、记忆文件或调试产物
  - 对未进 PR 的业务改动，按全局性、一致性、稳定性重新检测并修复，直到达到提交 PR 标准
  - 对记忆文件和调试产物，先确认其角色与必要性，再决定是否保留在提交之外

[能力盘点改为三模型串行：主稿、边界复核、工程拆解]
- Date: 2026-05-18
- Context: 用户明确指定后续全盘重新分析评估采用 `GPT-5.5 -> DeepSeek V4pro -> GPT-codex5.3` 的串行分工，并要求继续按该方案拆解实施
- Instructions:
  - `GPT-5.5` 负责主稿，统一全局口径、成熟度判断和缺口结论
  - `DeepSeek V4pro` 只复核边界项和高不确定域，不生成第二套全量主稿
  - `GPT-codex5.3` 只负责把仍成立的缺口拆成工程任务、最小切口、验证命令和提交边界
  - 最终正式输出仍由主模型统一收口，避免多套正式口径并存

[需要手动切换模型时必须提前明确告知用户]
- Date: 2026-05-19
- Context: 用户要求在任何需要切换 `GPT-5.5` 和 `GPT-codex5.3` 的时点先提前提示，等待其手动切换完成后，再通知进入下一步
- Instructions:
  - 任何需要切换到其他模型执行下一阶段任务时，必须先明确告诉用户当前应切换到哪个模型
  - 在用户完成手动切换前，不假设模型已经切换成功
  - 对模型切换提示使用直接、清楚、面向新手的表述
  - 用户确认已完成手动切换后，再发送下一步执行通知并继续实施

[串行多模型执行前先给出完整阶段与切换提示]
- Date: 2026-05-18
- Context: 用户要求把每一阶段需要使用什么模型都先提前告知，等用户手动切换模型后再继续实施
- Instructions:
  - 在开始串行多模型任务前，先列出完整阶段顺序、每阶段对应模型和该阶段目标

[billing/usage 当前是外围边界项]
- Date: 2026-05-19
- Context: 在继续推进 P0 收口时发现
- Category: 依赖关系
- Instructions:
  - `billing/subscription` 和 `usage` 在主仓只存在 OpenAPI 契约，当前没有稳定后端事实源
  - 这两类能力应先作为外围域边界项处理，除非补到真实 backend controller/service 位置，否则不做猜测式接线
  - 每进入下一阶段前，先单独提醒用户切换到指定模型
  - 用户未确认切换完成前，不进入下一阶段实施

[继续执行时以全局性一致性稳定性为硬约束并优先主线闭环]
- Date: 2026-05-20
- Context: 用户要求从全局性、一致性、稳定性为约束条件下继续执行，并强调必须精准高效准确
- Instructions:
  - 后续继续执行时，优先按主线任务闭环推进，不跨 PR 跳转到外围收口项
  - 每个任务项都需要同时具备代码证据和验证证据，才能判定为完成
  - 对骨架文件、透传包装和空实现保持未完成判断，直到行为级逻辑真正落地
  - 修改时先检查上下游链路和相邻模块的一致性，再做最小正确改动
  - 完成每一段主线后立即做针对性验证，再进入下一段

[继续执行剩余任务时持续推进直到全部完成]
- Date: 2026-05-20
- Context: 用户要求继续执行剩余所有任务，直到全部完成为止
- Instructions:
  - 对当前主线剩余任务持续推进实现、验证、文档回写和最终验收，直到全部完成
  - 中途仅在真实冲突、外部阻塞或关键信息缺失时停下
  - 在完成正式验收矩阵前，不以阶段性可运行状态替代“全部完成”结论

[全仓能力分析需按四项硬约束并扩展真实能力边界]
- Date: 2026-05-21
- Context: 用户要求基于全局性、一致性、稳定性、可维护性四个约束，对本地仓库所有文件代码结构做已实现功能和能力分析，并规避最小能力实现、最小改动、最小修复带来的危害
- Instructions:
  - 进行全仓能力分析时，先从目录结构、分层职责、上下游链路和运行时边界建立全局视图，再判断能力成熟度
  - 对每项已实现能力同时评估全局闭环、一致契约、稳定行为和后续维护成本，避免把骨架、兼容层、wrapper 或 partial 接线视为完整能力
  - 输出结论时，需要明确哪些能力已经形成真实主链，哪些仍停留在兼容过渡层、局部实现或待收口状态
  - 后续扩展能力边界时，优先选择统一模型、统一契约、统一执行入口和统一验证矩阵，避免继续放大最小实现残留风险

[继续下一步计划时先出实施方案等待确认后再落代码]
- Date: 2026-05-21
- Context: 用户要求继续执行下一步计划，但当前轮先不要落代码，待用户确认后再进入代码实施
- Instructions:
  - 当任务进入重构、收口、治理或结构优化阶段时，先输出实施顺序、拆分边界、风险和验收门禁，不直接修改代码
  - 在用户明确确认进入实施前，保持只读分析和方案输出
  - 方案需要细化到目录落点、文件切分方式、验证顺序和暂停检查点，便于用户确认后直接执行
