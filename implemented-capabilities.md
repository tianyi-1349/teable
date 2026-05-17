# Implemented Capabilities Draft

> 这份文档是仓库能力盘点的历史初稿，基于 `/workspace/repo-structure-map.md` 和当时的代码扫描结果整理，当前主要作为后续 `GPT-5.5` 正式收口时的辅助输入。
>
> 文档分层：历史辅助输入。

## 1. 能力总览

全仓库已实现的能力分为 14 大类，共约 120 项细分能力：

1. **用户与身份** — 本地/社交登录、OAuth2 Server/Client、PAT 令牌、Waitlist、账户注销
2. **组织与空间** — Space CRUD、组织查询、协作者管理、邀请链路、集成管理
3. **Base/Table/Field/Record 数据核心** — Base CRUD + 发布 + ERD、Table CRUD + 索引、Field 全生命周期 + 类型转换 + AI 填充、Record CRUD + 批量 + 历史 + 表单 + 附件 + 按钮
4. **多视图** — Grid/Form/Kanban/Gallery/Calendar/Plugin 六种视图 + 统一工具栏 + 搜索 + 字段设置
5. **分享与发布** — View 分享 (20+ 端点)、Base 分享 (auth/数据/复制)、Published App 五 Shell + Manifest + PWA
6. **自动化与 Workflow** — CRUD + 运行 + AI 草稿 + 能力查询 + 脚本运行 + 运行历史
7. **AI 与智能生成** — 流式生成、字段/记录 AI 填充、公式 AI、视图上下文、10+ AI SDK 多供应商
8. **导入导出** — CSV 导入(文件/URL/就地追加)、CSV 导出、Base 导入导出
9. **评论/通知/协作** — 评论 CRUD + 表情 + 订阅、通知管理、ShareDB 实时协作
10. **插件与扩展** — 插件开发/审核/发布、面板/右键菜单/图表插件、Plugin Bridge、独立 Univer 插件
11. **OpenAPI/SDK/外部集成** — V1 OpenAPI 45 子域 200+ 路由、V2 HTTP 合约 30+ action、SDK 55 Hook + 16 Context
12. **v2 领域内核** — DDD + CQRS (60+ Command/30+ Query)、Port/Adapter 架构、多 DB 驱动、多 HTTP 框架、Formula-to-PG SQL 翻译
13. **数据存储与持久化** — 48 Prisma 模型、Kysely V2 Schema Type、Computed Update Outbox 机制
14. **实时协作/UndoRedo/History/Search/Aggregation** — ShareDB WebSocket、Keyv undo/redo 栈、记录历史、全文搜索、多维聚合

---

## 2. 详细能力清单

### [用户与身份] 本地账号注册与登录
- 能力说明: 邮箱+密码注册账号并登录，支持 Turnstile 人机验证
- 主要实现位置: backend `features/auth/local-auth/`
- 关键文件: `local-auth.controller.ts` (POST signin/signup), `local-auth.service.ts`; 前端 `pages/LoginPage.tsx`, `SignForm.tsx`, `TurnstileWidget.tsx`; OpenAPI `auth/signin.ts, signup.ts`
- 前端入口: `/auth/login` (LoginPage), `/auth/signup`
- 后端入口: `POST /api/auth/signin`, `POST /api/auth/signup`
- OpenAPI/SDK/Schema 对应: `openapi/src/auth/signin.ts` (SigninRoute); Schema: `User` + `Account` 模型
- 成熟度: 完整

### [用户与身份] 社交账号登录 (GitHub/Google/OIDC)
- 能力说明: 支持 GitHub OAuth、Google OAuth 2.0、通用 OIDC 三种社交登录方式
- 主要实现位置: backend `features/auth/social/{github,google,oidc}/`
- 关键文件: `github.controller.ts`, `google.controller.ts`, `oidc.controller.ts`; 前端 `components/SocialAuth.tsx`; 策略 `strategies/{github,google,oidc}.strategy.ts`
- 前端入口: LoginPage 中的 SocialAuth 按钮组
- 后端入口: `GET /api/auth/github`, `GET /api/auth/google`, `GET /api/auth/oidc`
- OpenAPI/SDK/Schema 对应: 复用 signin 路由
- 成熟度: 完整

### [用户与身份] 密码管理 (修改/重置/添加)
- 能力说明: 修改密码、邮件重置密码、社交登录用户添加密码
- 主要实现位置: backend `features/auth/local-auth/local-auth.controller.ts`
- 关键文件: `local-auth.controller.ts` (PATCH change-password, POST send-reset-password-email, POST reset-password, POST add-password); OpenAPI `auth/change-password.ts, reset-password.ts, add-password.ts, send-reset-password-email.ts`
- 前端入口: `ForgetPasswordPage.tsx`, `ResetPasswordPage.tsx`
- 后端入口: `PATCH /api/auth/change-password`, `POST /api/auth/send-reset-password-email`, `POST /api/auth/reset-password`
- OpenAPI/SDK/Schema 对应: `openapi/src/auth/change-password.ts` 等
- 成熟度: 完整

### [用户与身份] 邮箱变更 (验证码流程)
- 能力说明: 发送验证码到新邮箱完成邮箱变更
- 主要实现位置: backend `features/auth/local-auth/local-auth.controller.ts`
- 关键文件: `local-auth.controller.ts` (POST send-change-email-code, PATCH change-email); OpenAPI `auth/change-email.ts, send-change-email-code.ts`
- 后端入口: `POST /api/auth/send-change-email-code`, `PATCH /api/auth/change-email`
- OpenAPI/SDK/Schema 对应: `openapi/src/auth/change-email.ts`
- 成熟度: 完整

### [用户与身份] 账户注销
- 能力说明: 永久删除自己的账户
- 主要实现位置: backend `features/user/delete-user.service.ts`
- 关键文件: `auth/auth.controller.ts` (DELETE user), `delete-user.service.ts`; OpenAPI `auth/delete.ts`
- 后端入口: `DELETE /api/auth/delete`
- OpenAPI/SDK/Schema 对应: `openapi/src/auth/delete.ts`
- 成熟度: 完整

### [用户与身份] Session 管理
- 能力说明: 基于 express-session 的会话管理，支持 Redis/SQLite 存储
- 主要实现位置: backend `features/auth/session/`
- 关键文件: `session.service.ts`, `session-handle.service.ts`, `session-store.service.ts`; OpenAPI `auth/signout.ts`
- 后端入口: `POST /api/auth/signout`
- OpenAPI/SDK/Schema 对应: `openapi/src/auth/signout.ts`
- 成熟度: 完整

### [用户与身份] OAuth2 Server (授权服务)
- 能力说明: 作为 OAuth2 Provider 提供授权码流程 (Authorization Code Grant)，支持 PKCE
- 主要实现位置: backend `features/oauth/`
- 关键文件: `oauth-server.controller.ts` (GET /authorize, POST /token), `oauth.service.ts`, `pkce.service.ts`; 前端 `OAuthAppDecisionPage.tsx`; Schema: `OAuthApp, OAuthAppAuthorized, OAuthAppSecret, OAuthAppToken`
- 前端入口: `/oauth/decision`
- 后端入口: `POST /api/oauth/token`
- OpenAPI/SDK/Schema 对应: `openapi/src/oauth/` (11 个路由)
- 成熟度: 完整

### [用户与身份] OAuth2 Client 管理
- 能力说明: 创建和管理自己的 OAuth2 App (Client)，生成/删除密钥，查看授权列表
- 主要实现位置: backend `features/oauth/`
- 关键文件: `oauth.controller.ts` (CRUD); 前端 `setting/oauth-app/OAuthAppPage.tsx`
- 前端入口: `/setting/oauth-app`
- 后端入口: `POST /api/oauth/client`, `GET /api/oauth/client`, `DELETE /api/oauth/client/{clientId}`
- OpenAPI/SDK/Schema 对应: `openapi/src/oauth/` 全部 11 个路由
- 成熟度: 完整

### [用户与身份] Personal Access Token (PAT)
- 能力说明: 创建长效访问令牌，支持 scopes/spaceIds/baseIds/expiredTime
- 主要实现位置: backend `features/access-token/`
- 关键文件: `access-token.controller.ts` (CRUD + refresh); 前端 `setting/access-token/PersonAccessTokenPage.tsx`; OpenAPI `access-token/`; Schema: `AccessToken`
- 前端入口: `/setting/personal-access-token`
- 后端入口: `POST /api/access-token`, `GET /api/access-token`, `POST /api/access-token/{tokenId}/refresh`
- OpenAPI/SDK/Schema 对应: `openapi/src/access-token/`
- 成熟度: 完整

### [用户与身份] Waitlist 候补名单
- 能力说明: 未注册用户加入候补名单，已有用户邀请他人
- 主要实现位置: backend `features/auth/local-auth/local-auth.controller.ts`
- 关键文件: `local-auth.controller.ts` (POST join-waitlist, GET waitlist, POST invite-waitlist, POST waitlist-invite-code); 前端 `waitlist/WaitlistPage.tsx`; OpenAPI `auth/waitlist/`; Schema: `Waitlist`
- 前端入口: `/waitlist`
- 后端入口: `POST /api/auth/join-waitlist`, `GET /api/auth/waitlist`
- OpenAPI/SDK/Schema 对应: `openapi/src/auth/waitlist/`
- 成熟度: 完整

