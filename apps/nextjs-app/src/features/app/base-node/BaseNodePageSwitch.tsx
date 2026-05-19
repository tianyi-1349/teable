import { BaseNodeResourceType } from '@teable/openapi';
import { CommunityPage } from '@/features/app/base/CommunityPage';
import { useBaseResource } from '../hooks/useBaseResource';
import { AppPage } from './AppPage';
import { DashBoardPage } from './DashBoardPage';
import { TablePage } from './TablePage';
import type { IBaseNodePageProps } from './types';
import { WorkflowPage } from './WorkflowPage';

export const BaseNodePageSwitch = (props: IBaseNodePageProps) => {
  const { resourceType } = useBaseResource();

  switch (resourceType) {
    case BaseNodeResourceType.Table:
      return <TablePage {...props} />;
    case BaseNodeResourceType.Dashboard:
      return <DashBoardPage />;
    case BaseNodeResourceType.Workflow:
      return <WorkflowPage />;
    case BaseNodeResourceType.App:
      return <AppPage {...props} />;
    default:
      return <CommunityPage />;
  }
};
