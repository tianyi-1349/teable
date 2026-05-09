# 可核验能力矩阵（中文）

> 说明：本表仅列出可在当前仓库中直接定位到代码定义/实现的能力项。

## A. 字段系统能力（Field）

| 分类 | 可核验能力 | 数量/类型 | 代码定义位置 | 上线风险等级 |
|---|---|---|---|---|
| 业务字段类型 | 字段类型总数 | 20 种 | `packages/core/src/models/field/constant.ts` | 中 |
| 业务字段类型 | `singleLineText` | 1 | 同上 | 低 |
| 业务字段类型 | `longText` | 1 | 同上 | 低 |
| 业务字段类型 | `user` | 1 | 同上 | 中 |
| 业务字段类型 | `attachment` | 1 | 同上 | 中 |
| 业务字段类型 | `checkbox` | 1 | 同上 | 低 |
| 业务字段类型 | `multipleSelect` | 1 | 同上 | 低 |
| 业务字段类型 | `singleSelect` | 1 | 同上 | 低 |
| 业务字段类型 | `date` | 1 | 同上 | 低 |
| 业务字段类型 | `number` | 1 | 同上 | 低 |
| 业务字段类型 | `rating` | 1 | 同上 | 低 |
| 业务字段类型 | `formula` | 1 | 同上 | 中 |
| 业务字段类型 | `rollup` | 1 | 同上 | 中 |
| 业务字段类型 | `conditionalRollup` | 1 | 同上 | 中 |
| 业务字段类型 | `link` | 1 | 同上 | 高 |
| 系统字段类型 | `createdTime` | 1 | 同上 | 低 |
| 系统字段类型 | `lastModifiedTime` | 1 | 同上 | 低 |
| 系统字段类型 | `createdBy` | 1 | 同上 | 低 |
| 系统字段类型 | `lastModifiedBy` | 1 | 同上 | 低 |
| 系统字段类型 | `autoNumber` | 1 | 同上 | 低 |
| 业务字段类型 | `button` | 1 | 同上 | 中 |
| 存储层字段类型 | DB 字段类型 | 7 种（`TEXT/INTEGER/DATETIME/REAL/BLOB/JSON/BOOLEAN`） | 同上 | 中 |

## B. 自动化/工作流能力（Workflow / Automation）

| 分类 | 可核验能力 | 说明 | 代码定义位置 | 上线风险等级 |
|---|---|---|---|---|
| 配置开关 | `workflowEnabled` | base 级工作流启用开关 | `packages/openapi/src/automation/app-mode/types.ts` | 中 |
| 页面联动 | Workflow 面板联动 App Mode 配置编辑 | 工作流上下文与 app-mode 同屏编辑 | `apps/nextjs-app/src/features/app/automation/workflow-panel/WorkFlowPanel.tsx` | 中 |
| 配置编辑 | 页面增删改排 | 页面新增、更新、删除、上下移动 | `AppModeConfigEditorCard.tsx` + `use-app-mode-config-editor.ts` | 中 |
| 配置编辑 | JSON 导入导出 | 草稿 JSON 导入、导出、校验 | `AppModeConfigEditorCard.tsx` | 中 |
| 动作触发 | action trigger 投影广播 | 通过 ShareDB presence 推送动作事件 | `apps/nestjs-backend/src/features/v2/v2-action-trigger.service.ts` | 高 |
| 动作触发 | `addRecord` | 记录新增触发 | 同上 | 高 |
| 动作触发 | `setRecord` | 记录更新/重排/批量更新触发 | 同上 | 高 |
| 动作触发 | `deleteRecord` | 记录删除触发 | 同上 | 高 |
| 动作触发 | `addField` | 字段新增触发 | 同上 | 高 |
| 动作触发 | `setField` | 字段更新触发 | 同上 | 高 |
| 动作触发 | `deleteField` | 字段删除触发 | 同上 | 高 |
| 动作触发 | `TableActionTriggerRequested` | 支持请求型自定义 actionKey 透传 | 同上 | 高 |

## C. AI Chat / AI 配置能力

| 分类 | 可核验能力 | 数量/类型 | 代码定义位置 | 上线风险等级 |
|---|---|---|---|---|
| AI 任务类型 | `Task` 枚举 | 3 种：`coding`、`embedding`、`translation` | `packages/openapi/src/ai/generate-stream.ts` | 中 |
| AI 接口 | 生成流接口 | `POST /api/{baseId}/ai/generate-stream` | 同上 + `apps/nestjs-backend/src/features/ai/ai.controller.ts` | 高 |
| AI 接口 | 获取 AI 配置 | `GET /{baseId}/ai/config` | `packages/openapi/src/ai/get-config.ts` + `ai.controller.ts` | 中 |
| AI 接口 | 获取禁用动作 | `GET /{baseId}/ai/disable-ai-actions` | `packages/openapi/src/ai/get-ai-disable-actions.ts` + `ai.controller.ts` | 中 |
| Chat 模型分层 | `chatModel` | `lg/md/sm` 三层模型 | `packages/openapi/src/admin/setting/update.ts` | 中 |
| Chat 能力标签 | `tags` | 支持模型标签返回（如 vision/tool-use） | `packages/openapi/src/ai/get-config.ts` | 中 |
| 能力兼容 | `ability -> tags` 映射 | `image/pdf/toolCall/reasoning/imageGeneration` 映射到标签 | `apps/nestjs-backend/src/features/ai/ai.service.ts` | 中 |
| Provider 适配 | 多模型 provider | OpenAI、Anthropic、Google、Azure、Cohere、Mistral、DeepSeek、XAI、TogetherAI、Ollama、OpenRouter、AI Gateway 等 | `apps/nestjs-backend/src/features/ai/util.ts` | 高 |
| 网关模型 | Gateway 模型配置与缓存 | 网关模型拉取、转换、标签与定价读取、内存缓存 | `apps/nestjs-backend/src/features/ai/ai.service.ts` | 高 |
| 能力开关 | `disableActions` | 可配置禁用 AI 动作列表 | `packages/openapi/src/admin/setting/update.ts` | 中 |
| 能力开关 | `disableModelSelection` | 可配置禁用模型选择 | 同上 | 中 |
| 并发配置 | 并发组 | `concurrencyGroups`、`perKey`、`taskTypes(text/image)` | 同上 | 高 |
| 附件传输 | 传输模式 | `url/base64` + 测试结果结构 | 同上 | 中 |
| 错误处理 | 流式错误归一化 | `stream_read_error/upstream_error/task execution failed` 归一化消息 | `apps/nestjs-backend/src/features/ai/ai.service.ts` + `util.ts` | 高 |

