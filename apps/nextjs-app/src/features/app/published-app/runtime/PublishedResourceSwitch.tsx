import { BaseNodeResourceType } from '@teable/openapi';
import type { ReactNode } from 'react';
import { usePublishedApp } from '../context';
import { PublishedResourceState } from './PublishedResourceState';
import { AppResourcePage } from './resources/AppResourcePage';
import { DashboardResourcePage } from './resources/DashboardResourcePage';
import { TableResourcePage } from './resources/TableResourcePage';
import { UnsupportedResourcePage } from './resources/UnsupportedResourcePage';
import { WorkflowResourcePage } from './resources/WorkflowResourcePage';

export const PublishedResourceSwitch = ({ children }: { children: ReactNode }) => {
  const { currentNode, defaultNode, isShare } = usePublishedApp();
  const node = currentNode ?? defaultNode;

  if (!node) {
    if (isShare) {
      return <>{children}</>;
    }

    return (
      <PublishedResourceState
        title="No published resources"
        description="This published app does not include a renderable resource yet."
      />
    );
  }

  if (!node.renderable) {
    return <UnsupportedResourcePage />;
  }

  switch (node.resourceType) {
    case BaseNodeResourceType.Table:
      return <TableResourcePage>{children}</TableResourcePage>;
    case BaseNodeResourceType.Dashboard:
      return <DashboardResourcePage>{children}</DashboardResourcePage>;
    case BaseNodeResourceType.Workflow:
      return <WorkflowResourcePage>{children}</WorkflowResourcePage>;
    case BaseNodeResourceType.App:
      return <AppResourcePage>{children}</AppResourcePage>;
    default:
      return <UnsupportedResourcePage />;
  }
};
