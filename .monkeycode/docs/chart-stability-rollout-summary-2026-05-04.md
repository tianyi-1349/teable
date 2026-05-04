# 图表稳定性改造总览（2026-05-04）

## 目标

在 `apps/nextjs-app` 中收敛 ECharts 使用方式，优先保障稳定性与可靠性，减少实例泄漏、重复初始化、重绘抖动和回归风险。

## 改造范围

- `apps/nextjs-app/src/features/app/components/Chart/Chart.tsx`
- `apps/nextjs-app/src/features/app/blocks/dashboard/Dashboard.tsx`
- `apps/nextjs-app/src/features/app/components/Chart/Chart.spec.tsx`
- `apps/nextjs-app/src/features/app/components/Chart/STABILITY_CHECKLIST.md`
- `apps/nextjs-app/src/features/app/components/Chart/USAGE.md`
- `AGENTS.md`
- `.github/pull_request_template.md`
- `.monkeycode/MEMORY.md`

## 关键变更

### 1) Chart 生命周期稳定化

文件：`apps/nextjs-app/src/features/app/components/Chart/Chart.tsx`

- 改为“单容器单实例”模式：优先复用 `echarts.getInstanceByDom(...)`，不存在再 `init(...)`。
- resize 时仅调用 `chart.resize(...)`，不再重复初始化。
- 组件卸载时统一 `dispose()`。
- 图表配置更新改为在独立 effect 中执行 `setOption(...)`。

### 2) 更新策略可配置（默认最安全）

文件：`apps/nextjs-app/src/features/app/components/Chart/Chart.tsx`

- 新增 `updateMode?: 'replace' | 'merge'`。
- 默认 `replace`：`notMerge: true`，优先避免旧配置残留。
- 显式 `merge`：`notMerge: false`，仅用于确有增量合并需求的场景。

### 3) Dashboard 去除全局 resize 风暴

文件：`apps/nextjs-app/src/features/app/blocks/dashboard/Dashboard.tsx`

- 删除通过 `window.dispatchEvent(new Event('resize'))` 强制驱动图表刷新的链路。
- 改为依赖 Chart 基座内部容器观察机制。
- 使用点显式传入 `updateMode="replace"`，锁定稳态策略。

### 4) 自动化回归测试补齐

文件：`apps/nextjs-app/src/features/app/components/Chart/Chart.spec.tsx`

- 用例 1：初始化、更新、resize、卸载销毁全链路验证。
- 用例 2：`updateMode="merge"` 参数分支验证。
- 用例 3：已有实例复用路径验证（不重复 `init`）。

### 5) 规范与门禁固化

- `apps/nextjs-app/src/features/app/components/Chart/USAGE.md`
  - 明确 Chart 基座是 nextjs-app 内唯一 ECharts 运行时入口。
  - 禁止业务代码直接 `echarts.init(...)`。
  - 明确 `replace/merge` 选择规则。

- `apps/nextjs-app/src/features/app/components/Chart/STABILITY_CHECKLIST.md`
  - 增补更新策略与回归检查项。

- `AGENTS.md`
  - 新增 `Frontend Chart Stability` 规则，提升团队层面一致性。

- `.github/pull_request_template.md`
  - 新增图表专项风险评估与验证清单，纳入 PR 审查门禁。

## 验证结果

- `pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx`：通过（3 passed）。
- `pnpm --filter @teable/app typecheck`：通过。

## 收益

- 消除高风险重复初始化与未销毁实例路径。
- 降低 dashboard 场景重绘噪声与抖动。
- 形成“代码修复 + 自动化测试 + 规范门禁 + PR 流程”闭环。

## 后续建议

1. 若新增 ECharts 图表类型，优先扩展 `Chart.spec.tsx`，再接业务页面。
2. 若出现性能瓶颈，再按场景评估 `updateMode="merge"`，并补回归说明。
3. 在代码评审中将本次模板清单设为必填项，持续防回归。
