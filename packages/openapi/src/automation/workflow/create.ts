import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowRoSchema, workflowVoSchema, type IWorkflowRo, type IWorkflowVo } from './types';

const CREATE_WORKFLOW = '/base/{baseId}/workflow';

export const CreateWorkflowRoute: RouteConfig = registerRoute({
  method: 'post',
  path: CREATE_WORKFLOW,
  description: 'Create a automation workflow',
  request: {
    params: z.object({ baseId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: workflowRoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created workflow',
      content: {
        'application/json': {
          schema: workflowVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const createWorkflow = async (baseId: string, createWorkflowRo?: IWorkflowRo) => {
  return axios.post<IWorkflowVo>(urlBuilder(CREATE_WORKFLOW, { baseId }), createWorkflowRo);
};
