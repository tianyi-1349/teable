# V1/V2 统一优化方案 —— 全局性·一致性·稳定性 精准执行

> 补充于: 2026-05-19
> 前置文档: architecture-audit-report.md（三维审计报告）
> 前置方案: V1/V2 统一路线图（阶段零～四 + 止损措施）

---

## 总览：两轮方案的定位差异

| | 上一轮方案 | 本轮补充 |
|---|---|---|
| **回答的问题** | 何时迁、迁什么 | 怎么迁得更快、中途更稳 |
| **核心手段** | 模块分类 + 时间阶段 + 止损规则 | 六个技术模式，降低迁移摩擦 |
| **适用范围** | 全模块迁移路线图 | 迁移过程中的架构质量和执行效率 |

---

## 优化一：统一 API 网关 —— 前端永远只调 V2 端点

### 目标

消除当前最可见的割裂——前端需要同时处理 REST 风格（V1）和 Action 风格（V2）的 API。

### 方案：V2 统一入口 + V1 适配器

前端调用链路：

```
前端 → V2 Contract-Http Handler → 领域逻辑判断:
                                    ├── V2 原生处理 (Table/Field/Record)
                                    └── V1Adapter → V1 Service (待迁移模块)
```

### 代码结构

```
packages/v2/contract-http-implementation/src/internal/
├── v1-adapter.ts              ← 统一入口, 一个 DI 对象包含所有 V1 子适配器
├── adapters/
│   ├── workflow.adapter.ts    ← 实现 WorkflowQueryPort 等 V2 接口
│   ├── space.adapter.ts       ← 实现 SpaceManagementPort
│   ├── dashboard.adapter.ts   ← 实现 DashboardPort
│   └── template.adapter.ts    ← 实现 TemplatePort
└── error-converter.ts         ← V1 exception → V2 DomainError 统一转换
```

### V1Adapter 代码示例

```typescript
// packages/v2/contract-http-implementation/src/internal/v1-adapter.ts

@Injectable()
export class V1Adapter {
  readonly workflow: WorkflowV1Adapter
  readonly space: SpaceV1Adapter
  readonly dashboard: DashboardV1Adapter

  constructor(
    private readonly workflowService: WorkflowService,
    private readonly spaceService: SpaceService,
    private readonly dashboardService: DashboardService,
  ) {
    this.workflow = new WorkflowV1Adapter(workflowService)
    this.space = new SpaceV1Adapter(spaceService)
    this.dashboard = new DashboardV1Adapter(dashboardService)
  }
}

class WorkflowV1Adapter {
  constructor(private readonly service: WorkflowService) {}

  async listWorkflows(baseId: string): Promise<Result<Workflow[], DomainError>> {
    try {
      const data = await this.service.getAllWorkflowByBaseId(baseId)
      return Result.ok(data.map(toWorkflowDto))
    } catch (err) {
      return Result.fail(domainError.fromUnknown(err))
    }
  }
}
```

### 效果

| 约束 | 改善 |
|------|------|
| 全局性 | 前端调用链路统一——所有 API 都走 V2 端点 |
| 一致性 | V1Adapter 强制 V2 风格的 `Result<T, DomainError>` 返回值 |
| 稳定性 | V1Adapter 可独立 mock，V2 Handler 测试不依赖 V1 真实环境 |

---

## 优化二：渐进式领域提取 —— 按逻辑密度而非模块边界

### 目标

不必等一个模块完整迁移才受益。高价值领域规则可以先提取并统一。

### 按逻辑密集度分层

```
优先级 1: 领域规则（纯函数，零依赖，最高共享价值）
  示例: 工作流激活条件校验、Webhook 签名验证、订阅状态机转换

优先级 2: 计算逻辑（纯函数或依赖少，可测试性高）
  示例: 公式求值、汇总聚合、字段类型校验

优先级 3: 副作用编排（事务/通知/审计，多端口依赖）
  示例: 创建记录后的级联通知、导入完成的审计写入

优先级 4: 简单 CRUD（无提取价值，保留在适配器即可）
  示例: Setting 查询、Template 列表、Health 检查
```

### 示例：Workflow 激活规则提取

