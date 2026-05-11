import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowRunVoSchema, type IWorkflowRunVo } from './types';

export const TEST_RUN_WORKFLOW = '/base/{baseId}/workflow/{workflowId}/test-run';

export const testRunWorkflowRoSchema = z.object({
  input: z.unknown().optional(),
});

export type ITestRunWorkflowRo = z.infer<typeof testRunWorkflowRoSchema>;

export const TestRunWorkflowRoute: RouteConfig = registerRoute({
  method: 'post',
  path: TEST_RUN_WORKFLOW,
  description: 'create and execute a manual automation workflow test run',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: testRunWorkflowRoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created workflow test run',
      content: {
        'application/json': {
          schema: workflowRunVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const testRunWorkflow = async (
  baseId: string,
  workflowId: string,
  testRunWorkflowRo?: ITestRunWorkflowRo
) => {
  return axios.post<IWorkflowRunVo>(
    urlBuilder(TEST_RUN_WORKFLOW, { baseId, workflowId }),
    testRunWorkflowRo
  );
};
