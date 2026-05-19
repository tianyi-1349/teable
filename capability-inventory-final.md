# Final Capability Inventory

> 文档分层：正式输出。
> 
> 这份文档是当前仓库能力盘点的正式事实清单，用于评审、对齐和后续缺口判断。

## 1. 仓库已实现能力总表

### 用户与身份
定义：覆盖账号注册登录、会话、令牌、OAuth 应用和个人身份设置的完整身份体系。

- 本地账号注册与登录，含 Turnstile 校验
- 社交登录，含 GitHub、Google、OIDC
- 密码管理，含修改密码、忘记密码、重置密码、社交账号补充密码
- 邮箱变更验证码流程
- 账户注销
- Session 会话管理与登出
- OAuth2 授权服务端能力，含授权码和 PKCE
- OAuth App 管理
- Personal Access Token 管理
- Waitlist 候补与邀请
- 用户资料、语言、头像、通知元数据管理
- 最近访问记录
- 用户行为追踪

### 组织、空间与协作
定义：围绕 Space、协作者、邀请、组织信息和空间级配置形成协作工作区能力。

- Space 创建、查询、更新、删除
- Space 协作者管理
- Space 邀请链接和邮件邀请
- Space 级第三方集成配置与连通性测试
- Space 内搜索
- 组织、部门、组织用户信息查询
- Base 级协作者管理
- Base 级邀请管理

### Base / Table / Field / Record 数据核心
定义：这是仓库的业务核心，提供 Base、Table、Field、Record 的全生命周期管理和数据操作能力。

- Base CRUD、复制、模板创建、导入导出
- Base ERD 关系图
- BaseNode 树形资源结构与文件夹管理
- Table CRUD、重命名、恢复、复制、索引管理
- Field CRUD、复制、删除、类型转换、字段设置
- Record 单条与批量 CRUD、复制、粘贴、清空、重排
- Record 历史、操作日志、状态流转相关数据处理
- 记录附件管理
- 表单提交写入记录
- 富字段编辑器，含选择、关联、公式等类型
- Button 字段动作型能力

### 视图与页面表现
定义：以多视图为主线，覆盖记录展示、视图配置、筛选排序分组和页面级交互。

- Grid 视图
- Kanban 视图
- Calendar 视图
- Gallery 视图
- Form 视图
- Plugin 视图
- 统一视图工具栏
- 视图筛选、排序、分组、搜索
- 字段设置面板
- Published App 多 Shell 页面表现

### 分享、发布与公开访问
定义：将视图或 Base 以受控公开方式对外分享，或发布为独立可访问页面。

- 共享视图，含密码、只读、嵌入、访问控制
- 共享 Base 只读访问
- 从分享内容复制 Base
- Published App 发布页
- Published Manifest 与 PWA 支持

### 自动化与 Workflow
定义：面向业务流程自动化，覆盖工作流定义、运行、能力查询和执行历史。

- Workflow CRUD
- Workflow 运行
- Workflow 能力查询
- Workflow AI 草稿生成
- Workflow 脚本运行
- Workflow 运行历史与日志查询

### AI 与智能生成
定义：围绕表格数据、公式、视图上下文和模型接入，提供数据智能生成与交互能力。

- AI 流式交互
- AI 自动填充字段值
- AI 公式生成
- 视图级 AI Chat 上下文
- 多模型 AI SDK 接入层

### 导入、导出与附件
定义：支持数据进出系统以及文件对象存储相关能力。

- CSV 导入
- CSV 导出
- Base 级导入导出
- 附件签名上传、访问 URL、上传通知

### 评论、通知与协作反馈
定义：围绕记录协作过程中的评论、反馈和提醒形成闭环。

- 评论创建、查询、更新、删除
- 评论表情反应
- 评论订阅
- 通知列表与已读管理
- 实时协作状态同步
- Presence 在线状态展示

### 插件、扩展与二次开发
定义：提供插件注册、发布、嵌入和宿主通信能力，支撑二次开发。

- 插件管理、审核、发布、版本管理
- Panel 插件
- 右键菜单插件
- 图表插件视图
- Plugin Bridge 宿主通信
- 独立 Univer 插件能力

### OpenAPI、SDK 与外部集成
定义：提供 V1/V2 API 契约、前端 SDK 以及多类外部访问和系统管理接口。

- V1 OpenAPI 路由与 schema 体系
- V2 contract-http action 路由体系
- 前端 SDK hooks 与 Context 体系
- 系统设置管理
- 回收站
- Pin 置顶
- 聚合查询 API
- 图表查询 API
- 全文搜索 API
- DB 连接管理
- 选择区复制粘贴 API
- 文档 API
- Health 检查
- Dashboard API
- Pixel 数据采集
- Billing 查询
- Group Point 查询

### v2 领域内核与新架构能力
定义：面向新架构演进的 DDD、CQRS、Ports/Adapters、contract-http 和发布能力。

- CQRS Command / Query 体系
- Ports / Adapters 架构
- 多数据库驱动适配
- 多 HTTP 框架适配
- 公式到 SQL 翻译
- 计算字段插件化引擎
- 事件总线
- 表格模板体系
- v2 Published 能力

