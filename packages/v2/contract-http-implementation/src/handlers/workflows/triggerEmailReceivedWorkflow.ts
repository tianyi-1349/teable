import type { IWorkflowRunVo } from '@teable/openapi';
import type { ITriggerEmailReceivedWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  mapDomainErrorToHttpError,
  triggerEmailReceivedWorkflowInputSchema,
  triggerEmailReceivedWorkflowResponseDataSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeTriggerEmailReceivedWorkflowEndpoint = async (
  rawInput: unknown,
  triggerEmailReceivedWorkflow: (
    baseId: string,
    workflowId: string,
    body: unknown
  ) => Promise<IWorkflowRunVo>
): Promise<ITriggerEmailReceivedWorkflowEndpointResult> => {
  const parsed = triggerEmailReceivedWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid TriggerEmailReceivedWorkflow input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const run = await triggerEmailReceivedWorkflow(
      parsed.data.baseId,
      parsed.data.workflowId,
      parsed.data.body
    );
    const validated = triggerEmailReceivedWorkflowResponseDataSchema.safeParse({ run });
    if (!validated.success) {
      const error = domainError.validation({
        message: 'Invalid TriggerEmailReceivedWorkflow output',
      });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 201, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to trigger email received workflow',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
