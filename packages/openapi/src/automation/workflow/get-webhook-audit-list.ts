import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowRunWebhookAuditListVoSchema, type IWorkflowRunWebhookAuditListVo } from './types';

export const GET_WORKFLOW_WEBHOOK_AUDIT_LIST = '/base/{baseId}/workflow/{workflowId}/webhook-audit';

export const workflowRunWebhookAuditListQuerySchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().positive().max(50).optional(),
});
export type IWorkflowRunWebhookAuditListQuery = z.infer<
  typeof workflowRunWebhookAuditListQuerySchema
>;

export const GetWorkflowWebhookAuditListRoute: RouteConfig = registerRoute({
  method: 'get',
  path: GET_WORKFLOW_WEBHOOK_AUDIT_LIST,
  description: 'get automation workflow webhook audit list',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
    query: workflowRunWebhookAuditListQuerySchema,
  },
  responses: {
    200: {
      description: 'Workflow webhook audit list',
      content: {
        'application/json': {
          schema: workflowRunWebhookAuditListVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const getWorkflowWebhookAuditList = async (
  baseId: string,
  workflowId: string,
  query?: IWorkflowRunWebhookAuditListQuery
) => {
  return axios.get<IWorkflowRunWebhookAuditListVo>(
    urlBuilder(GET_WORKFLOW_WEBHOOK_AUDIT_LIST, { baseId, workflowId }),
    { params: query }
  );
};