### 数据存储、schema 与持久化
定义：提供数据库模型定义、迁移、种子数据和新老 schema 类型支撑。

- Prisma 主 schema
- Prisma migrations
- 数据库 seed
- v2 Kysely schema type

### 基础设施与系统运行能力
定义：保障系统开发、运行、构建、观测和部署的底层能力。

- 权限守卫与多鉴权策略
- ShareDB 与 WebSocket 基础设施
- Redis Session 与缓存
- SMTP 发信
- 配置管理
- 日志体系
- Docker 容器化
- CI/CD 流水线
- 测试框架
- Lint / Typecheck / Format
- Git Hooks
- Makefile 任务编排

## 2. 详细能力明细

### 账号与身份体系
- 类型：用户真正可感知的功能
- 用户价值：用户可以完成注册、登录、登出、找回密码、社交登录和账户管理。
- 已实现内容：本地邮箱密码注册登录、GitHub/Google/OIDC 社交登录、密码修改与重置、邮箱变更验证码、账户注销、Session 管理、Turnstile 校验。
- 关键模块：`apps/nestjs-backend/src/features/auth`、`apps/nestjs-backend/src/features/user`、`apps/nextjs-app/src/features/app/pages/auth`
- 关键文件：`local-auth.controller.ts`、`oauth-server.controller.ts`、`turnstile.service.ts`、`LoginPage.tsx`、`ForgetPasswordPage.tsx`、`ResetPasswordPage.tsx`
- 前端/后端/契约/数据层对应关系：前端登录与账户页面调用 `openapi/src/auth/*` 与 `openapi/src/user/*`；后端由 `auth`、`user` 模块实现；数据层落在 `User`、`Account`、`Session`、`VerificationToken`。
- 完整度：完整
- 备注：本地登录、社交登录和会话体系链路完整，OAuth2 Server 与 OAuth App 管理单列为下一项能力。

### OAuth2 与访问令牌管理
- 类型：用户真正可感知的功能
- 用户价值：开发者或第三方系统可以基于 OAuth2 与 PAT 接入平台能力。
- 已实现内容：OAuth2 授权码流程、PKCE、OAuth App 创建与密钥管理、授权记录查询、PAT 创建与刷新。
- 关键模块：`apps/nestjs-backend/src/features/oauth`、`apps/nestjs-backend/src/features/access-token`、`apps/nextjs-app/src/features/app/pages/setting`
- 关键文件：`oauth-server.controller.ts`、`oauth.controller.ts`、`pkce.service.ts`、`access-token.controller.ts`、`OAuthAppPage.tsx`、`PersonAccessTokenPage.tsx`
- 前端/后端/契约/数据层对应关系：前端设置页接入 `openapi/src/oauth/*` 与 `openapi/src/access-token/*`；后端由 `oauth` 与 `access-token` 模块实现；数据层对应 `OAuthApp`、`OAuthAppSecret`、`OAuthAppAuthorized`、`OAuthAppToken`、`AccessToken`。
- 完整度：完整
- 备注：这一层同时服务内部页面和外部集成场景。

### Space 与组织协作管理
- 类型：用户真正可感知的功能
- 用户价值：团队可以创建工作空间、邀请成员、配置空间级集成并查看组织信息。
- 已实现内容：Space CRUD、协作者管理、邀请链接和邮件邀请、空间级集成配置、空间搜索、组织信息查询。
- 关键模块：`apps/nestjs-backend/src/features/space`、`apps/nestjs-backend/src/features/organization`、`apps/nextjs-app/src/features/app/blocks/space`
- 关键文件：`space.controller.ts`、`space.service.ts`、`organization.controller.ts`、`SpacePage.tsx`
- 前端/后端/契约/数据层对应关系：前端 Space 页面与设置页调用 `openapi/src/space/*`、`openapi/src/organization/*`；后端由 `space`、`organization` 实现；数据层对应 `Space`、`Collaborator`、`Invitation`、`InvitationRecord`、`Integration`、`Organization`。
- 完整度：较完整
- 备注：组织信息查询已有路由和控制器，业务覆盖面低于 Space 主链路。

### Base 与资源节点管理
- 类型：用户真正可感知的功能
- 用户价值：用户可以组织业务数据库、复制模板、维护树形资源结构并查看关系图。
- 已实现内容：Base CRUD、复制、模板创建、Base 协作者和邀请、ERD 关系图、BaseNode 树和文件夹管理。
- 关键模块：`apps/nestjs-backend/src/features/base`、`apps/nestjs-backend/src/features/base-node`、`apps/nextjs-app/src/features/app/blocks/base`、`apps/nextjs-app/src/features/app/blocks/erd`
- 关键文件：`base.controller.ts`、`base-duplicate.service.ts`、`base-node.controller.ts`、`BasePageRouter.tsx`、`BaseErd.tsx`
- 前端/后端/契约/数据层对应关系：前端 Base 页面与 ERD 页面调用 `openapi/src/base/*`、`openapi/src/base-node/*`；后端由 `base`、`base-node` 实现；数据层对应 `Base`、`BaseNode`、`BaseNodeFolder`。
- 完整度：完整
- 备注：模板创建同时依赖 v2 `table-templates` 作为预设结构来源。

