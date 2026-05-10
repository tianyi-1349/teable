import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowVoSchema, type IWorkflowVo } from './types';

export const GET_WORKFLOW_LIST = '/base/{baseId}/workflow';

export const workflowListVoSchema = z.array(workflowVoSchema);
export type IWorkflowListVo = z.infer<typeof workflowListVoSchema>;

export const GetWorkflowListRoute: RouteConfig = registerRoute({
  method: 'get',
  path: GET_WORKFLOW_LIST,
  description: 'get automation workflow list in base',
  request: {
    params: z.object({ baseId: z.string() }),
  },
  responses: {
    200: {
      description: 'Workflow list',
      content: {
        'application/json': {
          schema: workflowListVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const getWorkflowList = async (baseId: string) => {
  return axios.get<IWorkflowVo[]>(urlBuilder(GET_WORKFLOW_LIST, { baseId }));
};
