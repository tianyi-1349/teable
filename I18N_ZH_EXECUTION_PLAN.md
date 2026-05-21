# 前端中文国际化执行基线

## 1. 目标与边界

### 1.1 主目标

在中文环境下，前端页面中的菜单、按钮、提示、选项、空态、错误态、标签和说明文案不再出现非专有名词英文。

### 1.2 专有名词保留范围

以下词项允许保留英文：

- `SQL`
- `API`
- `JSON`
- `Token`
- `Webhook`
- `Cron`
- `ERD`
- `PWA`
- `Teable`

### 1.3 两阶段执行边界

#### 阶段 A：资源层补齐

- 扫描所有前端 i18n key 使用位置
- 对照 `packages/common-i18n/src/locales/en/*.json`
- 补齐 `packages/common-i18n/src/locales/zh/*.json` 中缺失或不一致的中文翻译

#### 阶段 B：源码层收口

- 扫描真实用户可见英文硬编码
- 将页面英文文案接入现有 i18n 体系
- 保持业务逻辑和协议字段语义不变，只改展示文案与翻译接入

### 1.4 不纳入本次目标的内容

- 测试文件中的英文 mock 文案
- 类型名、函数名、变量名
- 协议字段值本身，如 `id`、`dbFieldName`、`skip`、`take`
- 代码注释与开发日志

## 2. 执行原则

### 2.1 全局性

- 先资源层，后源码层，再做全局验收
- 输出翻译缺失清单和页面英文硬编码清单，避免遗漏真实页面

### 2.2 一致性

- 先冻结术语表、句式规范和专有名词保留表
- 同一英文概念跨模块保持同一中文译法

### 2.3 稳定性

- 阶段 A 优先只改 `zh` 资源文件
- 阶段 B 按批次推进源码接入
- 每批完成后立即做静态复扫和关键页面抽检

### 2.4 可维护性

- 优先复用现有 namespace
- 仅在文案量明显独立时新增 namespace
- 新增 key 必须按语义归档，避免 `common.json` 无序膨胀

## 3. 目录与真实结构

### 3.1 前端主工程

- `apps/nextjs-app`

### 3.2 现有 i18n 资源目录

- `packages/common-i18n/src/locales/en/*.json`
- `packages/common-i18n/src/locales/zh/*.json`

### 3.3 当前已注册 namespace

- `auth`
- `space`
- `common`
- `sdk`
- `share`
- `table`
- `token`
- `setting`
- `oauth`
- `zod`
- `developer`
- `plugin`
- `dashboard`
- `chart`

### 3.4 默认语言风险

当前 `apps/nextjs-app/next-i18next.config.js` 的 `defaultLocale` 为 `en`。

执行阶段 B 后，需要单独评估是否将默认语言策略调整为中文优先。

## 4. 术语表

| 英文 | 中文 |
|---|---|
| row | 记录 |
| record | 记录 |
| field | 字段 |
| column | 字段 |
| table | 表 |
| view | 视图 |
| filter | 筛选 |
| sort | 排序 |
| group | 分组 |
| base | 数据库 |
| share | 分享 |
| publish | 发布 |
| workflow | 工作流 |
| trigger | 触发器 |
| snapshot | 快照 |
| runtime | 运行时 |
| permission | 权限 |

## 5. 翻译规范

### 5.1 菜单项

- 使用“动词 + 名词”结构
- 示例：`插入记录`、`删除记录`、`分组设置`

### 5.2 按钮

- 使用简洁动宾短语
- 示例：`确认`、`取消`、`保存`、`筛选`

### 5.3 提示信息

- 使用完整、通顺、自然的句子
- 示例：`确定要删除这条记录吗？`

### 5.4 状态标签

- 优先短词
- 示例：`草稿`、`已启用`、`已授权`、`已拒绝`

### 5.5 成功与失败提示

- 成功：`动作 + 成功`
- 失败：`动作 + 失败，请重试`

## 6. 资源层与源码层映射规则

