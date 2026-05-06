import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpErrorCode } from '@teable/core';
import { AppModeService } from './app-mode.service';

describe('AppModeService', () => {
  const baseFindUniqueOrThrow = vi.fn();
  const settingFindUnique = vi.fn();
  const settingUpsert = vi.fn();

  const prismaService = {
    base: {
      findUniqueOrThrow: baseFindUniqueOrThrow,
    },
    setting: {
      findUnique: settingFindUnique,
      upsert: settingUpsert,
    },
  };

  const cls = {
    get: vi.fn(),
  };

  let service: AppModeService;

  beforeEach(() => {
    vi.clearAllMocks();
    baseFindUniqueOrThrow.mockResolvedValue({ id: 'base123' });
    settingFindUnique.mockResolvedValue(null);
    settingUpsert.mockResolvedValue(undefined);
    cls.get.mockReturnValue('usr123');

    service = new AppModeService(prismaService as never, cls as never);
  });

  it('returns default config when no setting exists', async () => {
    const config = await service.getConfig('base123');

    expect(config).toEqual({
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
    });
  });

  it('throws validation error when stored content is invalid', async () => {
    settingFindUnique.mockResolvedValue({ content: '{invalid-json' });

    await expect(service.getConfig('base123')).rejects.toMatchObject({
      code: HttpErrorCode.VALIDATION_ERROR,
    });
  });

  it('updates config with normalized defaults', async () => {
    const config = await service.updateConfig('base123', {
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
    });

    expect(config.workflowEnabled).toBe(true);
    expect(config.governance.auditPolicy).toBe('strict');
    expect(settingUpsert).toHaveBeenCalledTimes(1);
    expect(settingUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: 'app-mode:base:base123' },
      })
    );
  });

  it('rejects strict governance without isolated mode', async () => {
    await expect(
      service.updateConfig('base123', {
        version: 1,
        pages: [],
        linkedBaseIds: [],
        dashboardIds: [],
        workflowEnabled: false,
        governance: {
          roleMatrixVersion: 2,
          auditPolicy: 'strict',
          permissionMode: 'inherited',
        },
      })
    ).rejects.toMatchObject({ code: HttpErrorCode.VALIDATION_ERROR });
  });

  it('rejects strict governance with low role matrix version', async () => {
    await expect(
      service.updateConfig('base123', {
        version: 1,
        pages: [],
        linkedBaseIds: [],
        dashboardIds: [],
        workflowEnabled: false,
        governance: {
          roleMatrixVersion: 1,
          auditPolicy: 'strict',
          permissionMode: 'isolated',
        },
      })
    ).rejects.toMatchObject({ code: HttpErrorCode.VALIDATION_ERROR });
  });

  it('is idempotent for repeated valid updates', async () => {
    const payload = {
      version: 1,
      pages: [{ id: 'p1', name: 'Home', type: 'list' as const }],
      linkedBaseIds: ['baseA'],
      dashboardIds: ['dashA'],
      workflowEnabled: true,
      governance: {
        roleMatrixVersion: 2,
        auditPolicy: 'strict' as const,
        permissionMode: 'isolated' as const,
      },
    };

    const first = await service.updateConfig('base123', payload);
    const second = await service.updateConfig('base123', payload);

    expect(first).toEqual(second);
    expect(settingUpsert).toHaveBeenCalledTimes(2);
    expect(settingUpsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ where: { name: 'app-mode:base:base123' } })
    );
    expect(settingUpsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { name: 'app-mode:base:base123' } })
    );
  });

  it('rejects duplicate page ids', async () => {
    await expect(
      service.updateConfig('base123', {
        version: 1,
        pages: [
          { id: 'p1', name: 'Home', type: 'list' },
          { id: 'p1', name: 'Duplicate', type: 'detail' },
        ],
        linkedBaseIds: [],
        dashboardIds: [],
        workflowEnabled: false,
        governance: {
          roleMatrixVersion: 1,
          auditPolicy: 'standard',
          permissionMode: 'inherited',
        },
      })
    ).rejects.toMatchObject({ code: HttpErrorCode.VALIDATION_ERROR });
  });

  it('rejects duplicate linked base ids', async () => {
    await expect(
      service.updateConfig('base123', {
        version: 1,
        pages: [],
        linkedBaseIds: ['baseA', 'baseA'],
        dashboardIds: [],
        workflowEnabled: false,
        governance: {
          roleMatrixVersion: 1,
          auditPolicy: 'standard',
          permissionMode: 'inherited',
        },
      })
    ).rejects.toMatchObject({ code: HttpErrorCode.VALIDATION_ERROR });
  });

  it('rejects duplicate dashboard ids', async () => {
    await expect(
      service.updateConfig('base123', {
        version: 1,
        pages: [],
        linkedBaseIds: [],
        dashboardIds: ['dashA', 'dashA'],
        workflowEnabled: false,
        governance: {
          roleMatrixVersion: 1,
          auditPolicy: 'standard',
          permissionMode: 'inherited',
        },
      })
    ).rejects.toMatchObject({ code: HttpErrorCode.VALIDATION_ERROR });
  });
});
