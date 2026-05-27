/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@teable/db-main-prisma';
import { ClsService } from 'nestjs-cls';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { IClsStore } from '../../types/cls';
import { PerformanceCacheService } from '../../performance-cache';
import { AccessTokenModel } from '../model/access-token';
import { AccessTokenService } from './access-token.service';

describe('AccessTokenService', () => {
  let accessTokenService: AccessTokenService;
  const prismaService = mockDeep<PrismaService>();
  const accessTokenModel = mockDeep<AccessTokenModel>();
  const clsService = mockDeep<ClsService<IClsStore>>();
  const performanceCacheService = mockDeep<PerformanceCacheService>();

  beforeEach(async () => {
    accessTokenService = new AccessTokenService(
      prismaService,
      clsService,
      accessTokenModel,
      performanceCacheService
    );

    prismaService.txClient.mockImplementation(() => {
      return prismaService;
    });

    prismaService.$tx.mockImplementation(async (fn, _options) => {
      return await fn(prismaService);
    });
  });

  afterEach(() => {
    vitest.resetAllMocks();
    mockReset(prismaService);
  });

  it('should be defined', () => {
    expect(accessTokenService).toBeDefined();
  });

  describe('validate', () => {
    it('should validate access token successfully', async () => {
      // Mock data
      const accessTokenId = '123';
      const sign = 'SIGN';
      const expiredTime = new Date(Date.now() + 2000); // Expires in 2 seconds
      // Mock PrismaService response
      accessTokenModel.getAccessTokenRawById.mockResolvedValue({
        userId: 'user123',
        id: accessTokenId,
        sign,
        expiredTime,
      } as any);

      // Call the validate method
      const result = await accessTokenService.validate({ accessTokenId, sign });

      // Validate the result
      expect(result.userId).toEqual('user123');
      expect(result.accessTokenId).toEqual(accessTokenId);

      // Validate that accessToken.update was called with the correct arguments
      expect(prismaService.txClient().accessToken.update).toHaveBeenCalledWith({
        where: { id: accessTokenId },
        data: { lastUsedTime: expect.any(String) }, // It updates lastUsedTime to current time
      });
    });

    it('should throw UnauthorizedException for invalid sign', async () => {
      // Mock data
      const accessTokenId = '123';
      const sign = 'INVALID_SIGN';

      // Mock PrismaService response
      accessTokenModel.getAccessTokenRawById.mockResolvedValue({
        userId: 'user123',
        id: accessTokenId,
        sign: 'VALID_SIGN',
        expiredTime: new Date(),
      } as any);

      // Call the validate method and expect it to throw UnauthorizedException
      await expect(accessTokenService.validate({ accessTokenId, sign })).rejects.toThrowError(
        new UnauthorizedException('sign error')
      );

      // Ensure accessToken.update is not called in this case
      expect(prismaService.txClient().accessToken.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for expired token', async () => {
      // Mock data
      const accessTokenId = '123';
      const sign = 'VALID_SIGN';
      const expiredTime = new Date(Date.now() - 1500); // Expired 1 second ago

      // Mock PrismaService response
      accessTokenModel.getAccessTokenRawById.mockResolvedValue({
        userId: 'user123',
        id: accessTokenId,
        sign,
        expiredTime,
      } as any);

      // Call the validate method and expect it to throw UnauthorizedException
      await expect(accessTokenService.validate({ accessTokenId, sign })).rejects.toThrowError(
        new UnauthorizedException('token expired')
      );

      // Ensure accessToken.update is not called in this case
      expect(prismaService.txClient().accessToken.update).not.toHaveBeenCalled();
    });
  });
});
