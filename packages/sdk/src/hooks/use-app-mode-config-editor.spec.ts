import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAppModeConfig } from './use-app-mode-config';
import { useAppModeConfigEditor, validateAppModeDraft } from './use-app-mode-config-editor';

vi.mock('./use-app-mode-config', () => ({
  useAppModeConfig: vi.fn(),
}));

const mockedUseAppModeConfig = vi.mocked(useAppModeConfig);

const createConfig = (pageId: string) => ({
  version: 1,
  pages: [{ id: pageId, name: pageId, type: 'list' as const }],
  linkedBaseIds: [],
  dashboardIds: [],
  workflowEnabled: false,
  governance: {
    roleMatrixVersion: 1,
    auditPolicy: 'standard' as const,
    permissionMode: 'inherited' as const,
  },
});

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

describe('useAppModeConfigEditor', () => {
  it('resets draft when base id changes', () => {
    let currentAppMode = {
      baseId: 'base-1',
      config: createConfig('page-1'),
      isLoading: false,
      isFetching: false,
      error: null,
      isUpdating: false,
      updateConfig: vi.fn(),
      refetch: vi.fn(),
    };

    mockedUseAppModeConfig.mockImplementation(() => currentAppMode);

    const { result, rerender } = renderHook(() => useAppModeConfigEditor('current-base'));

    act(() => {
      result.current.setLinkedBaseIds(['custom-base']);
    });

    expect(result.current.draft?.linkedBaseIds).toEqual(['custom-base']);

    currentAppMode = {
      ...currentAppMode,
      baseId: 'base-2',
      config: createConfig('page-2'),
    };

    rerender();

    return waitFor(() => {
      expect(result.current.baseId).toBe('base-2');
      expect(result.current.draft?.pages[0].id).toBe('page-2');
      expect(result.current.draft?.linkedBaseIds).toEqual([]);
    });
  });
});
