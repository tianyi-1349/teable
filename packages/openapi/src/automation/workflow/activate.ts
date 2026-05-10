import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowVoSchema, type IWorkflowVo } from './types';

export const ACTIVATE_WORKFLOW = '/base/{baseId}/workflow/{workflowId}/activate';

export const ActivateWorkflowRoute: RouteConfig = registerRoute({
  method: 'post',
  path: ACTIVATE_WORKFLOW,
  description: 'activate a automation workflow',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
  },
  responses: {
    200: {
      description: 'Activated workflow',
      content: {
        'application/json': {
          schema: workflowVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const activateWorkflow = async (baseId: string, workflowId: string) => {
  return axios.post<IWorkflowVo>(urlBuilder(ACTIVATE_WORKFLOW, { baseId, workflowId }));
};
