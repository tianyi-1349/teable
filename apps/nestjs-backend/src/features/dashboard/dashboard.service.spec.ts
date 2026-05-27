import { PrismaService } from '@teable/db-main-prisma';
import { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import { BaseImportService } from '../base/base-import.service';
import { CollaboratorService } from '../collaborator/collaborator.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    service = new DashboardService(
      mockDeep<PrismaService>(),
      mockDeep<ClsService>(),
      mockDeep<CollaboratorService>(),
      mockDeep<BaseImportService>()
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
