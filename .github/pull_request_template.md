## 变更类型

- [ ] 功能
- [ ] 修复
- [ ] 重构
- [ ] 文档
- [ ] 其他

## 变更说明

请简述为什么做这次改动，以及预期收益。

## 风险评估

- [ ] 是否涉及图表渲染或图表交互逻辑
- [ ] 是否涉及生命周期管理（init/reuse/dispose）
- [ ] 是否涉及 option 更新策略（replace/merge）
- [ ] 是否涉及容器尺寸监听或布局联动
- [ ] 是否可能影响现有 Dashboard 页面

若勾选以上任一项，请补充风险与回滚方案：

## 图表专项检查（仅图表相关改动）

- [ ] 未在业务代码直接调用 `echarts.init(...)`
- [ ] 仍通过 `features/app/components/Chart/Chart` 统一接入
- [ ] 默认使用 `updateMode="replace"`，若用 `merge` 已说明必要性
- [ ] 已验证 resize 触发不会导致重复初始化
- [ ] 已验证组件卸载后实例被正确销毁

## 验证清单

- [ ] `pnpm --filter @teable/app exec vitest run src/features/app/components/Chart/Chart.spec.tsx`（图表相关必跑）
- [ ] `pnpm --filter @teable/app typecheck`
- [ ] 其他定向验证（按改动补充）

## 回归关注点

- [ ] 路由切换后图表是否正常显示
- [ ] 面板/容器尺寸变化后图表是否正常 resize
- [ ] 高频更新场景下是否出现明显抖动或内存增长

## 备注

如有已知限制、后续跟进项或跨模块影响，请在此说明。
