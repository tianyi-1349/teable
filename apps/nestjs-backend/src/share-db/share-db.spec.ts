import type { PrismaService } from '@teable/db-main-prisma';
import type { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { ICacheConfig } from '../configs/cache.config';
import type { EventEmitterService } from '../event-emitter/event-emitter.service';
import type { PermissionService } from '../features/auth/permission.service';
import type { SessionHandleService } from '../features/auth/session/session-handle.service';
import type { PerformanceCacheService } from '../performance-cache';
import type { IClsStore } from '../types/cls';
import type { RealtimeMetricsService } from './metrics/realtime-metrics.service';
import type { RepairAttachmentOpService } from './repair-attachment-op/repair-attachment-op.service';
import type { ShareDbAdapter } from './share-db.adapter';
import { ShareDbService } from './share-db.service';

describe('ShareDb', () => {
  let provider: ShareDbService;

  beforeEach(async () => {
    const shareDbAdapter = mockDeep<ShareDbAdapter>();
    const eventEmitterService = mockDeep<EventEmitterService>();
    const prismaService = mockDeep<PrismaService>();
    const clsService = mockDeep<ClsService<IClsStore>>();
    const permissionService = mockDeep<PermissionService>();
    const repairAttachmentOpService = mockDeep<RepairAttachmentOpService>();
    const performanceCacheService = mockDeep<PerformanceCacheService>();
    const sessionHandleService = mockDeep<SessionHandleService>();
    const realtimeMetrics = mockDeep<RealtimeMetricsService>();
    const cacheConfig: ICacheConfig = {
      provider: 'memory',
      sqlite: {
        uri: '',
      },
      redis: {
        uri: undefined,
      },
    };

    prismaService.bindAfterTransaction.mockImplementation(() => undefined as never);

    provider = new ShareDbService(
      shareDbAdapter,
      eventEmitterService,
      prismaService,
      clsService,
      permissionService,
      repairAttachmentOpService,
      cacheConfig,
      performanceCacheService,
      sessionHandleService,
      realtimeMetrics
    );
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  // it('create simple document', (done) => {
  //   const randomTitle = `B:${Math.floor(Math.random() * 1000)}`;
  //   const doc = provider.connect().get('books', randomTitle);
  //   doc.create({ title: randomTitle }, function (error) {
  //     if (error) throw error;
  //     doc.submitOp({ p: ['author'], oi: 'George Orwell' }, undefined, (error: unknown) => {
  //       if (error) throw error;
  //       console.log('submit succeed!');
  //       done();
  //     });
  //   });
  // }, 1000);
});
