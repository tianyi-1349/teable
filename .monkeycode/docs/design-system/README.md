# 设计规范目录

本目录用于维护当前仓库内可被 AI 和人工协作共同消费的设计规范。

## 文件说明

- `DESIGN.md`: 项目级产品 UI 设计规范，定义视觉语言、交互原则和实现约束。
- `page-recipes/*.md`: 面向具体页面类型的补充规则，提供更接近实际改造任务的上下文。
- `brands/*/DESIGN.md`: 外部品牌风格源文件的本地参考副本。
- `brand-mapping.md`: 外部品牌风格如何映射到当前仓库产品 UI 的实施说明。

## 使用方式

当任务涉及 `apps/nextjs-app` 的页面视觉、布局或交互调整时，建议按以下顺序读取：

1. `AGENTS.md`
2. `.monkeycode/docs/design-system/DESIGN.md`
3. 对应的 `page-recipes/*.md`（如存在）
4. 目标代码文件

## 当前范围

当前规范优先覆盖以下页面类型：

- dashboard
- record detail
- form
- table-adjacent side panels

主表格编辑区暂不作为第一阶段强约束范围。

当前已落库的 page recipe：

- `page-recipes/dashboard.md`
- `page-recipes/record-detail.md`
- `page-recipes/form.md`