### Table 生命周期与索引管理
- 类型：用户真正可感知的功能
- 用户价值：用户可以创建业务表、重命名、复制、恢复，并维护底层索引状态。
- 已实现内容：Table CRUD、默认视图、重命名、删除、恢复、复制、索引查询与维护。
- 关键模块：`apps/nestjs-backend/src/features/table`、`packages/v2/core/src/commands`
- 关键文件：`table-open-api.controller.ts`、`table.service.ts`、`table-index.service.ts`、`CreateTableCommand.ts`、`DeleteTableCommand.ts`
- 前端/后端/契约/数据层对应关系：前端 Table 页面经 SDK 调用 `openapi/src/table/*`；后端 V1 路由在 `table` 模块，V2 action 在 `contract-http` 中；数据层主表为 `TableMeta`。
- 完整度：完整
- 备注：V1 和 V2 均已落地，V2 范围仍在扩展。

### Field 生命周期与字段设置
- 类型：用户真正可感知的功能
- 用户价值：用户可以配置字段类型、格式、验证、复制、删除与转换。
- 已实现内容：Field CRUD、复制、删除、类型转换、字段设置面板、字段 AI 相关入口。
- 关键模块：`apps/nestjs-backend/src/features/field`、`apps/nextjs-app/src/features/app/components/field-setting`、`packages/v2/core/src/commands`
- 关键文件：`field-open-api.controller.ts`、`field-converting.service.ts`、`field-deleting.service.ts`、`FieldSetting.tsx`
- 前端/后端/契约/数据层对应关系：前端字段设置面板调用 `openapi/src/field/*`；后端由 `field` 模块实现；V2 对应 `createField/updateField/deleteField/duplicateField`；数据层对应 `Field`。
- 完整度：完整
- 备注：公式 AI 单独归入 AI 能力，字段设置本身已是成熟主链路。

### Record 数据操作与批量编辑
- 类型：用户真正可感知的功能
- 用户价值：用户可以完成记录的新增、编辑、批量修改、复制粘贴、排序和清空等高频表格操作。
- 已实现内容：Record 单条和批量 CRUD、复制、粘贴、清空、区间删除、重排、导入写入。
- 关键模块：`apps/nestjs-backend/src/features/record`、`packages/v2/core/src/commands`、`packages/sdk/src/hooks`
- 关键文件：`record-open-api.controller.ts`、`record-create.service.ts`、`record-update.service.ts`、`record-duplicate.service.ts`、`use-record.ts`、`use-records.ts`
- 前端/后端/契约/数据层对应关系：前端六种视图通过 SDK hooks 调用 `openapi/src/record/*`；后端 V1 在 `record` 模块，V2 在 `records.*` action；数据层以 `Record`、`Ops` 为主。
- 完整度：完整
- 备注：这是仓库最稳定的数据主链路之一。

### Record 历史、操作日志与回溯
- 类型：用户真正可感知的功能
- 用户价值：用户可以追踪记录变化、查看差异并定位数据修改过程。
- 已实现内容：Record history 查询、历史快照读取、字段级 diff、操作日志读取。
- 关键模块：`apps/nestjs-backend/src/features/record/record-history`、`apps/nestjs-backend/src/features/record`
- 关键文件：`record-history.controller.ts`、`record-open-api.controller.ts`
- 前端/后端/契约/数据层对应关系：前端记录详情页可消费 history 与 ops 数据；后端路由通过 `openapi/src/record/history/*` 与 `openapi/src/record/ops.ts` 暴露；数据层对应 `RecordHistory`、`Ops`。
- 完整度：完整
- 备注：这里保留代码已经明确支持的查询能力，系统级审计日志放到支撑能力章节。

### 附件上传与文件型记录值
- 类型：用户真正可感知的功能
- 用户价值：用户可以给记录上传文件、预览附件并获得可访问链接。
- 已实现内容：签名上传、S3 URL 获取、上传通知、附件编辑与预览。
- 关键模块：`apps/nestjs-backend/src/features/attachments`、`apps/nextjs-app/src/features/app/components/cell-editor`、`packages/v2/core/src/commands`
- 关键文件：`attachments.controller.ts`、`attachments.service.ts`、`AttachmentEditor.tsx`、`AttachmentPreview.tsx`、`SetRecordAttachmentCommand.ts`
- 前端/后端/契约/数据层对应关系：前端附件单元格编辑器调用 `openapi/src/attachments/*`；后端由 `attachments` 模块实现；记录附件值写入 `Record`，附件元信息落在 `Attachment`。
- 完整度：完整
- 备注：对象存储适配属于系统支撑能力，在第 3 节单列。

