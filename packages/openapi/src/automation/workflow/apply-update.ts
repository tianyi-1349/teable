import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowVoSchema, type IWorkflowVo } from './types';

export const APPLY_UPDATE_WORKFLOW = '/base/{baseId}/workflow/{workflowId}/apply-update';

export const ApplyUpdateWorkflowRoute: RouteConfig = registerRoute({
  method: 'post',
  path: APPLY_UPDATE_WORKFLOW,
  description: 'Apply draft updates to an active automation workflow',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
  },
  responses: {
    200: {
      description: 'Applied workflow draft update',
      content: {
        'application/json': {
          schema: workflowVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const applyUpdateWorkflow = async (baseId: string, workflowId: string) => {
  return axios.post<IWorkflowVo>(urlBuilder(APPLY_UPDATE_WORKFLOW, { baseId, workflowId }));
};
