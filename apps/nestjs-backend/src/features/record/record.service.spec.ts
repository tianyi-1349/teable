import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { PrismaService } from '@teable/db-main-prisma';
import type { Knex } from 'knex';
import type { ClsService } from 'nestjs-cls';
import type { CacheService } from '../../cache/cache.service';
import type { IThresholdConfig } from '../../configs/threshold.config';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import type { AttachmentsStorageService } from '../attachments/attachments-storage.service';
import type { BatchService } from '../calculation/batch.service';
import type { DataLoaderService } from '../data-loader/data-loader.service';
import type { TableIndexService } from '../table/table-index.service';
import type { IRecordQueryBuilder } from './query-builder';
import type { RecordPermissionService } from './record-permission.service';
import { RecordService } from './record.service';

describe('RecordService', () => {
  let service: RecordService;

  beforeEach(() => {
    service = new RecordService(
      {} as PrismaService,
      {} as BatchService,
      {} as ClsService,
      {} as CacheService,
      {} as AttachmentsStorageService,
      {} as RecordPermissionService,
      {} as TableIndexService,
      {} as Knex,
      {} as IDbProvider,
      {} as IThresholdConfig,
      {} as DataLoaderService,
      {} as IRecordQueryBuilder,
      {} as EventEmitter2
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