```typescript
// V1 现状: workflow.service.ts 中的一段混合代码
async activateWorkflow(baseId, workflowId) {
  const wf = await this.prisma.workflow.findUnique(...)
  if (!wf) throw new NotFoundException()
  if (wf.status === 'active') throw new ConflictException(...)
  const base = await this.prisma.base.findUnique(...)
  if (base.plan === 'free' && wf.nodes.length > 5)
    throw new ForbiddenException(...)
  await this.prisma.workflow.update(...)
  await this.notificationService.send(...)
}

// 优化后:

// 层1: 纯函数领域规则 (packages/v2/core/src/domain/workflow/ActivationRules.ts)
// 零数据库依赖, 零 DI, 可独立单元测试
export function canActivateWorkflow(
  workflow: WorkflowState,
  baseLimits: BaseLimits,
): Result<void, DomainError> {
  if (workflow.status === 'active')
    return Result.fail(domainError.conflict('Workflow already active'))
  if (workflow.nodes.length === 0)
    return Result.fail(domainError.validation('Workflow has no nodes'))
  if (workflow.nodes.length > baseLimits.maxWorkflowNodes)
    return Result.fail(
      domainError.forbidden(`Node limit exceeded: ${baseLimits.maxWorkflowNodes}`)
    )
  return Result.ok(void 0)
}

// 层2: V2 Command Handler 编排规则 + 持久化 + 副作用
@Injectable()
export class ActivateWorkflowHandler {
  constructor(
    @Inject(WORKFLOW_REPO) private readonly repo: WorkflowRepository,
    @Inject(EVENT_BUS) private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: ActivateWorkflowCommand): Promise<Result<Workflow, DomainError>> {
    const ruleResult = canActivateWorkflow(cmd.workflow, cmd.baseLimits)
    if (ruleResult.isFail) return ruleResult

    const updated = await this.repo.save(cmd.workflow.activate())
    await this.eventBus.publish(new WorkflowActivatedEvent(updated))

    return Result.ok(updated)
  }
}
```

### 效果

提取出的纯函数可被 V1 和 V2 **同时调用**，同一规则不再在两个地方实现。

---

## 优化三：CQRS Light —— 降低简单模块的 V2 迁移成本

### 问题

当前 V2 Full CQRS 模式每个操作需要：Command 类 + Handler 类 + DI 注册 + Contract + Handler = 5 个文件。对于 Setting、Template 这样的纯 CRUD 模块，仪式感过重。

### 方案：两种 CQRS 模式并存

```typescript
// Full CQRS (现有，用于复杂领域):
@Injectable()
export class CreateTableHandler implements ICommandHandler<CreateTableCommand, Table> {
  constructor(private tableRepo: TableRepository, private eventBus: EventBus) {}
  async execute(cmd: CreateTableCommand): Promise<Result<Table, DomainError>> {
    // 复杂领域逻辑
  }
}

// CQRS Light (新增，用于简单模块):
type SimpleCommandHandler<TInput, TOutput> = (
  input: TInput,
  deps: StandardDeps,  // { db, logger, currentUser }
) => Promise<Result<TOutput, DomainError>>

const getSettingHandler: SimpleCommandHandler<{ key: string }, SettingValue> =
  async (input, { db }) => {
    const row = await db.setting.findUnique({ where: { key: input.key } })
    if (!row) return Result.fail(domainError.notFound('Setting', { key: input.key }))
    return Result.ok(row.value)
  }
```

### 模式选择矩阵

| 模块 | CQRS 模式 | 判断依据 |
|------|:---:|------|
| Table/Record/Field | Full | 状态机、事务编排、多端口依赖 |
| Workflow | Full | 状态机、事件驱动、多触发器 |
| Organization (新建) | Full | 层级树、成员邀请、权限 |
| Billing (新建) | Full | 订阅状态机、配额计算 |
| Authority Matrix (新建) | Full | 策略引擎、矩阵评估 |
| Space | Full | 协作者管理、资源配额 |
| Dashboard | Light | CRUD + 插件布局 |
| Template | Light | 列表/详情/发布 |
| Setting | Light | 键值对读写 |
| Notification | Light | 标记已读/列表 |
| Trash | Light | 软删除/恢复 |
| Comment | Light | CRUD |

### 效果：文件数量对比

| | Full CQRS | CQRS Light |
|---|---|---|
| 每个操作的文件数 | 5 | 2 (Contract + Handler) |
| 10 个简单模块的总文件数 | ~200 | ~80 |
| 减少比例 | — | 60% |