### 多视图展示体系
- 类型：用户真正可感知的功能
- 用户价值：同一份数据可以用网格、看板、日历、画廊、表单和插件视图多种方式使用。
- 已实现内容：Grid、Kanban、Calendar、Gallery、Form、Plugin 六类视图，以及基础视图 CRUD。
- 关键模块：`apps/nextjs-app/src/features/app/views`、`apps/nestjs-backend/src/features/view`、`packages/sdk/src`、`packages/openapi/src/view`
- 关键文件：`GridView.tsx`、`KanbanView.tsx`、`CalendarView.tsx`、`GalleryView.tsx`、`FormView.tsx`、`PluginView.tsx`、`view-open-api.controller.ts`
- 前端/后端/契约/数据层对应关系：前端视图组件消费 `openapi/src/view/*`；后端由 `view` 模块持久化和操作；数据层以 `View` 为主，配置关联 `Field`、`TableMeta`。
- 完整度：完整
- 备注：Plugin View 与插件系统相连，但作为用户可见视图保留在本能力下。

### 视图配置与字段展示控制
- 类型：用户真正可感知的功能
- 用户价值：用户可以筛选、排序、分组、搜索、调整字段可见性和展示方式。
- 已实现内容：ViewToolbar、Filter、Sort、Group、Search、RowHeight、字段设置联动、移动端工具栏。
- 关键模块：`apps/nextjs-app/src/features/app/components/view-toolbar`、`apps/nestjs-backend/src/features/view`
- 关键文件：`ViewToolbar.tsx`、`ViewFilter.tsx`、`ViewSort.tsx`、`ViewGroup.tsx`、`ViewSearch.tsx`、`view-open-api.controller.ts`
- 前端/后端/契约/数据层对应关系：前端视图工具栏调用 `openapi/src/view/*` 下 filter/sort/group 相关路由；后端 `view` 模块负责保存配置；数据层配置最终附着在 `View`。
- 完整度：完整
- 备注：搜索在视图层的实时过滤和系统级全文搜索是两条能力链路，这里保留视图内链路。

### 表单视图与数据收集
- 类型：用户真正可感知的功能
- 用户价值：用户可以把表结构发布成填写表单，外部提交会直接写入记录。
- 已实现内容：表单视图渲染、表单编辑器、字段拖拽、必填项、隐藏项、提交逻辑、分享入口。
- 关键模块：`apps/nextjs-app/src/features/app/views/form`、`apps/nestjs-backend/src/features/view`
- 关键文件：`FormView.tsx`、`FormEditor.tsx`、`useFormSubmit.ts`、`view/form-*.ts`
- 前端/后端/契约/数据层对应关系：前端 Form 视图与提交页调用 `openapi/src/view/form-*.ts` 和 record 写入接口；后端仍归 `view` 和 `record` 模块；数据最终进入 `Record`。
- 完整度：完整
- 备注：它同时连接视图层和记录写入层，是高价值业务链路。

### 分享视图与公开访问
- 类型：用户真正可感知的功能
- 用户价值：用户可以将视图安全地分享给外部访问者，并控制访问方式。
- 已实现内容：View Share 开关、密码、只读、嵌入、导出、下载、访问控制与公开页渲染。
- 关键模块：`apps/nestjs-backend/src/features/share`、`apps/nextjs-app/src/features/app/pages/share`
- 关键文件：`share.controller.ts`、`ShareViewPage.tsx`、`openapi/src/share/view-*.ts`
- 前端/后端/契约/数据层对应关系：前端 `/share/[shareId]/view` 调用 `openapi/src/share/view-*.ts`；后端 `share` 模块处理公开访问；数据层对应 `ShareView`。
- 完整度：完整
- 备注：这是公开访问能力中最完整的一条链路。

### 分享 Base 与复制到新 Base
- 类型：用户真正可感知的功能
- 用户价值：用户可以共享整个 Base 的只读内容，并从共享内容复制出新 Base。
- 已实现内容：Base Share 公开访问、公开鉴权、公开数据读取、从分享内容复制 Base。
- 关键模块：`apps/nestjs-backend/src/features/share`、`apps/nextjs-app/src/features/app/pages/share`
- 关键文件：`share.controller.ts`、`BaseShareAuthPage.tsx`、`openapi/src/share/base-*.ts`、`openapi/src/share/base-copy.ts`
- 前端/后端/契约/数据层对应关系：前端分享页面调用 `share/base-*` 路由；后端 `share` 模块实现；数据层对应 `ShareBase` 与新建 `Base`。
- 完整度：完整
- 备注：复制分享 Base 实际落到 Base 创建链路。

### Published App 发布页
- 类型：用户真正可感知的功能
- 用户价值：用户可以将数据页面发布为独立页面，以更强的阅读和展示形态对外使用。
- 已实现内容：Published Grid、Kanban、Calendar、Gallery、Design 五类 Shell，外加导航与运行时包装。
- 关键模块：`apps/nextjs-app/src/features/app/blocks/published`、`packages/v2/published`
- 关键文件：`PublishedApp.tsx`、`PublishedAppWrapper.tsx`、`PublishedGridView.tsx`、`PublishedCalendarView.tsx`、`PublishedKanbanProvider.tsx`
- 前端/后端/契约/数据层对应关系：前端由 Published 页面运行时驱动；后端数据仍来自视图和记录链路；v2 `published` 包提供新架构演进支撑。
- 完整度：较完整
- 备注：前端发布页完整，v2 发布域仍在继续演进。