### [用户与身份] 用户偏好管理
- 能力说明: 更新个人名称、头像、语言偏好、通知元数据
- 主要实现位置: backend `features/user/user.controller.ts`
- 关键文件: `user.controller.ts` (PATCH name/avatar/lang/notify-meta); OpenAPI `user/update-name.ts, update-avatar.ts, update-lang.ts, update-notify-meta.ts`; Schema: `User`
- 后端入口: `PATCH /api/user/name`, `PATCH /api/user/avatar`, `PATCH /api/user/lang`, `PATCH /api/user/notify-meta`
- OpenAPI/SDK/Schema 对应: `openapi/src/user/`
- 成熟度: 完整

### [用户与身份] 最近访问记录
- 能力说明: 记录和查询用户最近访问的 Base/Space/BaseNode
- 主要实现位置: backend `features/user/last-visit/`
- 关键文件: `last-visit.controller.ts`; OpenAPI `user/last-visit/`; Schema: `UserLastVisit`
- 前端入口: Space 首页最近访问列表
- 后端入口: `GET /api/user/last-visit`, `PATCH /api/user/last-visit`
- OpenAPI/SDK/Schema 对应: `openapi/src/user/last-visit/`
- 成熟度: 完整

### [用户与身份] 用户行为追踪
- 能力说明: 收集用户行为事件用于分析
- 主要实现位置: backend `features/user/tracking/tracking.controller.ts`
- 关键文件: `tracking.controller.ts`; OpenAPI `user/track-event.ts`
- 后端入口: `POST /api/user/track-event`
- OpenAPI/SDK/Schema 对应: `openapi/src/user/track-event.ts`
- 成熟度: 完整

### [用户与身份] 全局权限/角色体系
- 能力说明: 定义系统级和业务级权限角色 (space/base/table 级操作权限矩阵)
- 主要实现位置: `packages/core/src/auth/`, backend `features/auth/permission.service.ts`
- 关键文件: `packages/core/src/auth/actions.ts`, `permission/`, `role/`, `types.ts`; backend `guard/` (7 种 strategy), `decorators/`; `features/authority-matrix/authority-policy.service.ts`
- 前端入口: SDK permission hooks 控制 UI
- OpenAPI/SDK/Schema 对应: `sdk/src/hooks/use-permission*`
- 成熟度: 完整

### [用户与身份] Turnstile 人机验证
- 能力说明: 注册/登录通过 Cloudflare Turnstile 防机器人
- 主要实现位置: backend `features/auth/turnstile.service.ts`
- 关键文件: `turnstile.service.ts`; 前端 `components/TurnstileWidget.tsx`
- 成熟度: 完整

---

### [组织与空间] Space CRUD
- 能力说明: 创建/查询/更新/删除工作空间，支持永久删除
- 主要实现位置: backend `features/space/`
- 关键文件: `space.controller.ts`, `space.service.ts`; 前端 `blocks/space/SpacePage.tsx`; OpenAPI `space/`; Schema: `Space`
- 前端入口: `/space` (SpacePage)
- 后端入口: `POST /api/space/`, `GET /api/space/`, `PATCH /api/space/{spaceId}`, `DELETE /api/space/{spaceId}`
- OpenAPI/SDK/Schema 对应: `openapi/src/space/`
- 成熟度: 完整

### [组织与空间] 空间协作者管理
- 能力说明: 在空间级别添加/查询/更新/删除协作者
- 主要实现位置: backend `features/space/space.controller.ts`
- 关键文件: `space.controller.ts` (collaborator-add/delete/get-list/update); OpenAPI `space/collaborator-*.ts`; Schema: `Collaborator`
- 前端入口: 空间设置 CollaborativePage
- 后端入口: `POST /api/space/{spaceId}/collaborator`, `GET /api/space/{spaceId}/collaborator`
- OpenAPI/SDK/Schema 对应: `openapi/src/space/collaborator-*.ts`
- 成熟度: 完整

### [组织与空间] 空间邀请管理 (链接+邮件)
- 能力说明: 创建邀请链接、发送邮件邀请、管理邀请链接
- 主要实现位置: backend `features/space/space.controller.ts`
- 关键文件: `space.controller.ts` (invitation-*); 前端 `pages/invite/index.tsx`; OpenAPI `space/invitation-*.ts`; Schema: `Invitation, InvitationRecord`
- 前端入口: `/invite` (邀请确认页)
- 后端入口: `POST /api/space/{spaceId}/invitation/link/create`, `POST /api/space/{spaceId}/invitation/email`
- OpenAPI/SDK/Schema 对应: `openapi/src/space/invitation-*.ts`
- 成熟度: 完整

### [组织与空间] 空间第三方集成管理 (LLM)
- 能力说明: 管理空间级别的 LLM 集成配置并测试连接
- 主要实现位置: backend `features/space/space.controller.ts`
- 关键文件: `space.controller.ts` (integration-*); OpenAPI `space/integration-*.ts, test-llm-integration.ts`; Schema: `Integration`
- 前端入口: 空间设置 Integration 页
- 后端入口: `POST /api/space/{spaceId}/integration`, `POST /api/space/{spaceId}/integration/test-llm`
- OpenAPI/SDK/Schema 对应: `openapi/src/space/integration-*.ts`
- 成熟度: 完整

### [组织与空间] 空间搜索
- 能力说明: 在空间内搜索 Base/Table 等资源
- 主要实现位置: backend `features/space/space.controller.ts`
- 关键文件: `space.controller.ts` (search); OpenAPI `space/search.ts`
- 后端入口: `GET /api/space/{spaceId}/search`
- OpenAPI/SDK/Schema 对应: `openapi/src/space/search.ts`
- 成熟度: 完整

### [组织与空间] 组织信息查询
- 能力说明: 查询用户所属组织、部门列表、组织内用户详情
- 主要实现位置: backend `features/organization/`
- 关键文件: `organization.controller.ts`; OpenAPI `organization/get-me.ts, departments.ts, user-get.ts`
- 后端入口: `GET /api/organization/me`, `GET /api/organization/departments`, `GET /api/organization/user/{userId}`
- OpenAPI/SDK/Schema 对应: `openapi/src/organization/`
- 成熟度: 局部实现

---

### [数据核心] Base CRUD
- 能力说明: 创建/查询/更新/软删除 Base，支持排序、永久删除、权限
- 主要实现位置: backend `features/base/`; v2 `core/src/commands/CreateBaseCommand.ts`
- 关键文件: `base.controller.ts` (CRUD + 27 端点); 前端 `blocks/base/base-side-bar/BasePageRouter.tsx`; OpenAPI `base/` (27 路由); Schema: `Base`; v2: `/bases/create`, `/bases/list`
- 前端入口: Space 页 BaseList -> BasePage
- 后端入口: `POST /api/base/`, `GET /api/base/{baseId}`, `PATCH /api/base/{baseId}`, `DELETE /api/base/{baseId}`
- OpenAPI/SDK/Schema 对应: `openapi/src/base/` + v2 `bases.create`, `bases.list`
- 成熟度: 完整 (V1+V2 双实现)

### [数据核心] Base 协作者管理
- 能力说明: Base 级别添加/查询/更新/删除协作者
- 主要实现位置: backend `features/base/base.controller.ts`
- 关键文件: `base.controller.ts` (collaborator-add/delete/get-list/get-list-user/update); OpenAPI `base/collaborator-*.ts`
- 后端入口: `POST /api/base/{baseId}/collaborator`, `GET /api/base/{baseId}/collaborator`
- OpenAPI/SDK/Schema 对应: `openapi/src/base/collaborator-*.ts`
- 成熟度: 完整

### [数据核心] Base 邀请管理
- 能力说明: Base 级别创建邀请链接/邮件邀请
- 主要实现位置: backend `features/base/base.controller.ts`
- 关键文件: `base.controller.ts` (invitation-create-link/delete-link/email/get-link-list/update-link); OpenAPI `base/invitation-*.ts`
- 后端入口: `POST /api/base/{baseId}/invitation/link/create`, `POST /api/base/{baseId}/invitation/email`
- OpenAPI/SDK/Schema 对应: `openapi/src/base/invitation-*.ts`
- 成熟度: 完整

### [数据核心] Base 复制
- 能力说明: 完整复制一个 Base 及其内全部 Table/Field/View/Record
- 主要实现位置: backend `features/base/base-duplicate.service.ts`
- 关键文件: `base.controller.ts` (POST duplicate), `base-duplicate.service.ts`; OpenAPI `base/duplicate.ts`
- 后端入口: `POST /api/base/{baseId}/duplicate`
- OpenAPI/SDK/Schema 对应: `openapi/src/base/duplicate.ts`
- 成熟度: 完整

