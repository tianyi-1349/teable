import { BaseNodeResourceType } from '@teable/openapi';
import { useTranslation } from 'next-i18next';
import type { ReactNode } from 'react';
import { useBaseResource } from '@/features/app/hooks/useBaseResource';
import { usePublishedApp } from '../context';
import { PublishedResourceState } from './PublishedResourceState';
import { AppResourcePage } from './resources/AppResourcePage';
import { DashboardResourcePage } from './resources/DashboardResourcePage';
import { TableResourcePage } from './resources/TableResourcePage';
import { UnsupportedResourcePage } from './resources/UnsupportedResourcePage';
import { WorkflowResourcePage } from './resources/WorkflowResourcePage';

export const PublishedResourceSwitch = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common');
  const { currentNode, defaultNode, isShare } = usePublishedApp();
  const resource = useBaseResource();
  const node = currentNode ?? defaultNode;

  if (!node) {
    if (resource.resourceType) {
      return (
        <PublishedResourceState
          title={t('system.publishedApp.accessDeniedTitle')}
          description={t('system.publishedApp.accessDeniedDescription')}
        />
      );
    }

    if (isShare) {
      return <>{children}</>;
    }

    return (
      <PublishedResourceState
        title={t('system.publishedApp.noResourcesTitle')}
        description={t('system.publishedApp.noResourcesDescription')}
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