### Workflow 自动化
- 类型：用户真正可感知的功能
- 用户价值：用户可以定义自动化流程，让数据变化或外部触发自动驱动动作执行。
- 已实现内容：Workflow CRUD、复制、运行、能力查询、脚本执行、运行历史与日志。
- 关键模块：`apps/nestjs-backend/src/features/workflow`、`packages/v2/core/src/modules/workflow`、`apps/nextjs-app/src/features/app/automation`
- 关键文件：`workflow.controller.ts`、`workflow-runner.service.ts`、`workflow-capability.service.ts`、`runtime.data.service.ts`
- 前端/后端/契约/数据层对应关系：前端流程编辑器调用 `openapi/src/automation/*`；后端 `workflow` 模块执行；数据层包括 `Workflow`、`WorkflowAction`、`WorkflowTrigger`、`WorkflowRun`、`WorkflowRunLog`。
- 完整度：完整
- 备注：工作流能力已经形成独立业务域。

### Workflow AI 草稿生成
- 类型：用户真正可感知的功能
- 用户价值：用户可以用自然语言生成自动化流程初稿，降低配置门槛。
- 已实现内容：AI 生成 workflow draft 的后端路由与生成服务。
- 关键模块：`apps/nestjs-backend/src/features/workflow`
- 关键文件：`workflow-ai.service.ts`、`workflow.controller.ts`、`openapi/src/automation/workflow/ai-create-draft.ts`
- 前端/后端/契约/数据层对应关系：前端自动化页面可调用 `openapi/src/automation/workflow/ai-create-draft.ts` 定义的草稿生成路由；后端生成草稿结构；草稿可继续进入 `Workflow` 持久化链路。
- 完整度：较完整
- 备注：代码能支撑草稿生成能力，复杂编排质量属于模型效果层，不纳入仓库能力判断。

### AI 记录与视图智能辅助
- 类型：用户真正可感知的功能
- 用户价值：用户可以用 AI 填充值、生成公式并围绕当前视图数据提问。
- 已实现内容：AI 流式对话、字段自动填充、公式生成、视图上下文 AI Chat。
- 关键模块：`apps/nestjs-backend/src/features/ai`、`apps/nestjs-backend/src/features/field/field-calculate`、`apps/nextjs-app/src/features/app/components/ai-chat`
- 关键文件：`ai.controller.ts`、`ai.service.ts`、`ai-strategy.service.ts`、`ai-formula.service.ts`、`AIChatDrawer.tsx`
- 前端/后端/契约/数据层对应关系：前端 AI 入口调用 `openapi/src/ai/*` 与 `openapi/src/field/ai-generate-formula.ts`；后端由 `ai` 与字段计算模块提供；数据基础来自 `TableMeta`、`Field`、`Record`。
- 完整度：完整
- 备注：这里聚焦用户层智能能力，多模型接入能力放到系统支撑能力补充说明。

### CSV 与 Base 导入导出
- 类型：用户真正可感知的功能
- 用户价值：用户可以把外部数据导入系统，也可以把当前数据导出或整体迁移。
- 已实现内容：CSV 导入、URL 导入、就地追加导入、CSV 导出、Base 级导入导出。
- 关键模块：`apps/nestjs-backend/src/features/import`、`apps/nestjs-backend/src/features/export`、`apps/nestjs-backend/src/features/base`
- 关键文件：`import.controller.ts`、`export.controller.ts`、`base.controller.ts`、`useCSVImport.ts`
- 前端/后端/契约/数据层对应关系：前端导入导出按钮调用 `openapi/src/import/*`、`openapi/src/export/*`、`openapi/src/base/export-base.ts`、`import-base.ts`；后端分别由 `import`、`export`、`base` 实现；数据最终落在 `Base/TableMeta/Field/Record`。
- 完整度：完整
- 备注：导入导出链路与数据核心强耦合，覆盖范围完整。

### 评论与通知反馈
- 类型：用户真正可感知的功能
- 用户价值：用户可以围绕记录展开讨论、接收提醒并追踪互动状态。
- 已实现内容：评论 CRUD、表情反应、评论订阅、通知列表、通知已读和全部已读。
- 关键模块：`apps/nestjs-backend/src/features/comment`、`apps/nestjs-backend/src/features/notification`、`packages/v2/core/src/commands`
- 关键文件：`comment-open-api.controller.ts`、`notification.controller.ts`
- 前端/后端/契约/数据层对应关系：前端记录详情和通知组件调用 `openapi/src/comment/create.ts`、`get-list.ts`、`update.ts`、`delete.ts`、`comment/reaction/*`、`comment/subscribe/*` 和 `notification/get-list.ts`、`update-status.ts`、`read-all.ts`；后端由 `comment`、`notification` 模块实现；评论主路由集中在 `api/comment/:tableId`；数据层对应 `Comment`、`CommentReaction`、`Notification`。
- 完整度：完整
- 备注：评论能力在 V1 与 V2 均有覆盖，用户主链路已完整。

