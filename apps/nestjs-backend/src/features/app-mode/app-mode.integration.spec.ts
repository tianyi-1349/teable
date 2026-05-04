import type { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PERMISSIONS_KEY } from '../auth/decorators/permissions.decorator';
import { AppModeController } from './app-mode.controller';
import { AppModeService } from './app-mode.service';

class TestPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (!required.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const scopesHeader = request.headers['x-scopes'] ?? '';
    const scopes = scopesHeader
      .split(',')
      .map((scope) => scope.trim())
      .filter(Boolean);
    const allowed = required.every((scope) => scopes.includes(scope));

    if (!allowed) {
      throw new ForbiddenException('Missing required scopes');
    }

    return true;
  }
}

describe('AppModeController integration', () => {
  let app: INestApplication | undefined;

  const service = {
    getConfig: vi.fn().mockResolvedValue({
      version: 1,
      pages: [],
      linkedBaseIds: [],
      dashboardIds: [],
      workflowEnabled: false,
      governance: {
        roleMatrixVersion: 1,
        auditPolicy: 'standard',
        permissionMode: 'inherited',
      },
    }),
    updateConfig: vi.fn(async (_baseId: string, config: unknown) => config),
  };

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
    vi.clearAllMocks();
  });

  it('returns 403 when missing base|read permission', async () => {
    const module = await Test.createTestingModule({
      controllers: [AppModeController],
      providers: [Reflector, { provide: AppModeService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalGuards(new TestPermissionGuard(app.get(Reflector)));
    await app.listen(0);
    const appUrl = await app.getUrl();

    const response = await fetch(`${appUrl}/api/base/base123/app-mode/config`);

    expect(response.status).toBe(403);
    expect(service.getConfig).not.toHaveBeenCalled();
  }, 15000);

  it('returns 400 when payload is invalid', async () => {
    const module = await Test.createTestingModule({
      controllers: [AppModeController],
      providers: [Reflector, { provide: AppModeService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalGuards(new TestPermissionGuard(app.get(Reflector)));
    await app.listen(0);
    const appUrl = await app.getUrl();

    const response = await fetch(`${appUrl}/api/base/base123/app-mode/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-scopes': 'base|update',
      },
      body: JSON.stringify({
        version: 1,
        pages: [],
        linkedBaseIds: [],
        dashboardIds: [],
        workflowEnabled: false,
        governance: {
          roleMatrixVersion: 1,
          auditPolicy: 'invalid-policy',
          permissionMode: 'inherited',
        },
      }),
    });

    expect(response.status).toBe(400);
    expect(service.updateConfig).not.toHaveBeenCalled();
  }, 15000);

  it('returns 200 when has base|read permission', async () => {
    const module = await Test.createTestingModule({
      controllers: [AppModeController],
      providers: [Reflector, { provide: AppModeService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalGuards(new TestPermissionGuard(app.get(Reflector)));
    await app.listen(0);
    const appUrl = await app.getUrl();

    const response = await fetch(`${appUrl}/api/base/base123/app-mode/config`, {
      headers: {
        'x-scopes': 'base|read',
      },
    });

    expect(response.status).toBe(200);
    expect(service.getConfig).toHaveBeenCalledWith('base123');
  }, 15000);

  it('returns 200 and delegates update when payload is valid', async () => {
    const module = await Test.createTestingModule({
      controllers: [AppModeController],
      providers: [Reflector, { provide: AppModeService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalGuards(new TestPermissionGuard(app.get(Reflector)));
    await app.listen(0);
    const appUrl = await app.getUrl();

    const payload = {
      version: 1,
      pages: [{ id: 'p1', name: 'Home', type: 'list' }],
      linkedBaseIds: [],
      dashboardIds: [],
      workflowEnabled: true,
      governance: {
        roleMatrixVersion: 2,
        auditPolicy: 'strict',
        permissionMode: 'isolated',
      },
    };

    const response = await fetch(`${appUrl}/api/base/base123/app-mode/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-scopes': 'base|update',
      },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(200);
    expect(service.updateConfig).toHaveBeenCalledWith('base123', payload);
    await expect(response.json()).resolves.toEqual(payload);
  }, 15000);
});
