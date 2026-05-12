import { BaseNodeResourceType } from '@teable/openapi';
import type {
  BuildPublishedAppManifestInput,
  PublishedAppManifest,
  PublishedAppNode,
  PublishedAppSourceNode,
} from './types';

const RENDERABLE_RESOURCE_TYPES = new Set<BaseNodeResourceType>([
  BaseNodeResourceType.Table,
  BaseNodeResourceType.Dashboard,
  BaseNodeResourceType.Workflow,
  BaseNodeResourceType.App,
]);

export const isPublishedAppRenderableResource = (resourceType: BaseNodeResourceType) => {
  return RENDERABLE_RESOURCE_TYPES.has(resourceType);
};

const toPublishedAppNode = (node: PublishedAppSourceNode): PublishedAppNode => {
  const renderable = isPublishedAppRenderableResource(node.resourceType);
  return {
    nodeId: node.id,
    resourceId: node.resourceId,
    resourceType: node.resourceType,
    title: node.resourceMeta?.name ?? '',
    icon: node.resourceMeta?.icon,
    parentId: node.parentId,
    children: node.children ?? [],
    visibleInNav: true,
    renderable,
  };
};

const findDefaultNodeId = (nodes: PublishedAppNode[], shareNodeId?: string | null) => {
  if (shareNodeId) {
    const shareNode = nodes.find((node) => node.nodeId === shareNodeId);
    if (shareNode?.renderable) {
      return shareNode.nodeId;
    }
  }

  return nodes.find((node) => node.renderable)?.nodeId ?? null;
};

export const buildPublishedAppManifest = ({
  baseId,
  title,
  icon,
  shareId,
  shareNodeId,
  nodes,
  permissions,
  mode,
}: BuildPublishedAppManifestInput): PublishedAppManifest => {
  const publishedNodes = nodes.map(toPublishedAppNode);

  return {
    baseId,
    shareId,
    title,
    icon,
    defaultNodeId: findDefaultNodeId(publishedNodes, shareNodeId),
    nodes: publishedNodes,
    permissions: {
      allowSave: permissions?.allowSave ?? false,
      allowCopy: permissions?.allowCopy ?? false,
      allowEdit: permissions?.allowEdit ?? false,
      readonly: permissions?.readonly ?? true,
    },
    mode,
    runtimeTargets: ['desktop-web', 'tablet-web', 'mobile-web', 'embed', 'pwa'],
  };
};
