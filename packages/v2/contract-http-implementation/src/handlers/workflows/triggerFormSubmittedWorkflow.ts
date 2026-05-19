import type { IWorkflowRunVo } from '@teable/openapi';
import type { ITriggerFormSubmittedWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  mapDomainErrorToHttpError,
  triggerFormSubmittedWorkflowInputSchema,
  triggerFormSubmittedWorkflowResponseDataSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeTriggerFormSubmittedWorkflowEndpoint = async (
  rawInput: unknown,
  triggerFormSubmittedWorkflow: (
    baseId: string,
    workflowId: string,
    body: unknown
  ) => Promise<IWorkflowRunVo>
): Promise<ITriggerFormSubmittedWorkflowEndpointResult> => {
  const parsed = triggerFormSubmittedWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid TriggerFormSubmittedWorkflow input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const run = await triggerFormSubmittedWorkflow(
      parsed.data.baseId,
      parsed.data.workflowId,
      parsed.data.body
    );
    const validated = triggerFormSubmittedWorkflowResponseDataSchema.safeParse({ run });
    if (!validated.success) {
      const error = domainError.validation({
        message: 'Invalid TriggerFormSubmittedWorkflow output',
      });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 201, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to trigger form submitted workflow',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
