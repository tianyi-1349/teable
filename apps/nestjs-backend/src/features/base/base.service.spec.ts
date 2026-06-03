import type { PrismaService } from '@teable/db-main-prisma';
import type { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { IThresholdConfig } from '../../configs/threshold.config';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import type { IClsStore } from '../../types/cls';
import type { AttachmentsStorageService } from '../attachments/attachments-storage.service';
import type { PermissionService } from '../auth/permission.service';
import type { CanaryService } from '../canary';
import type { CollaboratorService } from '../collaborator/collaborator.service';
import type { GraphService } from '../graph/graph.service';
import type { TableOpenApiService } from '../table/open-api/table-open-api.service';
import type { BaseDuplicateService } from './base-duplicate.service';
import { BaseService } from './base.service';

describe('BaseService', () => {
  let service: BaseService;

  beforeEach(async () => {
    service = new BaseService(
      mockDeep<PrismaService>(),
      mockDeep<ClsService<IClsStore>>(),
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
