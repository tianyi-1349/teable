# Published App Access Model Minimal Integration Matrix

文档层级：正式输出。

## 1. 目标

本矩阵用于固化当前 `share / published / template` 统一访问模型治理的最小自动化证据面。

本矩阵关注以下问题：

1. runtime 默认节点语义是否继续唯一使用 `defaultNodeId`。
2. source/template 历史字段 `defaultActiveNodeId` 是否已在前端单点边界完成兼容映射。
3. template permalink redirect path 与 template layout transport path 是否仍保留。
4. 当前哪些边界已有自动化证据，哪些边界仍保留为后续专项。

## 2. 覆盖范围

### 已纳入本矩阵

1. publish dialog source-to-runtime 默认节点兼容边界。
2. published runtime preview validation 默认节点与 fatal/warning 判定。
3. published runtime manifest / navigation 默认节点链路。
4. template permalink redirect path。
5. template layout transport / visit tracking path。
6. share / authenticated / template browser-level 访问模式信号预览。
7. share / authenticated / template 业务级 runtime 模式、权限和资源内容切换验证。
8. authenticated / share / template 真实页面入口 SSR 分流验证。

## 3. Matrix

| Slice | Scenario | Expected behavior | Evidence | Command | Status |
| --- | --- | --- | --- | --- | --- |
| Source compatibility boundary | `PublishBaseDialog` 读取 template publish config 中的 `defaultActiveNodeId` | 前端 validation 输入统一使用 runtime `defaultNodeId` | `apps/nextjs-app/src/features/app/blocks/table/table-header/publish-base/PublishBaseDialog.spec.tsx:136` | `pnpm --filter @teable/app exec vitest run src/features/app/blocks/table/table-header/publish-base/PublishBaseDialog.spec.tsx` | passed |
| Preview validation | 空选择、缺失 app runtime URL、dashboard mobile warning | validation 正确产出 fatal / warning，且默认节点字段保持 `defaultNodeId` | `apps/nextjs-app/src/features/app/published-app/preview/validatePublishedAppConfig.spec.ts:34` | `pnpm --filter @teable/app exec vitest run src/features/app/published-app/preview/validatePublishedAppConfig.spec.ts` | passed |
| Manifest default node | share node 可渲染时作为默认节点 | manifest 输出 `defaultNodeId`，权限与 runtime targets 保持稳定 | `apps/nextjs-app/src/features/app/published-app/manifest/buildPublishedAppManifest.spec.ts:19` | `pnpm --filter @teable/app exec vitest run src/features/app/published-app/manifest/buildPublishedAppManifest.spec.ts` | passed |
| Navigation fallback | share node 不可渲染或 direct URL scope 外 | navigation 回退到首个 renderable node，并正确标记 out-of-scope | `apps/nextjs-app/src/features/app/published-app/manifest/buildPublishedAppManifest.spec.ts:66` | `pnpm --filter @teable/app exec vitest run src/features/app/published-app/manifest/buildPublishedAppManifest.spec.ts` | passed |
| Template permalink path | `/t/[identifier]` SSR resolve | 解析 template permalink 后返回 302 redirect；缺失 identifier 返回 `notFound` | `apps/nextjs-app/src/pages/t/[identifier].spec.ts:31` | `pnpm --filter @teable/app exec vitest run 'src/pages/t/[identifier].spec.ts'` | passed |
| Template layout transport path | `TemplateBaseLayout` template base | template visit tracking 触发，ws template header 注入保留，渲染 `childrenContent` | `apps/nextjs-app/src/features/app/layouts/TemplateBaseLayout.spec.tsx:107` | `pnpm --filter @teable/app exec vitest run src/features/app/layouts/TemplateBaseLayout.spec.tsx` | passed |
| Non-template passthrough | `TemplateBaseLayout` non-template base | 直接返回 `children`，不触发 template visit tracking | `apps/nextjs-app/src/features/app/layouts/TemplateBaseLayout.spec.tsx:135` | `pnpm --filter @teable/app exec vitest run src/features/app/layouts/TemplateBaseLayout.spec.tsx` | passed |
| Browser-level access signals | `/_monitor/preview/published-access-model` | 真实浏览器中可观察到 share mode、authenticated mode 和 template deferred transport path 信号 | `apps/nextjs-app/e2e/pages/published/published-access-model.spec.ts:6` | `E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-access-model.spec.ts --project='Desktop Chrome'` | passed |
| Template runtime entry | `TemplateBaseLayout` + `PublishedAppProvider` | template layout 已挂载 `PublishedAppRuntime`，且 manifest mode 可显式产出 `template` | `apps/nextjs-app/src/features/app/published-app/context/PublishedAppContext.spec.tsx:48` | `pnpm --filter @teable/app exec vitest run src/features/app/published-app/context/PublishedAppContext.spec.tsx` | passed |
| Business flow switching | `/_monitor/preview/published-business-flow` | 真实浏览器中可切换 share / authenticated / template 模式，并验证 table / app 内容和权限文案随 runtime 状态联动变化 | `apps/nextjs-app/e2e/pages/published/published-business-flow.spec.ts:6` | `E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-business-flow.spec.ts --project='Desktop Chrome'` | passed |
| Authenticated browser route entry | `/base/[baseId]/[[...slug]]` | 未登录真实浏览器访问会跳到 `/auth/login?redirect=...` | `apps/nextjs-app/e2e/pages/published/published-route-entry.spec.ts:4` | `E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-route-entry.spec.ts --project='Desktop Chrome'` | passed |
| Share base auth browser entry | `/share/[shareId]/base/auth` | 真实浏览器可稳定加载 share base auth 页面，并保留 shareId 路由态 | `apps/nextjs-app/e2e/pages/published/published-route-entry.spec.ts:10` | `E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-route-entry.spec.ts --project='Desktop Chrome'` | passed |
| Share view auth browser entry | `/share/[shareId]/view/auth` | 真实浏览器可稳定加载 share view auth 页面，并保留 shareId 路由态 | `apps/nextjs-app/e2e/pages/published/published-route-entry.spec.ts:17` | `E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-route-entry.spec.ts --project='Desktop Chrome'` | passed |
| Authenticated SSR entry | `/base/[baseId]/[[...slug]]` | 未登录请求会按真实页面入口重定向到 `/auth/login?redirect=...` | `apps/nextjs-app/src/features/app/ssr/base-route-entry.spec.ts:58` | `pnpm --filter @teable/app exec vitest run src/features/app/ssr/base-route-entry.spec.ts` | passed |
| Share SSR entry | `createShareBaseSSR` | share 入口在 401 时跳转 share auth，并把 base redirect 改写成 share 前缀路由 | `apps/nextjs-app/src/features/app/blocks/share/base/share-base-ssr.spec.ts:29` | `pnpm --filter @teable/app exec vitest run src/features/app/blocks/share/base/share-base-ssr.spec.ts` | passed |
| Type safety gate | `@teable/app` | 上述最小矩阵改动后 app typecheck 继续通过 | `apps/nextjs-app/package.json:42` | `pnpm --filter @teable/app typecheck` | passed |

