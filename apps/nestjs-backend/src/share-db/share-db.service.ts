import { Injectable, Logger, Optional } from '@nestjs/common';
import { context as otelContext, trace as otelTrace } from '@opentelemetry/api';
import {
  ANONYMOUS_USER_ID,
  FieldOpBuilder,
  HttpErrorCode,
  IdPrefix,
  ViewOpBuilder,
} from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import cookie from 'cookie';
import { noop } from 'lodash';
import { ClsService } from 'nestjs-cls';
import type { CreateOp, DeleteOp, EditOp } from 'sharedb';
import ShareDBClass from 'sharedb';
import { CacheConfig, ICacheConfig } from '../configs/cache.config';
import { CustomHttpException } from '../custom.exception';
import { EventEmitterService } from '../event-emitter/event-emitter.service';
import { PermissionService } from '../features/auth/permission.service';
import { SessionHandleService } from '../features/auth/session/session-handle.service';
import { PerformanceCacheService } from '../performance-cache';
import type { IClsStore } from '../types/cls';
import { Timing } from '../utils/timing';
import { authMiddleware } from './auth.middleware';
import type { IRawOpMap } from './interface';
import { RealtimeMetricsService } from './metrics/realtime-metrics.service';
import { RepairAttachmentOpService } from './repair-attachment-op/repair-attachment-op.service';
import { ShareDbAdapter } from './share-db.adapter';
import { RedisPubSub } from './sharedb-redis.pubsub';

const v2ProjectionOpSourcePrefix = '@@v2-projection:';
const v2ProjectionSubmitSource = '@@v2-projection';

const hasClientStream = (
  agent: unknown
): agent is { stream: { write?: unknown; send?: unknown } } => {
  if (!agent || typeof agent !== 'object') {
    return false;
  }
  if (!('stream' in agent)) {
    return false;
  }

  const stream = (agent as { stream?: unknown }).stream;
  if (!stream || typeof stream !== 'object') {
    return false;
  }

  return 'write' in stream || 'send' in stream;
};

@Injectable()
export class ShareDbService extends ShareDBClass {
  private logger = new Logger(ShareDbService.name);

  constructor(
    readonly shareDbAdapter: ShareDbAdapter,
    private readonly eventEmitterService: EventEmitterService,
    private readonly prismaService: PrismaService,
    private readonly cls: ClsService<IClsStore>,
    private readonly permissionService: PermissionService,
    private readonly repairAttachmentOpService: RepairAttachmentOpService,
    @CacheConfig() private readonly cacheConfig: ICacheConfig,
    private readonly performanceCacheService: PerformanceCacheService,
    private readonly sessionHandleService: SessionHandleService,
    @Optional() private readonly realtimeMetrics?: RealtimeMetricsService
  ) {
    super({
      presence: true,
      doNotForwardSendPresenceErrorsToClient: true,
      db: shareDbAdapter,
      maxSubmitRetries: 3,
    });

    const { provider, redis } = this.cacheConfig;
    if (provider === 'redis') {
      if (!redis.uri) {
        throw new Error('Redis URI is required for Redis cache provider.');
      }
      const redisPubsub = new RedisPubSub({ redisURI: redis.uri });

      this.logger.log(`> Detected Redis cache; enabled the Redis pub/sub adapter for ShareDB.`);
      this.pubsub = redisPubsub;
    }

    authMiddleware(this, this.sessionHandleService);
    this.use('submit', this.onSubmit);

    // broadcast raw op events to client
    this.prismaService.bindAfterTransaction(async () => {
      const rawOpMaps = this.cls.get('tx.rawOpMaps');
      this.cls.set('tx.rawOpMaps', undefined);

      const ops: IRawOpMap[] = [];
      if (rawOpMaps?.length) {
        ops.push(...rawOpMaps);
      }

      if (ops.length) {
        await this.updateTableMetaByRawOpMap(rawOpMaps);
        await this.publishOpsMap(rawOpMaps);
        this.eventEmitterService.ops2Event(ops);
      }

      // clear cache keys
      const clearCacheKeys = this.cls.get('clearCacheKeys');
      if (clearCacheKeys?.length) {
        await Promise.all(clearCacheKeys.map((key) => this.performanceCacheService.del(key)));
        this.cls.set('clearCacheKeys', undefined);
      }
    });
  }

