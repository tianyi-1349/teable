import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowVoSchema, type IWorkflowVo } from './types';

export const DEACTIVATE_WORKFLOW = '/base/{baseId}/workflow/{workflowId}/deactivate';

export const DeactivateWorkflowRoute: RouteConfig = registerRoute({
  method: 'post',
  path: DEACTIVATE_WORKFLOW,
  description: 'deactivate a automation workflow',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
  },
  responses: {
    200: {
      description: 'Deactivated workflow',
      content: {
        'application/json': {
          schema: workflowVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const deactivateWorkflow = async (baseId: string, workflowId: string) => {
  return axios.post<IWorkflowVo>(urlBuilder(DEACTIVATE_WORKFLOW, { baseId, workflowId }));
};
