import type { PrismaService } from '@teable/db-main-prisma';
import type { Knex } from 'knex';
import type { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { IThresholdConfig } from '../../configs/threshold.config';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import type { IClsStore } from '../../types/cls';
import type { IRecordQueryBuilder } from '../record/query-builder';
import type { RecordPermissionService } from '../record/record-permission.service';
import type { RecordQueryService } from '../record/record-query.service';
import type { RecordService } from '../record/record.service';
import type { TableIndexService } from '../table/table-index.service';
import { AggregationService } from './aggregation.service';

describe('AggregateService', () => {
  let service: AggregationService;

  beforeEach(async () => {
    service = new AggregationService(
      mockDeep<RecordService>(),
      mockDeep<RecordQueryService>(),
      mockDeep<TableIndexService>(),
      mockDeep<PrismaService>(),
      mockDeep<Knex>(),
      mockDeep<IDbProvider>(),
      mockDeep<IThresholdConfig>(),
      mockDeep<ClsService<IClsStore>>(),
      mockDeep<RecordPermissionService>(),
      mockDeep<IRecordQueryBuilder>()
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
