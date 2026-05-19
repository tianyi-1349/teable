import type { IWorkflowRunVo } from '@teable/openapi';
import type { ITriggerScheduleWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  mapDomainErrorToHttpError,
  triggerScheduleWorkflowInputSchema,
  triggerScheduleWorkflowResponseDataSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeTriggerScheduleWorkflowEndpoint = async (
  rawInput: unknown,
  triggerScheduleWorkflow: (
    baseId: string,
    workflowId: string,
    body: unknown
  ) => Promise<IWorkflowRunVo>
): Promise<ITriggerScheduleWorkflowEndpointResult> => {
  const parsed = triggerScheduleWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid TriggerScheduleWorkflow input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const run = await triggerScheduleWorkflow(
      parsed.data.baseId,
      parsed.data.workflowId,
      parsed.data.body
    );
    const validated = triggerScheduleWorkflowResponseDataSchema.safeParse({ run });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid TriggerScheduleWorkflow output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 201, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to trigger schedule workflow',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
