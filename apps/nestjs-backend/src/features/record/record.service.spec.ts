import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { PrismaService } from '@teable/db-main-prisma';
import type { IGetRecordsRo } from '@teable/openapi';
import type { Knex } from 'knex';
import type { ClsService } from 'nestjs-cls';
import { vi } from 'vitest';
import type { CacheService } from '../../cache/cache.service';
import type { IThresholdConfig } from '../../configs/threshold.config';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import type { IClsStore } from '../../types/cls';
import type { AttachmentsStorageService } from '../attachments/attachments-storage.service';
import type { BatchService } from '../calculation/batch.service';
import type { DataLoaderService } from '../data-loader/data-loader.service';
import type { TableIndexService } from '../table/table-index.service';
import type { IRecordQueryBuilder } from './query-builder';
import type { RecordPermissionService } from './record-permission.service';
import type { RecordQueryService } from './record-query.service';
import { RecordService } from './record.service';

describe('RecordService', () => {
  let service: RecordService;
  let recordQueryService: Pick<RecordQueryService, 'hasRecord'>;

  beforeEach(() => {
    recordQueryService = {
      hasRecord: vi.fn(),
    };

    service = new RecordService(
      {} as PrismaService,
      {} as BatchService,
      {} as ClsService<IClsStore>,
      {} as CacheService,
      {} as AttachmentsStorageService,
      {} as RecordPermissionService,
      recordQueryService as RecordQueryService,
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

  it('returns deleted status when record query service cannot find the record', async () => {
    vi.mocked(recordQueryService.hasRecord).mockResolvedValue(false);

    const result = await service.getRecordStatus('tbl1', 'rec1', {} as IGetRecordsRo);

    expect(result).toEqual({ isDeleted: true, isVisible: false });
    expect(recordQueryService.hasRecord).toHaveBeenCalledWith('tbl1', 'rec1');
  });
});