  getConnection() {
    return this.connect();
  }

  @Timing()
  private async updateTableMetaByRawOpMap(rawOpMap?: IRawOpMap[]) {
    if (!rawOpMap?.length) {
      return;
    }
    const collection = rawOpMap.flatMap((map) => Object.keys(map));
    const tableIds = collection
      .filter(
        (c) =>
          c.startsWith(IdPrefix.Record) ||
          c.startsWith(IdPrefix.View) ||
          c.startsWith(IdPrefix.Field)
      )
      .map((c) => c.split('_')[1]);

    if (!tableIds.length) {
      return;
    }
    await this.prismaService.txClient().tableMeta.updateMany({
      where: { id: { in: tableIds } },
      data: { lastModifiedTime: new Date().toISOString() },
    });
  }

  @Timing()
  async publishOpsMap(rawOpMaps: IRawOpMap[] | undefined) {
    if (!rawOpMaps?.length) {
      return;
    }
    let publishCount = 0;
    const repairAttachmentContext =
      await this.repairAttachmentOpService.getCollectionsAttachmentsContext(rawOpMaps);
    for (const rawOpMap of rawOpMaps) {
      for (const collection in rawOpMap) {
        const data = rawOpMap[collection];
        for (const docId in data) {
          const rawOp = data[docId] as EditOp | CreateOp | DeleteOp;
          const channels = [collection, `${collection}.${docId}`];
          rawOp.c = collection;
          rawOp.d = docId;
          const repairedOp = await this.repairAttachmentOpService.repairAttachmentOp(
            rawOp,
            repairAttachmentContext
          );
          this.pubsub.publish(channels, repairedOp, noop);
          publishCount++;

          if (this.shouldPublishAction(repairedOp)) {
            const tableId = collection.split('_')[1];
            this.publishRelatedChannels(tableId, repairedOp);
          }
        }
      }
    }
    if (publishCount > 0) {
      this.realtimeMetrics?.recordOpsPublished(publishCount);
    }
  }

  // for update record when import
  publishRecordChannel(tableId: string, rawOp: EditOp | CreateOp | DeleteOp) {
    this.pubsub.publish([`${IdPrefix.Record}_${tableId}`], rawOp, noop);
  }

  private shouldPublishAction(rawOp: EditOp | CreateOp | DeleteOp) {
    const viewKeys = ['filter', 'sort', 'group', 'lastModifiedTime'];
    const fieldKeys = ['options'];
    return rawOp.op?.some(
      (op) =>
        viewKeys.includes(ViewOpBuilder.editor.setViewProperty.detect(op)?.key as string) ||
        fieldKeys.includes(FieldOpBuilder.editor.setFieldProperty.detect(op)?.key as string)
    );
  }

  /**
   * this is for some special scenarios like manual sort
   * which only send view ops but update record too
   */
  private publishRelatedChannels(tableId: string, rawOp: EditOp | CreateOp | DeleteOp) {
    this.pubsub.publish([`${IdPrefix.Record}_${tableId}`], rawOp, noop);
    this.pubsub.publish([`${IdPrefix.Field}_${tableId}`], rawOp, noop);
  }

  private getSubmitAgentCustom(context: ShareDBClass.middleware.SubmitContext) {
    const custom = (context.agent as { custom?: unknown })?.custom;
    if (!custom || typeof custom !== 'object') {
      return {} as {
        userId?: string;
        cookie?: string;
        shareId?: string | null;
        baseShareId?: string | null;
        templateHeader?: string | null;
      };
    }
    return custom as {
      userId?: string;
      cookie?: string;
      shareId?: string | null;
      baseShareId?: string | null;
      templateHeader?: string | null;
    };
  }

