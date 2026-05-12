import type { IBaseNodeAppResourceMeta } from '@teable/openapi';
import { BaseNodeResourceType } from '@teable/openapi';
import type { TreeItemData } from '@/features/app/blocks/base/base-node/hooks';

export type PublishedAppValidationSeverity = 'error' | 'warning' | 'info';

export interface PublishedAppValidationIssue {
  severity: PublishedAppValidationSeverity;
  message: string;
  nodeId?: string;
}

export interface PublishedAppValidationResult {
  issues: PublishedAppValidationIssue[];
  hasErrors: boolean;
}

export const validatePublishedAppConfig = (props: {
  selectedNodeIds: string[];
  defaultActiveNodeId?: string | null;
  treeItems: Record<string, TreeItemData>;
}): PublishedAppValidationResult => {
  const { defaultActiveNodeId, selectedNodeIds, treeItems } = props;
  const selectedNodes = selectedNodeIds.map((nodeId) => treeItems[nodeId]).filter(Boolean);
  const renderableNodes = selectedNodes.filter(
    (node) => node.resourceType !== BaseNodeResourceType.Folder
  );
  const issues: PublishedAppValidationIssue[] = [];

  if (selectedNodes.length === 0) {
    issues.push({
      severity: 'error',
      message: 'Select at least one node before publishing.',
    });
  }

  if (selectedNodes.length > 0 && renderableNodes.length === 0) {
    issues.push({
      severity: 'error',
      message: 'Select at least one table, dashboard, automation, or app node.',
    });
  }

  if (defaultActiveNodeId) {
    const defaultNode = treeItems[defaultActiveNodeId];
    if (!selectedNodeIds.includes(defaultActiveNodeId) || !defaultNode) {
      issues.push({
        severity: 'error',
        message: 'The default page must be included in the published nodes.',
        nodeId: defaultActiveNodeId,
      });
    } else if (defaultNode.resourceType === BaseNodeResourceType.Folder) {
      issues.push({
        severity: 'error',
        message: 'The default page cannot be a folder.',
        nodeId: defaultActiveNodeId,
      });
    }
  }

  for (const node of selectedNodes) {
    if (node.resourceType !== BaseNodeResourceType.App) continue;
    const meta = node.resourceMeta as IBaseNodeAppResourceMeta | undefined;
    if (!meta?.publicUrl) {
      issues.push({
        severity: 'warning',
        message: `App "${node.resourceMeta?.name ?? node.id}" has no public URL and will show an unavailable state.`,
        nodeId: node.id,
      });
    }
  }

  if (renderableNodes.length > 1) {
    issues.push({
      severity: 'info',
      message: 'Multiple pages will use the published app navigation model.',
    });
  }

  return {
    issues,
    hasErrors: issues.some((issue) => issue.severity === 'error'),
  };
};
