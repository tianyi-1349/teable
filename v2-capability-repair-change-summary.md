# V2 Capability Repair Change Summary

> 文档分层：正式输出。

## 1. 本轮目标

本轮围绕以下一致性与稳定性问题做连续收口：

1. `apps/nestjs-backend/src/features/v2/v2.controller.ts` 去掉 `ts-nocheck` 并恢复类型安全
2. 补齐 View、Comment、Workflow、Share、Template、Published App、Setting 的第一批 v2 公开入口
3. 补齐 Aggregation / Search 的 table 级 v2 公开入口
4. 补齐 Undo / Redo 的统一 v2 公开契约入口
5. 统一 generic `createV2OrpcRouter` 的显式边界表达
6. 同步恢复 `v2-contract-http` 与 `v2-contract-http-implementation` 的包级 typecheck

## 2. 主要代码改动

### 2.1 Nest `api/v2` 主入口

- 文件：`apps/nestjs-backend/src/features/v2/v2.controller.ts`
- 完成内容：
  - 去掉 `// @ts-nocheck`
  - 将 `@Implement(v2Contract.xxx)` 收窄为精确子路由对象
  - 统一错误分支为 `throwOrpcErrorByStatus(...)`
  - 接入新增 `tables.getRowCount`、`tables.getRecordIndex`、`tables.getSearchCount`、`tables.getSearchIndex`、`tables.undo`、`tables.redo`
  - 接入此前补齐的 `views.*`、`comments.*`、`share.*`、`templates.*`、`settings.*`、`workflows.*`、`publishedApps.*`

### 2.2 V2 Contract 层

- 文件：`packages/v2/contract-http/src/contract.ts`
- 完成内容：
  - `v2Contract` 使用 `as const satisfies AnyContractRouter`
  - 新增 `tables.getRowCount`
  - 新增 `tables.getRecordIndex`
  - 新增 `tables.getSearchCount`
  - 新增 `tables.getSearchIndex`
  - 新增 `tables.undo`
  - 新增 `tables.redo`

- 新增 contract 文件：
  - `packages/v2/contract-http/src/table/getRowCount.ts`
  - `packages/v2/contract-http/src/table/getRecordIndex.ts`
  - `packages/v2/contract-http/src/table/getSearchCount.ts`
  - `packages/v2/contract-http/src/table/getSearchIndex.ts`
  - `packages/v2/contract-http/src/table/undo.ts`
  - `packages/v2/contract-http/src/table/redo.ts`

### 2.3 Contract Implementation 层

- 文件：`packages/v2/contract-http-implementation/src/router.ts`
- 完成内容：
  - 接入新增 `tables.getRowCount`
  - 接入新增 `tables.getRecordIndex`
  - 接入新增 `tables.getSearchCount`
  - 接入新增 `tables.getSearchIndex`
  - 接入新增 `tables.undo`
  - 接入新增 `tables.redo`
  - 将 comment、share、publishedApps、settings、templates、workflows 的 Nest-only 报错实现收束为统一 helper

- 新增 handler 文件：
  - `packages/v2/contract-http-implementation/src/handlers/tables/getRowCount.ts`
  - `packages/v2/contract-http-implementation/src/handlers/tables/getRecordIndex.ts`
  - `packages/v2/contract-http-implementation/src/handlers/tables/getSearchCount.ts`
  - `packages/v2/contract-http-implementation/src/handlers/tables/getSearchIndex.ts`
  - `packages/v2/contract-http-implementation/src/handlers/tables/undo.ts`
  - `packages/v2/contract-http-implementation/src/handlers/tables/redo.ts`

### 2.4 API Surface 输出契约收口

- 文件范围：
  - `packages/v2/contract-http/src/workflow/*`
  - `packages/v2/contract-http/src/share/*`
  - `packages/v2/contract-http/src/comment/*`
  - `packages/v2/contract-http/src/template/*`
  - `packages/v2/contract-http/src/setting/*`
  - `packages/v2/contract-http/src/published-app/*`
  - `packages/v2/contract-http-implementation/src/handlers/{workflows,share,comments,template,setting,published-app}/*`
- 完成内容：
  - 将高价值公开接口的 response data 从 `unknown` / `unknown[]` 收紧到现有 `@teable/openapi` DTO 或本地显式 DTO
  - 将 implementation handler 的 service 返回签名从 `Promise<unknown>` 收紧到显式 DTO
  - 在成功分支统一补 `safeParse` 输出校验，非法输出统一返回 500
  - `share` 公开面已补齐只读与核心交互入口的输出契约收口
  - `workflow` 公开面已补齐读取、CRUD、lifecycle、test run 的输出契约收口
  - `comment`、`template`、`setting`、`published-app` 已补齐高价值公开面的输出契约收口

