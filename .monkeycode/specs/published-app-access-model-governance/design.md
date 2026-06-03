# Published App Access Model Governance Design

文档层级：正式标准

## 设计目标

- 保持已完成 Published Runtime 主线稳定。
- 用最小补丁收敛默认节点命名和 template 路径边界语义。
- 保持 runtime 内核只认一套运行时字段。
- 为后续 `template` published runtime 扩展保留清晰边界，而不在本轮引入新的并行结构。

## 当前代码事实

### 已落地主线

- `apps/nextjs-app/src/features/app/layouts/ShareBaseLayout.tsx` 已挂载 `PublishedAppProvider + PublishedAppRuntime`。
- `apps/nextjs-app/src/features/app/layouts/BaseLayout.tsx` 当前在 `resource.resourceType === BaseNodeResourceType.App` 时挂载 `PublishedAppProvider + PublishedAppRuntime`。
- `apps/nextjs-app/src/features/app/published-app/manifest/buildPublishedAppManifest.ts` 输出 `defaultNodeId`。
- `apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.tsx`、`navigation/buildPublishedNavigation.ts`、`preview/validatePublishedAppConfig.ts` 都以 `defaultNodeId` 为运行时语义。
- `apps/nestjs-backend/src/features/v2/v2-published-app.service.ts` 的 runtime manifest、navigation、node runtime 也以 `defaultNodeId` 为核心字段。
- `apps/nextjs-app/src/pages/t/[identifier].tsx` 已具备 template permalink 解析与跳转路径。
- `apps/nextjs-app/src/features/app/layouts/TemplateBaseLayout.tsx` 已具备 template layout、template transport 和 template visit tracking 路径。

### 当前尾差

- `packages/openapi/src/base/publish.ts` 仍以 `defaultActiveNodeId` 作为 publish config source 字段。
- `packages/openapi/src/template/get.ts` 仍以 `defaultActiveNodeId` 作为 template detail 返回字段。
- `apps/nestjs-backend/src/features/base/base.service.ts` 与 `apps/nestjs-backend/src/features/v2/v2.controller.ts` 仍在 source/template 层使用或透出 `defaultActiveNodeId`。
- `apps/nextjs-app/src/features/app/blocks/table/table-header/publish-base/PublishBaseDialog.tsx` 内部状态继续承接 `defaultActiveNodeId`，并已在前端单点边界显式映射为 runtime `defaultNodeId`。
- `apps/nextjs-app/src/features/app/published-app/manifest/types.ts` 中的 `PublishedAppMode` 已包含 `template`，并已通过 `TemplateBaseLayout.tsx` 接入独立 template published runtime 消费入口。

## 方案对比

### 方案 A：先做契约治理与验证矩阵

内容：

- runtime internal contract 继续统一使用 `defaultNodeId`。
- source / persisted / template detail 继续保留 `defaultActiveNodeId` 作为历史字段。
- 将 compatibility boundary 固定为前端单点适配，而不是前后端双点候选。
- 为 share / published / template 补最小验证矩阵。
- `template` published runtime 本轮保留为 deferred item，并明确原因与后续触发条件。

优点：

- 改动面最小。
- 风险最低。
- 与当前 PR1-PR9 已完成主线保持一致。
- 最符合 `EXECUTION_CONSTRAINTS.md`、主线交付协议和最小补丁原则。

风险：

- `template` published runtime 仍需后续专项处理。
- 需要把前端单点 compatibility boundary 说明清楚，避免后续消费者继续各自转换。

### 方案 B：直接接通 template runtime

内容：

- 为 template route 或 template context 增加 Published Runtime 消费入口。
- 同步处理命名统一、验证矩阵与文档回写。

优点：

- 统一访问模型在入口层更完整。

风险：

- 任务会从治理尾差升级为新的 runtime 主线扩展。
- 涉及 route、SSR、permission、template context、runtime consumer 等多层改动。
- 容易重新打开已完成主线，扩大回归面。

## 推荐方案

推荐方案 A。

理由：

- 当前项目的主矛盾是默认节点语义与 template 路径边界尾差，而不是 runtime 主线未完成。
- 方案 A 对全局性、一致性、稳定性和可维护性综合最优。
- 方案 A 可以更快形成可验证闭环，并为后续 template runtime 专项保留清晰边界。

