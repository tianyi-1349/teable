import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import {
  duplicateWorkflowRoSchema,
  workflowVoSchema,
  type IDuplicateWorkflowRo,
  type IWorkflowVo,
} from './types';

export const DUPLICATE_WORKFLOW = '/base/{baseId}/workflow/{workflowId}/duplicate';

export const DuplicateWorkflowRoute: RouteConfig = registerRoute({
  method: 'post',
  path: DUPLICATE_WORKFLOW,
  description: 'duplicate a automation workflow',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: duplicateWorkflowRoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Duplicated workflow',
      content: {
        'application/json': {
          schema: workflowVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const duplicateWorkflow = async (
  baseId: string,
  workflowId: string,
  duplicateWorkflowRo: IDuplicateWorkflowRo
) => {
  return axios.post<IWorkflowVo>(
    urlBuilder(DUPLICATE_WORKFLOW, { baseId, workflowId }),
    duplicateWorkflowRo
  );
};
