# Published App Runtime Contract Plan

> 文档分层：正式输出。
> 
> 这份文档是 published app runtime contract 演进的正式专项计划，用于指导 runtime 迁移和语义统一。

## 1. 目的

这份文档用于收口 `share-published-governance-roadmap.md` 中与 published app runtime 相关的治理主题。

当前 share 交互入口已经进入 v2，published app runtime 也已经形成基础 backend contract。

## 2. 当前事实

### 2.1 当前 manifest 生成位置

- `apps/nextjs-app/src/features/app/published-app/manifest/buildPublishedAppManifest.ts`
- `apps/nextjs-app/src/features/app/published-app/manifest/types.ts`

### 2.2 当前导航生成位置

- `apps/nextjs-app/src/features/app/published-app/navigation/buildPublishedNavigation.ts`
- `apps/nextjs-app/src/features/app/published-app/navigation/getPublishedNodeUrl.ts`

### 2.3 当前 Web App Manifest API

- `apps/nextjs-app/src/pages/api/published-app/manifest.ts`

这个 API 只负责输出 PWA manifest 文件内容：

- `name`
- `short_name`
- `description`
- `start_url`
- `scope`
- `icons`

它不是业务态的 published app runtime manifest。

### 2.4 当前 template publish 默认跳转事实源

- `apps/nestjs-backend/src/features/template/template-permalink.service.ts`
- `apps/nestjs-backend/src/features/template/template-open-api.service.ts`

当前 template publish 的默认跳转语义已经稳定存在：

- `publishInfo.defaultUrl`
- 若不存在则 fallback 到 `/base/{snapshotBaseId}`

## 3. 当前 runtime contract 真实形状

### 3.1 PublishedAppManifest

当前前端运行时已经隐含一套稳定结构：

- `baseId`
- `shareId?`
- `title`
- `icon?`
- `defaultNodeId?`
- `nodes`
- `permissions`
- `mode`
- `runtimeTargets`

### 3.2 PublishedAppNode

- `nodeId`
- `resourceId`
- `resourceType`
- `title`
- `icon?`
- `parentId?`
- `children`
- `visibleInNav`
- `renderable`

### 3.3 PublishedAppPermissions

- `allowSave`
- `allowCopy`
- `allowEdit`
- `readonly`

### 3.4 与 template publish 已共享的最小语义

- `defaultUrl`
- `defaultNodeId` 对应的默认打开资源概念

## 4. 当前治理主题

### 4.1 基础 backend 事实源已经落地

当前已确认并接入稳定 backend 事实源：

- `apps/nestjs-backend/src/features/base-share/base-share-auth.service.ts`
- `apps/nestjs-backend/src/features/base-node/base-node.service.ts`

当前实现文件：

- `packages/v2/contract-http/src/published-app/getRuntimeManifest.ts`
- `packages/v2/contract-http/src/contract.ts`
- `packages/v2/contract-http-implementation/src/handlers/published-app/getRuntimeManifest.ts`
- `apps/nestjs-backend/src/features/v2/v2-published-app.service.ts`
- `apps/nestjs-backend/src/features/v2/v2.controller.ts`

### 4.2 当前持续治理主题

runtime manifest、navigation model 与 node runtime 已进入 backend 契约层。当前专题重点集中在 `share` 模式之外的扩展空间，以及 node-level runtime 细节与更统一权限语义的持续细化。

## 5. 建议最小 contract 切口

### 第一层：runtime manifest

当前已落地：

- `publishedApps.getRuntimeManifest`

当前输入：

- `shareId`

当前输出：

- `baseId`
- `shareId`
- `title`
- `icon?`
- `defaultNodeId?`
- `defaultUrl?`
- `nodes`
- `permissions`
- `shareMeta.passwordRestricted`
- `mode`
- `runtimeTargets`

当前实现范围：

- 只覆盖 `share` 模式
- 基于 share 可访问范围裁剪 node 列表
- 生成可渲染 node 与默认 node
- 暴露默认跳转 URL
- 暴露 share 是否启用密码限制

当前与 template publish 的对齐点：

- 都已显式暴露或消费 `defaultUrl`

### 第二层：navigation-ready model

当前已落地一条更薄的 navigation-ready contract：

- `publishedApps.getNavigationModel`

当前作用：

- 直接输出前端可消费的导航树
- 输出 `defaultItem`、`activeItem`、`isSingleNode`、`isCurrentNodeInScope`

### 第三层：node runtime details

当前已落地：

- `publishedApps.getNodeRuntime`

当前作用：

- 给定 `shareId + nodeId`，返回当前 node runtime 解析结果
- 输出 `currentNode`、`defaultNode`、`resolvedNode`
- 输出 `isCurrentNodeInScope`、`isRenderable`、`isDefault`、`url`

## 6. 当前可执行结论

当前最合适的执行口径是：

1. 保持 `publishedApps.getRuntimeManifest` 作为 published runtime 的基础 contract
2. 保持 `publishedApps.getNavigationModel` 作为前端可直接消费的第二层 contract
3. 保持 `publishedApps.getNodeRuntime` 作为 node 级 runtime 解析 contract，并将更深的 permission/runtime 语义细化纳入持续治理

4. 将 template publish 侧的 `publishInfo.defaultUrl` 与 published runtime 的 `defaultUrl + defaultNodeId` 持续收束成共享访问模型

## 7. 完成判定

Published app runtime 从“主要依赖前端本地组装”升级到“基础 backend contract 已形成”的最小条件如下：

1. 有正式文档定义 runtime manifest 结构
2. 有真实 `contract-http + api/v2` endpoint 落地
3. 路线图、缺口清单和覆盖矩阵都同步到这一状态

当前进度：

- 条件 1 已满足
- 条件 2 已满足
- 条件 3 本次同步后满足