---

## 优化四：依赖倒置 —— V2 不直接依赖 V1 代码

### 问题

Workflow 当前状态：V2 Handler 直接 `import { WorkflowService } from 'apps/nestjs-backend/...'`。这是架构方向性错误——新架构依赖旧架构。

### 方案

```
正确依赖方向:
  V2 Handler → V2 Port (interface) ← V1 Adapter (实现) → V1 Service
                    ↑
             V2 Native Impl (实现，就绪后替换 Adapter)
```

### 代码

```typescript
// packages/v2/core/src/ports/WorkflowQueryPort.ts
// 定义在 V2 核心层，不依赖任何 V1 代码
export interface WorkflowQueryPort {
  listByBaseId(baseId: string): Promise<Result<WorkflowDto[], DomainError>>
  getById(workflowId: string): Promise<Result<WorkflowDto, DomainError>>
}

// packages/v2/core/src/di/tokens.ts
export const WORKFLOW_QUERY_PORT = Symbol('WorkflowQueryPort')

// apps/nestjs-backend/src/v2-adapters/workflow-query.adapter.ts
// 实现放在 V1 目录中 (apps/nestjs-backend), 实现 V2 的端口接口
@Injectable()
export class WorkflowQueryV1Adapter implements WorkflowQueryPort {
  constructor(private readonly service: WorkflowService) {}

  async listByBaseId(baseId: string) {
    try {
      const data = await this.service.getAllWorkflowByBaseId(baseId)
      return Result.ok(data.map(toDto))
    } catch (err) {
      return Result.fail(domainError.fromUnknown(err))
    }
  }
}

// V2 Handler —— 永远只依赖 V2 端口接口，不依赖 V1 具体类
@Injectable()
export class ListWorkflowsHandler {
  constructor(
    @Inject(WORKFLOW_QUERY_PORT)
    private readonly query: WorkflowQueryPort,  // ← 只有 V2 接口
  ) {}

  async execute(q: ListWorkflowsQuery) {
    return this.query.listByBaseId(q.baseId)
  }
}

// 切换时机: 当 V2 原生实现就绪
// { provide: WORKFLOW_QUERY_PORT, useClass: WorkflowQueryV1Adapter }  // 当前
// { provide: WORKFLOW_QUERY_PORT, useClass: WorkflowQueryV2Native }   // 未来
// V2 Handler 代码零改动
```

### 效果

| 约束 | 改善 |
|------|------|
| 全局性 | V1 适配器是 V2 端口的唯一实现点，依赖关系可审计 |
| 一致性 | V2 Handler 不跨层引用 V1 代码 |
| 稳定性 | DI 切换即可替换实现，无级联改动 |

---

## 优化五：特性开关路由 —— 安全渐进式上线

### 目标

一次性将前端切换到 V2 端点风险高。用特性开关实现可观测的灰度上线。

### 方案

```typescript
// packages/v2/core/src/ports/FeatureFlags.ts
export interface FeatureFlags {
  isEnabled(flag: string, context?: { baseId?: string; userId?: string }): boolean
}

// V2 Handler 中的灰度路由:
export class CreateRecordHandler {
  constructor(
    @Inject(FEATURE_FLAGS) private readonly flags: FeatureFlags,
    @Inject('V2ComputedFields') private readonly v2Calc: ComputedFieldService,
    @Inject('V1ComputedFields') private readonly v1Calc: V1ComputedFieldAdapter,
  ) {}

  async execute(cmd: CreateRecordCommand) {
    // 灰度: 10% 用户走 V2 新计算逻辑
    if (this.flags.isEnabled('v2-computed-fields', { baseId: cmd.baseId })) {
      return this.v2Calc.compute(cmd)
    }
    return this.v1Calc.compute(cmd)
  }
}

// 灰度策略:
// 阶段1: isEnabled → false (所有流量走 V1)
// 阶段2: isEnabled → userId hash % 100 < 10 (10% 灰度)
// 阶段3: isEnabled → userId hash % 100 < 50 (50% 灰度)
// 阶段4: isEnabled → true (全量)
// 阶段5: 移除分支代码，仅保留 V2 路径
```

### 效果

| 约束 | 改善 |
|------|------|
| 稳定性 | 可观测灰度上线，异常可秒级回滚 |
| 全局性 | 灰度数据对比 V1/V2 行为差异，主动发现不一致 |
| 一致性 | 渐进替代，不再有"断电切换"式的割裂感 |

