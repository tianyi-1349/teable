import { describe, expect, it } from 'vitest';
import { validateAppModeDraft } from './use-app-mode-config-editor';

describe('validateAppModeDraft', () => {
  it('returns ok for valid config', () => {
    const result = validateAppModeDraft({
      version: 1,
      pages: [{ id: 'p1', name: 'Home', type: 'list' }],
      linkedBaseIds: ['baseA'],
      dashboardIds: ['dashA'],
      workflowEnabled: true,
      governance: {
        roleMatrixVersion: 2,
        auditPolicy: 'strict',
        permissionMode: 'isolated',
      },
    });

    expect(result).toEqual({ ok: true });
  });

  it('returns error for duplicated page id', () => {
    const result = validateAppModeDraft({
      version: 1,
      pages: [
        { id: 'p1', name: 'Home', type: 'list' },
        { id: 'p1', name: 'Home2', type: 'detail' },
      ],
      linkedBaseIds: [],
      dashboardIds: [],
      workflowEnabled: false,
      governance: {
        roleMatrixVersion: 1,
        auditPolicy: 'standard',
        permissionMode: 'inherited',
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('Duplicate page id');
    }
  });

  it('returns error for strict governance without isolated mode', () => {
    const result = validateAppModeDraft({
      version: 1,
      pages: [{ id: 'p1', name: 'Home', type: 'list' }],
      linkedBaseIds: [],
      dashboardIds: [],
      workflowEnabled: false,
      governance: {
        roleMatrixVersion: 2,
        auditPolicy: 'strict',
        permissionMode: 'inherited',
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('strict audit requires isolated permission mode');
    }
  });
});
