# 品牌化提示词包（2026-05-06）

## 说明

本文件提供 6 套可执行的品牌化提示词包，用于在当前仓库中驱动 AI 执行前端页面改造或新页面生成。

其中包括：

- 2 套产品内页面改造 prompt pack
- 4 套专用场景 prompt pack（landing page / login page）

这些提示词包基于以下已确认约束编写：

- 先遵守 `AGENTS.md`
- 先遵守 `.monkeycode/docs/design-system/DESIGN.md`
- 若任务属于 dashboard，则同时遵守 `.monkeycode/docs/design-system/page-recipes/dashboard.md`
- 当前仓库是产品型 Web App，不是营销官网
- 不允许为了风格而破坏现有产品流程、组件边界和验证要求

使用方式：

1. 按目标页面类型选择下面某一套提示词包整体提供给 AI
2. 再补充你的具体任务，例如“改造某个 dashboard 卡片区”
3. 若目标页面不是 dashboard，请把其中的 dashboard 描述替换成对应页面上下文
4. 若目标是 landing page 或 login page，优先使用后半部分的专用场景包

## Prompt Pack 1: VoltAgent 风格

### 适用意图

- 需要更强的 AI-native 质感
- 需要现代、锐利、清晰的产品界面
- 需要明显但克制的技术感和工具感
- 适合 dashboard、配置面板、自动化/工作流相关界面

### 系统提示词

```text
You are editing a real product UI in the Teable monorepo.

Before changing code, read and follow:
1. AGENTS.md
2. .monkeycode/docs/design-system/DESIGN.md
3. .monkeycode/docs/design-system/page-recipes/dashboard.md if the task is dashboard-related

You must preserve product workflows, reuse existing components, and keep all chart rendering routed through src/features/app/components/Chart/Chart.

Do not imitate a marketing website. This is a dense, interactive product surface.
```

### 设计风格提示词

```text
Apply a VoltAgent-inspired product style to this UI.

Visual direction:
- Make the interface feel AI-native, sharp, modern, and tool-oriented.
- Use dark-on-light or neutral surfaces with crisp boundaries and controlled contrast.
- Favor structured cards, clean dividers, compact spacing, and obvious hierarchy.
- Let the page feel fast, focused, and technical rather than warm or decorative.
- Use accent color sparingly for active states, primary actions, and key data emphasis.
- Keep typography compact, clean, and highly scannable.

Interaction direction:
- Prioritize operator efficiency.
- Keep filters, metrics, controls, and explanations close to the data they affect.
- Avoid oversized empty space, oversized headings, or lifestyle-brand visual softness.
- Loading, empty, and error states should feel intentional and product-grade.

Product constraints:
- Preserve existing user flows.
- Reuse existing layout and form primitives before creating new ones.
- Do not introduce decorative chart treatments or overly colorful cards.
- Charts must support decision-making, not dominate the page.
```

### 执行任务提示词

```text
Task:
Refine the target Teable page with a VoltAgent-inspired product aesthetic while keeping the current behavior intact.

Execution requirements:
- Keep the information density high but readable.
- Strengthen hierarchy through spacing, borders, alignment, and typography before using color.
- Make key metrics and actions immediately discoverable.
- Reduce visual noise around charts, filters, and supporting metadata.
- Keep the result suitable for a serious multi-table workflow product.

Verification requirements:
- Check desktop and narrow-screen behavior.
- Check that the changed layout still supports existing workflows.
- Check that chart usage still follows the shared Chart component constraint.
- Summarize what changed in hierarchy, spacing, and action clarity.
```

### 一次性可执行整包

```text
You are editing a real product UI in the Teable monorepo.

Before changing code, read and follow:
1. AGENTS.md
2. .monkeycode/docs/design-system/DESIGN.md
3. .monkeycode/docs/design-system/page-recipes/dashboard.md if the task is dashboard-related

Preserve product workflows, reuse existing components, and keep all chart rendering routed through src/features/app/components/Chart/Chart.

Apply a VoltAgent-inspired product style to the target UI:
- AI-native, sharp, modern, technical, and tool-oriented
- compact typography and strong scanability
- structured cards, crisp borders, clean spacing, and focused hierarchy
- restrained surfaces with selective accent emphasis
- high information density without clutter

Do not turn the page into a marketing site. Do not add decorative noise. Do not rewrite stable flows.

If the page is a dashboard:
- prioritize title, metric, change, filter context, then chart
- keep cards easy to compare side by side
- ensure chart chrome does not dominate the card

Now implement the following task while keeping behavior intact:
[在这里补充具体任务]
```