  private async ensureBaseShareAuthenticated(baseShareId: string, cookieHeader?: string) {
    const requirePassword = await this.permissionService.baseShareRequiresPassword(baseShareId);
    if (!requirePassword) {
      return;
    }

    const token = cookie.parse(cookieHeader ?? '')?.[baseShareId];
    if (!token) {
      throw new CustomHttpException('Unauthorized', HttpErrorCode.UNAUTHORIZED_SHARE);
    }

    const valid = await this.permissionService.validateBaseSharePasswordToken(baseShareId, token);
    if (!valid) {
      throw new CustomHttpException('Unauthorized', HttpErrorCode.UNAUTHORIZED_SHARE);
    }
  }

  private async validateSubmitPermission(
    tableId: string,
    context: ShareDBClass.middleware.SubmitContext
  ) {
    const custom = this.getSubmitAgentCustom(context);
    const userId = custom.userId;
    const user = userId
      ? { id: userId, name: userId, email: '' }
      : { id: ANONYMOUS_USER_ID, name: ANONYMOUS_USER_ID, email: '' };

    await this.cls.runWith({ ...this.cls.get(), user }, async () => {
      if (custom.shareId) {
        throw new CustomHttpException('not allowed to submit', HttpErrorCode.RESTRICTED_RESOURCE, {
          localization: {
            i18nKey: 'httpErrors.share.notAllowedToSubmit',
          },
        });
      }

      if (custom.baseShareId) {
        await this.ensureBaseShareAuthenticated(custom.baseShareId, custom.cookie);
        await this.permissionService.validBaseSharePermissions(custom.baseShareId, tableId, [
          'record|update',
        ]);
        return;
      }

      if (custom.templateHeader) {
        const templateId = this.permissionService.getTemplateIdByHeader(custom.templateHeader);
        if (!templateId) {
          throw new CustomHttpException('Template header is invalid', HttpErrorCode.UNAUTHORIZED, {
            localization: {
              i18nKey: 'httpErrors.permission.templateHeaderInvalid',
            },
          });
        }
        await this.permissionService.validTemplatePermissions(tableId, ['record|update']);
        return;
      }

      if (!userId) {
        throw new CustomHttpException('Unauthorized', HttpErrorCode.UNAUTHORIZED);
      }

      await this.permissionService.validPermissions(tableId, ['record|update']);
    });
  }

  private onSubmit = (
    context: ShareDBClass.middleware.SubmitContext,
    next: (err?: unknown) => void
  ) => {
    const tracer = otelTrace.getTracer('default');
    const currentSpan = tracer.startSpan('submitOp');

    otelContext.with(otelTrace.setSpan(otelContext.active(), currentSpan), () => {
      const submitSource =
        ((context as ShareDBClass.middleware.SubmitContext & { options?: { source?: unknown } })
          .options?.source as unknown) ??
        ((context as ShareDBClass.middleware.SubmitContext & { extra?: { source?: unknown } }).extra
          ?.source as unknown);
      if (submitSource === v2ProjectionSubmitSource) {
        return next();
      }

      const opSource = typeof context.op.src === 'string' ? context.op.src : '';
      if (opSource.startsWith(v2ProjectionOpSourcePrefix)) {
        return next();
      }

      if (!hasClientStream(context.agent)) {
        return next();
      }

      const [docType] = context.collection.split('_');

      if (docType !== IdPrefix.Record || !context.op.op) {
        this.realtimeMetrics?.recordOperationError('invalid_doc_type');
        return next(new Error('only record op can be committed'));
      }

      const tableId = context.collection.split('_')[1];
      if (!tableId) {
        this.realtimeMetrics?.recordOperationError('invalid_table_id');
        return next(new Error('invalid record collection id'));
      }

      void this.validateSubmitPermission(tableId, context)
        .then(() => {
          this.realtimeMetrics?.recordOperationSubmit();
          next();
        })
        .catch((error: unknown) => {
          this.realtimeMetrics?.recordOperationError('permission_denied');
          next(error);
        });
    });
  };
}
