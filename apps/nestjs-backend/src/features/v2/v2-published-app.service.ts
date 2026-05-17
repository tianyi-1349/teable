import { Injectable } from '@nestjs/common';
import { BaseNodeResourceType } from '@teable/openapi';
import { BaseNodeService } from '../base-node/base-node.service';
import { BaseShareAuthService } from '../base-share/base-share-auth.service';

type PublishedRuntimeNode = {
  nodeId: string;
  resourceId: string;
  resourceType: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  children: string[];
  visibleInNav: boolean;
  renderable: boolean;
};

type PublishedNavigationItem = {
  nodeId: string;
  resourceId: string;
  resourceType: string;
  title: string;
  icon?: string | null;
  kind: 'node' | 'group';
  renderable: boolean;
  url?: string;
  children: PublishedNavigationItem[];
};

const renderableResourceTypes = new Set<string>([
  BaseNodeResourceType.Table,
  BaseNodeResourceType.Dashboard,
  BaseNodeResourceType.Workflow,
  BaseNodeResourceType.App,
]);

@Injectable()
export class V2PublishedAppService {
  constructor(
    private readonly baseShareAuthService: BaseShareAuthService,
    private readonly baseNodeService: BaseNodeService
  ) {}

  async getRuntimeManifest(shareId: string) {
    const shareInfo = await this.baseShareAuthService.getBaseShareInfo(shareId);
    const nodes = await this.baseNodeService.getList(shareInfo.baseId);
    const passwordRestricted = await this.baseShareAuthService.hasPassword(shareId);

    const allowedNodeIds = this.getAllowedNodeIds(nodes, shareInfo.nodeId);
    const filteredNodes = nodes.filter((node) => !allowedNodeIds || allowedNodeIds.has(node.id));

    const manifestNodes = filteredNodes.map((node) => ({
      nodeId: node.id,
      resourceId: node.resourceId,
      resourceType: node.resourceType,
      title: node.resourceMeta?.name ?? '',
      icon: node.resourceMeta?.icon ?? null,
      parentId: node.parentId,
      children: (node.children ?? []).map((child) => child.id),
      visibleInNav: true,
      renderable: renderableResourceTypes.has(node.resourceType),
    }));

    const defaultNodeId = this.findDefaultNodeId(manifestNodes, shareInfo.nodeId);

    const scopeNode = shareInfo.nodeId
      ? filteredNodes.find((node) => node.id === shareInfo.nodeId)
      : filteredNodes.find((node) => !node.parentId);

    return {
      baseId: shareInfo.baseId,
      shareId,
      title: scopeNode?.resourceMeta?.name ?? 'Published Teable App',
      icon: scopeNode?.resourceMeta?.icon ?? null,
      defaultNodeId,
      defaultUrl: defaultNodeId
        ? this.getPublishedNodeUrl(
            shareInfo.baseId,
            shareId,
            manifestNodes.find((node) => node.nodeId === defaultNodeId) ?? null
          )
        : undefined,
      nodes: manifestNodes,
      permissions: {
        allowSave: Boolean(shareInfo.allowSave),
        allowCopy: Boolean(shareInfo.allowCopy),
        allowEdit: Boolean(shareInfo.allowEdit),
        readonly: !shareInfo.allowEdit,
      },
      shareMeta: {
        passwordRestricted,
      },
      mode: 'share' as const,
      runtimeTargets: ['desktop-web', 'tablet-web', 'mobile-web', 'embed', 'pwa'] as const,
    };
  }

  async getNavigationModel(shareId: string, currentNodeId?: string) {
    const manifest = await this.getRuntimeManifest(shareId);
    const visibleNodes = manifest.nodes.filter((node) => node.visibleInNav);
    const nodeMap = new Map(visibleNodes.map((node) => [node.nodeId, node]));
    const rootNodes = visibleNodes.filter((node) => !node.parentId || !nodeMap.has(node.parentId));
    const items = rootNodes.map((node) => this.toNavigationItem(node, manifest, nodeMap));
    const flatItems = this.flattenNavigationItems(items);
    const defaultItem =
      flatItems.find((item) => item.nodeId === manifest.defaultNodeId && item.renderable) ??
      flatItems.find((item) => item.renderable);
    const activeItem = currentNodeId
      ? flatItems.find((item) => item.nodeId === currentNodeId)
      : undefined;
    const renderableItems = flatItems.filter((item) => item.renderable);

    return {
      items,
      flatItems,
      activeItem,
      defaultItem,
      isSingleNode: renderableItems.length <= 1,
      isCurrentNodeInScope: currentNodeId ? Boolean(activeItem) : true,
    };
  }

