import type { IWorkflowVo } from '@teable/openapi';
import type { IActivateWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  activateWorkflowInputSchema,
  activateWorkflowResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeActivateWorkflowEndpoint = async (
  rawInput: unknown,
  activateWorkflow: (baseId: string, workflowId: string) => Promise<IWorkflowVo>
): Promise<IActivateWorkflowEndpointResult> => {
  const parsed = activateWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid ActivateWorkflow input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const workflow = await activateWorkflow(parsed.data.baseId, parsed.data.workflowId);
    const validated = activateWorkflowResponseDataSchema.safeParse({ workflow });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid ActivateWorkflow output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return {
      status: 200,
      body: {
        ok: true,
        data: validated.data,
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to activate workflow',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
