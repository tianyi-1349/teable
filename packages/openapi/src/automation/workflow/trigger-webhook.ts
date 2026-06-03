import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowRunVoSchema, type IWorkflowRunVo } from './types';
import { createWorkflowWebhookSignatureHeaders } from './webhook-signature';

export const TRIGGER_WEBHOOK_WORKFLOW = '/base/{baseId}/workflow/{workflowId}/webhook';

export const triggerWebhookWorkflowBodySchema = z.unknown().optional();

export const triggerWebhookWorkflowHeaderSchema = z.object({
  'x-webhook-secret': z.string().optional(),
  'x-webhook-signature': z.string().optional(),
  'x-webhook-timestamp': z.string().optional(),
});

export type ITriggerWebhookWorkflowBody = z.infer<typeof triggerWebhookWorkflowBodySchema>;

export const TriggerWebhookWorkflowRoute: RouteConfig = registerRoute({
  method: 'post',
  path: TRIGGER_WEBHOOK_WORKFLOW,
  description: 'trigger an active webhook workflow and execute a run immediately',
  request: {
    params: z.object({ baseId: z.string(), workflowId: z.string() }),
    headers: triggerWebhookWorkflowHeaderSchema,
    body: {
      content: {
        'application/json': {
          schema: triggerWebhookWorkflowBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created webhook workflow run',
      content: {
        'application/json': {
          schema: workflowRunVoSchema,
        },
      },
    },
    401: {
      description:
        'Webhook authentication failed. Possible messages: Invalid webhook secret, Missing webhook signature headers, Missing webhook timestamp header, Invalid webhook timestamp, Webhook timestamp expired, Invalid webhook signature.',
    },
    413: {
      description: 'Webhook payload exceeded configured body size limit.',
    },
    429: {
      description: 'Webhook rate limit exceeded for this workflow.',
    },
  },
  tags: ['automation'],
});

export const triggerWebhookWorkflow = async (
  baseId: string,
  workflowId: string,
  body?: ITriggerWebhookWorkflowBody,
  headers?: {
    webhookSecret?: string;
    webhookSignature?: string;
    webhookTimestamp?: string;
    signatureSecret?: string;
    rawBody?: string;
    signatureHeader?: string;
    timestampHeader?: string;
  }
) => {
  const signatureHeaders =
    headers?.signatureSecret && headers.rawBody
      ? createWorkflowWebhookSignatureHeaders({
          secret: headers.signatureSecret,
          rawBody: headers.rawBody,
          timestamp: headers.webhookTimestamp,
          signatureHeader: headers.signatureHeader,
          timestampHeader: headers.timestampHeader,
        })
      : undefined;

  return axios.post<IWorkflowRunVo>(
    urlBuilder(TRIGGER_WEBHOOK_WORKFLOW, { baseId, workflowId }),
    body,
    {
      headers: {
        ...(headers?.webhookSecret && { 'x-webhook-secret': headers.webhookSecret }),
        ...(signatureHeaders ?? {
          ...(headers?.webhookSignature && { 'x-webhook-signature': headers.webhookSignature }),
          ...(headers?.webhookTimestamp && { 'x-webhook-timestamp': headers.webhookTimestamp }),
        }),
      },
    }
  );
};
