import { BaseNodeResourceType } from '@teable/openapi';
import type { PublishedAppManifest, PublishedAppNode } from '../manifest';
import { getPublishedNodeUrl } from './getPublishedNodeUrl';
import type { PublishedNavigationItem, PublishedNavigationModel } from './types';

const toNavigationItem = (
  node: PublishedAppNode,
  manifest: PublishedAppManifest,
  nodeMap: Map<string, PublishedAppNode>
): PublishedNavigationItem => {
  const children = node.children
    .map((childId) => nodeMap.get(childId))
    .filter((child): child is PublishedAppNode => Boolean(child))
    .filter((child) => child.visibleInNav)
    .map((child) => toNavigationItem(child, manifest, nodeMap));

  return {
    nodeId: node.nodeId,
    resourceId: node.resourceId,
    resourceType: node.resourceType,
    title: node.title,
    icon: node.icon,
    kind: node.resourceType === BaseNodeResourceType.Folder ? 'group' : 'node',
    renderable: node.renderable,
    url: node.renderable ? getPublishedNodeUrl({ manifest, node }) : undefined,
    children,
  };
};

const flattenNavigationItems = (items: PublishedNavigationItem[]): PublishedNavigationItem[] => {
  return items.flatMap((item) => [item, ...flattenNavigationItems(item.children)]);
};

const findFirstRenderableItem = (items: PublishedNavigationItem[]) => {
  return flattenNavigationItems(items).find((item) => item.renderable);
};

export const buildPublishedNavigation = (props: {
  manifest: PublishedAppManifest;
  currentNode?: PublishedAppNode;
}): PublishedNavigationModel => {
  const { currentNode, manifest } = props;
  const visibleNodes = manifest.nodes.filter((node) => node.visibleInNav);
  const nodeMap = new Map(visibleNodes.map((node) => [node.nodeId, node]));
  const rootNodes = visibleNodes.filter((node) => !node.parentId || !nodeMap.has(node.parentId));
  const items = rootNodes.map((node) => toNavigationItem(node, manifest, nodeMap));
  const flatItems = flattenNavigationItems(items);
  const defaultItem =
    flatItems.find((item) => item.nodeId === manifest.defaultNodeId && item.renderable) ??
    findFirstRenderableItem(items);
  const activeItem = currentNode
    ? flatItems.find((item) => item.nodeId === currentNode.nodeId)
    : undefined;
  const renderableItems = flatItems.filter((item) => item.renderable);

  return {
    items,
    flatItems,
    activeItem,
    defaultItem,
    isSingleNode: renderableItems.length <= 1,
    isCurrentNodeInScope: currentNode ? Boolean(activeItem) : true,
  };
};
