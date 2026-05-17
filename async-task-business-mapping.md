# Async Task Business Mapping

> 文档分层：正式输出。
> 
> 这份文档是异步任务与业务域关系的正式映射表，用于支撑治理和后续维护。

## 1. 目的

这份文档用于补齐 `capability-gap-list.md` 中“队列与异步任务业务映射不集中”的剩余缺口。

当前仓库已经明确存在 BullMQ 异步执行基础，但此前盘点材料里更偏向说明“有队列能力”，缺少一份按业务归口的映射表。

## 2. 总体结论

当前仓库的异步任务能力已经覆盖 3 类稳定场景：

1. 邮件发送合并与延迟发送
2. 附件图片 / PDF 缩略图生成
3. CSV 导入分块执行与结果通知

这些任务都落在 `apps/nestjs-backend` 内部，通过 `@nestjs/bullmq` + `EventJobModule.registerQueue(...)` 注册执行。

## 3. 异步任务总表

| 业务域 | 队列名 | 主要任务 | 注册位置 | 处理器 | 触发方式 | 状态 |
|--------|--------|----------|----------|--------|----------|------|
| Mail Sender | `mailSenderQueue` | 通知邮件合并、延迟发送 | `features/mail-sender/open-api/mail-sender.merge.module.ts` | `MailSenderMergeProcessor` | 事件 `Events.NOTIFY_MAIL_MERGE` 入队 | 成熟 |
| Attachments Crop | `attachments-crop-queue` | 图片缩略图裁剪、PDF 首页缩略图生成 | `features/attachments/attachments-crop.module.ts` | `AttachmentsCropQueueProcessor` | 附件处理链路调用 queue.add | 成熟 |
| Import CSV | `import-table-csv-queue` | CSV 分块导入、错误收集、通知发回 | `features/import/open-api/import-csv.module.ts` | `ImportTableCsvQueueProcessor` | 导入流程入队子任务 | 成熟 |

## 4. 分域说明

### 4.1 Mail Sender

- 队列名
  - `mailSenderQueue`
- 代码入口
  - `apps/nestjs-backend/src/features/mail-sender/open-api/mail-sender.merge.module.ts`
  - `apps/nestjs-backend/src/features/mail-sender/open-api/mail-sender.merge.processor.ts`
- 任务类型
  - `notifyMailMerge`
  - `notifyMailMergeSend`
- 业务作用
  - 对通知邮件做短时间窗口聚合，避免同一用户收到大量碎片化邮件
  - 对聚合后的邮件做延迟发送
- 触发方式
  - 监听 `Events.NOTIFY_MAIL_MERGE`
  - 通过 `queue.add(...)` 入队
- 治理判断
  - 这是典型的“支撑型后台异步任务”，稳定服务于通知链路。

### 4.2 Attachments Crop

- 队列名
  - `attachments-crop-queue`
- 代码入口
  - `apps/nestjs-backend/src/features/attachments/attachments-crop.module.ts`
  - `apps/nestjs-backend/src/features/attachments/attachments-crop.processor.ts`
- 业务作用
  - 对图片附件生成大图 / 小图缩略图
  - 对 PDF 附件渲染首页并生成缩略图
  - 完成后发出 `Events.CROP_IMAGE_COMPLETE`
- 触发方式
  - 附件服务通过 `queue.add('attachment_crop_image', ...)` 入队
- 治理判断
  - 这是典型的“用户体验增强型后台任务”，服务于附件预览能力。

### 4.3 Import CSV

- 队列名
  - `import-table-csv-queue`
- 代码入口
  - `apps/nestjs-backend/src/features/import/open-api/import-csv.module.ts`
  - `apps/nestjs-backend/src/features/import/open-api/import-csv.processor.ts`
- 业务作用
  - 对导入数据做分块处理
  - 收集逐行导入错误并写回存储
  - 在最后一块完成后更新导入状态并发送通知
- 触发方式
  - 导入流程将子任务按块切分后入队
- 治理判断
  - 这是当前最典型的“高负载业务异步任务”，直接服务数据导入主链路。

## 5. 当前治理结论

### 5.1 当前治理主题已经从“有没有队列”转为“是否有统一目录”

当前仓库已经具备可验证的异步任务执行面：

- 有明确队列名
- 有明确模块注册位置
- 有明确处理器
- 有明确业务触发链路

当前真正需要持续维护的主题是统一治理视图，而异步执行能力本身已经具备。

### 5.2 当前最适合的治理动作

1. 在盘点文档中把异步任务作为系统支撑层单独列项
2. 在系统管理与外围索引中引用本映射文档
3. 后续若新增 Workflow / Notification / Search 等队列，再持续补进本表

## 6. 后续维护规则

1. 每新增一个 BullMQ 队列，都补充以下 5 项信息：
   - 队列名
   - 注册模块
   - 处理器
   - 业务域
   - 触发方式
2. 若队列被下线或合并，同步更新本表，不保留过期项
3. 架构评审涉及导入、通知、附件、后台批处理时，优先引用本表作为异步任务事实源