  async getNodeRuntime(shareId: string, nodeId: string) {
    const manifest = await this.getRuntimeManifest(shareId);
    const currentNode = manifest.nodes.find((node) => node.nodeId === nodeId);
    const defaultNode =
      manifest.nodes.find((node) => node.nodeId === manifest.defaultNodeId) ?? null;
    const resolvedNode = currentNode ?? defaultNode;

    return {
      requestedNodeId: nodeId,
      currentNode,
      defaultNode,
      resolvedNode,
      isCurrentNodeInScope: Boolean(currentNode),
      isRenderable: Boolean(resolvedNode?.renderable),
      isDefault: Boolean(resolvedNode && defaultNode && resolvedNode.nodeId === defaultNode.nodeId),
      url: resolvedNode
        ? this.getPublishedNodeUrl(manifest.baseId, manifest.shareId, resolvedNode)
        : undefined,
    };
  }

  private findDefaultNodeId(
    nodes: Array<{ nodeId: string; renderable: boolean }>,
    shareNodeId: string | null
  ) {
    if (shareNodeId) {
      const shareNode = nodes.find((node) => node.nodeId === shareNodeId);
      if (shareNode?.renderable) {
        return shareNode.nodeId;
      }
    }

    return nodes.find((node) => node.renderable)?.nodeId ?? null;
  }

  private getAllowedNodeIds(
    nodes: Array<{ id: string; parentId: string | null }>,
    shareNodeId: string | null
  ) {
    if (!shareNodeId) {
      return undefined;
    }

    const nodeIds = new Set(nodes.map((node) => node.id));
    if (!nodeIds.has(shareNodeId)) {
      return new Set<string>();
    }

    const childrenByParent = new Map<string, string[]>();
    for (const node of nodes) {
      if (!node.parentId) continue;
      const current = childrenByParent.get(node.parentId) ?? [];
      current.push(node.id);
      childrenByParent.set(node.parentId, current);
    }

    const allowed = new Set<string>();
    const queue = [shareNodeId];
    while (queue.length) {
      const current = queue.shift();
      if (!current || allowed.has(current)) continue;
      allowed.add(current);
      for (const childId of childrenByParent.get(current) ?? []) {
        if (!allowed.has(childId)) {
          queue.push(childId);
        }
      }
    }

    return allowed;
  }

  private toNavigationItem(
    node: PublishedRuntimeNode,
    manifest: { baseId: string; shareId?: string; nodes: PublishedRuntimeNode[] },
    nodeMap: Map<string, PublishedRuntimeNode>
  ): PublishedNavigationItem {
    const children = node.children
      .map((childId) => nodeMap.get(childId))
      .filter((child): child is PublishedRuntimeNode => Boolean(child))
      .filter((child) => child.visibleInNav)
      .map((child) => this.toNavigationItem(child, manifest, nodeMap));

    return {
      nodeId: node.nodeId,
      resourceId: node.resourceId,
      resourceType: node.resourceType,
      title: node.title,
      icon: node.icon,
      kind: node.resourceType === BaseNodeResourceType.Folder ? 'group' : 'node',
      renderable: node.renderable,
      url: node.renderable
        ? this.getPublishedNodeUrl(manifest.baseId, manifest.shareId, node)
        : undefined,
      children,
    };
  }

  private flattenNavigationItems(items: PublishedNavigationItem[]): PublishedNavigationItem[] {
    return items.flatMap((item) => [item, ...this.flattenNavigationItems(item.children)]);
  }

  private getPublishedNodeUrl(
    baseId: string,
    shareId: string | undefined,
    node: PublishedRuntimeNode | null
  ) {
    if (!node) {
      return undefined;
    }

    switch (node.resourceType) {
      case BaseNodeResourceType.Table:
        return `${shareId ? `/share/${shareId}` : `/base/${baseId}`}/table/${node.resourceId}`;
      case BaseNodeResourceType.Dashboard:
        return `${shareId ? `/share/${shareId}` : `/base/${baseId}`}/dashboard/${node.resourceId}`;
      case BaseNodeResourceType.Workflow:
        return `${shareId ? `/share/${shareId}` : `/base/${baseId}`}/automation/${node.resourceId}`;
      case BaseNodeResourceType.App:
        return `${shareId ? `/share/${shareId}` : `/base/${baseId}`}/app/${node.resourceId}`;
      default:
        return undefined;
    }
  }
}