### 实时协作与在线状态
- 类型：用户真正可感知的功能
- 用户价值：多人协作时可以看到协同编辑、在线状态和位置反馈。
- 已实现内容：ShareDB OT 协作、WebSocket 推送、Presence 在线状态、协作者头像和状态展示。
- 关键模块：`apps/nestjs-backend/src/features/share-db`、`packages/sdk/src/hooks`、`packages/sdk/src/context/presence`
- 关键文件：`share-db.service.ts`、`share-db.gateway.ts`、`useCollaborate.ts`、`usePresence.ts`
- 前端/后端/契约/数据层对应关系：前端协作 hooks 与 Presence 组件消费实时通道；后端提供 ShareDB 和网关；数据层主要围绕 OT 操作和会话态。
- 完整度：完整
- 备注：它是多用户数据编辑体验的系统级显性能力。

### 撤销重做与选择区操作
- 类型：用户真正可感知的功能
- 用户价值：用户可以在表格式操作中安全回退，并进行接近电子表格体验的复制粘贴。
- 已实现内容：Undo、Redo、选择区复制、粘贴、删除、SelectionToOperation 转换。
- 关键模块：`apps/nestjs-backend/src/features/undo-redo`、`apps/nestjs-backend/src/features/selection`、`packages/sdk/src/context/selection`
- 关键文件：`undo-redo.controller.ts`、`selection.controller.ts`、`use-selection.ts`、`SelectionContext.tsx`
- 前端/后端/契约/数据层对应关系：前端 Grid 选择区与撤销重做入口调用 `openapi/src/undo-redo/*`、`openapi/src/selection/*`；后端 `undo-redo` 与 `selection` 模块执行；数据层依赖操作栈与 `Ops`。
- 完整度：完整
- 备注：它与 Grid 体验强关联，也是表格产品的重要基础能力。

### 插件管理与宿主扩展
- 类型：用户真正可感知的功能
- 用户价值：平台可以通过插件机制增加面板、菜单、图表或其他扩展能力。
- 已实现内容：插件 CRUD、审核、发布、版本管理、Panel 插件、右键菜单插件、图表插件、Plugin Bridge。
- 关键模块：`apps/nestjs-backend/src/features/plugin`、`packages/plugins`、`packages/sdk/src/context/plugin-bridge`
- 关键文件：`plugin.controller.ts`、`PluginPanelPage.tsx`、`PluginChartPage.tsx`、`use-plugin-bridge.ts`、`PluginBridge.tsx`
- 前端/后端/契约/数据层对应关系：前端插件管理页与插件渲染页调用 `openapi/src/plugin/*`；后端 `plugin` 模块提供管理接口；数据层对应 `Plugin`、`PluginRelease`、`PluginVersion`。
- 完整度：完整
- 备注：独立 Univer 插件已存在代码基础，成熟度低于主插件体系。

### 系统管理与外围接口
- 类型：用户真正可感知的功能
- 用户价值：管理员和集成方可以管理系统设置、回收站、Dashboard、全文搜索和外围查询接口。
- 已实现内容：系统设置、回收站、Pin、Dashboard API、全文搜索、聚合查询、图表查询、文档 API、DB 连接管理、Health、Pixel、Billing、Group Point。
- 关键模块：`apps/nestjs-backend/src/features/setting`、`trash`、`pin`、`dashboard`、`search`、`aggregation`、`chat`、`doc`、`db-connection`、`health`、`pixel`、`billing`、`group-point`
- 关键文件：`setting-open-api.controller.ts`、`trash.controller.ts`、`dashboard.controller.ts`、`search.controller.ts`、`aggregation-open-api.controller.ts`、`chat.controller.ts`
- 前端/后端/契约/数据层对应关系：前端管理页和业务页调用对应 `openapi/src/*` 子域；系统设置相关契约位于 `openapi/src/admin/setting/*`，计费相关契约位于 `openapi/src/billing/subscription/*`；后端各 feature 模块各自承载；系统设置主入口为 `api/admin/setting`，健康检查主入口为 `health`；数据层分散在 `Setting`、`Trash`、`Pin`、`Dashboard`、`Billing`、`Pixel` 等模型。
- 完整度：较完整
- 备注：其中 Billing、组织信息、独立 Univer 插件属于覆盖较浅的能力点。

## 3. 系统级支撑能力

- 权限与鉴权
  - `packages/core/src/auth` 定义动作、角色和权限类型。
  - `apps/nestjs-backend/src/features/auth/guard` 提供 Session、Bearer Token、PAT、OAuth Access Token、匿名访问等多策略守卫。
- schema 校验
  - `packages/openapi` 用 Zod 定义路由入参出参与 DTO。
  - V1 API、前端 SDK 和后端控制器围绕同一套 schema 工作。
- 命令查询分离
  - `packages/v2/core/src/commands` 与 `packages/v2/core/src/queries` 形成显式 CQRS 结构。
  - Base、Table、Field、Record、Comment、Undo/Redo 等核心域已有 Command/Query 落地。
- 实时通信
  - ShareDB、WebSocket gateway、Presence hook 共同支撑多人协作。
- undo/redo
  - `features/undo-redo` 与 v2 `UndoCommand`、`RedoCommand` 已形成前后端闭环。
- 事件驱动
  - v2 `events/` 提供事件总线和领域事件定义。
  - Workflow、计算字段、部分异步处理基于事件或运行时触发机制扩展。
