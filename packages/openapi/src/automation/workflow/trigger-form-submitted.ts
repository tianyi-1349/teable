import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowRunVoSchema, type IWorkflowRunVo } from './types';

export const TRIGGER_FORM_SUBMITTED_WORKFLOW =
  '/base/{baseId}/workflow/{workflowId}/form-submitted';

export const triggerFormSubmittedWorkflowBodySchema = z.unknown().optional();

export type ITriggerFormSubmittedWorkflowBody = z.infer<
  typeof triggerFormSubmittedWorkflowBodySchema
>;

export const TriggerFormSubmittedWorkflowRoute: RouteConfig = registerRoute({
  method: 'post',
  path: TRIGGER_FORM_SUBMITTED_WORKFLOW,
  description: 'trigger an active form submitted workflow and execute a run immediately',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: triggerFormSubmittedWorkflowBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created form submitted workflow run',
      content: {
        'application/json': {
          schema: workflowRunVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const triggerFormSubmittedWorkflow = async (
  baseId: string,
  workflowId: string,
  body?: ITriggerFormSubmittedWorkflowBody
) => {
  return axios.post<IWorkflowRunVo>(
    urlBuilder(TRIGGER_FORM_SUBMITTED_WORKFLOW, { baseId, workflowId }),
    body
  );
};
