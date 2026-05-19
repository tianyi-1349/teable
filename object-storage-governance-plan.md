# Object Storage Governance Plan

> 文档分层：正式输出。
> 
> 这份文档是对象存储能力治理的正式收口文档，用于把附件上传、访问、缩略图、provider 适配和业务入口整理成统一基础设施视图。

## 1. 目的

这份文档用于收口 `capability-gap-task-matrix.md` 中与对象存储相关的治理主题：

- `5.3 对象存储可抽象程度不足`

当前仓库的文件能力已经可用，但对象存储视图主要散落在 `attachments` 域、provider 适配层和若干业务消费点之间。

这份文档的目标是先把当前真实结构、统一抽象点和后续治理方向收清楚，避免后续继续把对象存储误判成“只有附件接口”。

## 2. 当前事实

### 2.1 公开业务入口已经稳定

后端附件主入口位于：

1. `apps/nestjs-backend/src/features/attachments/attachments.controller.ts`
2. `apps/nestjs-backend/src/features/attachments/attachments.service.ts`

当前稳定公开能力包括：

1. 上传直传入口
   - `PUT /api/attachments/upload/:token`
   - `POST /api/attachments/upload/:token`
2. 文件读取入口
   - `GET /api/attachments/read/:path(*)`
3. 签名入口
   - `POST /api/attachments/signature`
4. 上传通知入口
   - `POST /api/attachments/notify/:token`

### 2.2 对象存储抽象已经存在

统一抽象点位于：

1. `apps/nestjs-backend/src/features/attachments/plugins/adapter.ts`
2. `apps/nestjs-backend/src/features/attachments/plugins/storage.ts`
3. `apps/nestjs-backend/src/features/attachments/attachments-storage.service.ts`

其中：

1. `StorageAdapter`
   - 定义 presigned、对象元信息、预览 URL、上传、裁剪、下载、删除等统一能力面
2. `storageAdapterProvider`
   - 按配置切换 `local`、`minio`、`s3`、`aliyun`
3. `AttachmentsStorageService`
   - 承接 URL 签发缓存、缩略图 URL、表格缩略图生成、裁剪和事件发射

### 2.3 provider 适配已经形成稳定切换层

当前 provider 实现包括：

1. `plugins/local.ts`
2. `plugins/minio.ts`
3. `plugins/s3.ts`
4. `plugins/aliyun.ts`

这说明“对象存储能力”已经不是单一 S3 直连代码，而是具备 provider 切换能力的统一适配层。

### 2.4 缩略图和衍生处理已经进入异步执行链路

当前缩略图处理链路位于：

1. `apps/nestjs-backend/src/features/attachments/attachments-crop.processor.ts`
2. `apps/nestjs-backend/src/features/attachments/pdf-thumbnail.ts`
3. `apps/nestjs-backend/src/features/attachments/attachments-storage.service.ts`

关键事实：

1. 图片附件通过 `cropTableImage(...)` 生成缩略图
2. PDF 通过 `renderPdfFirstPageAsImage(...)` 生成首页图片后再上传缩略图
3. `attachments-crop-queue` 已承担衍生资源生成任务

### 2.5 对象存储能力已经被多业务消费

当前明确消费对象存储能力的业务包括：

1. 表格附件上传和预览
2. Base/template 图片裁剪
3. 评论等带附件能力的链路
4. Published / logo / plugin / automation 等按 `UploadType` 分桶的上传场景

统一分桶规则位于：

1. `StorageAdapter.getBucket(...)`
2. `StorageAdapter.getDir(...)`

## 3. 当前统一抽象视图

当前对象存储能力已经可以按四层理解：

1. 业务入口层
   - `attachments.controller.ts`
   - 负责签名、上传、读取、通知
2. 业务编排层
   - `attachments.service.ts`
   - 负责 token、缓存、数据库元信息、上传后通知
3. 存储能力层
   - `attachments-storage.service.ts`
   - 负责 URL、缩略图、裁剪、衍生资源
4. provider 适配层
   - `plugins/*.ts`
   - 负责本地、MinIO、S3、阿里云的具体实现

## 4. 当前治理主题

当前治理主题已经从“缺少能力”转成“统一命名与治理视图持续增强”：

1. “对象存储”能力仍主要通过 `attachments` 域对外呈现
2. 业务方更容易看到附件接口，不容易直接看到底层统一抽象
3. 当前已经有一份专门面向评审和治理的对象存储总览文档

这份文档补齐后，`5.3` 的主要治理缺口已经收口。

## 5. 后续治理规则

后续继续演进对象存储能力时，按以下规则推进：

1. 业务入口新增上传类型时，先更新 `StorageAdapter.getBucket(...)` 和 `StorageAdapter.getDir(...)` 的统一映射
2. provider 能力变化时，优先保持 `StorageAdapter` 抽象面稳定
3. 新增衍生资源处理链路时，同步更新 `async-task-business-mapping.md`
4. 若对象存储能力从附件域外溢到更多系统级场景，同步更新：
   - `capability-inventory-final.md`
   - `system-management-and-peripheral-index.md`
   - `capability-review-pack-index.md`

## 6. 收口结论

`5.3 对象存储可抽象程度不足` 当前已经完成正式收口。

当前更准确的结论是：

1. 对象存储统一抽象已经存在
2. provider 切换能力已经存在
3. 附件、缩略图和衍生处理主链路已经稳定
4. 后续事项属于持续治理，而不是当前缺少基础能力
