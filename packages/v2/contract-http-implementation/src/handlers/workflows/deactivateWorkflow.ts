import type { IWorkflowVo } from '@teable/openapi';
import type { IDeactivateWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  deactivateWorkflowInputSchema,
  deactivateWorkflowResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeDeactivateWorkflowEndpoint = async (
  rawInput: unknown,
  deactivateWorkflow: (baseId: string, workflowId: string) => Promise<IWorkflowVo>
): Promise<IDeactivateWorkflowEndpointResult> => {
  const parsed = deactivateWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid DeactivateWorkflow input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const workflow = await deactivateWorkflow(parsed.data.baseId, parsed.data.workflowId);
    const validated = deactivateWorkflowResponseDataSchema.safeParse({ workflow });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid DeactivateWorkflow output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to deactivate workflow',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