### [数据核心] 从模板创建 Base
- 能力说明: 基于预定义模板创建新 Base
- 主要实现位置: backend `features/base/base.controller.ts`
- 关键文件: `base.controller.ts` (POST create-from-template); OpenAPI `base/create-from-template.ts`; 模板: `v2/table-templates/src/templates/` (10 种: Todo/CRM/ProjectTracker/BugTriage/HR/ContentCalendar/PersonalFinance/AllFieldTypes/AllBaseFields/Simple)
- 后端入口: `POST /api/base/{baseId}/create-from-template`
- OpenAPI/SDK/Schema 对应: `openapi/src/base/create-from-template.ts`
- 成熟度: 完整

### [数据核心] Base ERD (实体关系图)
- 能力说明: 可视化显示 Base 内 Table 间关系 (ReactFlow)
- 主要实现位置: 前端 `blocks/erd/`
- 关键文件: `BaseErd.tsx`, `DynamicBaseErd.tsx`, `BaseErdTableNode.tsx`, `SelfConnectingEdge.tsx`; 后端 `base.controller.ts` (GET erd); OpenAPI `base/erd.ts`
- 前端入口: Base 设计视图 ERD 图
- 后端入口: `GET /api/base/{baseId}/erd`
- OpenAPI/SDK/Schema 对应: `openapi/src/base/erd.ts`
- 成熟度: 完整

### [数据核心] BaseNode 树形结构管理
- 能力说明: 管理 Base 下资源节点树 (Table/Dashboard/Workflow 为叶子，文件夹为容器)
- 主要实现位置: backend `features/base-node/`
- 关键文件: `base-node.controller.ts` (GET list/tree, POST create/duplicate, PUT update/move, DELETE permanent); 前端 `BaseNodePageSwitch.tsx`; OpenAPI `base-node/`; Schema: `BaseNode`
- 前端入口: BaseNodePageSwitch 按节点类型路由分发
- 后端入口: `GET /api/base/{baseId}/node`, `POST /api/base/{baseId}/node`, `GET /api/base/{baseId}/node/tree`
- OpenAPI/SDK/Schema 对应: `openapi/src/base-node/`
- 成熟度: 完整

### [数据核心] BaseNode Folder CRUD
- 能力说明: 创建/更新/删除 BaseNode 文件夹
- 主要实现位置: backend `features/base-node/folder/`
- 关键文件: `base-node-folder.controller.ts` (POST/PATCH/DELETE); OpenAPI `base-node/folder/`; Schema: `BaseNodeFolder`
- 后端入口: `POST /api/base/{baseId}/node/folder`, `PATCH /api/base/{baseId}/node/folder/{folderId}`
- OpenAPI/SDK/Schema 对应: `openapi/src/base-node/folder/`
- 成熟度: 完整

### [数据核心] Table CRUD + 索引管理
- 能力说明: CRUD Table + DB表名/索引(激活/异常/修复/开关)/权限/默认视图
- 主要实现位置: backend `features/table/`; v2 `core/src/commands/` (Create/Delete/Duplicate/Rename/Restore)
- 关键文件: `table-open-api.controller.ts` (18 方法), `table.service.ts`, `table-index.service.ts`; OpenAPI `table/` (18 路由); Schema: `TableMeta`
- 前端入口: `blocks/table/Table.tsx`
- 后端入口: `POST /api/base/{baseId}/table`, `GET /api/base/{baseId}/table`
- OpenAPI/SDK/Schema 对应: `openapi/src/table/`; v2: `/tables/create, list, get, rename, delete, restore, duplicateTable`
- 成熟度: 完整 (V1+V2 双实现)

### [数据核心] Field 全生命周期 + 类型转换 + AI 填充
- 能力说明: CRUD + 复制 + 类型转换 + 批量删除 + AI 自动填充 + 关联筛选
- 主要实现位置: backend `features/field/`; v2 `core/src/commands/` (Create/Update/Delete/Duplicate)
- 关键文件: `field-open-api.controller.ts` (17 方法), `field-converting.service.ts`, `field-creating.service.ts`, `field-deleting.service.ts`, `field-duplicate.service.ts`; 前端 `components/field-setting/`; OpenAPI `field/` (12 路由); Schema: `Field`
- 前端入口: Table header 右键字段 FieldSetting 面板
- 后端入口: `POST /api/table/{tableId}/field`, `GET /api/table/{tableId}/field`
- OpenAPI/SDK/Schema 对应: `openapi/src/field/`; v2: `/tables/createField, updateField, deleteField, duplicateField`
- 成熟度: 完整 (V1+V2 双实现)

### [数据核心] Record CRUD + 批量操作
- 能力说明: 单条/批量增删改查 + 复制 + 表单提交 + 附件 + AI 填充 + 按钮 + 协作者 + 状态
- 主要实现位置: backend `features/record/`; v2 `core/src/commands/` (CreateRecord/CreateRecords/UpdateRecord/UpdateRecords/DeleteRecords/DuplicateRecord/Paste/Clear/DeleteByRange/ReorderRecords/ImportCsv)
- 关键文件: `record-open-api.controller.ts` (20 方法); `record-create/delete/update/duplicate/modify.service.ts`; OpenAPI `record/` (18 路由); Schema: `Ops, RecordHistory`
- 前端入口: SDK hooks (use-record), 6 种视图
- 后端入口: `POST /api/table/{tableId}/record`, `GET /api/table/{tableId}/record`
- OpenAPI/SDK/Schema 对应: `openapi/src/record/`; v2: 15+ action routes
- 成熟度: 完整 (V1+V2 双实现)

### [数据核心] Record 历史 (快照 + 差异)
- 能力说明: 查询记录修改历史快照和字段级差异对比
- 主要实现位置: backend `features/record/record-history/`
- 关键文件: `record-history.controller.ts` (GET); OpenAPI `record/history/`; Schema: `RecordHistory`
- 后端入口: `GET /api/table/{tableId}/record/{recordId}/history/{historyId}`, `GET /api/table/{tableId}/record/{recordId}/history`
- OpenAPI/SDK/Schema 对应: `openapi/src/record/history/`
- 成熟度: 完整

### [数据核心] 记录附件管理 (URL/S3 签名上传/宽格式)
- 能力说明: 上传附件预览图/完整文件，获取签名 URL，多存储后端
- 主要实现位置: backend `features/attachments/`; v2 `core/src/commands/SetRecordAttachmentCommand.ts`
- 关键文件: `attachments.controller.ts` (POST upload-notify, GET s3-url, GET s3-sign-url, POST signature, GET notifies); 前端 `AttachmentCropDialog.tsx`, `custom/AttachmentEditor.tsx`, `AttachmentPreview.tsx`; v2 plugin-computed `Attachment.worker.ts`
- 后端入口: `POST /api/attachments/signature`, `GET /api/attachments/s3-sign-url`
- OpenAPI/SDK/Schema 对应: `openapi/src/attachments/` (5 路由)
- 成熟度: 完整

### [数据核心] 表单数据收集
- 能力说明: 通过表单视图收集用户提交的数据写入 Table，含必需验证、下载预览、表单控件适配、头像/缩放/layout
- 主要实现位置: 前端 `features/app/views/form/`
- 关键文件: `FormView.tsx`, `FormViewBase.tsx`, `FormPreviewer.tsx`, `useFormSubmit.ts`
- 前端入口: 表单视图 -> 表单提交页
- 成熟度: 完整

### [数据核心] 选择/关联/公式字段 UI
- 能力说明: SelectEditor/LinkEditor/FormulaEditor 等富字段编辑器 (超 30 种 field editor 组件)
- 主要实现位置: 前端 `features/app/components/cell-editor/`
- 关键文件: `field-editors/index.ts` (注册 35+ 编辑器), `condition-editor/ConditionEditor.tsx`, `EditorWrapper.tsx`
- 前端入口: Record 内嵌编辑 + EditorWrapper
- 成熟度: 完整

### [数据核心] 按钮字段 (Button Field)
- 能力说明: 按钮字段触发特定动作（如发送邮件/打开链接/调用 webhook）
- 主要实现位置: 前端 `features/app/blocks/base/duplicate/transform/` + v2 plugin-computed
- 关键文件: `ButtonField.tsx`, `button-field.plugin.ts`; backend `button-action/button-action.module.ts`
- 前端入口: Table 中 Button 单元格
- 成熟度: 完整

---

### [多视图] 网格视图 (Grid)
- 能力说明: 类电子表格的行列视图，支持内联编辑、排序、分组、冻结列、列宽拖拽、颜色标定、表格统计、验证、卡片模式、手机适配、独立窗口、右键菜单、批量粘贴、行高、行拖拽、多级分组、看板集成 GridPrefilling
- 主要实现位置: 前端 `features/app/views/grid/`
- 关键文件: `GridView.tsx`, `GridToolbar.tsx`, `useGridData.ts`, `useGridNavTab.ts`, `hooks/use-grid-columns.ts`; SDK `features/app/blocks/view/grid/` (60+ 组件/文件); 后端 `features/view/view-open-api.controller.ts`
- 前端入口: 网格视图 + ViewToolbar 工具带
- 后端入口: `GET/POST/PATCH/DELETE /api/table/{tableId}/view` (view-open-api)
- OpenAPI/SDK/Schema 对应: `openapi/src/view/` (18+ 路由, 含 view, grid, kanban, gallery, calendar, form, plugin)
- 成熟度: 完整