## D. Recharts 实现能力

| 分类 | 可核验能力 | 数量/类型 | 代码实现位置 | 上线风险等级 |
|---|---|---|---|---|
| 图形类型 | Recharts 图形总数 | 4 种：`Bar`、`Line`、`Area`、`Pie` | `.../chart-show/combo/Combo.tsx`、`.../chart-show/pie/Pie.tsx` | 中 |
| 组合图容器 | `ComposedChart` | 支持混合图 | `Combo.tsx` | 中 |
| 坐标系 | `XAxis`/`YAxis` | 支持多 Y 轴左右分布 | `Combo.tsx` | 中 |
| 辅助元素 | `CartesianGrid`/`ReferenceLine`/`Label`/`LabelList` | 已落地 | `Combo.tsx` | 低 |
| 交互 | 图例 hover/click | 高亮与隐藏系列 | `Combo.tsx`、`Pie.tsx` | 中 |
| 交互 | 点击筛选联动 | 写回 `ChartContext` 维度筛选 | `Combo.tsx`、`Pie.tsx` | 高 |
| 展示 | Tooltip 格式化 | prefix/suffix/decimal | `Combo.tsx`、`Pie.tsx` | 中 |
| 饼图增强 | activeShape、中心总计、百分比标签 | 已实现 | `Pie.tsx` | 中 |

## E. ECharts 实现能力

| 分类 | 可核验能力 | 数量/类型 | 代码实现位置 | 上线风险等级 |
|---|---|---|---|---|
| 图形类型 | ECharts 图形总数 | 3 种：`bar`、`line`、`pie` | `apps/nextjs-app/src/features/app/components/Chart/type.ts` | 低 |
| 渲染入口 | 统一 runtime 组件 | `echarts.init/getInstanceByDom` | `apps/nextjs-app/src/features/app/components/Chart/Chart.tsx` | 中 |
| 图形实现 | `Bar` 类 | x/y + series bar | `.../Chart/bar.ts` | 低 |
| 图形实现 | `Line` 类 | x/y + series line | `.../Chart/line.tsx` | 低 |
| 图形实现 | `Pie` 类 | legend + series pie | `.../Chart/pie.tsx` | 低 |
| 统计逻辑 | 基础统计 | `Count`、`Sum` | `.../Chart/type.ts` + `.../Chart/base.ts` | 低 |

## F. App Mode 具体实现能力

| 分类 | 可核验能力 | 数量/类型 | 代码定义位置 | 上线风险等级 |
|---|---|---|---|---|
| 页面类型 | 页面类型总数 | 4 种：`list`、`detail`、`dashboard`、`form` | `packages/openapi/src/automation/app-mode/types.ts` | 中 |
| 配置结构 | `version` | 默认 `1` | 同上 | 低 |
| 配置结构 | `pages[]` | 页面数组 | 同上 | 中 |
| 配置结构 | `linkedBaseIds[]` | 关联 base 列表 | 同上 | 中 |
| 配置结构 | `dashboardIds[]` | dashboard 列表 | 同上 | 中 |
| 配置结构 | `workflowEnabled` | 工作流启用开关 | 同上 | 中 |
| 治理结构 | `governance` | `roleMatrixVersion/auditPolicy/permissionMode` | 同上 | 高 |
| 治理类型 | `auditPolicy` | `strict`、`standard` | 同上 | 高 |
| 治理类型 | `permissionMode` | `inherited`、`isolated` | 同上 | 高 |
| 治理规则 | strict 约束 | strict 必须 isolated 且 `roleMatrixVersion >= 2` | `apps/nestjs-backend/src/features/app-mode/app-mode.service.ts` | 高 |
| 唯一性校验 | 页面 ID 唯一 | 禁止重复 page id | `types.ts` + `app-mode.service.spec.ts` | 中 |
| 唯一性校验 | linkedBaseIds 唯一 | 禁止重复 | 同上 | 中 |
| 唯一性校验 | dashboardIds 唯一 | 禁止重复 | 同上 | 中 |
| API | 读取配置 | `GET api/base/:baseId/app-mode/config` | `app-mode.controller.ts` | 中 |
| API | 更新配置 | `PUT api/base/:baseId/app-mode/config` | 同上 | 高 |

## 风险分级说明

| 等级 | 说明 |
|---|---|
| 低 | 主要为静态类型/基础渲染/无复杂状态联动能力，回归面较小 |
| 中 | 存在跨组件状态、数据格式或配置联动，需常规回归测试 |
| 高 | 涉及运行时协议、实时链路、权限治理、后端核心路径，需重点评审与专项验证 |
