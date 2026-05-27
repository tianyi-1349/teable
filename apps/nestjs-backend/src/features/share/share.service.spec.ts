import { PrismaService } from '@teable/db-main-prisma';
import type { Knex } from 'knex';
import { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import type { IAggregationService } from '../aggregation/aggregation.service.interface';
import { CollaboratorService } from '../collaborator/collaborator.service';
import { FieldService } from '../field/field.service';
import { RecordOpenApiService } from '../record/open-api/record-open-api.service';
import { RecordService } from '../record/record.service';
import { SelectionService } from '../selection/selection.service';
import { ShareSocketService } from './share-socket.service';
import { ShareService } from './share.service';

describe('ShareService', () => {
  let service: ShareService;

  beforeEach(async () => {
    service = new ShareService(
      mockDeep<PrismaService>(),
      mockDeep<FieldService>(),
      mockDeep<RecordService>(),
      mockDeep<IAggregationService>(),
      mockDeep<RecordOpenApiService>(),
      mockDeep<SelectionService>(),
      mockDeep<CollaboratorService>(),
      mockDeep<ShareSocketService>(),
      mockDeep<ClsService>(),
      mockDeep<IDbProvider>(),
      mockDeep<Knex>()
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
