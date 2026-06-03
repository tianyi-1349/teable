import type { PrismaService } from '@teable/db-main-prisma';
import type { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { IClsStore } from '../../types/cls';
import type { BaseImportService } from '../base/base-import.service';
import type { CollaboratorService } from '../collaborator/collaborator.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    service = new DashboardService(
      mockDeep<PrismaService>(),
      mockDeep<ClsService<IClsStore>>(),
      mockDeep<CollaboratorService>(),
      mockDeep<BaseImportService>()
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