| 场景 | 处理方式 | 资源归属建议 |
|---|---|---|
| 已存在 `t(...)` key，中文缺失 | 只补 `zh` 资源 | 原 namespace |
| 页面英文硬编码，语义通用 | 新增 key 并接入 `t(...)` | `common` |
| 表格/字段/记录/视图相关 | 新增 key 并接入 `t(...)` | `table` |
| 设置/配置相关 | 新增 key 并接入 `t(...)` | `setting` 或 `developer` |
| 图表/统计相关 | 新增 key 并接入 `t(...)` | `chart` 或 `dashboard` |
| 工作流自动化整块文案 | 评估独立 namespace | 候选 `automation` |
| 发布运行态整块文案 | 评估独立 namespace | 候选 `publishedApp` |
| 协议字段值与展示同名 | 展示层翻译，协议值保留 | 按页面语义新增展示 key |

### 6.1 namespace 新增条件

- 当某独立模块新增 key 超过 25 到 40 个，且跨多个文件复用明显时，可新增独立 namespace
- 当前优先观察：`automation`、`publishedApp`

## 7. 扫描范围

### 7.1 文件类型

- `.ts`
- `.tsx`
- `.js`
- `.jsx`
- 如存在 `.vue`，一并纳入

### 7.2 i18n 使用方式

- `$t(...)`
- `useTranslation(...)`
- `t(...)`
- `i18n.t(...)`
- 带 namespace 的 key，如 `common:actions.save`

### 7.3 英文硬编码扫描对象

- JSX 可见文本
- `label`
- `title`
- `placeholder`
- `description`
- `content`
- `message`
- 弹窗标题与描述
- 状态标签与选项名称

## 8. 任务矩阵

### 8.1 阶段 A：资源层补齐

| 子任务 | 动作 | 产出 | 验收 |
|---|---|---|---|
| 文件扫描 | 枚举所有前端候选文件 | 文件清单 | 覆盖真实页面与共享组件 |
| i18n 键扫描 | 提取所有 key 使用位置 | i18n 键使用清单 | 可按文件、namespace、key 检索 |
| 英文基准比对 | 对照 `en/*.json` 找缺失项 | `zh` 缺失键清单 | 差异完整 |
| 中文翻译补齐 | 补齐缺失 key、修正不一致项 | 更新后的 `zh/*.json` | 缺失项清零 |
| 插值校验 | 校验 `{{...}}` 变量一致性 | 资源一致性报告 | 无变量缺失或错位 |

### 8.2 阶段 B：源码层收口

| 子任务 | 动作 | 产出 | 验收 |
|---|---|---|---|
| 英文硬编码扫描 | 提取真实用户可见英文文案 | 页面英文硬编码清单 | 每条含文件、位置、原文案 |
| 高优先级模块接入 | 替换英文硬编码为 `t(...)` | 第一批改造文件 | 关键页面无非专有名词英文 |
| 中优先级模块接入 | 继续替换散点英文 | 第二批改造文件 | 散点英文显著下降 |
| 收尾模块接入 | 处理后台与边缘页面 | 第三批改造文件 | 页面收尾完成 |
| 默认语言评估 | 决定是否中文优先 | 语言策略结论 | 与产品目标一致 |

## 9. 批次顺序

### 9.1 第一批 P0

- `apps/nextjs-app/src/features/app/automation`
- `apps/nextjs-app/src/features/app/published-app`
- `apps/nextjs-app/src/features/system/pages/ErrorPage.tsx`

### 9.2 第二批 P1

- `apps/nextjs-app/src/features/app/blocks/AuthorityMatrix.tsx`
- `apps/nextjs-app/src/features/app/blocks/setting/query-builder/*`
- `apps/nextjs-app/src/features/app/blocks/view/tool-bar/APIDialogContent.tsx`
- `apps/nextjs-app/src/features/app/blocks/graph/ProgressBar.tsx`
- `apps/nextjs-app/src/features/app/blocks/setting/oauth-app/OAuthAppDecisionPage.tsx`

### 9.3 第三批 P1 收尾

- `apps/nextjs-app/src/features/app/blocks/admin/setting/components/ai-config/*`
- `apps/nextjs-app/src/features/app/blocks/chart/*`
- 分享、发布、预览、工具栏等散点目录

## 10. 文件级执行表

### 10.1 第一批文件级任务

