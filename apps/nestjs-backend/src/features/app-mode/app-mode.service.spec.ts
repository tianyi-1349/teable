import { beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('falls back to default config when stored content is invalid', async () => {
    settingFindUnique.mockResolvedValue({ content: '{invalid-json' });

    const config = await service.getConfig('base123');
    expect(config.governance.auditPolicy).toBe('standard');
    expect(config.workflowEnabled).toBe(false);
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
});