- 插件桥接
  - `packages/sdk/src/context/plugin-bridge` 与 `packages/plugins` 提供宿主到插件的通信标准层。
- API 类型契约
  - V1 `packages/openapi` 与 V2 `packages/v2/contract-http` 共同构成两代 API 契约体系。
- 观测与日志
  - 结构化日志、异常过滤器、请求拦截器、OpenTelemetry、Sentry 共同提供观测能力。
- 队列与异步任务
  - 仓库结构地图已明确 `nestjs-backend` 存在 BullMQ 队列角色；Workflow 运行、邮件发送、部分后台处理具备异步执行基础。
- 文件与对象存储
  - `features/attachments` 提供签名上传、访问 URL、上传通知和对象存储接入点。
- 多模型 AI 接入层
  - `packages/ai-sdk` 封装多家模型供应商，支撑 AI 流式交互、自动填充和公式生成。
- 国际化
  - `packages/common-i18n`、`packages/i18n-keys`、前后端 i18n service/provider 形成多语言支撑。
- 持久化与迁移
  - Prisma schema、migrations、seed 和 v2 db schema type 共同支撑数据层演进。

## 4. 高价值能力链路

- 能力：本地登录与注册
  - 前端入口：`/auth/login`、`/auth/signup`
  - API / OpenAPI：`POST /api/auth/signin`、`POST /api/auth/signup`；`openapi/src/auth/signin.ts`、`signup.ts`
  - 后端实现：`features/auth/local-auth/local-auth.controller.ts`、`local-auth.service.ts`
  - 数据或领域层：`User`、`Account`、`Session`
  - 说明：用户身份进入系统的基础链路，前后端和 schema 关系清晰。

- 能力：OAuth2 授权与 OAuth App 管理
  - 前端入口：`/setting/oauth-app`、`/oauth/decision`
  - API / OpenAPI：`openapi/src/oauth/*`
  - 后端实现：`oauth-server.controller.ts`、`oauth.controller.ts`、`pkce.service.ts`
  - 数据或领域层：`OAuthApp`、`OAuthAppSecret`、`OAuthAppAuthorized`、`OAuthAppToken`
  - 说明：同时具备 Provider 能力和 Client 管理能力。

- 能力：Space 协作管理
  - 前端入口：`/space/*`、Space 设置页
  - API / OpenAPI：`openapi/src/space/*`
  - 后端实现：`space.controller.ts`、`space.service.ts`
  - 数据或领域层：`Space`、`Collaborator`、`Invitation`、`Integration`
  - 说明：形成工作区、成员、邀请和集成的统一入口。

- 能力：Base 创建与资源树管理
  - 前端入口：`/base/[baseId]/*`
  - API / OpenAPI：`openapi/src/base/*`、`openapi/src/base-node/*`
  - 后端实现：`base.controller.ts`、`base-node.controller.ts`
  - 数据或领域层：`Base`、`BaseNode`、`BaseNodeFolder`
  - 说明：承接所有业务数据容器和节点组织关系。

- 能力：Table 与 Field 管理
  - 前端入口：Table 页、字段设置面板
  - API / OpenAPI：`openapi/src/table/*`、`openapi/src/field/*`
  - 后端实现：`table-open-api.controller.ts`、`field-open-api.controller.ts`
  - 数据或领域层：`TableMeta`、`Field`
  - 说明：表结构与字段结构链路成熟，V1/V2 双轨并行。

- 能力：Record 批量编辑
  - 前端入口：Grid、Kanban、Gallery、Calendar 等视图中的记录编辑
  - API / OpenAPI：`openapi/src/record/*`
  - 后端实现：`record-open-api.controller.ts` 与各 record service
  - 数据或领域层：`Record`、`Ops`
  - 说明：这是仓库最核心的数据写入和变更链路。

- 能力：表单提交写入记录
  - 前端入口：Form 视图与公开表单页
  - API / OpenAPI：`openapi/src/view/form-*.ts` 与 record 写入接口
  - 后端实现：`view` 模块加 `record` 模块
  - 数据或领域层：`View`、`Record`
  - 说明：把视图层能力直接转化为外部数据收集入口。

- 能力：视图筛选排序分组搜索
  - 前端入口：所有视图顶部 `ViewToolbar`
  - API / OpenAPI：`openapi/src/view/*`
  - 后端实现：`view-open-api.controller.ts`
  - 数据或领域层：`View`
  - 说明：构成多视图可用性的关键配置链路。

- 能力：共享视图公开访问
  - 前端入口：`/share/[shareId]/view`
  - API / OpenAPI：`openapi/src/share/view-*.ts`
  - 后端实现：`share.controller.ts`
  - 数据或领域层：`ShareView`、`View`、`Record`
  - 说明：分享功能链路完整，公开页能力成熟。

- 能力：共享 Base 与复制
  - 前端入口：`/share/[shareId]/base/auth`
  - API / OpenAPI：`openapi/src/share/base-*.ts`、`base-copy.ts`
  - 后端实现：`share.controller.ts`
  - 数据或领域层：`ShareBase`、`Base`
  - 说明：把公开访问和数据复用串成完整业务链路。

