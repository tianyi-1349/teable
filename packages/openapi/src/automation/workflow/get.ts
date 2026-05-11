import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowDetailVoSchema, type IWorkflowDetailVo } from './types';

export const GET_WORKFLOW = '/base/{baseId}/workflow/{workflowId}';

export const GetWorkflowRoute: RouteConfig = registerRoute({
  method: 'get',
  path: GET_WORKFLOW,
  description: 'get a automation workflow',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
  },
  responses: {
    200: {
      description: 'Workflow detail',
      content: {
        'application/json': {
          schema: workflowDetailVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const getWorkflow = async (baseId: string, workflowId: string) => {
  return axios.get<IWorkflowDetailVo>(urlBuilder(GET_WORKFLOW, { baseId, workflowId }));
};