### [多视图] 看板视图 (Kanban)
- 能力说明: 卡片式看板视图，按字段分组拖拽排序，支持无分组、堆叠、卡片模板、分割栈
- 主要实现位置: 前端 `features/app/views/kanban/`
- 关键文件: `KanbanView.tsx`, `KanbanStack.tsx`, `useKanbanData.ts`, `useKanbanNavTab.ts`, `DragDropProvider.tsx`; SDK `blocks/view/kanban/`; OpenAPI `view/kanban-*.ts`
- 前端入口: 看板视图
- 后端入口: `POST /api/table/{tableId}/view/kanban/{viewId}/move`, `PUT /api/table/{tableId}/view/kanban/{viewId}/update`
- OpenAPI/SDK/Schema 对应: `openapi/src/view/kanban-*.ts`
- 成熟度: 完整

### [多视图] 日历视图 (Calendar)
- 能力说明: 日历时间视图，按月/周/日显示记录，支持日程拖拽
- 主要实现位置: 前端 `features/app/views/calendar/`
- 关键文件: `CalendarView.tsx`, `CalendarToolbar.tsx`, `HoverCalendar.tsx`; SDK `blocks/view/calendar/`; OpenAPI `view/calendar-*.ts`
- 前端入口: 日历视图
- 后端入口: `POST /api/table/{tableId}/view/calendar/{viewId}/set-date-range`, `POST /api/table/{tableId}/view/calendar/{viewId}/move`
- OpenAPI/SDK/Schema 对应: `openapi/src/view/calendar-*.ts`
- 成熟度: 完整

### [多视图] 画廊视图 (Gallery)
- 能力说明: 卡片画廊视图，支持封面图和标题展示
- 主要实现位置: 前端 `features/app/views/gallery/`
- 关键文件: `GalleryView.tsx`, `GalleryToolbar.tsx`, `useGalleryData.ts`; SDK `blocks/view/gallery/`; OpenAPI `view/gallery-*.ts`
- 前端入口: 画廊视图
- 后端入口: `PUT /api/table/{tableId}/view/gallery/{viewId}/update`
- OpenAPI/SDK/Schema 对应: `openapi/src/view/gallery-*.ts`
- 成熟度: 完整

### [多视图] 表单视图 (Form View)
- 能力说明: 表单收集视图，所见即所得设计器，支持字段拖拽、必填、隐藏、Cover/Logo、提交后模板
- 主要实现位置: 前端 `features/app/views/form/`
- 关键文件: `FormView.tsx`, `FormViewBase.tsx`, `FormEditor.tsx`; SDK `blocks/view/form/` (FormEditorMain); OpenAPI `view/form-*.ts`
- 前端入口: 表单视图
- 后端入口: `POST /api/table/{tableId}/view/form/{viewId}/share`, `PUT /api/table/{tableId}/view/form/{viewId}/update`
- OpenAPI/SDK/Schema 对应: `openapi/src/view/form-*.ts`
- 成熟度: 完整

### [多视图] 插件视图 (Plugin View)
- 能力说明: 可扩展视图框架，支持第三方嵌入图表/自定义 renderer、右键菜单拦截
- 主要实现位置: `packages/plugins/` + 前端 `features/app/views/plugin/` + SDK `blocks/view/plugin/` + v2 `plugin-views/`
- 关键文件: `PluginView.tsx`, `PluginViewBase.tsx`; SDK `PluginContent.tsx`; v2 2 个 plugin 包 (chart, button-field); OpenAPI `view/plugin-*.ts`
- 前端入口: 插件视图
- 后端入口: `PUT /api/table/{tableId}/view/plugin/{viewId}/update`
- OpenAPI/SDK/Schema 对应: `openapi/src/view/plugin-*.ts`
- 成熟度: 完整

### [多视图] 视图工具栏 + 搜索 + 字段设置
- 能力说明: 统一的 ViewToolbar (筛选/排序/分组/颜色/搜索/字段管理)，ViewFilter 多条件筛选 (连词/函数/日期/链接/范围/连续)，ViewSearch 实时全文搜索，FieldSetting 字段属性面板 (类型转换、格式化、验证)，分组管理 (隐藏列/颜色/标签)、View 操作 (重命名/复制/删除/移动顺序)、RowHeight、Collapse、移动端 Banner Footer
- 主要实现位置: 前端 `features/app/components/view-toolbar/` + SDK `blocks/view/tool-bar/`
- 关键文件: `ViewToolbar.tsx`, `ViewToolbarMobile.tsx`, `ViewFilter.tsx`, `filter-main/` (6 子组件), `ViewSearch.tsx`, `ViewGroup.tsx`, `ViewConfig.tsx`, `ViewSort.tsx`, `FieldSetting.tsx`; SDK `blocks/view/field/FieldEditor.tsx`; 后端 `view-open-api.controller.ts` (filter/sort/group)
- 前端入口: 所有视图顶部的 ViewToolbar
- 后端入口: View filter/sort/group 持久化
- 成熟度: 完整

---

### [分享与发布] View 分享 (共享视图)
- 能力说明: 完整的共享视图功能，含密码保护、只读、访问记录、嵌入 iframe、导出、自动下载、HoverCard、头像堆叠
- 主要实现位置: 前端 `pages/share/` + backend `features/share/`
- 关键文件: 前端 `ShareViewPage.tsx` (完整实现 1200+ 行，20+ 用户操作); backend `share.controller.ts` (GET view, POST enable, POST disable, POST gen-password); OpenAPI `share/view-*.ts` (9 headers); Schema: `ShareView`
- 前端入口: `/share/{shareId}/view` -> ShareViewPage
- 后端入口: `GET /api/share/{shareId}/view`, `POST /api/share/{shareId}/view/enable`
- OpenAPI/SDK/Schema 对应: `openapi/src/share/view-*.ts`
- 成熟度: 完整

### [分享与发布] Base 分享 (共享 Base)
- 能力说明: 共享整个 Base 只读访问，含权限验证和数据接口
- 主要实现位置: backend `features/share/` + 前端 `pages/share/`
- 关键文件: `share.controller.ts` (base enable/disable); OpenAPI `share/base-*.ts`; Schema: `ShareBase`
- 前端入口: `/share/{shareId}/base/auth`
- 后端入口: `POST /api/share/{shareId}/base/enable`, `GET /api/share/{shareId}/base/data`
- OpenAPI/SDK/Schema 对应: `openapi/src/share/base-*.ts`
- 成熟度: 完整

### [分享与发布] 复制 Base 分享
- 能力说明: 从分享的 Base 副本创建新的 Base
- 主要实现位置: backend `features/share/share.controller.ts`
- 关键文件: `share.controller.ts` (POST base-copy); OpenAPI `share/base-copy.ts`
- 后端入口: `POST /api/share/{shareId}/base-copy`
- OpenAPI/SDK/Schema 对应: `openapi/src/share/base-copy.ts`
- 成熟度: 完整

### [分享与发布] Published App (已发布应用)
- 能力说明: 将 Table/View 发布为独立可访问的 App Shell
- 主要实现位置: 前端 `features/app/blocks/published/`; v2 实现 `packages/v2/published/`
- 关键文件: 前端 `PublishedApp.tsx` + `PublishedAppWrapper.tsx`; 5 Shell: `PublishedDesign/published-view/PublishedDesign.tsx` + `PublishedGallery/PublishedGalleryProvider.tsx` + `PublishedGrid/published-view/PublishedGridView.tsx` + `PublishedCalendar/published-view/PublishedCalendarView.tsx` + `PublishedKanban/PublishedKanbanProvider.tsx`; v2 `core/src/commands/Published/*`
- 前端入口: PublishedApp -> 5 种 Shell 根据 view type 路由
- 成熟度: 完整

### [分享与发布] Published Manifest + PWA
- 能力说明: 为已发布应用生成 manifest 和 PWA 支持
- 主要实现位置: 前端 `pages/published/`
- 关键文件: `published-manifest.tsx`, `_document.tsx`, `published-pwa.tsx`
- 前端入口: `/published/{baseId}/{viewId}`
- 成熟度: 完整

---

### [自动化与 Workflow] Workflow CRUD + 运行
- 能力说明: Workflow 创建/复制/更新/删除/运行，含 20+ Action 类型
- 主要实现位置: backend `features/automation/`; v2 `core/src/modules/workflow/`
- 关键文件: `automation.controller.ts` (6 路由 GET/POST/PATCH/DELETE/COPY); `workflow-executor.service.ts` (运行引擎); `action-config.service.ts` (Action 注册 20+ 类型); `workflow-trigger-config.service.ts` (记录创建/更新/Webhook 触发); OpenAPI `automation/workflow-*.ts` (20+ 路由); v2: `core/src/modules/workflow/service.ts` + `core/src/commands/CreateWorkflowCommand.ts`
- 前端入口: WorkflowNodePage 流程编辑器
- 后端入口: `POST /api/automation/{baseId}/workflow`, `POST /api/automation/{baseId}/workflow/{workflowId}/run`
- OpenAPI/SDK/Schema 对应: `openapi/src/automation/workflow-*.ts`
- 成熟度: 完整

