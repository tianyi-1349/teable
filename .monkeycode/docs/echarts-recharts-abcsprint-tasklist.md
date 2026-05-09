# ECharts/Recharts A-B-C 实施任务清单（PR 级别）

## PR-1：统一 Schema 与类型入口（不新增渲染）

### 目标
- 扩展 chart block 的图表类型定义与配置 schema。
- 保持 `interaction.filter` 协议不变。

### 文件级任务
1. `apps/nextjs-app/src/features/app/blocks/chart/types.ts`
- 新增配置 schema：`scatterConfigSchema`、`funnelConfigSchema`、`progressConfigSchema`、`roseConfigSchema`、`radarConfigSchema`
- 预留 B/C 阶段 schema：`gauge/heatmap/sunburst/candlestick/boxplot/parallel/pictorialBar/treemap/sankey/graph/map/themeRiver/wordCloud`
- 扩展 `chartConfigSchema` union
- 保持 `IChartInteractionFilter` 原样（`source/dimensionColumn/dimensionValues`）

2. `apps/nextjs-app/src/features/app/blocks/chart/components/chart/chart-config/TypeSelector.tsx`
- 新增图表类型选项（分阶段可用标记）

3. `apps/nextjs-app/src/features/app/blocks/chart/components/chart/chart-config/ChartForm.tsx`
- 新类型映射到对应 Form 占位组件（先占位，渲染后续 PR）

### 验收
1. schema 单测通过（合法/非法输入）
2. `pnpm --filter @teable/app typecheck` 通过

---

## PR-2：A 阶段 Recharts 快速交付

### 目标
- 基于现有 Recharts 架构交付：`scatter/funnel/progress/rose/radar`。
- 复用现有交互筛选协议。

### 文件级任务
1. 新增展示组件
- `.../chart-show/scatter/Scatter.tsx`
- `.../chart-show/funnel/Funnel.tsx`
- `.../chart-show/progress/Progress.tsx`
- `.../chart-show/rose/Rose.tsx`
- `.../chart-show/radar/Radar.tsx`

2. 新增配置组件
- `.../chart-config/form/ScatterForm.tsx`
- `.../chart-config/form/FunnelForm.tsx`
- `.../chart-config/form/ProgressForm.tsx`
- `.../chart-config/form/RoseForm.tsx`
- `.../chart-config/form/RadarForm.tsx`

3. 分发入口
- `.../chart-show/ChartDisplay.tsx` 新增对应类型分支

4. 交互联动
- 所有新图点击事件统一调用 `onInteractionFilterChange`
- `source` 值规范：`scatter/funnel/progress/rose/radar`

### 验收
1. 每图至少 1 个渲染测试
2. 每图至少 1 个点击筛选联动测试
3. `pnpm --filter @teable/app exec vitest run src/features/app/blocks/chart/**/**.spec.tsx`
4. `pnpm --filter @teable/app typecheck`

---

## PR-3：ECharts 子渲染基础层（分流层）

### 目标
- 引入 ECharts 子渲染器，不改现有 Recharts 图。
- 让 B/C 阶段图可以按类型路由到 ECharts。

### 文件级任务
1. 新增目录与基础组件
- `.../chart-show/echarts/EChartsRenderer.tsx`
- `.../chart-show/echarts/types.ts`
- `.../chart-show/echarts/events.ts`（点击事件转 `interaction.filter`）

2. 分发逻辑
- `.../chart-show/ChartDisplay.tsx`
- 根据 `config.type` 分流到 Recharts 或 ECharts renderer

3. 复用运行时入口
- 统一调用 `apps/nextjs-app/src/features/app/components/Chart/Chart`
- 不在业务页面直接 `echarts.init(...)`

### 验收
1. 分流测试：同一 `ChartDisplay` 能正确路由不同类型
2. `Chart.spec.tsx` 与新增分流测试通过
3. `pnpm --filter @teable/app typecheck`

---

## PR-4：B 阶段 ECharts 第一批

### 目标
- 交付高价值中复杂图：`gauge/heatmap/sunburst/candlestick`。

### 文件级任务
1. 新增 ECharts 图构建器
- `.../chart-show/echarts/GaugeChart.tsx`
- `.../chart-show/echarts/HeatmapChart.tsx`
- `.../chart-show/echarts/SunburstChart.tsx`
- `.../chart-show/echarts/CandlestickChart.tsx`

2. 新增配置表单
- `.../chart-config/form/GaugeForm.tsx`
- `.../chart-config/form/HeatmapForm.tsx`
- `.../chart-config/form/SunburstForm.tsx`
- `.../chart-config/form/CandlestickForm.tsx`

3. 数据映射与校验
- 在对应 chart builder 中实现维度列/数值列映射校验
- 对空数据和异常列类型给出 UI 级错误提示

### 验收
1. 每图 option 生成测试
2. heatmap/sunburst/candlestick 的数据映射异常测试
3. `pnpm --filter @teable/app typecheck`

---

## PR-5：C 阶段高级图（ECharts）

### 目标
- 交付高复杂度图：`sankey/graph/map/themeRiver`，并评估 `wordCloud`。

### 文件级任务
1. 新增 ECharts 图构建器
- `.../chart-show/echarts/SankeyChart.tsx`
- `.../chart-show/echarts/GraphChart.tsx`
- `.../chart-show/echarts/MapChart.tsx`
- `.../chart-show/echarts/ThemeRiverChart.tsx`
- `.../chart-show/echarts/WordCloudChart.tsx`（可选）

2. 新增配置表单
- `.../chart-config/form/SankeyForm.tsx`
- `.../chart-config/form/GraphForm.tsx`
- `.../chart-config/form/MapForm.tsx`
- `.../chart-config/form/ThemeRiverForm.tsx`
- `.../chart-config/form/WordCloudForm.tsx`（可选）

3. 地图与扩展依赖
- `MapChart` 增加 map 资源注册策略（GeoJSON 源）
- `wordCloud` 如启用需引入 `echarts-wordcloud`

### 验收
1. 每图最小可渲染数据样例通过
2. sankey/graph/map 的交互筛选事件符合统一协议
3. `pnpm --filter @teable/app typecheck`

---

## 统一验收清单（每个 PR 都执行）

1. 不修改 `IChartInteractionFilter` 结构
2. `ChartDisplay` 分流逻辑覆盖新增类型
3. 单测：渲染 + 交互 + schema
4. `pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx`
5. `pnpm --filter @teable/app typecheck`

---

## 备注

1. `统计数字(KPI)`保持非 ECharts 组件实现，消费同一筛选上下文。
2. `Chord` 不纳入当前范围（ECharts 内置支持历史变更，维护成本高）。
