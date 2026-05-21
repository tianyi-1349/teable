import { BaseNodeResourceType } from '@teable/openapi';
import { describe, expect, it } from 'vitest';
import type { TreeItemData } from '@/features/app/blocks/base/base-node/hooks';
import { validatePublishedAppConfig } from './validatePublishedAppConfig';

const createNode = (
  id: string,
  resourceType: BaseNodeResourceType,
  overrides: Partial<TreeItemData> = {}
): TreeItemData => {
  return {
    id,
    parentId: null,
    resourceId: `${id}-resource`,
    resourceType,
    resourceMeta: {
      name: `${id}-name`,
      icon: null,
      ...((resourceType === BaseNodeResourceType.App ? { publicUrl: undefined } : {}) as object),
      ...(overrides.resourceMeta ?? {}),
    },
    children: [],
    hasChildren: false,
    level: 0,
    isExpanded: false,
    isLoading: false,
    canDrag: true,
    canDrop: true,
    ...overrides,
  } as TreeItemData;
};

describe('validatePublishedAppConfig', () => {
  it('marks empty selection as fatal', () => {
    const result = validatePublishedAppConfig({
      selectedNodeIds: [],
      defaultNodeId: null,
      treeItems: {},
    });

    expect(result.hasFatalErrors).toBe(true);
    expect(result.hasErrors).toBe(true);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'fatal',
          message: 'Select at least one node before publishing.',
        }),
      ])
    );
  });

  it('marks missing app runtime URL as fatal', () => {
    const treeItems = {
      app1: createNode('app1', BaseNodeResourceType.App),
    } satisfies Record<string, TreeItemData>;

    const result = validatePublishedAppConfig({
      selectedNodeIds: ['app1'],
      defaultNodeId: 'app1',
      treeItems,
    });

    expect(result.hasFatalErrors).toBe(true);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'fatal',
          nodeId: 'app1',
        }),
      ])
    );
  });

  it('keeps dashboard mobile review as warning', () => {
    const treeItems = {
      dashboard1: createNode('dashboard1', BaseNodeResourceType.Dashboard),
    } satisfies Record<string, TreeItemData>;

    const result = validatePublishedAppConfig({
      selectedNodeIds: ['dashboard1'],
      defaultNodeId: 'dashboard1',
      treeItems,
    });

    expect(result.hasFatalErrors).toBe(false);
    expect(result.hasErrors).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'warning',
          message:
            'Dashboard pages may require mobile layout verification to avoid overflow on narrow screens.',
        }),
      ])
    );
  });
});
