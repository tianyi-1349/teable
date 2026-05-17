# 仓库能力盘点执行提示词

> 文档分层：正式标准。
> 
> 这份文档提供与 `capability-inventory-execution-playbook.md` 配套的执行提示词模板，当前盘点流程以这里的提示词口径为准。

## 当前固定执行顺序

1. `GPT-5.5`：读取本地仓库和现有盘点文档，输出正式主稿
2. `DeepSeek V4 Pro`：只复核边界项和高不确定域
3. `GPT-5.5`：吸收复核结果，输出唯一正式版

---

## Step 1: GPT-5.5 主盘点

```text
你现在是仓库能力盘点主模型。请读取本地仓库代码和已有盘点文档，对当前仓库“已经实现的功能能力明细”和“剩余缺口清单”做正式收口。

输入材料：
1. `repo-structure-map.md`
2. `implemented-capabilities.md`
3. `capability-gap-list.md`
4. `capability-gap-task-matrix.md`
5. `v1-v2-coverage-matrix.md`
6. 各专项路线图和边界说明文档

分析目标：
1. 校正当前正式能力清单
2. 校正缺口清单和修复任务矩阵状态
3. 对每个核心域给出 V1/V2 覆盖判断
4. 明确哪些项已收口，哪些项仍是边界项

输出要求：
1. 更新正式能力明细口径
2. 更新缺口状态
3. 更新矩阵状态
4. 更新覆盖矩阵结论
5. 标出边界项与后续推进条件

要求：
- 只依据真实代码入口、契约、service、handler、controller 给出结论
- 保持单一正式口径
- 不输出多套候选结论
```

---

## Step 2: DeepSeek V4 Pro 边界复核

```text
你现在是边界复核模型。请不要重做全量能力盘点，只复核以下高不确定项：

1. `billing/subscription`
2. `usage`
3. `Aggregation / Search`
4. `Undo / Redo`
5. `Share / Published` 统一语义边界

你的输入材料：
1. GPT-5.5 主稿中的相关片段
2. 本地仓库代码
3. `billing-usage-boundary-note.md`
4. `v1-v2-coverage-matrix.md`
5. `share-published-governance-roadmap.md`

分析目标：
1. 判断主稿中的边界结论是否稳固
2. 只指出确有代码证据支撑的修订建议
3. 不输出新的全量能力目录

输出格式：

# Boundary Review Notes

## 1. 复核范围

## 2. 逐项结论
### 条目名称
- 当前主稿结论：
- 代码证据是否足够：是 / 否
- 是否建议修订：是 / 否
- 修订建议：
- 证据文件：

## 3. 最终建议
- 哪些保持不变
- 哪些需要主模型修订

要求：
- 只复核指定边界项
- 不要重做全量主稿
- 不要输出第二套正式口径
```

---

## Step 3: GPT-5.5 最终收口

```text
你现在是最终收口模型。请基于主稿和边界复核结果，输出唯一正式版盘点结论。

输入材料：
1. GPT-5.5 主稿
2. DeepSeek 边界复核说明
3. 本地代码仓库

你的职责：
1. 只吸收有代码证据支撑的复核意见
2. 更新正式结论，不保留多套口径
3. 同步缺口清单、矩阵、覆盖矩阵和路线图状态
4. 输出唯一正式版

最终输出要求：
1. 更新正式能力盘点文档
2. 更新 `capability-gap-list.md`
3. 更新 `capability-gap-task-matrix.md`
4. 更新 `v1-v2-coverage-matrix.md`
5. 必要时更新相关路线图文档
```