### 2.5 共享动态值表达收口

- 文件：
  - `packages/v2/contract-http/src/shared/json.ts`
  - `packages/v2/contract-http/src/shared/http.ts`
  - `packages/v2/contract-http/src/table/recordDto.ts`
  - `packages/v2/contract-http/src/table/updateField.ts`
  - `packages/v2/contract-http/src/table/explainCommand.ts`
- 完成内容：
  - 新增共享递归 `jsonValueSchema`
  - 将错误详情 schema、record dto runtime schema、field 更新事件变更值 schema、explain command 中的动态参数 schema 统一改为显式 JSON 值表达
  - 保持对外 TypeScript DTO 的兼容宽度，避免把底层动态字段强行收成单一静态结构

### 2.6 模块依赖与构建配置

- 文件：`apps/nestjs-backend/src/features/v2/v2.module.ts`
- 完成内容：
  - 接入 `AggregationOpenApiModule`
  - 接入 `UndoRedoStackModule`
  - 注册 `UndoRedoService`

- 文件：
  - `packages/v2/contract-http/tsconfig.json`
  - `packages/v2/contract-http-implementation/tsconfig.json`
  - `packages/v2/contract-http/package.json`
  - `packages/v2/contract-http-implementation/package.json`
- 完成内容：
  - 显式补 `@teable/openapi` workspace 依赖
  - 显式补 `@teable/openapi` 的 `paths` 映射
  - 将 `../../openapi/src` 加入 `include`
  - 将 `dom.iterable` 加入 `compilerOptions.lib`

## 3. 文档与知识同步

- 正式输出已更新：
  - `capability-gap-list.md`
  - `capability-gap-task-matrix.md`
  - `v1-v2-coverage-matrix.md`

- 项目记忆已更新：
  - `.monkeycode/MEMORY.md`
  - 新增 `v2-contract-http` 跨包类型依赖约束
  - 新增 generic router 显式 Nest adapter 边界约束

## 4. 验证结果

本轮已完成以下验证：

1. `pnpm --filter @teable/v2-contract-http typecheck`
2. `pnpm --filter @teable/v2-contract-http-implementation typecheck`
3. `pnpm --filter @teable/backend typecheck`

当前三项均已通过。

本轮新增导出面验证：

4. `packages/v2` 下 `*.ts/*.tsx/*.mts/*.cts` 已清零 `export * from`（grep 结果 `No files found`）
5. `pnpm -r --filter "./packages/v2/**" typecheck` 全量通过（38 个 v2 workspace 包）

补充验证结论：

1. `packages/v2/contract-http-implementation/src/handlers` 中已无 `Promise<unknown>` / `=> unknown`
2. `packages/v2/contract-http/src` 中剩余 `z.unknown()` 仅保留在 `table/dto.ts`
3. 本轮已验证 `v2-contract-http` 与 `v2-contract-http-implementation` 当前处于稳定绿色类型状态
4. 本轮尝试继续收紧 `table/dto.ts` 的 `shareMeta`、`options`、`filter.value` 后，已确认会触发更深层的 view schema 导出缺口与 `IFilterDTO` / `FilterSetType` 结构不一致，因此已回退到当前稳定状态

## 5. 当前剩余边界

当前剩余事项已经从“隐性断层”转成“显式边界”：

1. comment、share、publishedApps、settings、templates、workflows 在 generic router 中仍显式依赖 Nest adapter
2. billing / usage 当前仍缺主仓内稳定 backend 事实源，继续保留为仓库边界受限项
3. 更深层的 Workflow、Share / Published、Ports / Adapters 全域统一已转入路线图治理，而不是本轮继续扩大改动面
4. `packages/v2/contract-http/src/table/dto.ts` 中仍保留 3 处动态配置边界：`shareMeta`、`options`、`filter.value`，当前缺少单一稳定上游 schema，继续收紧会扩大到 filter / view 底层类型统一工作，因此本轮保持边界表达

## 6. 可直接复用的评审表述

这轮改动把 `api/v2`、`contract-http`、`contract-http-implementation` 和 generic router 四层链路重新对齐，完成了 Aggregation / Search、Undo / Redo 与 Workflow / Share / Comment / Template / Setting / Published App 高价值公开面的输出契约收口，并把高层 Nest-only 能力的边界表达统一成显式约束，同时恢复并保持了相关包的包级 typecheck。
