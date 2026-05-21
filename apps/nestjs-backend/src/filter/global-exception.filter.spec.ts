import { BadRequestException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IClsStore } from '../types/cls';
import { GlobalExceptionFilter } from './global-exception.filter';

const sentryMocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  withScope: vi.fn(),
}));

vi.mock('@sentry/nestjs', () => ({
  captureException: sentryMocks.captureException,
  withScope: sentryMocks.withScope,
}));

describe('GlobalExceptionFilter', () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const getResponse = vi.fn(() => ({ status }));
  const getRequest = vi.fn(() => ({ url: '/api/test' }));
  const host = {
    switchToHttp: () => ({
      getResponse,
      getRequest,
    }),
  } as unknown as ArgumentsHost;

  const createConfigService = () =>
    ({
      getOrThrow: () => ({ enableGlobalErrorLogging: false }),
    }) as unknown as ConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('captures exception with CLS user and space context', () => {
    const setTag = vi.fn();
    const setUser = vi.fn();
    sentryMocks.withScope.mockImplementation((callback: (scope: unknown) => void) => {
      callback({ setTag, setUser });
    });

    const clsService = {
      get: (key: keyof IClsStore | 'user.id' | 'user.email') => {
        if (key === 'user.id') return 'usr1';
        if (key === 'user.email') return 'user@example.com';
        if (key === 'spaceId') return 'space1';
        return undefined;
      },
    };

    const filter = new GlobalExceptionFilter(createConfigService(), clsService as never);
    const exception = new BadRequestException('bad request');

    filter.catch(exception, host);

    expect(setTag).toHaveBeenCalledWith('http.url', '/api/test');
    expect(setTag).toHaveBeenCalledWith('space.id', 'space1');
    expect(setUser).toHaveBeenCalledWith({ id: 'usr1', email: 'user@example.com' });
    expect(sentryMocks.captureException).toHaveBeenCalledWith(exception);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
        status: 400,
      })
    );
  });

  it('captures exception without CLS context', () => {
    const setTag = vi.fn();
    const setUser = vi.fn();
    sentryMocks.withScope.mockImplementation((callback: (scope: unknown) => void) => {
      callback({ setTag, setUser });
    });

    const filter = new GlobalExceptionFilter(createConfigService());
    const exception = new BadRequestException('bad request');

    filter.catch(exception, host);

    expect(setTag).toHaveBeenCalledWith('http.url', '/api/test');
    expect(setUser).not.toHaveBeenCalled();
    expect(sentryMocks.captureException).toHaveBeenCalledWith(exception);
    expect(status).toHaveBeenCalledWith(400);
  });
});