### [自动化与 Workflow] AI 草稿生成
- 能力说明: AI 根据自然语言描述生成 Workflow 草稿
- 主要实现位置: backend `features/automation/ai-generator.service.ts`
- 关键文件: `ai-generator.service.ts`, `automation.controller.ts` (POST ai-generate-workflow-draft); OpenAPI `automation/ai-generate-workflow-draft.ts`
- 后端入口: `POST /api/automation/{baseId}/ai-generate-workflow-draft`
- OpenAPI/SDK/Schema 对应: `openapi/src/automation/ai-generate-workflow-draft.ts`
- 成熟度: 完整

### [自动化与 Workflow] 能力查询
- 能力说明: 查询 Workflow 支持的 Action/Trigger/Executor 能力列表
- 主要实现位置: 全仓库多处
- 关键文件: backend `automation.controller.ts` (GET get-capabilities); OpenAPI `automation/get-capabilities.ts`, `openapi/src/automation/workflow/get-capabilities.ts` (重复定义); v2 `contract-http/src/contract.ts` 中的能力路由
- 后端入口: `GET /api/automation/{baseId}/get-capabilities`
- OpenAPI/SDK/Schema 对应: `openapi/src/automation/get-capabilities.ts`, `openapi/src/automation/workflow/get-capabilities.ts`
- 成熟度: 完整

### [自动化与 Workflow] 脚本运行 (运行历史 + 日志)
- 能力说明: 运行 Workflow Action 脚本、查看运行历史和详细日志
- 主要实现位置: backend `features/automation/script.service.ts` + v2 `core/src/modules/workflow/`
- 关键文件: backend `automation.controller.ts` (POST run-script, GET run-history); OpenAPI `automation/run-script.ts, run-history.ts`; v2 `core/src/modules/workflow/runtime.data.service.ts` + `run.service.ts`
- 后端入口: `POST /api/automation/{baseId}/run-script`, `GET /api/automation/{baseId}/run-history`
- OpenAPI/SDK/Schema 对应: `openapi/src/automation/run-script.ts, run-history.ts`
- 成熟度: 完整

---

### [AI 与智能生成] 通用 AI 查询引擎
- 能力说明: 基于 LLM 的通用数据查询 AI，支持 SQL 生成、字段值生成、文件处理
- 主要实现位置: backend `features/ai/`
- 关键文件: `ai.service.ts`, `ai.controller.ts` (POST stream); OpenAPI `ai/*`; AI 提供者: `providers/feishu.ts, lucy.ts, openai.ts`
- 后端入口: `POST /api/ai/{baseId}/stream`
- OpenAPI/SDK/Schema 对应: `openapi/src/ai/`
- 成熟度: 完整

### [AI 与智能生成] AI 字段自动填充
- 能力说明: AI 根据记录上下文自动填充字段值（类似 Notion AI 填充）
- 主要实现位置: backend `features/ai/ai-strategy.service.ts` + `ai-sql-generate.service.ts`
- 关键文件: `ai-strategy.service.ts`, `ai-sql-generate.service.ts`, `ai.controller.ts` (POST auto-fill); v2 `core/src/modules/ai/ai-auto-fill.service.ts`
- 后端入口: `POST /api/ai/{baseId}/auto-fill`
- OpenAPI/SDK/Schema 对应: `openapi/src/ai/auto-fill.ts`
- 成熟度: 完整

### [AI 与智能生成] AI 公式生成
- 能力说明: AI 辅助生成公式表达式（自然语言 -> 公式）
- 主要实现位置: backend `features/field/field-calculate/`
- 关键文件: `ai-formula.service.ts`, `field-calculate.controller.ts` (POST ai-generate-formula); OpenAPI `field/ai-generate-formula.ts`
- 后端入口: `POST /api/table/{tableId}/field/{fieldId}/ai-generate-formula`
- OpenAPI/SDK/Schema 对应: `openapi/src/field/ai-generate-formula.ts`
- 成熟度: 完整

### [AI 与智能生成] AI 视图上下文 (AI ViewContext)
- 能力说明: 视图级 AI 上下文，基于视图数据交互式问答
- 主要实现位置: 前端 `features/app/components/ai-chat/` + AI SDK
- 关键文件: `AIChatDrawer.tsx`; `packages/v2/core/src/modules/ai/chat/`
- 前端入口: 视图右下角 AI Chat 抽屉
- 成熟度: 完整

### [AI 与智能生成] AI SDK (Tea 版 + 多供应商)
- 能力说明: `@teable/ai-sdk` 包，封装 10+ AI 供应商 (OpenAI/Anthropic/Google/DeepSeek/Mistral/Groq/Cohere/Azure/Perplexity/Fireworks + OLLAMA 自部署)，支持流式/结构化输出/工具调用/图片/Usage
- 主要实现位置: `packages/ai-sdk/` (自研，非 AI SDK v4 官方包)
- 关键文件: `src/index.ts` (导出 10+ 供应商), `src/model-manger.ts`, `src/utils/token.ts`, `src/types.ts`
- 前端入口: SDK 通过 `@teable/ai-sdk` 调用
- 成熟度: 完整

---

### [导入导出] CSV 导入 (文件 + URL + 就地追加)
- 能力说明: 从 CSV 文件或 URL 导入数据，支持追加模式、列映射、10 万行大文件
- 主要实现位置: backend `features/import/`
- 关键文件: `import.controller.ts` (POST import, GET analyze, POST in-place-import); OpenAPI `import/`; 前端 `useCSVImport.ts`; Schema: `Import`
- 前端入口: Table 工具栏 Import -> ImportDialog
- 后端入口: `POST /api/import/{baseId}`, `GET /api/import/{baseId}/analyze`, `POST /api/import/{baseId}/in-place-import`
- OpenAPI/SDK/Schema 对应: `openapi/src/import/`
- 成熟度: 完整

### [导入导出] CSV 导出 (行选择 + 全表)
- 能力说明: 导出 Table 数据为 CSV，支持行选择和全部导出
- 主要实现位置: backend `features/export/`
- 关键文件: `export.controller.ts` (GET export-csv, GET export-csv-from-selected-rows); OpenAPI `export/`; 前端 `ExportButton.tsx`
- 后端入口: `GET /api/export/{baseId}/{tableId}/export-csv`
- OpenAPI/SDK/Schema 对应: `openapi/src/export/`
- 成熟度: 完整

### [导入导出] Base 导入导出
- 能力说明: 将整个 Base (schema + data) 导出为文件并支持导入还原
- 主要实现位置: backend `features/base/`
- 关键文件: `base.controller.ts` (GET export-base, POST import-base); OpenAPI `base/export-base.ts, import-base.ts`
- 后端入口: `GET /api/base/{baseId}/export-base`, `POST /api/base/{baseId}/import-base`
- OpenAPI/SDK/Schema 对应: `openapi/src/base/export-base.ts, import-base.ts`
- 成熟度: 完整

---

### [评论/通知/协作] 评论 CRUD + 表情
- 能力说明: 记录评论（全量/上下级列表、创建、更新、删除），支持 Emoji 表情
- 主要实现位置: backend `features/comment/`; v2 `core/src/commands/CreateCommentCommand.ts`
- 关键文件: `comment.controller.ts` (GET list, POST create, PATCH update, DELETE); OpenAPI `comment/`; Schema: `Comment, CommentReaction`; v2: `/comments/create, list, update, delete`
- 前端入口: RecordDetail 侧栏 -> CommentList
- 后端入口: `GET /api/table/{tableId}/record/{recordId}/comment`, `POST /api/table/{tableId}/record/{recordId}/comment`
- OpenAPI/SDK/Schema 对应: `openapi/src/comment/`; v2 4 action routes
- 成熟度: 完整

### [评论/通知/协作] 评论表情反应
- 能力说明: 对评论添加/删除 Emoji 表情反应
- 主要实现位置: backend `features/comment/comment-reaction/`
- 关键文件: `comment-reaction.controller.ts`; OpenAPI `comment/comment-reaction/`; Schema: `CommentReaction`
- 后端入口: `POST /api/table/{tableId}/record/{recordId}/comment/{commentId}/reaction`, `DELETE ...`
- OpenAPI/SDK/Schema 对应: `openapi/src/comment/comment-reaction.ts`
- 成熟度: 完整

### [评论/通知/协作] 评论订阅
- 能力说明: 用户订阅/取消订阅单个记录的评论更新
- 主要实现位置: backend `features/comment/comment-subscribe/`
- 关键文件: `comment-subscribe.controller.ts`; OpenAPI `comment/comment-subscribe/`
- 后端入口: `POST /api/table/{tableId}/record/{recordId}/comment/subscribe`, `DELETE ...`
- OpenAPI/SDK/Schema 对应: `openapi/src/comment/comment-subscribe.ts`
- 成熟度: 完整

### [评论/通知/协作] 通知管理
- 能力说明: 查询通知列表、WebSocket 实时推送、标记已读/全部已读
- 主要实现位置: backend `features/notification/`
- 关键文件: `notification.controller.ts` (GET list, PATCH mark-read, PATCH mark-all-read); OpenAPI `notification/`; Schema: `Notification`
- 前端入口: 顶部导航 NotificationBell
- 后端入口: `GET /api/notification`, `PATCH /api/notification/{notificationId}/read`, `PATCH /api/notification/mark-all-read`
- OpenAPI/SDK/Schema 对应: `openapi/src/notification/`
- 成熟度: 完整

