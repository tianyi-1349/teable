import type { PrismaService } from '@teable/db-main-prisma';
import type { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { IClsStore } from '../../types/cls';
import { OAuthService } from './oauth.service';

describe('OauthService', () => {
  let service: OAuthService;

  beforeEach(async () => {
    service = new OAuthService(mockDeep<PrismaService>(), mockDeep<ClsService<IClsStore>>());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