---

## 优化六：自动化契约测试生成 —— 声明式而非手写

### 目标

降低 V1/V2 行为一致性验证的测试编写成本。

### 方案：声明式契约测试框架

```typescript
// packages/v2/e2e/src/contract-specs/record.contract-spec.ts

contractSpec('Record CRUD 行为一致性', (spec) => {
  const table = spec.useTable({
    name: 'Test',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Score', type: 'number' },
    ]
  })

  spec.it('创建简单记录', {
    request: { method: 'POST', body: { fields: { Name: 'hello' } } },
    assert: {
      status: (s) => s === 200 || s === 201,
      'body.fields.Name': 'hello',
      'body.createdTime': (v) => expect(v).toBeDefined(),
    }
  })

  spec.it('创建含公式字段的记录', {
    before: () =>
      spec.addField(table.id, {
        name: 'Upper', type: 'formula',
        expression: 'UPPER({Name})'
      }),
    request: { method: 'POST', body: { fields: { Name: 'hello' } } },
    assert: {
      'body.fields.Upper': 'HELLO',  // 断言公式计算结果一致
    }
  })

  spec.it('更新记录并验证 modifiedTime', {
    before: (ctx) =>
      ctx.record = ctx.createRecord(table.id, { fields: { Name: 'orig' } }),
    request: {
      method: 'PATCH',
      urlParams: { recordId: (ctx) => ctx.record.id },
      body: { fields: { Name: 'updated' } },
    },
    assert: {
      'body.fields.Name': 'updated',
      'body.lastModifiedTime': (v) => expect(new Date(v)).toBeAfter(ctx.startTime),
    }
  })
})

// 框架自动执行:
// 1. 调用 V1 endpoint → 记录响应 A → 清理数据
// 2. 调用 V2 endpoint → 记录响应 B
// 3. 对 A 和 B 分别运行断言
// 4. 输出差异报告
```

### 效果

| | 手写测试 | 声明式 |
|---|---|---|
| 每个操作点测试代码量 | ~40 行 | ~5 行 |
| 覆盖 20 个核心 CRUD 操作 | ~800 行 | ~100 行 |
| 新增断言条件 | 需要理解测试流程 | 添加一行 assert 键值对 |

---

## 综合执行策略：三轮方案叠加

```
时间线:
                   月1            月2            月3            月4
                    ├──────────────┼──────────────┼──────────────┼──────────────┤

上一轮:冻结 V1     ██
上一轮:V2 内部分层  ████
上一轮:止损 CI 规则 ████

本轮:统一API网关   ████████████████████████████████████████████████████████  (持续)
本轮:依赖倒置       ██████████████                                    (Workflow先做)
本轮:CQRS Light                                    ██████████████  (简单模块用)
本轮:渐进式提取     ████████████████████████████████████████████████████████  (持续)
本轮:特性开关       ████████████████████████████████████████████████████████  (持续)
本轮:契约测试框架   ██████████████                                    (框架搭建)
本轮:契约测试用例         ████████████████████████████████████████████  (持续编写)

模块迁移:
  Workflow修复      ████████████████
  Organization新建         ████████████████
  Billing新建                     ████████████████
  AuthMatrix新建                         ████████████████
  Space迁移                                      ████████████
  Template/Dash迁移                                     ████████████
```

---

## 三轮方案对比矩阵

| | 第一轮（审计报告） | 第二轮（迁移路线图） | 第三轮（本优化方案） |
|---|---|---|---|
| **成果** | 发现 4 个空壳、2 个断裂点、V2 35% 覆盖 | 模块分类、6 阶段时序、止损规则 | 6 个技术执行模式 |
| **解决什么** | "问题在哪" | "何时迁、迁什么" | "怎么迁快且稳" |
| **对全局性** | 量化缺口 | 按分类补齐 | 统一入口 + 渐进提取 |
| **对一致性** | 发现 API/错误/Workflow 分裂 | 契约测试 + 分类模板 | 统一网关 + CQRS Light + 依赖倒置 |
| **对稳定性** | 发现双轨行为差异风险 | 阶段四渐进下线 | 特性开关灰度 + 自动化测试 |

---

> 版本: v1.0 | 配合 architecture-audit-report.md 阅读
