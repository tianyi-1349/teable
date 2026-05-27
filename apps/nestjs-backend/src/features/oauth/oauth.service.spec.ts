import { PrismaService } from '@teable/db-main-prisma';
import { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import { OAuthService } from './oauth.service';

describe('OauthService', () => {
  let service: OAuthService;

  beforeEach(async () => {
    service = new OAuthService(mockDeep<PrismaService>(), mockDeep<ClsService>());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
