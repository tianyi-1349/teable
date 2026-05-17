# AGENTS

## Use This File

- A legacy `agents.md` exists at the repo root. If it conflicts with this file, trust `AGENTS.md`.

## Toolchain

- Use `pnpm` only. Root `packageManager` is `pnpm@9.13.0`; `npm` is explicitly disallowed.
- Match CI when possible: Node `22.18.0`.

## Repo Map

- `apps/nextjs-app`: Next.js frontend.
- `apps/nestjs-backend`: main backend; local dev starts from here.
- `packages/openapi`: shared API route/schema/client layer. Backend API changes often require matching updates here.
- `packages/sdk`: frontend/sdk helpers and shared React-side utilities.
- `packages/db-main-prisma`: Prisma schema, migrations, client generation.
- `packages/v2/*`: newer runtime/domain packages. These build with `tsdown`, not `tsc` emit.

## Documentation Layers

- Capability-inventory documentation is organized into three layers:
  1. Formal standards: execution handbooks, prompt templates, acceptance rules.
  2. Formal outputs: final inventories, summaries, gap lists, task matrices, coverage matrices, presentation materials.
  3. Historical auxiliary inputs: structure maps, historical drafts, early scan artifacts.
- When creating or updating capability-inventory docs, declare the document layer first.
- If the execution method changes, update both `capability-inventory-execution-playbook.md` and `capability-prompts.md` in the same round.
- If a formal output changes, sync the relevant gap, matrix, index, and roadmap docs before closing the task.

## Local Dev

- First-time setup follows the root README: `pnpm install` then `make switch-db-mode`.
- Start local dev from `apps/nestjs-backend` with `pnpm dev`.
- Do not start the Next app separately for normal local development; the backend dev flow starts it.
- Shared env files live under `apps/nextjs-app/.env*`, and Prisma scripts load env from that directory via `dotenv-flow`.
- Plugin dev is separate: run `pnpm build:packages`, then `pnpm run:plugin` (serves plugins on port `3002`).

## Verification Order

- If you changed Prisma schema or migrations, run `pnpm --filter @teable/db-main-prisma prisma-generate-ci` before typechecking apps/packages.
- CI lint/type flow is:
  1. `pnpm -F @teable/db-main-prisma prisma-generate --schema ./prisma/postgres/schema.prisma`
  2. `pnpm -F "./packages/**" run build`
  3. `pnpm g:typecheck`
  4. `pnpm g:lint`
  5. `pnpm g:lint-styles`
- Fast package-level checks:
  - `pnpm --filter @teable/app typecheck`
  - `pnpm --filter @teable/backend typecheck`
  - `pnpm --filter @teable/openapi typecheck`
  - `pnpm --filter @teable/sdk typecheck`
- Focused tests usually go through Vitest directly, for example:
  - `pnpm --filter @teable/backend exec vitest run path/to/spec.ts`
  - `pnpm --filter @teable/app exec vitest run path/to/spec.ts`

## Test Quirks

- `@teable/backend` e2e tests seed the database first via its `pre-test-e2e` script; do not assume `vitest` alone is enough.
- The heavy integration path used in CI is `make postgres.integration.test`.
- v2 integration coverage in CI runs with `FORCE_V2_ALL=true` and `V2_COMPUTED_UPDATE_MODE=sync`. Reuse those env vars when debugging v2-only behavior.
- Repo-wide unit-test CI intentionally excludes backend and runs `pnpm -F "!@teable/backend" -r --parallel test-unit`.

## v2 HTTP Contract Conventions

- `packages/v2/contract-http` uses action-style paths such as `/tables/createField`, `/tables/listRecords`, `/tables/rename`; do not introduce nested REST paths there.
- HTTP adapters live in `packages/v2/contract-http-*`. `contract-http-express` is a thin router wrapper over the shared contract/implementation packages.

## Hooks

- Pre-commit only runs `pnpm g:lint-staged-files`, which formats staged files through `lint-staged`/Prettier; it is not a substitute for lint/type/test.
- Commit messages are checked by `commitlint` via `.husky/commit-msg`.

## Frontend Chart Stability

- In `apps/nextjs-app`, use `features/app/components/Chart/Chart` as the only ECharts runtime entry.
- Do not call `echarts.init(...)` in feature/page code.
- Prefer `updateMode="replace"` for stable option replacement; only use `updateMode="merge"` when incremental merge is explicitly required.
- Keep chart lifecycle handling (init/reuse/resize/dispose) inside the base chart component.
- For chart-related changes, run:
  - `pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx`
  - `pnpm --filter @teable/app typecheck`
