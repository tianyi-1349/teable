import { BaseNodeResourceType } from '@teable/openapi';
import type { IBaseResourceParsed } from '../hooks/useBaseResource';
import { getAppServerSideProps } from './AppPage';
import { getBaseServerSideProps } from './BasePage';
import { getDashboardServerSideProps } from './DashBoardPage';
import { getTableServerSideProps } from './TablePage';
import type { ISSRContext, SSRResult } from './types';
import { getWorkflowServerSideProps } from './WorkflowPage';

export const getResourcePageProps = async (
  ctx: ISSRContext,
  parsed: IBaseResourceParsed,
  queryParams: Record<string, string | string[] | undefined> = {}
): Promise<SSRResult> => {
  if (!parsed.resourceType) {
    return getBaseServerSideProps(ctx);
  }

  switch (parsed.resourceType) {
    case BaseNodeResourceType.Table:
      return getTableServerSideProps(ctx, parsed, queryParams);
    case BaseNodeResourceType.Dashboard:
      return getDashboardServerSideProps(ctx, parsed);
    case BaseNodeResourceType.Workflow:
      return getWorkflowServerSideProps(ctx, parsed);
    case BaseNodeResourceType.App:
      return getAppServerSideProps(ctx, parsed);
    default:
      return { notFound: true };
  }
};
