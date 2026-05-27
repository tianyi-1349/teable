import { PrismaService } from '@teable/db-main-prisma';
import type { Knex } from 'knex';
import { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { IThresholdConfig } from '../../configs/threshold.config';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import { RecordService } from '../record/record.service';
import type { IRecordQueryBuilder } from '../record/query-builder';
import { RecordPermissionService } from '../record/record-permission.service';
import { TableIndexService } from '../table/table-index.service';
import { AggregationService } from './aggregation.service';

describe('AggregateService', () => {
  let service: AggregationService;

  beforeEach(async () => {
    service = new AggregationService(
      mockDeep<RecordService>(),
      mockDeep<TableIndexService>(),
      mockDeep<PrismaService>(),
      mockDeep<Knex>(),
      mockDeep<IDbProvider>(),
      mockDeep<IThresholdConfig>(),
      mockDeep<ClsService>(),
      mockDeep<RecordPermissionService>(),
      mockDeep<IRecordQueryBuilder>()
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
