import type { INestApplication } from '@nestjs/common';
import { ViewType } from '@teable/core';
import {
  BaseNodeResourceType,
  createBaseNode,
  createBaseShare,
  getBaseNodeList,
  updateBaseShare,
} from '@teable/openapi';
import { createBase, createTable, createView, initApp } from './utils/init-app';

describe('Published runtime fixture', () => {
  let app: INestApplication;
  let appUrl: string;

  beforeAll(async () => {
    process.env.SECRET_KEY ||= 'test-secret-key';
    process.env.BACKEND_JWT_SECRET ||= 'test-jwt-secret';
    process.env.DISABLE_PRE_SQL_EXECUTOR_CHECK = 'true';
    const appCtx = await initApp();
    app = appCtx.app;
    appUrl = appCtx.appUrl;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates minimal published/share fixture and prints it', async () => {
    const base = await createBase({
      name: 'published-runtime-fixture',
      spaceId: globalThis.testConfig.spaceId,
    });

    try {
      const table = await createTable(base.id, {
        name: 'Published Table',
        fields: [],
        views: [],
        records: [],
      });

      const formView = await createView(table.id, {
        name: 'Published Form',
        type: ViewType.Form,
      });

      const dashboardNode = await createBaseNode(base.id, {
        resourceType: BaseNodeResourceType.Dashboard,
        name: 'Published Dashboard',
      });

      const nodeList = await getBaseNodeList(base.id);
      const tableNode = nodeList.data.find((node) => node.resourceId === table.id);

      expect(tableNode).toBeDefined();

      const baseShare = await createBaseShare(base.id, { nodeId: tableNode!.id });
      await updateBaseShare(base.id, baseShare.data.shareId, {
        allowCopy: true,
        allowEdit: false,
        enabled: true,
      });

      const fixture = {
        baseId: base.id,
        tableId: table.id,
        defaultViewId: table.defaultViewId,
        formViewId: formView.id,
        tableNodeId: tableNode!.id,
        dashboardNodeId: dashboardNode.data.id,
        baseShareId: baseShare.data.shareId,
        authenticatedTableUrl: `/base/${base.id}/table/${table.id}/${table.defaultViewId}`,
        authenticatedFormUrl: `/base/${base.id}/table/${table.id}/${formView.id}`,
        shareRootUrl: `/share/${baseShare.data.shareId}/base/${base.id}`,
        shareTableUrl: `/share/${baseShare.data.shareId}/base/${base.id}/table/${table.id}`,
        shareFormUrl: `/share/${baseShare.data.shareId}/base/${base.id}/table/${table.id}/${formView.id}`,
        publishedManifestUrl: `/api/v2/publishedApps/getRuntimeManifest?shareId=${baseShare.data.shareId}`,
        publishedNavUrl: `/api/v2/publishedApps/getNavigationModel?shareId=${baseShare.data.shareId}`,
        publishedNodeRuntimeUrl: `/api/v2/publishedApps/getNodeRuntime?shareId=${baseShare.data.shareId}&nodeId=${tableNode!.id}`,
      };

      const [manifestRes, navigationRes, nodeRuntimeRes] = await Promise.all([
        fetch(`${appUrl}${fixture.publishedManifestUrl}`),
        fetch(`${appUrl}${fixture.publishedNavUrl}`),
        fetch(`${appUrl}${fixture.publishedNodeRuntimeUrl}`),
      ]);

      expect(manifestRes.ok).toBe(true);
      expect(navigationRes.ok).toBe(true);
      expect(nodeRuntimeRes.ok).toBe(true);

      const manifestPayload = (await manifestRes.json()) as {
        ok: boolean;
        data: {
          manifest: {
            baseId: string;
            shareId?: string;
            defaultNodeId: string | null;
            defaultUrl?: string;
            mode: string;
            runtimeTargets: string[];
            permissions: {
              allowEdit: boolean;
              allowCopy: boolean;
              allowSave: boolean;
              readonly: boolean;
            };
            nodes: Array<{
              nodeId: string;
              resourceId: string;
              resourceType: string;
              renderable: boolean;
            }>;
          };
        };
      };
      const navigationPayload = (await navigationRes.json()) as {
        ok: boolean;
        data: {
          navigation: {
            items: Array<{
              nodeId: string;
              resourceType: string;
              renderable: boolean;
              url?: string;
            }>;
            flatItems: Array<{
              nodeId: string;
              resourceType: string;
              renderable: boolean;
              url?: string;
            }>;
            defaultItem?: { nodeId: string };
            activeItem?: { nodeId: string };
            isSingleNode: boolean;
            isCurrentNodeInScope: boolean;
          };
        };
      };
      const nodeRuntimePayload = (await nodeRuntimeRes.json()) as {
        ok: boolean;
        data: {
          runtime: {
            requestedNodeId: string;
            currentNode: { nodeId: string } | null;
            defaultNode: { nodeId: string } | null;
            resolvedNode: { nodeId: string; resourceType: string } | null;
            isCurrentNodeInScope: boolean;
            isRenderable: boolean;
            isDefault: boolean;
            url?: string;
          };
        };
      };

      expect(manifestPayload.ok).toBe(true);
      expect(navigationPayload.ok).toBe(true);
      expect(nodeRuntimePayload.ok).toBe(true);

      const manifest = manifestPayload.data.manifest;
      const navigation = navigationPayload.data.navigation;
      const nodeRuntime = nodeRuntimePayload.data.runtime;

      expect(manifest.baseId).toBe(base.id);
      expect(manifest.shareId).toBe(baseShare.data.shareId);
      expect(manifest.mode).toBe('share');
      expect(manifest.permissions).toMatchObject({
        allowEdit: false,
        allowCopy: true,
        readonly: true,
      });
      expect(manifest.runtimeTargets).toEqual(
        expect.arrayContaining(['desktop-web', 'tablet-web', 'mobile-web', 'embed', 'pwa'])
      );
      expect(manifest.defaultNodeId).toBe(tableNode!.id);
      expect(manifest.defaultUrl).toBe(`/share/${baseShare.data.shareId}/table/${table.id}`);
      expect(manifest.nodes).toHaveLength(1);
      expect(manifest.nodes).toEqual([
        expect.objectContaining({
          nodeId: tableNode!.id,
          resourceId: table.id,
          resourceType: BaseNodeResourceType.Table,
          renderable: true,
        }),
      ]);

      expect(navigation.defaultItem?.nodeId).toBe(tableNode!.id);
      expect(navigation.activeItem).toBeUndefined();
      expect(navigation.isCurrentNodeInScope).toBe(true);
      expect(navigation.isSingleNode).toBe(true);
      expect(navigation.flatItems).toEqual([
        expect.objectContaining({
          nodeId: tableNode!.id,
          resourceType: BaseNodeResourceType.Table,
          renderable: true,
          url: `/share/${baseShare.data.shareId}/table/${table.id}`,
        }),
      ]);

      expect(nodeRuntime.requestedNodeId).toBe(tableNode!.id);
      expect(nodeRuntime.currentNode?.nodeId).toBe(tableNode!.id);
      expect(nodeRuntime.defaultNode?.nodeId).toBe(tableNode!.id);
      expect(nodeRuntime.resolvedNode?.nodeId).toBe(tableNode!.id);
      expect(nodeRuntime.resolvedNode?.resourceType).toBe(BaseNodeResourceType.Table);
      expect(nodeRuntime.isCurrentNodeInScope).toBe(true);
      expect(nodeRuntime.isRenderable).toBe(true);
      expect(nodeRuntime.isDefault).toBe(true);
      expect(nodeRuntime.url).toBe(`/share/${baseShare.data.shareId}/table/${table.id}`);

      console.log('PUBLISHED_RUNTIME_FIXTURE=' + JSON.stringify(fixture));
    } finally {
      // Keep fixture data for follow-up manual checks.
    }
  });
});
