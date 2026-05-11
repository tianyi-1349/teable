import { dehydrate } from '@tanstack/react-query';
import { BaseNodeResourceType, getWorkflow, getWorkflowList } from '@teable/openapi';
import { ReactQueryKeys } from '@teable/sdk/config';
import { AutomationPage } from '@/features/app/automation/Pages';
import type { IBaseResourceParsed } from '../hooks/useBaseResource';
import type { ISSRContext, SSRResult } from './types';

export const getWorkflowServerSideProps = async (
  ctx: ISSRContext,
  parsed: IBaseResourceParsed
): Promise<SSRResult> => {
  if (parsed.resourceType !== BaseNodeResourceType.Workflow) return { notFound: true };

  const workflowId = parsed.workflowId;
  await ctx.queryClient.prefetchQuery({
    queryKey: ['workflow-list', ctx.baseId],
    queryFn: () => getWorkflowList(ctx.baseId).then(({ data }) => data),
  });

  if (workflowId) {
    await ctx.queryClient.prefetchQuery({
      queryKey: ReactQueryKeys.workflowItem(ctx.baseId, workflowId),
      queryFn: () => getWorkflow(ctx.baseId, workflowId).then(({ data }) => data),
    });
  }

  return {
    props: {
      ...(await ctx.getTranslationsProps()),
      dehydratedState: dehydrate(ctx.queryClient),
    },
  };
};

export const WorkflowPage = () => {
  return <AutomationPage />;
};
