import type { PrismaService } from '@teable/db-main-prisma';
import type { Knex } from 'knex';
import type { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { IThresholdConfig } from '../../../configs/threshold.config';
import type { IDbProvider } from '../../../db-provider/db.provider.interface';
import type { EventEmitterService } from '../../../event-emitter/event-emitter.service';
import type { IClsStore } from '../../../types/cls';
import type { FieldViewSyncService } from '../../field/field-calculate/field-view-sync.service';
import type { FieldService } from '../../field/field.service';
import type { RecordQueryService } from '../../record/record-query.service';
import type { RecordService } from '../../record/record.service';
import type { ViewService } from '../view.service';
import { ViewOpenApiService } from './view-open-api.service';

describe('ViewOpenApiService', () => {
  let service: ViewOpenApiService;

  beforeEach(async () => {
    service = new ViewOpenApiService(
      mockDeep<PrismaService>(),
      mockDeep<RecordService>(),
      mockDeep<RecordQueryService>(),
      mockDeep<ViewService>(),
      mockDeep<FieldService>(),
      mockDeep<FieldViewSyncService>(),
      mockDeep<EventEmitterService>(),
      mockDeep<ClsService<IClsStore>>(),
      mockDeep<IDbProvider>(),
      mockDeep<Knex>(),
      mockDeep<IThresholdConfig>()
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
