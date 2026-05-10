import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowRunVoSchema, type IWorkflowRunVo } from './types';

export const GET_WORKFLOW_RUN_LIST = '/base/{baseId}/workflow/{workflowId}/run';

export const workflowRunListVoSchema = z.array(workflowRunVoSchema);
export type IWorkflowRunListVo = z.infer<typeof workflowRunListVoSchema>;

export const GetWorkflowRunListRoute: RouteConfig = registerRoute({
  method: 'get',
  path: GET_WORKFLOW_RUN_LIST,
  description: 'get automation workflow run list',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
  },
  responses: {
    200: {
      description: 'Workflow run list',
      content: {
        'application/json': {
          schema: workflowRunListVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const getWorkflowRunList = async (baseId: string, workflowId: string) => {
  return axios.get<IWorkflowRunVo[]>(urlBuilder(GET_WORKFLOW_RUN_LIST, { baseId, workflowId }));
};
