# DESIGN.md 落地实施指南（2026-05-06）

## 目标

在当前仓库中引入一套可被 AI 直接消费的 `DESIGN.md` 机制，用于稳定生成和迭代前端页面，同时避免把视觉参考误用为脱离产品约束的“静态仿站提示词”。

## 结论摘要

- `awesome-design-md` 的核心价值是把设计语言沉淀成 AI 可读的 Markdown 规范，而不是提供像素级复刻能力。
- 对当前仓库，最成熟的做法不是直接照搬第三方 `DESIGN.md`，而是维护一份项目自有的、面向产品 UI 的 `DESIGN.md`。
- 这份规范应与 `AGENTS.md`、现有组件约束、页面信息架构和验证清单一起使用，形成“设计规范 + 实现约束 + 验证门禁”闭环。

## awesome-design-md 的可借鉴点

### 使用方式

- 把目标风格的 `DESIGN.md` 放到项目根目录，或把内容作为上下文提供给 AI。
- 用自然语言告诉 AI 基于该规范生成页面或组件。
- AI 从 Markdown 中读取色彩、排版、间距、语气、布局、交互倾向等设计信号，再产出代码。

### 优点

- 比单张截图更结构化，可复用性更高。
- 比“请做得像某品牌”这类模糊提示更稳定。
- 更适合在多轮协作中复用，尤其适合复杂页面的一致性控制。

### 局限

- 它本质上是“风格和规则输入”，不是完整设计系统运行时。
- 若缺少产品约束，AI 仍可能生成好看但不符合业务结构的页面。
- 若内容没有版本、适用范围和验证标准，后续会出现“看起来像，但不能持续维护”的问题。

## 从 issues 看到的真实风险

### 1. 供给压力会快速上升

- 大量 issue 都是 `DESIGN.md request`。
- 这说明一旦机制有效，团队很快就会希望覆盖更多品牌、更多页面类型、更多语义场景。

对当前仓库的启发：

- 不要一开始就追求覆盖所有页面。
- 先限定试点范围，例如只覆盖首页、dashboard、record detail、form 页面。

### 2. 链接和分发稳定性很重要

- issue `#377` 直接反馈 README 中的外链失效。
- 这类问题会让规范存在但不可用。

对当前仓库的启发：

- 不要依赖外部站点托管核心设计规范。
- 设计规范应直接放在仓库内，并通过稳定相对路径引用。

### 3. 浏览状态和索引体验会影响使用率

- issue `#384` 说明分类筛选未进入 URL，导致返回和分享体验差。

对当前仓库的启发：

- 如果后续你们把 `DESIGN.md` 扩展成内部文档集合，需要有稳定目录、明确分类和可共享入口。
- 至少要保证文档路径固定，且不同页面类型能快速定位到对应规范。

### 4. 团队会要求可信度信号

- issue `#396` 关注的是“这些 design.md 是否经过校验/可信”。

对当前仓库的启发：

- 规范文件必须带上版本、适用范围、最后更新时间、示例页面和验收标准。
- 否则 AI 和人都会把它当成“灵感参考”，而不是可执行规范。

## 面向当前仓库的成熟实施方案

## 方案目标

让 AI 在生成或修改 Teable 前端页面时，能够同时遵守：

- 产品信息架构
- 现有组件和技术边界
- 页面视觉语言
- 响应式和可访问性要求

## 推荐文件布局

推荐先从仓库文档目录开始，不要直接扔到根目录：

- `.monkeycode/docs/design-system/DESIGN.md`
- `.monkeycode/docs/design-system/README.md`
- `.monkeycode/docs/design-system/page-recipes/dashboard.md`
- `.monkeycode/docs/design-system/page-recipes/record-detail.md`
- `.monkeycode/docs/design-system/page-recipes/form.md`

推荐原因：

- 当前仓库已经把项目级补充文档放在 `.monkeycode/docs/`。
- 可以先把 `DESIGN.md` 作为内部协作资产沉淀，稳定后再考虑提升到仓库根目录。
- 避免和用户实际业务文件、源码入口、开源仓库根目录说明混在一起。

## 与 AGENTS.md 的配合方式

`AGENTS.md` 负责“如何做”，`DESIGN.md` 负责“做成什么样”。

建议分工：

- `AGENTS.md`
  - 约束技术实现路径
  - 指明不可绕过的组件入口
  - 指明验证命令和测试方式
- `DESIGN.md`
  - 约束视觉语言和交互风格
  - 约束布局节奏、密度、层级、语气
  - 给出页面类型级别的风格规则

实际调用方式建议写成：

1. 先读取 `AGENTS.md`
2. 再读取 `.monkeycode/docs/design-system/DESIGN.md`
3. 若目标是具体页面且对应 `page-recipes/*.md` 已存在，再读取该文件
4. 最后再开始改代码

## DESIGN.md 推荐结构

下面这份结构最适合当前仓库，而不是完全照搬品牌展示型模板。

### 1. Scope

- 适用产品范围：Teable Web App
- 适用代码范围：`apps/nextjs-app`
- 当前覆盖页面：dashboard、record detail、form、table-adjacent panels
- 非适用范围：官网营销页、独立活动页、品牌宣传页

### 2. Product Principles

- 优先信息清晰，而不是视觉装饰
- 优先高密度可操作界面，而不是大面积留白展示
- 优先降低认知跳转，而不是引入新奇布局
- 优先内联编辑与渐进披露，而不是多层弹窗流

### 3. Visual Language

