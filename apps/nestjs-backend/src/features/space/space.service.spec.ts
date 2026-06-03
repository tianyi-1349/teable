import type { PrismaService } from '@teable/db-main-prisma';
import type { Knex } from 'knex';
import type { ClsService } from 'nestjs-cls';
import type { IThresholdConfig } from '../../configs/threshold.config';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import type { PerformanceCacheService } from '../../performance-cache';
import type { IClsStore } from '../../types/cls';
import type { PermissionService } from '../auth/permission.service';
import type { BaseService } from '../base/base.service';
import type { CollaboratorService } from '../collaborator/collaborator.service';
import type { SettingOpenApiService } from '../setting/open-api/setting-open-api.service';
import type { SettingService } from '../setting/setting.service';
import { SpaceService } from './space.service';

describe('SpaceService', () => {
  let service: SpaceService;

  beforeEach(() => {
    service = new SpaceService(
      {} as PrismaService,
      {} as ClsService<IClsStore>,
      {} as BaseService,
      {} as CollaboratorService,
      {} as PermissionService,
      {} as SettingService,
      {} as SettingOpenApiService,
      {} as PerformanceCacheService,
      {} as IThresholdConfig,
      {} as Knex,
      {} as IDbProvider
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
