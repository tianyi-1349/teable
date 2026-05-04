import { describe, expect, it, vi } from 'vitest';
import type { IAppModeConfig } from '@teable/openapi';
import { AppModeController } from './app-mode.controller';

describe('AppModeController', () => {
  it('delegates getConfig to service', async () => {
    const service = {
      getConfig: vi.fn().mockResolvedValue({ version: 1 }),
      updateConfig: vi.fn(),
    };
    const controller = new AppModeController(service as never);

    const result = await controller.getConfig('base123');

    expect(service.getConfig).toHaveBeenCalledWith('base123');
    expect(result).toEqual({ version: 1 });
  });

  it('delegates updateConfig to service', async () => {
    const payload: IAppModeConfig = {
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
    };
    const service = {
      getConfig: vi.fn(),
      updateConfig: vi.fn().mockResolvedValue(payload),
    };
    const controller = new AppModeController(service as never);

    const result = await controller.updateConfig('base123', payload);

    expect(service.updateConfig).toHaveBeenCalledWith('base123', payload);
    expect(result).toEqual(payload);
  });
});