- 色彩角色：surface、border、text、muted、accent、danger、success
- 层级策略：页面背景、卡片背景、浮层背景的区别
- 圆角和阴影策略：何处允许强调，何处保持克制
- 字体层级：页面标题、区块标题、字段标签、正文、辅助文本
- 间距节奏：列表、表单、卡片、侧栏使用的 spacing scale

### 4. Interaction Rules

- 表格周边 UI 应避免抢占主数据区视觉焦点
- 表单错误应靠近字段显示，不依赖全局 toast 兜底
- 危险操作要有明确二次确认和后果提示
- 加载态优先 skeleton 或局部 pending，不要频繁整页闪烁

### 5. Responsive Rules

- 桌面端优先保证信息密度
- 窄屏下优先纵向重排，不要简单缩放桌面布局
- 关键操作在移动端仍需可直达

### 6. Accessibility Rules

- 文本与背景需要满足最小对比度要求
- 键盘可达路径不可被自定义容器打断
- 状态变化不能只靠颜色表达

### 7. Page Recipes

对每种高频页面类型，补一段面向 AI 的具体规则：

- Dashboard
  - 图表只是辅助，不应压过筛选、数据解释和后续动作
  - 统计卡优先短标题、核心数字、次级变化说明
- Record Detail
  - 首屏优先展示身份字段、状态字段、关键动作
  - 长字段分组展示，避免无限向下平铺
- Form
  - 必填、错误、帮助信息要同层出现
  - 提交流程要明确成功、失败和离开保护

### 8. Implementation Constraints

这一段必须结合当前仓库真实约束：

- 图表只能走 `src/features/app/components/Chart/Chart`
- 不要在业务页面直接 `echarts.init(...)`
- 优先复用现有表单、弹窗、列表和布局组件
- 对已有复杂页面做样式升级时，默认小步迭代，不做全量重写

### 9. Verification Checklist

- 是否符合页面信息层级
- 是否保留现有关键操作路径
- 是否适配桌面和移动端
- 是否复用现有组件约束
- 是否补充对应测试或最小验证步骤

## 推荐试点范围

第一阶段建议只做 3 类页面，不要一次性全仓推广：

1. dashboard 卡片与图表容器
2. record detail / drawer / side panel
3. form 页面与配置面板

原因：

- 这三类页面既高频，又足够体现 Teable 的产品特征。
- 能直接验证 `DESIGN.md` 是否真的提升 AI 输出稳定性。
- 能避开表格主网格这种实现复杂、约束极强的高风险区域。

## 实施步骤

### 第一步：先写项目自有 DESIGN.md

- 不要先复制第三方品牌模板。
- 先根据当前产品真实页面抽取规则。

### 第二步：补 page recipe

- 针对 `dashboard`、`record detail`、`form` 各补一份页面级 recipe。
- recipe 比总规范更接近 AI 真正执行时需要的上下文。

### 第三步：在 AGENTS.md 中增加引用约定

建议新增一条简短规则：

- 当任务涉及 `apps/nextjs-app` 的页面视觉、布局或交互改造时，先读取 `.monkeycode/docs/design-system/DESIGN.md` 和对应 page recipe，再开始实现。

### 第四步：用真实任务试跑

建议用以下类型任务验证：

- “把某个配置面板做得更清晰，但不改变现有功能”
- “把 dashboard 卡片层级和密度做得更统一”
- “优化 record detail 的移动端阅读体验”

### 第五步：补回归门禁

- 在相关 PR 描述中要求说明是否遵循 `DESIGN.md`
- 对关键页面补最小截图、测试或验收说明

## 明确不建议的做法

- 不要把外部品牌 `DESIGN.md` 直接当成产品 UI 规范。
- 不要让 AI 只看 `DESIGN.md`，不看 `AGENTS.md` 和现有代码。
- 不要一开始就试图覆盖表格主编辑区全部交互。
- 不要把 `DESIGN.md` 写成纯视觉形容词堆砌，例如“高级、现代、优雅”。
- 不要没有版本号、适用范围和验证清单。

## 最小落地模板

如果后续要真正创建文件，建议先从这个最小模板开始：

```md
# DESIGN.md

## Scope
- Product: Teable Web App
- Codebase: apps/nextjs-app
- Coverage: dashboard, record detail, form, side panels

## Product Principles
- Prioritize information clarity over decoration.
- Prioritize dense but readable workflows.
- Preserve existing task flows unless the task explicitly changes them.

## Visual Language
- Use restrained surfaces and clear borders.
- Keep hierarchy visible through spacing and typography before adding color.
- Use accent colors to guide action, not to decorate every block.

## Interaction Rules
- Keep key actions close to the data they act on.
- Show field-level validation near the source of the error.
- Prefer partial loading states over full-page blocking spinners.

## Implementation Constraints
- Use existing app components before introducing new primitives.
- Route all chart rendering through src/features/app/components/Chart/Chart.
- Avoid broad rewrites when a local layout adjustment is sufficient.

## Verification
- Check desktop and mobile layouts.
- Check visual hierarchy and action discoverability.
- Check that existing workflows still work.
```

## 建议的后续动作

1. 先创建 `.monkeycode/docs/design-system/DESIGN.md` 初稿。
2. 再补 1 到 2 个 page recipe，而不是一次写完整套规范。
3. 然后挑一个真实页面做小范围试点改造，验证 AI 输出稳定性。

## 当前判断

如果目标是“让 AI 更稳定地修改 Teable 现有产品页面”，引入 `DESIGN.md` 是值得做的。

但前提是：

- 它必须是项目自有规范
- 必须与 `AGENTS.md` 和现有实现约束联动
- 必须从小范围页面试点开始

否则很容易复现 `awesome-design-md` 已经暴露出的典型问题：可用但不稳定，可参考但不可验证，可展示但难维护。