### 推荐任务示例

```text
Now implement the following task while keeping behavior intact:
Refine the dashboard summary cards and chart containers in apps/nextjs-app so they feel more VoltAgent-inspired: sharper hierarchy, cleaner card structure, tighter filter-to-chart relationship, and better scanability for operators.
```

## Prompt Pack 2: Apple 风格

### 适用意图

- 需要更克制、更平静的高级感
- 需要更强的一致性、留白节奏和内容秩序
- 需要让复杂界面更易读，而不是更炫
- 适合 record detail、form、设置页、面板类页面

### 系统提示词

```text
You are editing a real product UI in the Teable monorepo.

Before changing code, read and follow:
1. AGENTS.md
2. .monkeycode/docs/design-system/DESIGN.md
3. Read a matching page recipe if one exists for the target page type

You must preserve product workflows, reuse existing components, and avoid broad rewrites.

Do not transform the page into a marketing landing page. This is a functional product interface.
```

### 设计风格提示词

```text
Apply an Apple-inspired product style to this UI.

Visual direction:
- Make the interface calm, refined, restrained, and highly legible.
- Use clear structure, soft hierarchy, careful spacing, and minimal visual noise.
- Favor fewer but more deliberate emphasis points.
- Let surfaces feel polished and coherent, not loud.
- Keep typography precise, balanced, and easy to read at a glance.
- Use whitespace as a tool for grouping and comprehension, not as empty decoration.

Interaction direction:
- Make the page feel predictable and effortless.
- Keep actions obvious without shouting.
- Reduce cognitive load in dense areas by improving grouping and rhythm.
- Keep feedback states clean, local, and understandable.

Product constraints:
- Preserve the existing workflow model.
- Reuse current components and product patterns.
- Avoid oversized hero treatments, oversized headlines, or brand-showcase layouts.
- Keep the result practical for daily operational usage.
```

### 执行任务提示词

```text
Task:
Refine the target Teable page with an Apple-inspired product aesthetic while preserving the current behavior.

Execution requirements:
- Improve readability through calmer spacing and clearer grouping.
- Use hierarchy that feels quiet but obvious.
- Make forms, details, and side panels feel more polished and less busy.
- Remove unnecessary visual competition between adjacent sections.
- Keep the final result understated, structured, and product-appropriate.

Verification requirements:
- Check desktop and narrow-screen layouts.
- Check that key actions remain easy to find.
- Check that validation, empty, loading, and feedback states remain local and clear.
- Summarize what changed in readability, grouping, and visual calmness.
```

### 一次性可执行整包

```text
You are editing a real product UI in the Teable monorepo.

Before changing code, read and follow:
1. AGENTS.md
2. .monkeycode/docs/design-system/DESIGN.md
3. Read a matching page recipe if one exists for the target page type

Preserve product workflows, reuse existing components, and avoid broad rewrites.

Apply an Apple-inspired product style to the target UI:
- calm, refined, restrained, and highly legible
- balanced spacing and clean grouping
- polished but subtle surfaces
- precise typography and minimal visual noise
- fewer, more deliberate emphasis points

Do not turn the page into a marketing site. Do not overuse giant whitespace. Do not remove information needed by operators.

If the page is a form, detail page, or side panel:
- make section grouping clearer
- keep labels, helper text, and actions closely related
- improve calmness without reducing task efficiency

Now implement the following task while keeping behavior intact:
[在这里补充具体任务]
```

### 推荐任务示例

```text
Now implement the following task while keeping behavior intact:
Refine the record detail drawer or configuration form in apps/nextjs-app so it feels more Apple-inspired: calmer spacing, cleaner grouping, clearer field hierarchy, and more polished action placement without changing the underlying workflow.
```