## 关键设计边界

### 1. Runtime 唯一默认节点语义

- runtime 层唯一默认节点字段为 `defaultNodeId`。
- 适用位置：manifest、context、navigation、preview validation、published runtime service。

### 2. Source Compatibility Layer

- `defaultActiveNodeId` 保留在 source / persisted / template detail 层。
- 该字段不得直接扩散为新的 runtime consumer 语义。
- 本轮只允许通过前端单点适配将其转换为 `defaultNodeId`。

### 3. Template Mode Disposition

- `template` mode 已接入独立 Published Runtime 入口。
- template permalink 与 template layout 继续作为现有 template transport path。
- template runtime 继续复用现有 manifest、context、navigation 和 shell 结构。
- 后续若要继续扩大 template 专项，重点转向真实业务端到端联动验证，而不是再造新入口。

## Compatibility Boundary

### Frontend Source Boundary

- `apps/nextjs-app/src/features/app/blocks/table/table-header/publish-base/PublishBaseDialog.tsx`
- 当前已具备从 source state 向 runtime validation contract 的转换关系。
- 本轮优先在该边界收口前端 source-to-runtime 默认节点语义转换。
- backend 与 openapi 公开 contract 在本轮保持冻结。

## 最小验证矩阵

### Share Runtime

- share runtime 默认节点链路成立。
- scope 外节点拒绝态不回归。

### Authenticated App Runtime

- authenticated `App` route 仍通过 Published Runtime 提供默认节点语义。
- 已完成 shell / context / navigation 主线不回归。

### Template Publish Config Compatibility

- template publish config 的默认节点保存、回显或校验兼容关系成立。
- `defaultActiveNodeId` 与 `defaultNodeId` 的边界在验证层可证明。

### Template Path Preservation

- template permalink 跳转路径不回归。
- `TemplateBaseLayout` 的 template transport/layout 路径不回归。
- 当前证据状态：`pages/t/[identifier].tsx` 已通过 focused test 证明 permalink redirect path 保留；`TemplateBaseLayout.spec.tsx` 已证明 template visit tracking 与 non-template children passthrough 行为保留。

## 风险控制

- 不新增第二套 manifest、context 或 navigation 结构。
- 不在本轮修改 backend 或 openapi 公开字段名。
- 不改变 `ShareBaseLayout.tsx` 和 `BaseLayout.tsx` 的主线挂载策略，除非后续证据证明必要。
- 先补 focused tests 和最小验证结论，再判断是否需要下一轮专项。

## 本轮实施结果

- 前端单点 compatibility boundary 已完成收口。
- runtime canonical 默认节点语义继续唯一使用 `defaultNodeId`。
- source / persisted / template detail 公开字段名在本轮保持冻结。
- template permalink redirect path 已有 focused test 证据。
- `TemplateBaseLayout` transport/layout path 已有 focused test 证据。
- share / authenticated / template 访问模式信号已补 browser-level Playwright 证据。
- 独立 template published runtime 入口已通过 `TemplateBaseLayout.tsx` + `PublishedAppProvider(mode='template')` 接通。
- 最小正式验证矩阵已沉淀为 `.monkeycode/docs/published-app-access-model-minimal-integration-matrix-2026-05-27.md`。
- `/_monitor/preview/published-business-flow` 已补业务级 Playwright 证据，证明 share / authenticated / template 模式切换会驱动 table / app 内容与权限文案联动变化。
- `base-route-entry.spec.ts` 与 `share-base-ssr.spec.ts` 已补真实页面入口 SSR 分流证据，证明 authenticated login redirect 与 share auth redirect / route rewrite 行为成立。
- `published-route-entry.spec.ts` 已补 authenticated 与 share auth 真实浏览器入口证据；`/share/[shareId]/base/auth` 与 `/share/[shareId]/view/auth` 当前已可稳定加载。
- share auth 原始组件布局结构在当前 DEV 客户端更新链下会触发浏览器 crash；本轮已以稳定替代结构收口真实页面可用性，后续如需继续深挖，可对原布局触发片段做专项二分。
