import type { IWorkflowRunVo } from '@teable/openapi';
import type { ITriggerWebhookWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  mapDomainErrorToHttpError,
  triggerWebhookWorkflowInputSchema,
  triggerWebhookWorkflowResponseDataSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

type HttpLikeError = Error & { code?: string; getStatus?: () => number };

export const executeTriggerWebhookWorkflowEndpoint = async (
  rawInput: unknown,
  triggerWebhookWorkflow: (
    baseId: string,
    workflowId: string,
    body: unknown,
    webhookSecret?: string,
    webhookSignature?: string,
    webhookTimestamp?: string
  ) => Promise<IWorkflowRunVo>
): Promise<ITriggerWebhookWorkflowEndpointResult> => {
  const parsed = triggerWebhookWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid TriggerWebhookWorkflow input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const run = await triggerWebhookWorkflow(
      parsed.data.baseId,
      parsed.data.workflowId,
      parsed.data.body,
      parsed.data.webhookSecret,
      parsed.data.webhookSignature,
      parsed.data.webhookTimestamp
    );
    const validated = triggerWebhookWorkflowResponseDataSchema.safeParse({ run });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid TriggerWebhookWorkflow output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 201, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const httpLikeError = cause as HttpLikeError;
    if (typeof httpLikeError?.getStatus === 'function') {
      const status = httpLikeError.getStatus();
      if ([401, 404, 413, 429].includes(status)) {
        return {
          status: status as 401 | 404 | 413 | 429,
          body: {
            ok: false,
            error: {
              code: httpLikeError.code ?? 'internal_server_error',
              message: httpLikeError.message,
              tags: [],
            },
          },
        };
      }
    }
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to trigger webhook workflow',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
