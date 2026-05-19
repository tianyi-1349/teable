import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowRunVoSchema, type IWorkflowRunVo } from './types';

export const TRIGGER_SCHEDULE_WORKFLOW = '/base/{baseId}/workflow/{workflowId}/schedule';

export const triggerScheduleWorkflowBodySchema = z.unknown().optional();

export type ITriggerScheduleWorkflowBody = z.infer<typeof triggerScheduleWorkflowBodySchema>;

export const TriggerScheduleWorkflowRoute: RouteConfig = registerRoute({
  method: 'post',
  path: TRIGGER_SCHEDULE_WORKFLOW,
  description: 'trigger an active schedule workflow and execute a run immediately',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: triggerScheduleWorkflowBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created schedule workflow run',
      content: {
        'application/json': {
          schema: workflowRunVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const triggerScheduleWorkflow = async (
  baseId: string,
  workflowId: string,
  body?: ITriggerScheduleWorkflowBody
) => {
  return axios.post<IWorkflowRunVo>(
    urlBuilder(TRIGGER_SCHEDULE_WORKFLOW, { baseId, workflowId }),
    body
  );
};
