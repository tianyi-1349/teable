# SDD 风格落地记录（2026-05-06）

## 目标

按 SDD 模式把 VoltAgent / Apple 两种品牌风格从设计资产落地到当前仓库，并在真实页面上完成第一轮试点改造。

## 设计资产落库

- 新增 `.monkeycode/docs/design-system/brands/voltagent/DESIGN.md`
- 新增 `.monkeycode/docs/design-system/brands/apple/DESIGN.md`
- 新增 `.monkeycode/docs/design-system/brands/README.md`
- 新增 `.monkeycode/docs/design-system/brand-mapping.md`

## 风格映射决策

- VoltAgent 用于更强工具感、技术感、操作密度高的产品面
- Apple 用于更平静、清晰、秩序感强的 detail / form / settings 面

## 第一轮试点页面

### 1. VoltAgent 试点

- 文件：`apps/nextjs-app/src/features/app/dashboard/DashboardHeader.tsx`
- 目标：增强 dashboard header 的工具感、边界感和可扫描性
- 手段：
  - 顶栏加入更深底色与轻微 blur
  - 输入框、按钮、更多菜单统一为暗色卡片化边界
  - 主要操作加入受控 emerald 强调

### 2. Apple 试点

- 文件：`apps/nextjs-app/src/features/app/components/setting/integration/third-party-integrations/Detail.tsx`
- 目标：让 detail 面更平静、更分组清晰、更易读
- 手段：
  - 头部信息收敛到更有秩序的卡片容器
  - 描述区与 scope 区分层明确
  - 文本层级更克制，链接色更精确

## 当前状态

- 设计资产已落库
- 项目映射已落库
- 两个真实页面已完成第一轮风格试点
- 待执行最小验证与必要修正