## 选型建议

### 更适合 VoltAgent 风格的场景

- dashboard
- automation / workflow
- AI 相关入口
- 指标、监控、分析、配置密集界面

### 更适合 Apple 风格的场景

- detail view
- settings
- forms
- drawer / side panel
- 需要降低认知噪声的密集编辑界面

## 使用原则

- 这两套提示词包都只能作为“品牌化倾向”，不能覆盖项目既有约束。
- 优先级始终是：产品流程 > 仓库约束 > 页面 recipe > 品牌风格。
- 若品牌风格与当前页面任务冲突，应保留产品可用性和实现边界。

## 专用场景包 1: VoltAgent 落地页生成提示词

### 适用场景

- 产品介绍页
- 功能发布页
- AI 功能入口页
- 工具型 SaaS 的 campaign landing page

### 可执行整包

```text
You are creating a landing page with a VoltAgent-inspired aesthetic.

Even though this is a landing page, keep the result product-aware, structured, and believable for a real SaaS workflow platform.

Design direction:
- AI-native, sharp, modern, technical, and product-forward
- crisp visual hierarchy, structured sections, and compact but readable spacing
- restrained surfaces with precise accent color usage
- strong contrast in messaging, but not chaotic or neon-heavy
- premium tool-like feeling rather than consumer-social energy

Content and layout direction:
- Build a clear landing page flow: hero, value props, product proof, workflow examples, trust signals, and CTA
- Keep headlines concise and high-signal
- Use product screenshots or screenshot-like containers as evidence, not decoration
- Make the page feel like it belongs to a serious productivity product
- Avoid vague AI buzzword sections with no functional meaning

Interaction direction:
- Primary CTA should be obvious early in the page
- Secondary CTA can support demo, docs, or sign-in
- Sections should transition cleanly with strong rhythm and low visual noise

Do not make it feel like a generic startup template.
Do not overuse gradients, giant glow effects, or decorative motion.

Now generate the landing page for this task:
[在这里补充具体任务]
```

### 推荐任务示例

```text
Now generate the landing page for this task:
Create a VoltAgent-inspired landing page for Teable app mode that explains editable app configuration, governance defaults, dashboard pages, and workflow enablement for operators and admins.
```

## 专用场景包 2: VoltAgent 登录页生成提示词

### 适用场景

- 登录页
- 注册入口页
- workspace 进入页
- 邀请接受页附近的身份校验入口

### 可执行整包

```text
You are creating a login page with a VoltAgent-inspired aesthetic.

Design direction:
- AI-native, modern, crisp, and technical
- compact but polished layout
- strong clarity around identity, workspace access, and next action
- restrained surfaces, clear borders, subtle depth, and limited accent emphasis

Layout direction:
- Keep the login form as the operational center of gravity
- Support it with a concise product message, optional trust cues, and optional workspace context
- If a split layout is used, the supporting side should reinforce product capability, not become visual noise

Interaction direction:
- Make email, password, SSO, and workspace actions immediately discoverable
- Validation should be local, calm, and precise
- Loading and failure states should feel product-grade and intentional
- Keep recovery actions such as forgot password or switch account easy to find

Product direction:
- The page should feel like entry into a serious work platform
- Avoid playful illustrations, oversized marketing copy, or soft consumer-app styling
- Keep the result suitable for repeated daily use

Now generate the login page for this task:
[在这里补充具体任务]
```

### 推荐任务示例

```text
Now generate the login page for this task:
Create a VoltAgent-inspired login page for Teable with email login, SSO entry, workspace hinting, and a clean enterprise-grade access flow.
```

## 专用场景包 3: Apple 落地页生成提示词

### 适用场景

- 产品官网首页
- 新功能介绍页
- 高端产品发布页
- 需要克制高级感的 landing page

### 可执行整包

