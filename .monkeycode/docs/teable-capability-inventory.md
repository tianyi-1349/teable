# Teable 项目能力清单（结构化盘点）

## 一、项目结构类型

1. 双主应用架构
2. `apps/nextjs-app`：Next.js 前端主应用（`@teable/app`）
3. `apps/nestjs-backend`：NestJS 后端主应用（`@teable/backend`）
4. `plugins`：独立 Next.js 插件应用（`@teable/plugin`）
5. `packages/*`：共享基础库（core/openapi/sdk/ui/db 等）
6. `packages/v2/*`：新一代领域与契约分层能力（core/contract/adapter/import/e2e 等）

## 二、产品功能能力（业务域）

1. 基础数据底座能力（Base、Table、Field、Record）
2. 视图与展示能力（Grid、Gallery、Kanban、Form、Dashboard）
3. 分享与发布能力（Share、Publish、Base Share）
4. 导入导出能力（Import、Export、CSV、批量处理）
5. 权限与治理能力（Auth、Access Token、Organization、Space、Collaborator）
6. 通知与消息能力（Notification、Comment、Chat）
7. 模板能力（Template、Table templates）
8. 回收站能力（Trash）
9. 撤销重做能力（Undo/Redo）
10. 集成与插件能力（Plugin、Plugin panel、Plugin context menu、官方 chart plugin）
11. AI 能力（多模型接入、流式生成、模型配置、网关模型）
12. App Mode 能力（base 级配置读取/更新、治理规则校验、工作流联动编辑）
13. OAuth 能力（第三方登录与授权流）
14. 邀请与协作能力（Invitation/Member 协作）
15. 健康检查能力（Health）
16. 完整性检查能力（Integrity）

## 三、后端平台能力（NestJS 层）

1. 模块化后端架构（`app.module.ts` 注册大量 feature module）
2. OpenAPI 接口分层模块（field/template/import/export/setting/comment 等）
3. BullMQ 异步任务队列能力（Redis 条件启用）
4. WebSocket 实时通信能力（`WsModule`）
5. 事件驱动能力（EventEmitter + Listener）
6. 可观测性能力（OpenTelemetry + Sentry）
7. 配置中心能力（ConfigModule + 分环境配置）
8. 统一异常与校验能力（CustomHttpException、ZodValidationPipe）
9. 后端 AI provider 适配能力（OpenAI/Anthropic/Google/Azure/Cohere/Mistral/DeepSeek/XAI/TogetherAI/Ollama/OpenRouter/AI Gateway 等）
10. 流式响应与错误归一化能力（AI stream read failure normalization）

## 四、前端平台能力（Next.js + React 层）

1. React Query 数据请求与缓存能力
2. 多语言能力（i18next / next-i18next）
3. 富交互能力（DnD、虚拟列表、表格拖拽、Flow、Calendar）
4. 可视化能力（ECharts、Recharts）
5. 复杂表格编辑能力（`@glideapps/glide-data-grid`）
6. 组件体系能力（`@teable/ui-lib` + Radix + Tailwind）
7. 主题与设计系统能力（light/dark/system + shadcn 样式体系）
8. 前端监控能力（Sentry for Next.js）
9. 工作流面板与 app-mode 编辑联动能力（Workflow Panel + AppModeConfigEditorCard）
10. 分享页/嵌入页能力（plugins 中 sheet-form-view）

## 五、共享库能力（packages/*）

1. `@teable/core`：核心领域模型、规则、表达式、基础类型与校验
2. `@teable/openapi`：接口 schema、客户端定义、契约导出
3. `@teable/sdk`：前端业务 SDK、hooks、编辑器与交互逻辑
4. `@teable/ui-lib`：设计系统组件库、样式与动效基础设施
5. `@teable/db-main-prisma`：Prisma schema/migration/seed/client 生成
6. `@teable/common-i18n`：国际化公共资源
7. `@teable/icons`：图标资源
8. `@teable/formula`：公式计算相关能力
9. `@teable/i18n-keys`：i18n key 统一管理能力

## 六、v2 体系能力（packages/v2/*）

1. `v2-core`：新一代领域核心能力（命令/查询/规则）
2. `v2-contract-http`：HTTP 合同层（动作式路径）
3. `v2-contract-http-implementation`：合同实现层（router + handler）
4. `v2-contract-http-client`：客户端访问层
5. `v2-contract-http-{express,fastify,hono}`：多框架适配层
6. `v2-contract-http-openapi`：OpenAPI 生成层
7. `v2-di`：依赖注入容器能力
8. DB 适配器能力（pg/pglite/postgresjs/shared）
9. Repository 适配能力（adapter-repository-postgres、table-repository）
10. 实时协作适配能力（sharedb、broadcastchannel）
11. 日志适配能力（console、pino）
12. Undo/Redo 存储适配能力（keyv）
13. 导入能力（`v2-import`，含 csv/xlsx）
14. 调试与开发工具能力（`v2-devtools`、`v2-debug-data`、`v2-command-explain`）
15. 模板能力（`v2-table-templates`）
16. E2E 验证能力（`v2-e2e`）
17. 性能基准能力（`v2-benchmark-node`）
18. Postgres schema 能力（`v2-postgres-schema`）

## 七、数据与存储能力

1. Prisma ORM 能力
2. PostgreSQL 主存储能力
3. Redis 缓存/队列能力
4. Keyv 多存储抽象能力（含 sqlite/redis）
5. 对象存储能力（AWS S3 SDK）

## 八、实时协作与通信能力

1. Sharedb 实时协作能力
2. WebSocket + SockJS 相关通信能力
3. Reconnecting WebSocket 前端重连能力
4. 事件流处理能力（stream parser / SSE-like 场景）

## 九、观测与运维能力

1. Sentry 错误追踪（前后端）
2. OpenTelemetry 指标/日志/trace 输出
3. health endpoint 健康探针
4. 构建体积与分发检查能力（size-limit、es-check）

## 十、工程与质量保障能力

1. pnpm monorepo 工作区能力
2. TypeScript 全仓类型检查能力（`g:typecheck`）
3. ESLint + Prettier 统一规范能力
4. lint-staged + husky 提交前质量门禁
5. Vitest 单元/集成测试能力
6. 后端 e2e + 数据种子预置能力
7. Playwright（前端端到端测试基础）
8. 自动发布脚本能力（beta/next/latest）
9. 代码生成与 schema 输出能力（OpenAPI types、Prisma generate）
10. 多包并行构建能力（workspace 并行脚本）

## 十一、插件生态能力

1. 独立插件前端运行时（Next.js）
2. 表单/表格视图插件能力（sheet-form-view）
3. 插件与主应用共享 SDK/UI/Core/OpenAPI 能力
4. 插件国际化能力
