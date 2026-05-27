import { PrismaService } from '@teable/db-main-prisma';
import type { Knex } from 'knex';
import { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { IThresholdConfig } from '../../../configs/threshold.config';
import type { IDbProvider } from '../../../db-provider/db.provider.interface';
import { EventEmitterService } from '../../../event-emitter/event-emitter.service';
import { FieldViewSyncService } from '../../field/field-calculate/field-view-sync.service';
import { FieldService } from '../../field/field.service';
import { RecordService } from '../../record/record.service';
import { ViewService } from '../view.service';
import { ViewOpenApiService } from './view-open-api.service';

describe('ViewOpenApiService', () => {
  let service: ViewOpenApiService;

  beforeEach(async () => {
    service = new ViewOpenApiService(
      mockDeep<PrismaService>(),
      mockDeep<RecordService>(),
      mockDeep<ViewService>(),
      mockDeep<FieldService>(),
      mockDeep<FieldViewSyncService>(),
      mockDeep<EventEmitterService>(),
      mockDeep<ClsService>(),
      mockDeep<IDbProvider>(),
      mockDeep<Knex>(),
      mockDeep<IThresholdConfig>()
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
