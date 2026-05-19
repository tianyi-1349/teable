# Capability Inventory Summary

> 文档分层：正式输出。
> 
> 这份文档是面向管理层和跨团队沟通的正式摘要版，结论应与 `capability-inventory-final.md` 保持一致。

## 1. 仓库核心能力版图

这个仓库的核心是一套以 `Base / Table / Field / Record` 为中心的数据协作平台。

在这条主链路之上，已经形成五层能力结构：

1. 身份与协作层
   - 登录注册、OAuth2、PAT、Space、协作者、邀请、组织信息
2. 数据操作层
   - Base、Table、Field、Record 全生命周期管理
3. 数据消费层
   - Grid、Kanban、Calendar、Gallery、Form、Plugin 六类视图
4. 对外使用层
   - 分享视图、分享 Base、Published App、导入导出、评论通知、插件扩展
5. 系统支撑层
   - OpenAPI、SDK、Prisma、ShareDB、权限守卫、v2 CQRS、日志观测、对象存储

这意味着仓库已经具备“可建模、可协作、可公开、可自动化、可扩展”的完整产品基础。

## 2. 已形成体系化实现的能力

以下能力已经形成前端入口、后端模块、OpenAPI 契约、数据模型四层闭环。

### 数据主链路
- Base CRUD、复制、模板创建、节点树管理
- Table CRUD、索引管理、恢复、复制
- Field CRUD、类型转换、字段设置
- Record 单条与批量 CRUD、复制、粘贴、排序、清空
- Record 历史、Ops 操作日志

### 多视图产品能力
- Grid
- Kanban
- Calendar
- Gallery
- Form
- Plugin View
- 视图筛选、排序、分组、搜索、字段展示控制

### 协作与公开访问
- Space 协作管理
- 评论、表情反应、评论订阅
- 通知列表与已读状态
- ShareDB 实时协作与 Presence
- 共享视图公开访问
- 共享 Base 与复制
- Published App 页面发布

### 开发者与集成能力
- OAuth2 Provider + OAuth App 管理
- PAT 管理
- V1 OpenAPI 契约体系
- 前端 SDK hooks 与 Context 体系
- 插件管理、审核、发布、Panel、菜单、图表扩展

### 自动化与 AI
- Workflow CRUD、运行、能力查询、运行历史
- Workflow AI 草稿生成
- AI 流式交互
- AI 字段自动填充
- AI 公式生成
- 视图级 AI Chat

## 3. 处于演进中的能力

以下能力已经有明确代码结构和落地片段，但整体覆盖度或渗透率还低于主链路。

### v2 新架构能力
- v2 contract-http action 路由体系
- CQRS Command / Query 结构
- Ports / Adapters 六边形架构
- 多数据库驱动适配
- 多 HTTP 框架适配
- 公式到 SQL 翻译
- 计算字段插件化引擎
- 事件总线
- v2 Published 能力

### 局部业务域
- 组织信息域
- Billing 查询
- 独立 Univer 插件

这些能力说明仓库已经明确存在“新架构迁移主线”，但当前生产主能力仍以 V1 OpenAPI + NestJS feature 模块为核心。

## 4. 最有价值的 12 条能力链路

1. 本地登录与注册
2. OAuth2 授权与 OAuth App 管理
3. Space 协作管理
4. Base 创建与资源树管理
5. Table 与 Field 管理
6. Record 批量编辑
7. 表单提交写入记录
8. 共享视图公开访问
9. Published App 发布页
10. Workflow 自动化
11. AI 自动填充与公式生成
12. 评论通知与实时协作

这 12 条链路基本覆盖了最终用户使用、团队协作、公开传播、自动化执行和平台扩展五个维度。

## 5. 管理层结论

1. 这是一个已经完成核心产品闭环的数据协作平台仓库。
2. 最成熟的部分是数据主链路、多视图、分享协作、评论通知、导入导出、身份与集成接口。
3. 最明确的演进方向是 v2 新架构，包括 CQRS、contract-http、Ports/Adapters 和领域能力下沉。
4. 当前最适合投入评审和持续建设的重点区域有三个：
   - 继续巩固 Record / View / Share / Workflow 这四条核心产品链路
   - 推进 v2 在核心业务域中的覆盖率
   - 用统一的 API 契约和插件扩展能力支撑外部生态

## 6. 建议的评审使用方式

### 产品评审
- 重点看第 1、2、4 节
- 用于确认当前产品已具备哪些可售卖能力和协作能力

### 研发评审
- 重点看第 2、3 节
- 用于确认主链路成熟度和演进中模块的边界

### 架构评审
- 重点看第 3、5 节
- 用于讨论 V1 与 V2 并行状态、迁移方向和系统支撑层是否需要继续统一
