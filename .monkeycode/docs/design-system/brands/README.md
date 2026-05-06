# 品牌源文件目录

本目录用于保存外部品牌设计规范的来源文件，以及它们在当前仓库中的使用边界。

## 目录说明

- `apple/DESIGN.md`: 来自 `VoltAgent/awesome-design-md` 的 Apple 风格原始设计规范副本。
- `voltagent/DESIGN.md`: 来自 `VoltAgent/awesome-design-md` 的 VoltAgent 风格原始设计规范副本。

## 使用原则

- 这些文件是品牌风格输入源，不直接覆盖项目级 `DESIGN.md`。
- 真正落地到当前仓库时，应优先参考：
  1. `AGENTS.md`
  2. `.monkeycode/docs/design-system/DESIGN.md`
  3. 对应 `page-recipes/*.md`
  4. 本目录中的品牌源文件

## 当前实施分工

- VoltAgent: 适合作为 `dashboard`、`workflow`、配置密集界面的强化风格输入。
- Apple: 适合作为 `record detail`、`form`、`settings`、`side panel` 的平静化风格输入。
