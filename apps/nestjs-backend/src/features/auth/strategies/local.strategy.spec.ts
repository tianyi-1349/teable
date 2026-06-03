/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable sonarjs/no-duplicate-string */
import type { Request } from 'express';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { CacheService } from '../../../cache/cache.service';
import type { UserService } from '../../user/user.service';
import type { LocalAuthService } from '../local-auth/local-auth.service';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  const authService = mockDeep<LocalAuthService>();
  const cacheService = mockDeep<CacheService>();
  const userService = {
    refreshLastSignTime: vitest.fn(),
  } as unknown as UserService;
  const testEmail = 'test@test.com';
  const testPassword = '12345678a';
  const mokeReq = {
    ip: '127.0.0.1',
    connection: {
      remoteAddress: '127.0.0.1',
    },
    headers: {
      'x-forwarded-for': '127.0.0.1',
    },
  } as unknown as Request;

  beforeEach(async () => {
    localStrategy = new LocalStrategy(userService, authService, cacheService, {
      signin: {
        maxLoginAttempts: 5,
        accountLockoutMinutes: 10,
      },
    } as never);
  });

  afterEach(() => {
    vitest.resetAllMocks();
    mockReset(authService);
    mockReset(cacheService);
  });

  it('should throw error when lockout is disabled', async () => {
    authService.validateUserByEmailWithTurnstile.mockRejectedValue(new Error());
    localStrategy['authConfig'].signin = {
      maxLoginAttempts: 0,
      accountLockoutMinutes: 0,
    };
    await expect(localStrategy.validate(mokeReq, testEmail, testPassword)).rejects.toThrow(
      'Email or password is incorrect'
    );
  });

  it('should throw error when account is already locked', async () => {
    authService.validateUserByEmailWithTurnstile.mockRejectedValue(new Error());
    localStrategy['authConfig'].signin = {
      maxLoginAttempts: 5,
      accountLockoutMinutes: 10,
    };
    cacheService.get.mockImplementation(async (key) => {
      if (key === `signin:lockout:${testEmail}`) return true;
      return undefined;
    });

    await expect(localStrategy.validate(mokeReq, testEmail, testPassword)).rejects.toThrow(
      'Your account has been locked out, please try again after 10 minutes'
    );
  });

  it('should increment attempt count and throw error', async () => {
    authService.validateUserByEmailWithTurnstile.mockRejectedValue(new Error());
    localStrategy['authConfig'].signin = {
      maxLoginAttempts: 5,
      accountLockoutMinutes: 10,
    };
    cacheService.get.mockResolvedValue(undefined);
    cacheService.incr.mockResolvedValue(3);

    await expect(localStrategy.validate(mokeReq, testEmail, testPassword)).rejects.toMatchObject({
      response: 'Email or password is incorrect',
    });
    expect(cacheService.incr).toHaveBeenCalledWith(`signin:attempts:${testEmail}`, 30);
  });

  it('should lock account when max attempts reached', async () => {
    authService.validateUserByEmailWithTurnstile.mockRejectedValue(new Error());
    localStrategy['authConfig'].signin = {
      maxLoginAttempts: 4,
      accountLockoutMinutes: 10,
    };
    cacheService.get.mockResolvedValue(undefined);
    cacheService.incr.mockResolvedValue(4);

    await expect(localStrategy.validate(mokeReq, testEmail, testPassword)).rejects.toMatchObject({
      response: 'Your account has been locked out, please try again after 10 minutes',
    });
    expect(cacheService.set).toHaveBeenCalledWith(`signin:lockout:${testEmail}`, true, 10);
    expect(cacheService.del).toHaveBeenCalledWith(`signin:attempts:${testEmail}`);
  });

  it('should handle first failed attempt', async () => {
    authService.validateUserByEmailWithTurnstile.mockRejectedValue(new Error());
    localStrategy['authConfig'].signin = {
      maxLoginAttempts: 5,
      accountLockoutMinutes: 10,
    };
    cacheService.get.mockResolvedValue(undefined);
    cacheService.incr.mockResolvedValue(1);

    await expect(localStrategy.validate(mokeReq, testEmail, testPassword)).rejects.toMatchObject({
      response: 'Email or password is incorrect',
    });
    expect(cacheService.incr).toHaveBeenCalledWith(`signin:attempts:${testEmail}`, 30);
  });
});