```text
You are creating a landing page with an Apple-inspired aesthetic.

Design direction:
- calm, refined, premium, and restrained
- deliberate spacing, elegant grouping, and very low visual noise
- polished surfaces and carefully controlled emphasis
- precise typography with strong readability and quiet confidence

Content and layout direction:
- Build a clear landing flow: hero, product promise, capability sections, product proof, trust, and CTA
- Let each section breathe, but do not waste space
- Use fewer, stronger messages instead of many small marketing claims
- Product imagery should feel clean, precise, and integrated into the story
- Prefer clarity and elegance over hype

Interaction direction:
- CTA placement should feel obvious and natural
- Section transitions should be smooth and quiet
- Micro-details should make the page feel polished without becoming ornamental

Avoid generic gradient-heavy startup design.
Avoid noisy comparison tables unless they are essential.
Avoid turning the page into a luxury poster with no product depth.

Now generate the landing page for this task:
[在这里补充具体任务]
```

### 推荐任务示例

```text
Now generate the landing page for this task:
Create an Apple-inspired landing page for Teable app mode, highlighting calm product power, editable configuration, governed workflows, dashboard pages, and polished operational control.
```

## 专用场景包 4: Apple 登录页生成提示词

### 适用场景

- 登录页
- 注册/加入工作区入口
- 账户恢复入口
- 需要精致秩序感的身份认证页面

### 可执行整包

```text
You are creating a login page with an Apple-inspired aesthetic.

Design direction:
- calm, refined, minimal, and highly legible
- soft but precise hierarchy
- clean grouping, balanced whitespace, and polished restraint
- subtle premium feeling without visual excess

Layout direction:
- Keep the sign-in form central and easy to understand
- Surround it with only the supporting context needed for trust and orientation
- If a secondary panel exists, it should quietly reinforce product context, not compete with the form

Interaction direction:
- Make sign-in methods obvious and effortless
- Keep error, loading, and recovery states clear and local
- Reduce cognitive load through grouping, label clarity, and consistent spacing
- Make the page feel welcoming but still product-focused

Product direction:
- Avoid oversized marketing language
- Avoid decorative visual tricks that slow comprehension
- Keep the result suitable for repeated use inside a serious work product

Now generate the login page for this task:
[在这里补充具体任务]
```

### 推荐任务示例

```text
Now generate the login page for this task:
Create an Apple-inspired login page for Teable with email sign-in, optional SSO, graceful recovery paths, and a calm, polished enterprise-ready access experience.
```

## 专用场景包补充说明

- 这 4 套专用场景包更适合新页面生成，不是产品内局部改造 prompt 的替代品。
- 若任务目标是 `apps/nextjs-app` 里的现有产品页面，优先使用前面的产品型 prompt pack。
- 若任务目标是官网、营销页、登录页、新入口页，则优先使用这里的专用场景包。

## 页面级执行包 1: VoltAgent Record Detail

### 使用前提

- 先读取 `AGENTS.md`
- 先读取 `.monkeycode/docs/design-system/DESIGN.md`
- 再读取 `.monkeycode/docs/design-system/page-recipes/record-detail.md`

### 可执行整包

```text
You are editing a record detail surface in the Teable monorepo.

Before changing code, read and follow:
1. AGENTS.md
2. .monkeycode/docs/design-system/DESIGN.md
3. .monkeycode/docs/design-system/page-recipes/record-detail.md

Apply a VoltAgent-inspired product style while preserving current behavior.

Style direction:
- AI-native, sharp, modern, and tool-oriented
- crisp grouping, compact spacing, strong scanability
- restrained surfaces and precise emphasis
- technical clarity over decorative softness

Execution direction:
- Make record identity, status, and primary actions immediately visible near the top.
- Strengthen grouping between core editable fields, metadata, and secondary content.
- Keep actions close to the related section.
- Improve readability in drawers and side panels without turning them into mini full pages.
- Do not overuse cards or visual separators in already narrow surfaces.

Constraints:
- Preserve the current workflow.
- Reuse existing components.
- Prefer local layout improvement over broad rewrites.

Verification:
- Check that identity and status remain top-visible.
- Check that fields are grouped more clearly.
- Check that actions still feel close to the relevant data.
- Check narrow-screen and side-panel readability.

Now implement the following task:
[在这里补充具体任务]
```

## 页面级执行包 2: Apple Record Detail

### 使用前提

- 先读取 `AGENTS.md`
- 先读取 `.monkeycode/docs/design-system/DESIGN.md`
- 再读取 `.monkeycode/docs/design-system/page-recipes/record-detail.md`

