import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowRunDetailVoSchema, type IWorkflowRunDetailVo } from './types';

export const GET_WORKFLOW_RUN = '/base/{baseId}/workflow/{workflowId}/run/{runId}';

export const GetWorkflowRunRoute: RouteConfig = registerRoute({
  method: 'get',
  path: GET_WORKFLOW_RUN,
  description: 'get automation workflow run detail',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string(), runId: z.string() }),
  },
  responses: {
    200: {
      description: 'Workflow run detail',
      content: {
        'application/json': {
          schema: workflowRunDetailVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const getWorkflowRun = async (baseId: string, workflowId: string, runId: string) => {
  return axios.get<IWorkflowRunDetailVo>(
    urlBuilder(GET_WORKFLOW_RUN, { baseId, workflowId, runId })
  );
};
