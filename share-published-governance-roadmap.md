# Share Published Governance Roadmap

> 文档分层：正式输出。
> 
> 这份文档是 share / published 统一治理的正式路线图，用于支撑缺口收口和阶段推进。

## 1. 目的

这份文档用于收口 `capability-gap-task-matrix.md` 中与 share / published 相关的治理主题：

- `2.3 Share 与 Published 统一度不足`
- `2.1 V1 与 V2 双轨能力覆盖不一致` 中与 share / published 相关的部分

当前 share 只读主链路与 published/template 公开读取入口已进入 v2，published app runtime 也已新增 manifest、navigation、node runtime 三条 backend 契约入口，并补了第一批 permission/runtime 语义字段。

## 2. 当前事实

### 2.1 Share 已进入 v2 的入口

- `share.formSubmitView`
- `share.copyView`
- `share.buttonClickView`
- `share.getView`
- `share.getViewAggregations`
- `share.getViewRowCount`
- `share.getViewRecords`
- `share.getViewGroupPoints`
- `share.getViewLinkRecords`
- `share.getViewCollaborators`
- `share.getViewCalendarDailyCollection`
- `share.getViewSearchCount`
- `share.getViewSearchIndex`

### 2.2 Published / Template 已进入 v2 的入口

- `templates.listPublished`
- `templates.getById`
- `templates.getPermalink`
- `templates.incrementVisit`

当前已确认 template publish 与 published runtime 的一条真实统一语义：

- template publish 通过 `publishInfo.defaultUrl` 决定默认跳转地址
- published runtime 通过 `defaultUrl` 暴露默认打开地址
- 两者当前都围绕“默认激活节点 URL”这一语义收敛

### 2.3 当前治理主题

- published app runtime 已有 manifest、navigation、node runtime contract，并已补 `defaultUrl`、`passwordRestricted` 语义；更统一的 permissions / runtime 语义层已转入持续治理
- template publish 与 published runtime 已共享 `defaultUrl` 语义；更深的一体化公开 contract 模型已转入后续专项治理

## 3. 分层路线图

### 第一层：share 剩余交互入口

本层当前已完成第一批稳定交互入口：

1. `share.copyView`
2. `share.formSubmitView`
3. `share.buttonClickView`

### 第二层：published app runtime 契约面

当前已完成三条 backend contract 落地：

1. `publishedApps.getRuntimeManifest`
2. `publishedApps.getNavigationModel`
3. `publishedApps.getNodeRuntime`

当前治理项：

1. published permissions 与 mode 的统一 contract 细化
2. template publish 与 published runtime 的更深统一

当前参考文档：

- `published-app-runtime-contract-plan.md`

### 第三层：统一 runtime 抽象

目标：

- share runtime
- published app runtime
- template publish redirect

三者共享统一资源解析与最小 manifest 语义。

当前已确认的最小共享语义：

- `defaultUrl`
- `defaultNodeId`
- 与默认节点解析相关的资源路径规则

## 4. 推荐切口

### 4.1 短期

继续以 share 的稳定交互入口与 published runtime 基础 contract 为主。

原因：

- 后端事实源已经明确
- 与现有 `ShareAuthService` / `ShareService`、`BaseShareAuthService` / `BaseNodeService` 复用度高

### 4.2 中期

把 `published-app` 当前前端 runtime 所需数据继续拆成更细的单独契约。

### 4.3 长期

把 share / published / template publish 的公开访问链路统一成一套可组合 contract。

当前最小统一切口已经明确：

1. template publish 侧：`TemplatePermalinkService.resolvePermalink(...)` 使用 `publishInfo.defaultUrl`
2. published runtime 侧：`publishedApps.getRuntimeManifest` 暴露 `defaultUrl`
3. 后续可以围绕 `defaultUrl + defaultNodeId` 形成统一 Published 访问模型

## 5. 完成判定

Share / Published 可从“统一度不足”升级到“基础统一面已形成”的最小条件：

1. share 读取与核心交互入口都进入 v2
2. published app runtime 至少有 manifest / node data / permission 三类公开 contract
3. template publish 与 published app runtime 之间的关系有统一说明文档

当前进度：

- 条件 1 已满足
- 条件 2 已完成 manifest / navigation / node runtime 三层 backend contract，permission 细化已转入持续治理
- 条件 3 已通过路线图与 contract 设计文档建立统一说明

## 6. 当前结论

当前最合适的执行口径是：

1. 继续细化 published app runtime 的更深 permission / mode 语义
2. 再做 share / published 的统一 runtime 语义收束
3. 最后把 template publish 与 published runtime 的 `defaultUrl / defaultNodeId` 统一收成共享访问模型