| 文件 | 当前问题 | 具体动作 | 资源策略 |
|---|---|---|---|
| `apps/nextjs-app/src/features/app/automation/Pages.tsx` | 英文硬编码集中 | 替换侧栏、触发器卡片、按钮、空态、状态、运行详情等英文文案 | 优先评估 `automation` namespace |
| `apps/nextjs-app/src/features/app/published-app/preview/PublishedAppDevicePreview.tsx` | 标题、设备标签、状态统计英文 | 接入翻译，保留 `PWA` | `publishedApp` 或 `common` |
| `apps/nextjs-app/src/features/app/published-app/shell/DesktopShell.tsx` | 副标题英文 | `Published runtime` 接入翻译 | `publishedApp` 或 `common` |
| `apps/nextjs-app/src/features/app/published-app/runtime/PublishedResourceErrorBoundary.tsx` | 错误边界标题与描述英文 | 接入翻译 | `publishedApp` 或 `common` |
| `apps/nextjs-app/src/features/system/pages/ErrorPage.tsx` | 细节标签英文 | `Code`、`Message`、`Error id`、`ErrorMessage` 接入翻译 | `common.system.error.*` |

### 10.2 第二批文件级任务

| 文件 | 当前问题 | 具体动作 | 资源策略 |
|---|---|---|---|
| `apps/nextjs-app/src/features/app/blocks/AuthorityMatrix.tsx` | 说明、按钮、统计卡、状态英文 | 替换页面说明、卡片标题、状态、告警说明 | `common` |
| `apps/nextjs-app/src/features/app/blocks/setting/query-builder/PreviewTable.tsx` | `skip`、`take`、`Loading...` 展示英文 | 为展示层补中文标签 | `developer` 或 `setting` |
| `apps/nextjs-app/src/features/app/blocks/setting/query-builder/PreviewScript.tsx` | `Key`、`Value` 表头英文 | 接入翻译 | `developer` |
| `apps/nextjs-app/src/features/app/blocks/view/tool-bar/APIDialogContent.tsx` | `Text`、选项标签英文 | 展示标签中文化，协议值保留 | `table` + `developer` |
| `apps/nextjs-app/src/features/app/blocks/graph/ProgressBar.tsx` | 进度与提示英文 | 接入翻译 | `common` |
| `apps/nextjs-app/src/features/app/blocks/setting/oauth-app/OAuthAppDecisionPage.tsx` | 前置错误提示英文 | 接入翻译 | `oauth` 或 `common` |

## 11. 验收矩阵

### 11.1 静态验收

- 复扫所有前端真实页面中的可见英文硬编码
- 复扫所有新增或修改的 i18n key 是否在 `en` 与 `zh` 中同时存在
- 校验插值变量是否一致

### 11.2 页面验收

至少抽检以下页面：

- 自动化页面
- 发布预览页
- 发布运行态错误页
- 系统错误页
- 权限矩阵页
- 查询构建页
- API 工具面板
- AI 配置页

### 11.3 一致性验收

- `记录/字段/表/视图/筛选/排序/分组` 术语统一
- `工作流/触发器/快照/运行时` 术语统一
- 成功、失败、空态、确认句式统一
- 专有名词保留策略统一

## 12. 完成判定

只有同时满足以下条件，当前任务才可判定完成：

1. 中文资源缺失键补齐
2. 第一批高优先级页面英文硬编码清零
3. 关键页面静态复扫通过
4. 关键页面人工抽检通过
5. 术语一致性复查通过

## 13. 风险与回退原则

### 13.1 主要风险

- 只补资源，未覆盖页面硬编码
- 新增 key 无序扩散到 `common.json`
- 协议字段值与展示标签混用
- 默认语言仍为英文导致首屏漏出英文

### 13.2 回退原则

- 不回退用户现有改动
- 一次只收口一批页面
- 资源层问题优先在 locale 文件修复
- 页面层问题优先用最小改动接入现有 i18n 体系

## 14. 本文件用途

本文件是当前前端中文国际化任务的唯一执行基线。后续实施、复扫、验收和进度同步均以本文件为准，避免主线漂移、范围漂移和验收口径漂移。