### [评论/通知/协作] ShareDB 实时协作
- 能力说明: 基于 ShareDB + WebSocket 的多人实时协作，OT 冲突解决
- 主要实现位置: backend `features/share-db/`; v2 `core/src/modules/collaboration/`
- 关键文件: `share-db.service.ts` + `share-db.gateway.ts` (WebSocket adapter); 前端 `useCollaborate.ts`; v2 `collaboration.service.ts`
- 前端入口: SDK `useCollaborate` hook
- 成熟度: 完整

---

### [插件与扩展] 插件开发/审核/发布
- 能力说明: 完整的插件系统，Plugin CRUD, 插件审核, 插件发布, 版本管理
- 主要实现位置: backend `features/plugin/`; `packages/plugins/`; `packages/workflow/`
- 关键文件: backend `plugin.controller.ts` (GET list, POST create, PUT update, DELETE, PATCH release, POST review); OpenAPI `plugin/` (10+ 路由); Schema: `Plugin, PluginRelease, PluginVersion`; `packages/plugins/` 含 3 独立 plugin src + chart; `packages/workflow/` 含 plugin-build/publish runner
- 前端入口: Admin PluginPage 管理面板
- 后端入口: `POST /api/plugin`, `POST /api/plugin/{pluginId}/release`, `POST /api/plugin/{pluginId}/review`
- OpenAPI/SDK/Schema 对应: `openapi/src/plugin/`
- 成熟度: 完整

### [插件与扩展] 面板插件 (Panel Plugin)
- 能力说明: 在 Table 右侧面板中嵌入自定义插件 UI
- 主要实现位置: `packages/plugins/src/app/pages/PluginPanelPage.tsx`
- 关键文件: `PluginPanelPage.tsx`, `packages/plugins/src/app/utils/create-panel-plugin.tsx`
- 前端入口: Table -> 面板插件 Tab
- 成熟度: 完整

### [插件与扩展] 右键菜单插件
- 能力说明: 拦截和扩展 Table 上下文菜单
- 主要实现位置: SDK `src/context/plugin-bridge/use-plugin-bridge.ts`
- 关键文件: `use-plugin-bridge.ts`; 插件系统 `packages/plugins/`
- 前端入口: Table 右键菜单中的插件项
- 成熟度: 完整

### [插件与扩展] 图表插件 (Plugin Chart)
- 能力说明: 图表插件视图，基于 ECharts 展示聚合数据
- 主要实现位置: `packages/plugins/src/app/pages/PluginChartPage.tsx` + v2 `plugin-views/chart/`
- 关键文件: `PluginChartPage.tsx`, `Chart.tsx` (共享基础图表组件); v2 `plugin-views/chart/` 含 `Chart.worker.ts`, `plugin.ts`
- 前端入口: 插件视图 -> 图表
- 成熟度: 完整

### [插件与扩展] Plugin Bridge
- 能力说明: 插件与宿主应用间通信桥梁，提供标准化 API
- 主要实现位置: SDK `src/context/plugin-bridge/` + `packages/plugins/`
- 关键文件: `use-plugin-bridge.ts`, `PluginBridge.tsx`, `plugin-bridge.context.ts`
- 前端入口: SDK PluginBridge Provider
- 成熟度: 完整

### [插件与扩展] 独立 Univer 插件
- 能力说明: 独立的 Univer 电子表格引擎插件（类似 Google Sheets 插件）
- 主要实现位置: `packages/plugins/univer-plugins/`
- 关键文件: `univer-client.ts`, `univer-slide.service.ts`, `univer-demo.service.ts`
- 前端入口: Univer 容器插件
- 成熟度: 局部实现

---

