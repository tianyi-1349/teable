# Published App Access Model Governance Requirements

文档层级：正式标准

## 主线目标

在不回归已完成 Published App Runtime 主线的前提下，收敛 Published App 默认节点语义与 template 访问路径的剩余治理尾差，并为后续 `template` published runtime 是否接通建立清晰、可验证的边界。

## 当前事实

- share 路由已接入 `PublishedAppProvider + PublishedAppRuntime`。
- authenticated `App` 路由已接入 `PublishedAppProvider + PublishedAppRuntime`。
- `PublishedAppContext`、manifest、navigation、shell、preview/validation 已落地。
- runtime consumer 当前统一使用 `defaultNodeId`。
- source publish config 与 template detail 仍保留 `defaultActiveNodeId`。
- template permalink 和 template layout 路径已存在，但当前没有独立的 template published runtime 入口。
- `PublishedAppMode` 当前包含 `authenticated`、`share`、`template`，其中 `template` 仅保留在 manifest 类型层。

## 范围

### In Scope

- 明确 `template` 访问路径与 `template` published runtime 的边界结论。
- 收敛 `defaultActiveNodeId` 与 `defaultNodeId` 的单点适配边界。
- 为 share / published / template 相关链路建立最小验证矩阵。
- 同步 backlog、spec 与 acceptance 文档状态。

### Out of Scope

- 重做 `.monkeycode/specs/published-app-runtime/` 中 PR1-PR9 已完成的 Published Runtime 主线。
- 新增跨端 shell、renderer、PWA 能力或 Mini Program 实现。
- 大范围路由重构。
- backend 或 openapi 公开字段命名迁移。
- 在本轮内直接扩成新的 template published runtime 主线专项，除非后续证据证明这是完成统一访问模型的必要条件。

## Requirements

### R1: Runtime Mainline Preservation

WHEN the access-model governance slice is implemented,
THE SYSTEM SHALL preserve the existing share runtime and authenticated `App` runtime behavior.

验收要点：

- share route 的 Published Runtime 行为不回归。
- authenticated `App` route 的 Published Runtime 行为不回归。
- 已完成的 PR1-PR9 主线行为不被重新打开。

### R2: Canonical Runtime Default Node Contract

WHEN runtime state is consumed by manifest, context, navigation, validation, or renderer,
THE SYSTEM SHALL use `defaultNodeId` as the canonical runtime field.

验收要点：

- runtime consumer 不引入第二套默认节点字段语义。
- runtime manifest、navigation、context、validation 保持 `defaultNodeId` 一致。

### R3: Source Compatibility Boundary

WHEN publish config or template detail still exposes `defaultActiveNodeId`,
THE SYSTEM SHALL convert it through one explicit frontend compatibility boundary rather than multiple ad hoc consumer conversions.

验收要点：

- `defaultActiveNodeId` 的历史兼容保留在 source / persisted contract 层。
- runtime-facing contract 继续使用 `defaultNodeId`。
- 映射点可定位、可解释、可测试。

### R4: Template Runtime Disposition

WHEN evaluating `template` mode in this governance slice,
THE SYSTEM SHALL distinguish existing template transport/layout paths from a future template published runtime entry, and either keep the latter as a documented deferred item with explicit rationale, or prove that it is required before expanding scope.

验收要点：

- 本轮必须给出明确结论。
- 若保留为 deferred item，需说明原因、边界和触发条件。
- 不接受只有类型存在、没有行为定义的模糊完成态。

### R5: Minimal Verification Matrix

WHEN this governance slice is completed,
THE SYSTEM SHALL include a minimal verification matrix across share / published / template related paths.

验收要点：

- 至少覆盖 share runtime 默认节点链路。
- 至少覆盖 authenticated `App` runtime 默认节点链路。
- 至少覆盖 template publish config 默认节点的保存、回显或校验兼容链路。
- 至少覆盖 template permalink 或 template layout 现有访问路径的不回归结论。

### R6: Documentation Synchronization

WHEN the governance conclusion is finalized,
THE SYSTEM SHALL keep backlog, spec, and acceptance documents consistent with the actual code state.

验收要点：

- backlog 不再把已完成的 runtime 主线描述成大面积未闭环。
- 本轮新增 spec 与现有 `published-app-runtime` spec、acceptance 报告保持一致。

## 完成门槛

- 代码层有明确的统一访问模型结论。
- `defaultActiveNodeId` / `defaultNodeId` 的前端单点适配边界清晰。
- `template` transport/layout path 与 `template` published runtime entry 在本轮有明确 disposition。
- 最小验证矩阵成立。
- 文档状态与代码事实一致。
