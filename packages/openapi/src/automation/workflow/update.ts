import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import {
  updateWorkflowRoSchema,
  workflowVoSchema,
  type IUpdateWorkflowRo,
  type IWorkflowVo,
} from './types';

export const UPDATE_WORKFLOW = '/base/{baseId}/workflow/{workflowId}';

export const UpdateWorkflowRoute: RouteConfig = registerRoute({
  method: 'put',
  path: UPDATE_WORKFLOW,
  description: 'update a automation workflow',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: updateWorkflowRoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated workflow',
      content: {
        'application/json': {
          schema: workflowVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const updateWorkflow = async (
  baseId: string,
  workflowId: string,
  updateWorkflowRo: IUpdateWorkflowRo
) => {
  return axios.put<IWorkflowVo>(
    urlBuilder(UPDATE_WORKFLOW, { baseId, workflowId }),
    updateWorkflowRo
  );
};