- 能力：Published App 发布页
  - 前端入口：`/published/{baseId}/{viewId}`
  - API / OpenAPI：底层复用 view / record 数据接口
  - 后端实现：数据仍由 `view`、`record` 等模块提供，v2 `published` 负责新架构演进
  - 数据或领域层：`View`、`Record`
  - 说明：用户可把数据页面发布为独立展示站点。

- 能力：Workflow 自动化
  - 前端入口：WorkflowNodePage
  - API / OpenAPI：`openapi/src/automation/workflow/create.ts`、`get-list.ts`、`get.ts`、`update.ts`、`delete.ts`、`duplicate.ts`、`activate.ts`、`deactivate.ts`、`get-capabilities.ts`、`get-run-list.ts`、`get-run.ts`、`test-run.ts`
  - 后端实现：`workflow.controller.ts`、`workflow-runner.service.ts`
  - 数据或领域层：`Workflow`、`WorkflowAction`、`WorkflowTrigger`、`WorkflowRun`
  - 说明：已具备定义、运行、回放和能力查询的完整流程域。

- 能力：AI 自动填充与公式生成
  - 前端入口：字段设置与 AI Chat 入口
  - API / OpenAPI：`openapi/src/ai/*`、`openapi/src/field/ai-generate-formula.ts`
  - 后端实现：`ai.service.ts`、`ai-strategy.service.ts`、`ai-formula.service.ts`
  - 数据或领域层：`Field`、`Record`
  - 说明：AI 能力直接服务数据录入和数据建模场景。

- 能力：CSV 导入导出
  - 前端入口：Table 工具栏导入导出按钮
  - API / OpenAPI：`openapi/src/import/*`、`openapi/src/export/*`
  - 后端实现：`import.controller.ts`、`export.controller.ts`
  - 数据或领域层：`Import`、`TableMeta`、`Field`、`Record`
  - 说明：连接外部文件数据与内部表数据。

- 能力：评论与通知
  - 前端入口：Record 详情侧栏、顶部通知组件
  - API / OpenAPI：`openapi/src/comment/create.ts`、`get-list.ts`、`update.ts`、`delete.ts`、`reaction/create-reaction.ts`、`reaction/delete-reaction.ts`、`subscribe/create-subscribe.ts`、`subscribe/delete-subscribe.ts`、`notification/get-list.ts`、`notification/update-status.ts`、`notification/read-all.ts`
  - 后端实现：`comment-open-api.controller.ts`、`notification.controller.ts`
  - 数据或领域层：`Comment`、`CommentReaction`、`Notification`
  - 说明：形成记录协作反馈闭环。

- 能力：实时协作与 Presence
  - 前端入口：`useCollaborate`、`usePresence` 绑定的表格界面
  - API / OpenAPI：实时链路以 ShareDB / WebSocket 为主
  - 后端实现：`share-db.service.ts`、`share-db.gateway.ts`
  - 数据或领域层：OT 操作、会话态、Presence 状态
  - 说明：直接决定多人编辑体验。

- 能力：插件管理与 Plugin Bridge
  - 前端入口：插件管理页、Plugin View、Panel 插件入口
  - API / OpenAPI：`openapi/src/plugin/*`
  - 后端实现：`plugin.controller.ts`
  - 数据或领域层：`Plugin`、`PluginRelease`、`PluginVersion`
  - 说明：支撑平台扩展和二次开发。

- 能力：V1 OpenAPI 与前端 SDK
  - 前端入口：全站业务页面统一使用 SDK hooks
  - API / OpenAPI：`packages/openapi/src/*`
  - 后端实现：NestJS V1 controllers
  - 数据或领域层：Prisma 模型和 DTO schema
  - 说明：它是当前主业务链路最稳定的契约层。

- 能力：V2 contract-http 与 CQRS
  - 前端入口：新架构逐步接入的业务域
  - API / OpenAPI：`packages/v2/contract-http/src/contract.ts`
  - 后端实现：`contract-http-express` 适配器加 v2 core command/query
  - 数据或领域层：`packages/v2/core`
  - 说明：这是仓库新架构的演进主线。

## 5. 最终结论

1. 这个仓库最核心的能力版图是一个以 Base、Table、Field、Record 为中心的数据协作平台，上层叠加多视图展示、公开分享、自动化 Workflow、AI 辅助和插件扩展，下层由 OpenAPI、SDK、Prisma 和 v2 CQRS 架构共同支撑。
2. 已经形成体系化实现的能力包括：身份体系、Space 协作、Base/Table/Field/Record 主数据链路、多视图体系、分享视图、导入导出、评论通知、实时协作、V1 OpenAPI 契约和前端 SDK。这些能力在前端入口、后端路由、契约层和数据层之间都有明确映射。
3. 处于局部落地或演进中状态的能力主要包括：组织信息域、Billing、独立 Univer 插件、Published 的 v2 侧实现、v2 contract-http 全量覆盖、v2 多数据库与多 HTTP 适配、公式到 SQL 翻译、事件总线和计算字段引擎。这些部分已有清晰代码骨架和局部落地，但覆盖范围和主业务渗透率仍低于 V1 成熟链路。
