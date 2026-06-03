import type { PrismaService } from '@teable/db-main-prisma';
import type { Knex } from 'knex';
import type { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import type { IClsStore } from '../../types/cls';
import type { IAggregationService } from '../aggregation/aggregation.service.interface';
import type { CollaboratorService } from '../collaborator/collaborator.service';
import type { FieldService } from '../field/field.service';
import type { RecordOpenApiService } from '../record/open-api/record-open-api.service';
import type { RecordQueryService } from '../record/record-query.service';
import type { RecordService } from '../record/record.service';
import type { SelectionService } from '../selection/selection.service';
import type { ShareSocketService } from './share-socket.service';
import { ShareService } from './share.service';

describe('ShareService', () => {
  let service: ShareService;

  beforeEach(async () => {
    service = new ShareService(
      mockDeep<PrismaService>(),
      mockDeep<FieldService>(),
      mockDeep<RecordService>(),
      mockDeep<RecordQueryService>(),
      mockDeep<IAggregationService>(),
      mockDeep<RecordOpenApiService>(),
      mockDeep<SelectionService>(),
      mockDeep<CollaboratorService>(),
      mockDeep<ShareSocketService>(),
      mockDeep<ClsService<IClsStore>>(),
      mockDeep<IDbProvider>(),
      mockDeep<Knex>()
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
