import { BaseNodeResourceType } from '@teable/openapi';
import { buildPublishedNavigation } from '../navigation';
import { buildPublishedAppManifest } from './buildPublishedAppManifest';

const BASE_ID = 'base-1';
const SHARE_ID = 'share-1';
const TITLE = 'Published Base';
const TABLE_NODE_ID = 'table-node';
const TABLE_RESOURCE_ID = 'table-1';
const FOLDER_NODE_ID = 'folder-node';
const DASHBOARD_NODE_ID = 'dashboard-node';
const DASHBOARD_RESOURCE_ID = 'dashboard-1';
const WORKFLOW_NODE_ID = 'workflow-node';
const WORKFLOW_RESOURCE_ID = 'workflow-1';
const APP_NODE_ID = 'app-node';
const APP_RESOURCE_ID = 'app-1';

describe('buildPublishedAppManifest', () => {
  it('uses the shared node as default and preserves published permissions', () => {
    const manifest = buildPublishedAppManifest({
      baseId: BASE_ID,
      shareId: SHARE_ID,
      shareNodeId: TABLE_NODE_ID,
      title: TITLE,
      nodes: [
        {
          id: TABLE_NODE_ID,
          resourceId: TABLE_RESOURCE_ID,
          resourceType: BaseNodeResourceType.Table,
          resourceMeta: { name: 'Orders' },
          children: [],
        },
        {
          id: DASHBOARD_NODE_ID,
          resourceId: DASHBOARD_RESOURCE_ID,
          resourceType: BaseNodeResourceType.Dashboard,
          resourceMeta: { name: 'Overview' },
          children: [],
        },
      ],
      permissions: {
        allowEdit: false,
        allowCopy: true,
        allowSave: false,
        readonly: true,
      },
      mode: 'share',
    });

    expect(manifest.defaultNodeId).toBe(TABLE_NODE_ID);
    expect(manifest.permissions).toEqual({
      allowEdit: false,
      allowCopy: true,
      allowSave: false,
      readonly: true,
    });
    expect(manifest.runtimeTargets).toEqual([
      'desktop-web',
      'tablet-web',
      'mobile-web',
      'embed',
      'pwa',
    ]);
  });

  it('falls back to the first renderable node when the shared node is not renderable', () => {
    const manifest = buildPublishedAppManifest({
      baseId: BASE_ID,
      shareId: SHARE_ID,
      shareNodeId: FOLDER_NODE_ID,
      title: TITLE,
      nodes: [
        {
          id: FOLDER_NODE_ID,
          resourceId: 'folder-1',
          resourceType: BaseNodeResourceType.Folder,
          resourceMeta: { name: 'Group' },
          children: [TABLE_NODE_ID],
        },
        {
          id: TABLE_NODE_ID,
          parentId: FOLDER_NODE_ID,
          resourceId: TABLE_RESOURCE_ID,
          resourceType: BaseNodeResourceType.Table,
          resourceMeta: { name: 'Orders' },
          children: [],
        },
      ],
      mode: 'share',
    });

    expect(manifest.defaultNodeId).toBe(TABLE_NODE_ID);
  });
});

describe('buildPublishedNavigation', () => {
  it('keeps single-node share navigation compact and marks in-scope current nodes', () => {
    const manifest = buildPublishedAppManifest({
      baseId: BASE_ID,
      shareId: SHARE_ID,
      shareNodeId: TABLE_NODE_ID,
      title: TITLE,
      nodes: [
        {
          id: TABLE_NODE_ID,
          resourceId: TABLE_RESOURCE_ID,
          resourceType: BaseNodeResourceType.Table,
          resourceMeta: { name: 'Orders' },
          children: [],
        },
      ],
      permissions: {
        allowEdit: false,
        readonly: true,
      },
      mode: 'share',
    });

    const currentNode = manifest.nodes[0];
    const navigation = buildPublishedNavigation({ manifest, currentNode });

    expect(navigation.isSingleNode).toBe(true);
    expect(navigation.isCurrentNodeInScope).toBe(true);
    expect(navigation.defaultItem?.nodeId).toBe(TABLE_NODE_ID);
    expect(navigation.activeItem?.nodeId).toBe(TABLE_NODE_ID);
    expect(navigation.flatItems).toEqual([
      expect.objectContaining({
        nodeId: TABLE_NODE_ID,
        resourceType: BaseNodeResourceType.Table,
        url: `/share/${SHARE_ID}/base/${BASE_ID}/table/${TABLE_RESOURCE_ID}`,
        renderable: true,
      }),
    ]);
  });

  it('treats direct URLs outside published scope as out of scope', () => {
    const manifest = buildPublishedAppManifest({
      baseId: BASE_ID,
      shareId: SHARE_ID,
      shareNodeId: TABLE_NODE_ID,
      title: TITLE,
      nodes: [
        {
          id: TABLE_NODE_ID,
          resourceId: TABLE_RESOURCE_ID,
          resourceType: BaseNodeResourceType.Table,
          resourceMeta: { name: 'Orders' },
          children: [],
        },
      ],
      mode: 'share',
    });

    const outOfScopeNode = {
      nodeId: DASHBOARD_NODE_ID,
      parentId: null,
      resourceId: DASHBOARD_RESOURCE_ID,
      resourceType: BaseNodeResourceType.Dashboard,
      title: 'Overview',
      children: [],
      visibleInNav: true,
      renderable: true,
    };

    const navigation = buildPublishedNavigation({
      manifest,
      currentNode: outOfScopeNode,
    });

    expect(navigation.activeItem).toBeUndefined();
    expect(navigation.isCurrentNodeInScope).toBe(false);
    expect(navigation.defaultItem?.nodeId).toBe(TABLE_NODE_ID);
  });

  it('builds share URLs for dashboard, workflow, and app resources', () => {
    const manifest = buildPublishedAppManifest({
      baseId: BASE_ID,
      shareId: SHARE_ID,
      title: TITLE,
      nodes: [
        {
          id: DASHBOARD_NODE_ID,
          resourceId: DASHBOARD_RESOURCE_ID,
          resourceType: BaseNodeResourceType.Dashboard,
          resourceMeta: { name: 'Overview' },
          children: [],
        },
        {
          id: WORKFLOW_NODE_ID,
          resourceId: WORKFLOW_RESOURCE_ID,
          resourceType: BaseNodeResourceType.Workflow,
          resourceMeta: { name: 'Automation' },
          children: [],
        },
        {
          id: APP_NODE_ID,
          resourceId: APP_RESOURCE_ID,
          resourceType: BaseNodeResourceType.App,
          resourceMeta: { name: 'Sales App' },
          children: [],
        },
      ],
      mode: 'share',
    });

    const navigation = buildPublishedNavigation({ manifest });

    expect(navigation.flatItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nodeId: DASHBOARD_NODE_ID,
          url: `/share/${SHARE_ID}/base/${BASE_ID}/dashboard/${DASHBOARD_RESOURCE_ID}`,
        }),
        expect.objectContaining({
          nodeId: WORKFLOW_NODE_ID,
          url: `/share/${SHARE_ID}/base/${BASE_ID}/automation/${WORKFLOW_RESOURCE_ID}`,
        }),
        expect.objectContaining({
          nodeId: APP_NODE_ID,
          url: `/share/${SHARE_ID}/base/${BASE_ID}/app/${APP_RESOURCE_ID}`,
        }),
      ])
    );
  });
});
