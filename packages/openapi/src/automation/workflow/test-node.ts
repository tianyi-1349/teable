import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowRunVoSchema, type IWorkflowRunVo } from './types';

export const TEST_NODE_WORKFLOW = '/base/{baseId}/workflow/{workflowId}/test-node';

export const testNodeWorkflowRoSchema = z.object({
  nodeId: z.string().trim().min(1),
  input: z.unknown().optional(),
});

export type ITestNodeWorkflowRo = z.infer<typeof testNodeWorkflowRoSchema>;

export const TestNodeWorkflowRoute: RouteConfig = registerRoute({
  method: 'post',
  path: TEST_NODE_WORKFLOW,
  description: 'create and execute a manual automation node test run',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: testNodeWorkflowRoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created workflow node test run',
      content: {
        'application/json': {
          schema: workflowRunVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const testNodeWorkflow = async (
  baseId: string,
  workflowId: string,
  ro: ITestNodeWorkflowRo
) => {
  return axios.post<IWorkflowRunVo>(urlBuilder(TEST_NODE_WORKFLOW, { baseId, workflowId }), ro);
};
