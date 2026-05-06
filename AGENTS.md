# AGENTS

- Trust this file over the legacy root `agents.md` if they conflict.
- Use `pnpm` only. Root `packageManager` is `pnpm@9.13.0`, and `npm` is blocked by `engines`.
- Match CI when possible: Node `22.18.0`.

## Repo shape

- Workspace packages live in `apps/*`, `packages/*`, `packages/v2/*`, and `plugins`.
- Main app entrypoints are `apps/nextjs-app` (Next.js 16 frontend) and `apps/nestjs-backend` (Nest backend).
- `packages/openapi` is a shared API schema/client layer; backend API changes often need matching updates there.
- `packages/db-main-prisma` owns Prisma schema, migrations, seed, and client generation.
- `packages/v2/*` are private workspace packages built with `tsdown`; use `tsc --noEmit` only for typechecking.

## Local dev

- First-time setup from repo root: `pnpm install`, then `make switch-db-mode`.
- `make switch-db-mode` is interactive and also starts `teable-postgres`, waits for health, and runs `make postgres.mode`.
- Normal app dev starts from `apps/nestjs-backend`: `pnpm dev`.
- Do not start `apps/nextjs-app` separately for normal local work; the backend dev flow starts the frontend.
- Shared env files live under `apps/nextjs-app/.env*`. Prisma scripts in `packages/db-main-prisma` load env from that directory via `dotenv-flow -p ../../apps/nextjs-app`.
- Plugin preview is separate: run `pnpm build:packages` from root, then `pnpm run:plugin`.

## Verification

- If you changed Prisma schema or migrations, run `pnpm --filter @teable/db-main-prisma prisma-generate-ci` before app/package typechecks.
- CI lint/type order is:
  1. `pnpm -F @teable/db-main-prisma prisma-generate --schema ./prisma/postgres/schema.prisma`
  2. `pnpm -F "./packages/**" run build`
  3. `pnpm g:typecheck`
  4. `pnpm g:lint`
  5. `pnpm g:lint-styles`
- Fast package checks:
  - `pnpm --filter @teable/app typecheck`
  - `pnpm --filter @teable/backend typecheck`
  - `pnpm --filter @teable/openapi typecheck`
  - `pnpm --filter @teable/sdk typecheck`
- Frontend unit tests: `pnpm --filter @teable/app exec vitest run path/to/spec.tsx`
- Backend unit tests: `pnpm --filter @teable/backend exec vitest run path/to/spec.ts`

## Testing quirks

- Backend e2e is not plain `vitest`: `apps/nestjs-backend` runs `pre-test-e2e` first, which seeds via `pnpm -F @teable/db-main-prisma prisma-db-seed -- --e2e`.
- The heavy backend integration path used in CI is `make postgres.integration.test`; it starts a temporary Postgres on port `25432`, runs `make postgres.mode`, builds `packages/**`, then runs `pnpm g:test-e2e-cover`.
- Repo-wide unit-test CI intentionally excludes the backend and runs `pnpm -F "!@teable/backend" -r --parallel test-unit`.
- v2 integration coverage in CI uses `FORCE_V2_ALL=true` and `V2_COMPUTED_UPDATE_MODE=sync`; reuse those env vars when debugging v2-only behavior.
- `packages/v2/e2e` sharded coverage command is `pnpm -C packages/v2/e2e test-unit-cover -- --shard=1/4`.

## v2 conventions

- Keep framework-independent HTTP contracts in `packages/v2/contract-http`.
- Use action-style paths there, such as `/tables/createField`, `/tables/listRecords`, `/tables/rename`; do not introduce nested REST resources.
- Router packages in `packages/v2/contract-http-*` should stay thin adapters over shared contract/implementation packages.

## Frontend constraints

- In `apps/nextjs-app`, use `src/features/app/components/Chart/Chart` as the ECharts runtime entry; do not call `echarts.init(...)` from feature or page code.
- Prefer `updateMode="replace"` for chart option updates; only use `merge` when incremental merge is required.
- For chart changes, run `pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx` and `pnpm --filter @teable/app typecheck`.
- For page visual, layout, or interaction changes in `apps/nextjs-app`, read `.monkeycode/docs/design-system/DESIGN.md` first; if the task targets a specific page type and a matching file exists under `.monkeycode/docs/design-system/page-recipes/`, read that too before editing code.

## Hooks

- Pre-commit only runs `pnpm g:lint-staged-files --debug` through `lint-staged`; it is formatting help, not full verification.
- Commit messages are enforced by `pnpm commitlint --edit $1` via `.husky/commit-msg`.