## 4. 结论

当前最小矩阵已经证明：

1. runtime canonical 默认节点语义继续唯一使用 `defaultNodeId`。
2. `defaultActiveNodeId -> defaultNodeId` 兼容层已经稳定收敛在前端单点边界。
3. template permalink redirect path 和 template layout transport path 都有 focused test 证据。
4. share / authenticated / template 的 browser-level 访问模式信号已经有真实浏览器证据。
5. template layout 已接通独立 `PublishedAppRuntime` 入口，manifest mode 可显式产出 `template`。
6. 业务级 browser flow 已证明 share / authenticated / template 模式切换会驱动权限和资源内容联动变化。
7. 真实页面入口 SSR 级分流已证明 authenticated、share、template 三类入口的关键路由装配行为成立。
8. 本轮治理已经完成最小闭环，后续剩余工作集中在更接近真实后端 seed / login / route fixture 的全链路 e2e。
9. share auth 真实浏览器入口已形成稳定自动化证据，原始 DEV crash 已收敛为组件原布局结构与客户端更新链之间的局部兼容问题。

## 5. Remaining Gaps

1. 当前业务级 flow 仍基于 `/_monitor/preview/*` 最小基座，尚未接入真实登录、seed 数据和后端 route fixture。
2. share auth 原始布局结构在当前 DEV 客户端更新链下会触发浏览器 crash，当前已通过稳定替代结构消除问题，但最小触发片段仍可继续专项收敛。
3. 本矩阵是 focused integration matrix，不替代完整 e2e 或多端真实联调验证。