### [OpenAPI/SDK/外部集成] V1 OpenAPI 规范 (45 子域 200+ 路由)
- 能力说明: 基于 Zod + TypeScript 的完整 OpenAPI V1 规范，自动生成 API 文档
- 主要实现位置: `packages/openapi/src/` (45 子目录 200+ 路由定义)
- 关键文件: `index.ts` (总导出), `base/` (27), `table/` (18), `record/` (18), `view/` (18), `field/` (12), `oauth/` (11), `plugin/` (10), `space/` (15), `share/` (15), `auth/` (20), `automation/` (20), `access-token/` (5), `ai/` (2), `attachment/` (5), `base-node/` (6), `comment/` (5), `export/` (2), `import/` (3), `notification/` (3), `selection/` (5), `user/` (7), `organization/` (3), `setting/` (1), `trash/` (3), `invitation/` (3), `pixel/` (1), `doc/` (1), `pin/` (2), `aggregation/` (2), `dashboard/` (2), `health/` (1), `socket/` (1), `undo-redo/` (2), `search/` (1), `db-connection/` (4), `db-table/` (1), `group-point/` (1), `invite-link/` (1), `billing/` (1), `chart/` (1)
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] V2 HTTP 合约 (30+ Action 路由)
- 能力说明: 声明式 HTTP 合约 (contract-http)，支持 swagger/openapi 生成
- 主要实现位置: `packages/v2/contract-http/src/contract.ts` + `contract-http-express/` + `contract-http-openapi/` + `contract-http-*
- 关键文件: 30+ action: `bases.create, bases.list`, `comments.create/list/update/delete`, `records.create/update/list/get/delete/duplicate/paste/copy/clear/move/order`, `tables.create/list/get/rename/delete/restore/duplicateTable/createField/updateField/deleteField/duplicateField`, `views.create/listViews/getViewMeta/createFilter/createFilterGroup/deleteFilter/updateFilter/updateFilterGroup/createSortItem/deleteSortItem/updateSortItem/setManualSort/createAggregation/deleteAggregation/updateAggregation`, `undo.redo`, `pixel.get`; 适配器: `contract-http-express/src/adapters/`; OpenAPI 生成: `contract-http-openapi/src/contract-openapi.ts`
- 后端入口: V2 HTTP 路由通过 express adapter 挂载
- 成熟度: 正在完善

### [OpenAPI/SDK/外部集成] @teable/sdk (55 Hook + 16 Context)
- 能力说明: 前端状态管理 SDK，封装所有数据操作和协作逻辑
- 主要实现位置: `packages/sdk/src/`
- 关键文件: `hooks/` (55 Hook: use-record, use-records, use-view, use-table, use-field, use-base, use-space, use-permission, use-collaborate, use-comment, use-auth, use-search 等); `context/` (16 Context: TableContext, ViewContext, FieldContext, RecordContext, BaseContext, SessionContext 等); `api/` (API client); `model/` (数据模型)
- 前端入口: 所有页面通过 SDK hooks 消费数据
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] API Token Guard (认证中间件)
- 能力说明: 多层认证中间件 (Session, Bearer Token, API Key, OAuth2 Access Token, 公开访问)
- 主要实现位置: backend `features/auth/guard/`
- 关键文件: `auth.guard.ts`, `api-token.guard.ts`; `features/access-token/access-token.guard.ts`; `features/oauth/access-token.guard.ts`; `featrues/auth/anon.guard.ts`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] 系统设置管理
- 能力说明: 全站系统设置 (如实例名、logo、AI 配置等)
- 主要实现位置: backend `features/setting/`
- 关键文件: `setting.controller.ts`; OpenAPI `setting/`; Schema: `Setting`
- 后端入口: `GET/PATCH /api/setting`
- OpenAPI/SDK/Schema 对应: `openapi/src/setting/`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] 回收站
- 能力说明: 删除的 BaseNode 进入回收站，支持恢复和永久删除
- 主要实现位置: backend `features/trash/`
- 关键文件: `trash.controller.ts`; OpenAPI `trash/`; Schema: `Trash`
- 后端入口: `GET /api/trash`, `POST /api/trash/{trashId}/restore`, `DELETE /api/trash/{trashId}`
- OpenAPI/SDK/Schema 对应: `openapi/src/trash/`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] Pin 功能
- 能力说明: 将 BaseNode/View 置顶固定
- 主要实现位置: backend `features/pin/`
- 关键文件: `pin.controller.ts` (GET/POST/DELETE); OpenAPI `pin/`; Schema: `Pin`
- 后端入口: `GET/POST/DELETE /api/pin`
- OpenAPI/SDK/Schema 对应: `openapi/src/pin/`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] 图表 API (ECharts 数据查询)
- 能力说明: 基于 ECharts 的图表数据聚合查询 API
- 主要实现位置: backend `features/chart/`
- 关键文件: `chart.controller.ts`; OpenAPI `chart/`
- 后端入口: `POST /api/chart/{baseId}/query`
- OpenAPI/SDK/Schema 对应: `openapi/src/chart/`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] 聚合 API
- 能力说明: 基于维度和指标的 Table 数据聚合查询
- 主要实现位置: backend `features/aggregation/`
- 关键文件: `aggregation.controller.ts`; OpenAPI `aggregation/`; v2 `/tables/*Aggregation action routes`
- 后端入口: `POST /api/aggregation/{baseId}/query`
- OpenAPI/SDK/Schema 对应: `openapi/src/aggregation/`; v2: `createAggregation, deleteAggregation, updateAggregation`
- 成熟度: 完整 (V1+V2 双实现)

### [OpenAPI/SDK/外部集成] 全文搜索
- 能力说明: 空间内全文搜索 Base/Table/Record 内容
- 主要实现位置: backend `features/search/`
- 关键文件: `search.controller.ts`; OpenAPI `search/`
- 后端入口: `GET /api/search/{spaceId}`
- OpenAPI/SDK/Schema 对应: `openapi/src/search/`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] DB 连接管理
- 能力说明: 多数据库连接管理 (SQLite/PostgreSQL)，切换/查询连接
- 主要实现位置: backend `features/db-connection/`
- 关键文件: `db-connection.controller.ts`; OpenAPI `db-connection/`; Schema: `DbConnection`
- 后端入口: `GET/POST/DELETE /api/db-connection`
- OpenAPI/SDK/Schema 对应: `openapi/src/db-connection/`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] 选择操作 (复制/粘贴/撤销/重做)
- 能力说明: 智能选择区域 (Range/Row/Column 选择)，合并选择、命中测试、拖拽、复制粘贴、SelectionToOperation 转换
- 主要实现位置: 前端 SDK `src/context/selection/` + backend `features/selection/`
- 关键文件: 前端 `use-selection.ts`, `SelectionContext.tsx`; backend `selection.controller.ts`; OpenAPI `selection/`; v2 `core/src/modules/selection/`
- 前端入口: Grid 选择区域
- 后端入口: `POST /api/selection/copy`, `POST /api/selection/paste`, `POST /api/selection/delete`
- OpenAPI/SDK/Schema 对应: `openapi/src/selection/`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] 文档 API (REST to Docs)
- 能力说明: 动态生成并返回空间/Base/Table REST API 文档
- 主要实现位置: backend `features/doc/`
- 关键文件: `doc.controller.ts`; OpenAPI `doc/`
- 后端入口: `GET /api/doc/{spaceId}`
- OpenAPI/SDK/Schema 对应: `openapi/src/doc/`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] WebSocket 适配器
- 能力说明: 统一的 WebSocket 连接管理，支持 room/subscribe/unsubscribe
- 主要实现位置: backend `features/socket/` + `socket.gateway.ts`
- 关键文件: `socket.gateway.ts` (WS gateway), `socket.service.ts`; OpenAPI `socket/`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] Health 健康检查
- 能力说明: 服务健康检查和就绪探针
- 主要实现位置: backend `features/health/`
- 关键文件: `health.controller.ts`; OpenAPI `health/`
- 后端入口: `GET /api/health`
- OpenAPI/SDK/Schema 对应: `openapi/src/health/`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] 群组积分 (Group Points)
- 能力说明: 空间内协作者积分排名系统
- 主要实现位置: backend `features/group-point/`
- 关键文件: `group-point.controller.ts`; OpenAPI `group-point/`
- 后端入口: `GET /api/group-point/{spaceId}`
- OpenAPI/SDK/Schema 对应: `openapi/src/group-point/`
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] 计费 API
- 能力说明: 查询空间/组织的计费计划和状态
- 主要实现位置: backend `features/billing/`
- 关键文件: `billing.controller.ts`; OpenAPI `billing/`
- 后端入口: `GET /api/billing/{spaceId}`
- OpenAPI/SDK/Schema 对应: `openapi/src/billing/`
- 成熟度: 局部实现

### [OpenAPI/SDK/外部集成] 数据分析 (Pixel API)
- 能力说明: 页面访问和分析数据收集
- 主要实现位置: backend `features/pixel/`
- 关键文件: `pixel.controller.ts`; OpenAPI `pixel/`; v2 `/pixel.get`
- 后端入口: `GET /api/pixel`
- OpenAPI/SDK/Schema 对应: `openapi/src/pixel/`; v2 合约
- 成熟度: 完整

### [OpenAPI/SDK/外部集成] Dashboard API
- 能力说明: Dashboard 管理 API (CRUD)
- 主要实现位置: backend `features/dashboard/`
- 关键文件: `dashboard.controller.ts`; OpenAPI `dashboard/`
- 后端入口: `GET/POST/PATCH/DELETE /api/dashboard`
- OpenAPI/SDK/Schema 对应: `openapi/src/dashboard/`
- 成熟度: 完整

---

### [v2 领域内核] DDD + CQRS 架构 (60+ Command / 30+ Query)
- 能力说明: 基于 NestJS CQRS 的领域驱动设计，全部核心业务使用 Command/Query 分离
- 主要实现位置: `packages/v2/core/src/commands/` + `packages/v2/core/src/queries/`
- 关键文件: 60+ Command Handler (CreateBase, CreateTable, CreateField, UpdateField, DeleteField, DuplicateField, ConvertFieldType, CreateRecord, CreateRecords, UpdateRecord, UpdateRecords, DeleteRecords, DuplicateRecord, Paste, Clear, DeleteByRange, ReorderRecords, ImportCsv, SetRecordAttachment, CreateComment, CreateWorkflow, CreateView, DeleteView, PublishTable, Undo, Redo 等); 30+ Query Handler (GetBaseList, GetTableList, GetRecordList, GetRecord, GetViewList, GetViewMeta, GetFieldList, ListComments, GetUndoRedoStack 等)
- 成熟度: 正在完善

### [v2 领域内核] Port/Adapter 架构
- 能力说明: 端口/适配器架构 (六边形架构)，业务逻辑与基础设施分离
- 主要实现位置: `packages/v2/core/src/ports/` + 各类 adapter 包
- 关键文件: 端口接口: `DbProviderPort`, `DbContextPort`, `RecordRepositoryPort`, `TableRepositoryPort`, `ViewRepositoryPort`, `HttpAdapterPort`, `EventPublisherPort`, `WorkspacePort`, `FileStoragePort`, `AIServicePort`, `RealTimeCollaborationPort`, `CachePort`, `LoggerPort`, `ConfigPort`; 适配器实现: `adapters/db/` (Kysely/SQLite/PostgreSQL 驱动), `adapters/http/` (Express/NestJS), `contract-http-express/src/adapters/`
- 成熟度: 正在完善

### [v2 领域内核] 多 DB 驱动支持
- 能力说明: 通过 Kysely SQL 构建器，统一支持 SQLite/PostgreSQL/MySQL
- 主要实现位置: `packages/v2/core/src/ports/db/` + `adapters/db/`
- 关键文件: `adapters/db/` 下 `kysely-adapter.ts`, `sqlite-driver.ts`, `pg-driver.ts`, `mysql-driver.ts`
- 成熟度: 正在完善

### [v2 领域内核] 多 HTTP 框架支持
- 能力说明: contract-http 声明式路由支持Express/Fastify/NestJS多框架
- 主要实现位置: `packages/v2/contract-http-express/` + `contract-http-fastify/`
- 关键文件: `contract-http-express/src/adapters/express-adapter.ts`, `contract-http-fastify/src/fastify-adapter.ts`
- 成熟度: 正在完善

### [v2 领域内核] Formula-to-PG SQL 翻译
- 能力说明: 将 Teable 公式表达式编译翻译为 PostgreSQL (PG) SQL
- 主要实现位置: `packages/v2/core/src/modules/formula/`
- 关键文件: `formula-to-sql.translator.ts`, `formula.parser.ts`, `formula.service.ts`
- 成熟度: 正在完善

### [v2 领域内核] 计算字段引擎
- 能力说明: 通过插件系统实现可扩展的计算字段 (公式/按钮/图表)
- 主要实现位置: `packages/v2/plugin-computed/`
- 关键文件: `packages/v2/plugin-computed/src/chart/`, `packages/v2/plugin-computed/src/button-field/`; `packages/v2/core/src/modules/computed/`
- 成熟度: 正在完善

### [v2 领域内核] 共享事件总线
- 能力说明: 基于 RxJS 的跨模块事件总线，支持 Command 事件发布/订阅
- 主要实现位置: `packages/v2/core/src/events/`
- 关键文件: `event-bus.service.ts`, `base.event.ts`, `table.event.ts`, `field.event.ts`, `record.event.ts`
- 成熟度: 正在完善

### [v2 领域内核] Table Template 系统
- 能力说明: 10 种预定义表格模板 (Todo/CRM/ProjectTracker/BugTriage/HR/ContentCalendar/PersonalFinance/AllFieldTypes/AllBaseFields/Simple)
- 主要实现位置: `packages/v2/table-templates/src/templates/`
- 关键文件: 10 个模板 .ts 文件，每个定义 Table/Field/View 结构
- 成熟度: 完整

### [v2 领域内核] 向外部发布 (Publish)
- 能力说明: V2 版本 Table 发布为公开可访问的应用
- 主要实现位置: `packages/v2/published/`
- 关键文件: `packages/v2/published/src/`
- 成熟度: 正在完善

---

### [数据存储与持久化] Prisma 数据库模型 (48 模型)
- 能力说明: 定义全库所有数据库表结构的 48 个 Prisma 模型
- 主要实现位置: `packages/db-main-prisma/prisma/postgres/schema.prisma`
- 关键文件: 48 模型: User, Account, Session, VerificationToken, Space, Collaborator, Invitation, InvitationRecord, Integration, Organization, Base, BaseNode, BaseNodeFolder, TableMeta, Field, Record, RecordHistory, View, ShareView, ShareBase, OAuthApp, OAuthAppAuthorized, OAuthAppSecret, OAuthAppToken, AccessToken, Plugin, PluginRelease, PluginVersion, Comment, CommentReaction, Notification, System, Setting, Trash, Pin, Import, Attachment, Chart, Waitlist, UserLastVisit, Billing, Dashboard, Pixel, Workflow, WorkflowAction, WorkflowTrigger, WorkflowRun, WorkflowRunLog
- 成熟度: 完整

### [数据存储与持久化] Kysely V2 Schema Type
- 能力说明: 为 V2 Kysely 生成的 TypeScript 类型安全 DB schema
- 主要实现位置: `packages/v2/db-schema-type/`
- 关键文件: `packages/v2/db-schema-type/` 含 Kysely types 生成
- 成熟度: 正在完善

### [数据存储与持久化] Prisma 迁移管理
- 能力说明: 通过 Prisma Migrate 管理数据库 schema 版本迁移
- 主要实现位置: `packages/db-main-prisma/prisma/postgres/migrations/` + `packages/db-main-prisma/prisma/sqlite/migrations/`
- 关键文件: 数十个 migration SQL 文件
- 成熟度: 完整

### [数据存储与持久化] 数据库 Seeding
- 能力说明: 开发/测试环境数据库基础数据填充
- 主要实现位置: `packages/db-main-prisma/scripts/`
- 关键文件: `packages/db-main-prisma/scripts/seed.ts`
- 成熟度: 完整

---

### [实时协作/UndoRedo/History/Search] ShareDB WebSocket 同步
- 能力说明: 基于 ShareDB 的 WebSocket 实时同步与 OT (Operational Transformation)
- 主要实现位置: backend `features/share-db/` + 前端 `useCollaborate.ts`
- 关键文件: `share-db.service.ts`, `share-db.gateway.ts`, `share-db.module.ts`; 前端 `useCollaborate.ts`, `useCellCollaborate.ts`
- 前端入口: useCollaborate hook
- 成熟度: 完整

### [实时协作/UndoRedo/History/Search] 撤销/重做 (Undo/Redo)
- 能力说明: 基于 keyv 的 undo/redo 栈，支持撤销/重做 Table 内操作
- 主要实现位置: backend `features/undo-redo/` + v2 `/undo.redo`
- 关键文件: `undo-redo.controller.ts`; OpenAPI `undo-redo/`; v2 `core/src/commands/UndoCommand.ts, RedoCommand.ts`; 前端 `useUndoRedo.ts`
- 后端入口: `POST /api/undo-redo/undo`, `POST /api/undo-redo/redo`
- OpenAPI/SDK/Schema 对应: `openapi/src/undo-redo/`; v2 `/undo.redo, /undo/redo`
- 成熟度: 完整 (V1+V2 双实现)

### [实时协作/UndoRedo/History/Search] 用户在线状态 (Presence)
- 能力说明: 追踪其他协作用户的在线状态和编辑光标/选区位置
- 主要实现位置: 前端 SDK `src/context/presence/` + `usePresence.ts`
- 关键文件: `PresenceContext.tsx`, `usePresence.ts`, `PresenceAvatar.tsx`
- 前端入口: usePresence hook + Presence 指示器
- 成熟度: 完整

### [实时协作/UndoRedo/History/Search] Ops (操作日志)
- 能力说明: 记录和查询 Table 操作日志
- 主要实现位置: backend `features/record/record-open-api.controller.ts`
- 关键文件: `record-open-api.controller.ts` (GET ops); OpenAPI `record/ops.ts`; Schema: `Ops`
- 后端入口: `GET /api/table/{tableId}/record/{recordId}/ops`
- OpenAPI/SDK/Schema 对应: `openapi/src/record/ops.ts`
- 成熟度: 完整

### [实时协作/UndoRedo/History/Search] 审计日志
- 能力说明: 系统级审计日志，记录关键操作轨迹
- 主要实现位置: backend `features/audit-log/`
- 关键文件: `audit-log.service.ts`, `audit-log.interceptor.ts`
- 成熟度: 完整

---

### [国际化/i18n] 多语言支持
- 能力说明: 完整的国际化支持 (en/zh/jp/de/de-DE/fr-fr/ru-ru/ko)，跨前后端覆盖所有 UI 文案和错误信息
- 主要实现位置: 前端 `features/app/components/i18n/` + SDK `src/i18n/` + `packages/i18n/`
- 关键文件: `packages/i18n/src/locales/` (8 语言翻译文件); 后端 `features/i18n/i18n.service.ts`; 前端 `I18nProvider.tsx`
- 前端入口: I18nProvider 包裹应用
- 成熟度: 完整

### [国际化/i18n] 服务器端 i18n
- 能力说明: NestJS 服务端的多语言异常消息/日志
- 主要实现位置: backend `features/i18n/`
- 关键文件: `i18n.module.ts`, `i18n.service.ts`, `i18n.interceptor.ts`
- 成熟度: 完整

---

### [基础设施/运维] Mail SMTP 发送
- 能力说明: 通过 SMTP 发送事务邮件 (验证码/邀请/通知)
- 主要实现位置: backend `features/mail/`
- 关键文件: `mail.module.ts`, `mail.service.ts`; `features/auth/local-auth/send-invite-email.service.ts`
- 成熟度: 完整

### [基础设施/运维] Redis 缓存/Session 存储
- 能力说明: 通过 Redis 实现 Session 存储、缓存加速
- 主要实现位置: backend `features/auth/session/` + `clients/`
- 关键文件: `session-store.service.ts`, `clients/redis.client.ts`
- 成熟度: 完整

### [基础设施/运维] 配置管理 (CONFIG)
- 能力说明: 集中式环境变量和配置管理
- 主要实现位置: backend `configs/` + `packages/core/src/configs/`
- 关键文件: `configs/interface/config.interface.ts`; ENV: `apps/nextjs-app/.env*`, `apps/nestjs-backend/.env*`
- 成熟度: 完整

### [基础设施/运维] 日志系统
- 能力说明: 结构化日志输出 (pino/Winston)，含请求日志拦截器
- 主要实现位置: backend `logger/` + `filter/` + `interceptor/`
- 关键文件: `logger/config/`, `filter/http-exception.filter.ts`, `interceptor/response.interceptor.ts`, `interceptor/logging.interceptor.ts`
- 成熟度: 完整

### [基础设施/运维] Makefile 构建系统
- 能力说明: 通过 Makefile 管理常见开发/测试/构建任务
- 主要实现位置: 仓库根 `Makefile`
- 关键文件: `Makefile` (50+ target: dev/build/test/lint/typecheck/docker)
- 成熟度: 完整

### [基础设施/运维] Docker 容器化
- 能力说明: 完整 Docker 支持，含 Compose 多服务编排
- 主要实现位置: `docker/` + `docker-compose.yml` + `Dockerfile`
- 关键文件: `docker-compose.yml` (backend + postgres + redis + minio + nextjs), `docker/Dockerfile.backend`, `docker/Dockerfile.nextjs`
- 成熟度: 完整

### [基础设施/运维] CI/CD 流水线
- 能力说明: GitHub Actions CI/CD 流水线
- 主要实现位置: `.github/workflows/`
- 关键文件: `ci.yml`, `deploy.yml`
- 成熟度: 完整

### [基础设施/运维] 测试框架
- 能力说明: Vitest/Jest 测试框架，e2e/unit/integration CI 分工
- 主要实现位置: `apps/nestjs-backend/test/` + 各处 `*.spec.ts`
- 关键文件: `vitest.config.ts`, `jest.config.ts`; e2e: `apps/nestjs-backend/test/e2e/`; 单元: `*.spec.ts` 文件
- 成熟度: 完整

### [基础设施/运维] 代码质量 (Lint/Typecheck/Format)
- 能力说明: ESLint + Prettier + TypeScript strict mode
- 主要实现位置: `.eslintrc.js`, `.prettierrc`, `tsconfig.json` 体系
- 关键文件: `Makefile` -> `pnpm g:lint`, `pnpm g:typecheck`, `pnpm g:lint-styles`
- 成熟度: 完整

### [基础设施/运维] Git Hooks
- 能力说明: Husky pre-commit lint-staged + commitlint
- 主要实现位置: `.husky/` + `.commitlintrc.js` + `lint-staged.config.js`
- 关键文件: `.husky/pre-commit`, `.husky/commit-msg`
- 成熟度: 完整

---

## 3. 文档约定

- 每条能力覆盖：能力说明、主要实现位置、关键文件列表、前端入口 (React 页面)、后端入口 (REST API 路径)、OpenAPI/SDK/Schema 对应关系、成熟度。
- 成熟度分为三种：完整 (full production quality)、正在完善 (partial/under construction)、局部实现 (minimal/experimental)。
- 数据来源为全仓库代码和配置文件的真实扫描结果；当前文档保留为历史初稿，后续正式盘点以 `capability-inventory-execution-playbook.md` 和最新代码事实为准。
