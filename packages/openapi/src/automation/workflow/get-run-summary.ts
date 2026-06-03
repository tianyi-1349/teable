import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import {
  workflowRunWebhookAuditSummaryVoSchema,
  type IWorkflowRunWebhookAuditSummaryVo,
} from './types';

export const GET_WORKFLOW_RUN_SUMMARY = '/base/{baseId}/workflow/{workflowId}/run-summary';

export const GetWorkflowRunSummaryRoute: RouteConfig = registerRoute({
  method: 'get',
  path: GET_WORKFLOW_RUN_SUMMARY,
  description: 'get automation workflow run summary',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
  },
  responses: {
    200: {
      description: 'Workflow run summary',
      content: {
        'application/json': {
          schema: workflowRunWebhookAuditSummaryVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const getWorkflowRunSummary = async (baseId: string, workflowId: string) => {
  return axios.get<IWorkflowRunWebhookAuditSummaryVo>(
    urlBuilder(GET_WORKFLOW_RUN_SUMMARY, { baseId, workflowId })
  );
};