### 可执行整包

```text
You are editing a record detail surface in the Teable monorepo.

Before changing code, read and follow:
1. AGENTS.md
2. .monkeycode/docs/design-system/DESIGN.md
3. .monkeycode/docs/design-system/page-recipes/record-detail.md

Apply an Apple-inspired product style while preserving current behavior.

Style direction:
- calm, refined, restrained, and highly legible
- balanced spacing and polished grouping
- subtle surfaces and low visual noise
- hierarchy that feels quiet but immediately understandable

Execution direction:
- Make the top area feel orderly and trustworthy through clear identity, status, and actions.
- Group long fields and supporting content into calmer, more readable sections.
- Reduce visual competition between editable content and secondary metadata.
- Make drawers and side panels feel polished, focused, and easy to read.
- Preserve information density needed for real work.

Constraints:
- Preserve workflow behavior.
- Reuse current product patterns.
- Avoid oversized spacing that weakens task efficiency.

Verification:
- Check top-level orientation clarity.
- Check section grouping and long-field readability.
- Check that actions remain easy to locate.
- Check that the result feels calmer without losing operational usefulness.

Now implement the following task:
[在这里补充具体任务]
```

## 页面级执行包 3: VoltAgent Form

### 使用前提

- 先读取 `AGENTS.md`
- 先读取 `.monkeycode/docs/design-system/DESIGN.md`
- 再读取 `.monkeycode/docs/design-system/page-recipes/form.md`

### 可执行整包

```text
You are editing a form surface in the Teable monorepo.

Before changing code, read and follow:
1. AGENTS.md
2. .monkeycode/docs/design-system/DESIGN.md
3. .monkeycode/docs/design-system/page-recipes/form.md

Apply a VoltAgent-inspired product style while preserving current behavior.

Style direction:
- AI-native, sharp, modern, and operational
- dense but readable field layout
- crisp grouping and compact hierarchy
- restrained use of accent and clear action emphasis

Execution direction:
- Make the primary submit path obvious.
- Keep labels, helper text, required state, and validation tightly connected.
- Strengthen grouping between related field sets and dependent options.
- Preserve efficiency for advanced configuration workflows.
- Keep drawers, modals, and side panels focused and compact.

Constraints:
- Do not rely on global-only error feedback.
- Do not introduce decorative whitespace that slows completion.
- Reuse existing form primitives and workflows.

Verification:
- Check field grouping logic.
- Check that validation remains local and clear.
- Check that submit intent stays obvious on desktop and narrow screens.
- Check that the result feels faster and clearer, not merely more styled.

Now implement the following task:
[在这里补充具体任务]
```

## 页面级执行包 4: Apple Form

### 使用前提

- 先读取 `AGENTS.md`
- 先读取 `.monkeycode/docs/design-system/DESIGN.md`
- 再读取 `.monkeycode/docs/design-system/page-recipes/form.md`

### 可执行整包

```text
You are editing a form surface in the Teable monorepo.

Before changing code, read and follow:
1. AGENTS.md
2. .monkeycode/docs/design-system/DESIGN.md
3. .monkeycode/docs/design-system/page-recipes/form.md

Apply an Apple-inspired product style while preserving current behavior.

Style direction:
- calm, refined, minimal, and highly legible
- deliberate spacing and polished grouping
- subtle surfaces with very low visual noise
- clear but quiet hierarchy around actions and validation

Execution direction:
- Make related field groups easier to scan and complete.
- Keep helper text, required indicators, and validation close to each field.
- Improve form calmness without sacrificing operational density.
- Make submit, cancel, and recovery paths clear and predictable.
- Keep constrained surfaces polished and easy to complete.

Constraints:
- Do not drift into marketing-style whitespace.
- Do not weaken field-level validation clarity.
- Preserve existing workflow and component structure.

Verification:
- Check that the form is easier to read and complete.
- Check that validation and helper text remain local.
- Check that primary and secondary actions are clearly differentiated.
- Check that the final result feels calmer without becoming slower.

Now implement the following task:
[在这里补充具体任务]
```
