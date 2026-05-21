import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { AuthGuard } from './auth.guard';
import { PermissionGuard } from './permission.guard';

const createContext = (path: string, url = path) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ path, url }),
      getResponse: () => ({ redirect: vi.fn() }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as never;

describe('published app guard paths', () => {
  it('allows the exact publishedApps routes through the auth guard', async () => {
    const guard = new AuthGuard(new Reflector(), { get: vi.fn() } as never);
    const validateSpy = vi.spyOn(guard, 'validate');

    await expect(
      guard.canActivate(createContext('/api/v2/publishedApps/getRuntimeManifest'))
    ).resolves.toBe(true);

    expect(validateSpy).not.toHaveBeenCalled();
  });

  it('does not treat near-matching publishedApps routes as public in the auth guard', async () => {
    const guard = new AuthGuard(new Reflector(), { get: vi.fn() } as never);
    const validateSpy = vi.spyOn(guard, 'validate').mockResolvedValue(true as never);

    await expect(
      guard.canActivate(createContext('/api/v2/publishedApps/getRuntimeManifest/extra'))
    ).resolves.toBe(true);

    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  it('allows the exact publishedApps routes through the permission guard', async () => {
    const guard = new PermissionGuard(new Reflector(), { get: vi.fn() } as never, {} as never);
    const fallbackSpy = vi.spyOn(guard as any, 'permissionCheckWithPublicFallback') as any;
    fallbackSpy.mockImplementation(async () => true as never);

    await expect(
      guard.canActivate(createContext('/api/v2/publishedApps/getNodeRuntime'))
    ).resolves.toBe(true);

    expect(fallbackSpy).not.toHaveBeenCalled();
  });

  it('does not treat near-matching publishedApps routes as public in the permission guard', async () => {
    const guard = new PermissionGuard(new Reflector(), { get: vi.fn() } as never, {} as never);
    const fallbackSpy = vi.spyOn(guard as any, 'permissionCheckWithPublicFallback') as any;
    fallbackSpy.mockImplementation(async () => true as never);

    await expect(
      guard.canActivate(createContext('/api/v2/publishedApps/getNodeRuntime/extra'))
    ).resolves.toBe(true);

    expect(fallbackSpy).toHaveBeenCalledTimes(1);
  });
});
