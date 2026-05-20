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

const getSelectedNodes = (selectedNodeIds: string[], treeItems: Record<string, TreeItemData>) => {
  return selectedNodeIds
    .map((nodeId) => treeItems[nodeId])
    .filter((node): node is TreeItemData => Boolean(node));
};

const addDashboardWarning = (
  issues: PublishedAppValidationIssue[],
  renderableNodes: TreeItemData[]
) => {
  const hasDashboardNode = renderableNodes.some(
    (node) => node.resourceType === BaseNodeResourceType.Dashboard
  );

  if (hasDashboardNode) {
    issues.push({
      severity: 'warning',
      message:
        'Dashboard pages may require mobile layout verification to avoid overflow on narrow screens.',
    });
  }
};

type IPublishedAppConfigValidationProps = {
  selectedNodeIds: string[];
  // Source publish config still uses `defaultActiveNodeId`, while runtime manifest uses `defaultNodeId`.
  defaultNodeId?: string | null;
};

export const validatePublishedAppConfig = (
  props: IPublishedAppConfigValidationProps & { treeItems: Record<string, TreeItemData> }
): PublishedAppValidationResult => {
  const { defaultNodeId, selectedNodeIds, treeItems } = props;
  const selectedNodes = getSelectedNodes(selectedNodeIds, treeItems);
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

  if (defaultNodeId) {
    const defaultNode = treeItems[defaultNodeId];
    if (!selectedNodeIds.includes(defaultNodeId) || !defaultNode) {
      issues.push({
        severity: 'error',
        message: 'The default page must be included in the published nodes.',
        nodeId: defaultNodeId,
      });
    } else if (defaultNode.resourceType === BaseNodeResourceType.Folder) {
      issues.push({
        severity: 'error',
        message: 'The default page cannot be a folder.',
        nodeId: defaultNodeId,
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

  addDashboardWarning(issues, renderableNodes);

  return {
    issues,
    hasErrors: issues.some((issue) => issue.severity === 'error'),
  };
};
