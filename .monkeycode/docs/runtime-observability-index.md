# 运行可观测性产品化索引

文档分层：正式输出。

## 1. 分层口径

运行可观测性分为三层：产品可见状态、研发运行状态、适配验证状态。每个运行能力至少应在对应层有一个稳定观察入口。

## 2. 产品可见状态

| 能力域 | 当前入口 | 当前状态 | 后续要求 |
| --- | --- | --- | --- |
| Published / Share / Template | `apps/nextjs-app/src/pages/_monitor/preview/published-access-model.tsx`、`published-business-flow.tsx`、`share-auth-isolation.tsx` | 已有 monitor 页面和 Playwright 入口 | 补真实登录与真实后端 fixture 的全链路 e2e |
| Workflow run history | `apps/nextjs-app/src/features/app/automation/Pages.tsx` 的 run history 与 node run detail | 已显示 workflow run、step、选中节点输出和 webhook run input audit；webhook audit 已结构化展示签名 header、时间戳 header、签名验证状态、body size 与 rate limit；run history 已支持 trigger/status/webhook audit 服务端筛选、最近 100 条 webhook audit summary 计数、签名失败/缺少时间戳/请求体大小统计维度和 webhook audit 分页明细接口，并区分空运行与空筛选结果 | 扩展真实产品报表页和长周期趋势分析 |
| Workflow schedule | `Pages.tsx` schedule trigger 配置区 | 已支持 interval、one-time、cron、timezone 编辑、next-run preview、upcoming runs 列表；cron upcoming runs 已按严格五段 cron 和 timezone 计算真实未来运行时间；run history 可按 schedule trigger 筛选历史运行 | 增加更丰富的日历布局视图 |

## 3. 研发运行状态

| 能力域 | 当前入口 | 当前状态 | 验证方式 |
| --- | --- | --- | --- |
| Workflow schedule worker | `apps/nestjs-backend/src/features/workflow/workflow-schedule.service.ts`、`workflow-schedule.processor.ts` | active workflow 可同步 BullMQ repeat job 与 one-time delayed job，job payload 带 `nextRunAt` 与 `timezone` | `pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-schedule.service.spec.ts` |
| Workflow webhook signature | `apps/nestjs-backend/src/features/workflow/workflow-webhook-signature.ts`、`workflow.service.ts` | 后端签名 payload、HMAC-SHA256 生成、`sha256=` 前缀兼容、timestamp tolerance 和自定义签名 header 读取已单点化 | `pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-webhook-signature.spec.ts src/features/workflow/workflow.service.spec.ts` |
| Workflow webhook OpenAPI helper | `packages/openapi/src/automation/workflow/webhook-signature.ts`、`trigger-webhook.ts` | OpenAPI 客户端已提供默认/自定义签名头生成 helper，`triggerWebhookWorkflow` 可自动生成签名与时间戳 header | `pnpm --filter @teable/openapi exec vitest run src/automation/workflow/webhook-signature.spec.ts src/automation/workflow/trigger-webhook.spec.ts` |
| ShareDB snapshot metadata | `apps/nestjs-backend/src/share-db/share-db.adapter.ts` | readonly snapshot metadata 透传与 legacy fallback 已固定 | `pnpm --filter @teable/backend exec vitest run src/share-db/share-db.adapter.spec.ts src/share-db/share-db.service.spec.ts src/share-db/share-db.spec.ts` |
| Published route entry | `apps/nextjs-app/e2e/pages/published/*.spec.ts` | browser-level monitor e2e 已覆盖边界信号 | `E2E_WEBSERVER_MODE=DEV pnpm exec playwright test e2e/pages/published/published-route-entry.spec.ts --project='Desktop Chrome'` |

## 4. 适配验证状态

| 能力域 | 当前入口 | 当前状态 | 后续要求 |
| --- | --- | --- | --- |
| HTTP adapter | `apps/nestjs-backend/src/bootstrap.ts`、`packages/v2/contract-http-{express,fastify,hono}/src/index.spec.ts` | 主应用当前为 Nest 默认 Express；V2 Express/Fastify/Hono contract adapters 已覆盖 workflow 或 settings/templates/share 代表路由 | 新增主应用 Fastify application factory 后纳入 smoke matrix |
| Database mode | `apps/nestjs-backend/package.json` e2e scripts | 当前正式 e2e 以 PostgreSQL schema 为主 | 新增 SQLite focused e2e 路径后纳入 smoke matrix |
| V2 core contract | `packages/v2/core`、`packages/v2/contract-http`、`packages/v2/contract-http-implementation/src/handlers/workflows/*` | 核心 typecheck 与 focused e2e 已可独立验证，workflow schedule/webhook trigger handler 契约测试已补齐 | 将 share / template / setting 继续迁入统一契约矩阵 |

## 5. 当前结论

当前运行可观测性已有研发级和 monitor 级入口，webhook 签名后端与 OpenAPI 客户端 helper 已对齐，webhook run detail 已显示自定义 header 与签名审计摘要，run history 已提供 trigger/status/webhook audit 服务端筛选入口、webhook audit summary 计数、签名失败/缺少时间戳/请求体大小统计维度和分页明细接口，schedule upcoming runs 已显示真实未来运行时间。产品化缺口集中在真实用户态 e2e、真实产品报表页、长周期趋势分析、多适配器 smoke matrix 的 CI 化。
