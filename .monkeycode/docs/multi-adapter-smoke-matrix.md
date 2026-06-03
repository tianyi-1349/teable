# 多适配器 Smoke Matrix

文档分层：正式输出。

## 1. 判定口径

本矩阵只记录当前仓库中有代码入口、可由本地命令验证的运行组合。未实现启动入口的组合标记为缺口，不使用推测性通过结论。

## 2. 当前矩阵

| HTTP Adapter | Database | 当前状态 | 代码证据 | 验证方式 |
| --- | --- | --- | --- | --- |
| Express | PostgreSQL | 可验证 | `apps/nestjs-backend/src/bootstrap.ts` 使用 Nest 默认 Express；`apps/nestjs-backend/package.json` 的 `pre-test-e2e` 使用 postgres prisma schema | `pnpm --filter @teable/backend pre-test-e2e && pnpm --filter @teable/backend exec vitest run --config ./vitest-e2e.config.ts <focused-e2e>` |
| Express | SQLite | 缺少正式 smoke 入口 | Prisma schema 与脚本当前以 postgres e2e 路径为主 | 需要新增 SQLite 专用 env、schema 选择与 focused e2e 命令 |
| Express contract adapter | in-memory v1 adapter smoke | 通过 | `packages/v2/contract-http-express/src/index.spec.ts` 已通过 Node HTTP server 验证 `/settings/getPublic`、`/templates/listPublished`、`/share/getView` | `pnpm --filter @teable/v2-contract-http-express exec vitest run src/index.spec.ts` |
| Fastify contract adapter | in-memory v1 adapter smoke | 通过 | `packages/v2/contract-http-fastify/src/index.spec.ts` 已通过 `fastify.inject` 验证 `/workflows/triggerSchedule`、`/workflows/triggerWebhook`、`/settings/getPublic`、`/templates/listPublished`、`/share/getView` | `pnpm --filter @teable/v2-contract-http-fastify exec vitest run src/index.spec.ts` |
| Hono contract adapter | in-memory v1 adapter smoke | 通过 | `packages/v2/contract-http-hono/src/index.spec.ts` 已通过 `Hono.request` 验证 `/settings/getPublic`、`/templates/listPublished`、`/share/getView` | `pnpm --filter @teable/v2-contract-http-hono exec vitest run src/index.spec.ts` |
| Fastify | PostgreSQL | 缺少 Nest 启动入口 | 当前 `bootstrap.ts` 未接入 `FastifyAdapter` | 需要新增 Fastify bootstrap 或测试专用 application factory |
| Fastify | SQLite | 缺少启动入口 | 当前缺少 Fastify 与 SQLite 两侧组合入口 | 需要先完成 Fastify 与 SQLite 单项入口，再组合验证 |

## 3. 当前结论

当前可真实验证的主应用组合是 Express + PostgreSQL。V2 Express/Fastify/Hono contract adapters 已有 workflow 或 settings/templates/share 代表路由独立 smoke 证据。Express + SQLite、Fastify + PostgreSQL、Fastify + SQLite 仍是主应用运行组合缺口。

## 4. 收口要求

1. 新增 adapter 组合前，先提供可复用 application factory，避免复制 `bootstrap.ts` 的中间件、Swagger、CORS 与全局 pipe/filter 配置。
2. 每个组合至少跑通 health/API smoke、认证上下文初始化、基础表记录读写、workflow focused smoke。
3. 每个组合的验证命令必须写入本矩阵，且命令能在 CI 或本地等价环境复现。

## 5. 当前验证证据

- `NODE_OPTIONS="--max-old-space-size=6144" pnpm --filter @teable/backend typecheck`：通过。
- `pnpm --filter @teable/backend exec vitest run src/features/workflow/workflow-schedule.service.spec.ts src/features/workflow/workflow.service.spec.ts`：通过。
- `pnpm --filter @teable/v2-contract-http-express exec vitest run src/index.spec.ts`：通过，覆盖 settings/templates/share 代表路由。
- `pnpm --filter @teable/v2-contract-http-fastify exec vitest run src/index.spec.ts`：通过，覆盖 workflow/settings/templates/share 代表路由。
- `pnpm --filter @teable/v2-contract-http-hono exec vitest run src/index.spec.ts`：通过，覆盖 settings/templates/share 代表路由。
