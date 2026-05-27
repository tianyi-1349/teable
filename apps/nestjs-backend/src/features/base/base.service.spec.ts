import { PrismaService } from '@teable/db-main-prisma';
import { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { IThresholdConfig } from '../../configs/threshold.config';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import { AttachmentsStorageService } from '../attachments/attachments-storage.service';
import { PermissionService } from '../auth/permission.service';
import { CanaryService } from '../canary';
import { CollaboratorService } from '../collaborator/collaborator.service';
import { GraphService } from '../graph/graph.service';
import { TableOpenApiService } from '../table/open-api/table-open-api.service';
import { BaseDuplicateService } from './base-duplicate.service';
import { BaseService } from './base.service';

describe('BaseService', () => {
  let service: BaseService;

  beforeEach(async () => {
    service = new BaseService(
      mockDeep<PrismaService>(),
      mockDeep<ClsService>(),
      mockDeep<CollaboratorService>(),
      mockDeep<BaseDuplicateService>(),
      mockDeep<PermissionService>(),
      mockDeep<TableOpenApiService>(),
      mockDeep<GraphService>(),
      mockDeep<AttachmentsStorageService>(),
      mockDeep<CanaryService>(),
      mockDeep<IDbProvider>(),
      mockDeep<IThresholdConfig>()
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
