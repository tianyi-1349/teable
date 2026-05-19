import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowRunVoSchema, type IWorkflowRunVo } from './types';

export const TRIGGER_EMAIL_RECEIVED_WORKFLOW =
  '/base/{baseId}/workflow/{workflowId}/email-received';

export const triggerEmailReceivedWorkflowBodySchema = z.unknown().optional();

export type ITriggerEmailReceivedWorkflowBody = z.infer<
  typeof triggerEmailReceivedWorkflowBodySchema
>;

export const TriggerEmailReceivedWorkflowRoute: RouteConfig = registerRoute({
  method: 'post',
  path: TRIGGER_EMAIL_RECEIVED_WORKFLOW,
  description: 'trigger an active email received workflow and execute a run immediately',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: triggerEmailReceivedWorkflowBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created email received workflow run',
      content: {
        'application/json': {
          schema: workflowRunVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const triggerEmailReceivedWorkflow = async (
  baseId: string,
  workflowId: string,
  body?: ITriggerEmailReceivedWorkflowBody
) => {
  return axios.post<IWorkflowRunVo>(
    urlBuilder(TRIGGER_EMAIL_RECEIVED_WORKFLOW, { baseId, workflowId }),
    body
  );
};
