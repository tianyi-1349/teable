import type { IWorkflowVo } from '@teable/openapi';
import type { IApplyUpdateWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  applyUpdateWorkflowInputSchema,
  applyUpdateWorkflowResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeApplyUpdateWorkflowEndpoint = async (
  rawInput: unknown,
  applyUpdateWorkflow: (baseId: string, workflowId: string) => Promise<IWorkflowVo>
): Promise<IApplyUpdateWorkflowEndpointResult> => {
  const parsed = applyUpdateWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid ApplyUpdateWorkflow input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const workflow = await applyUpdateWorkflow(parsed.data.baseId, parsed.data.workflowId);
    const validated = applyUpdateWorkflowResponseDataSchema.safeParse({ workflow });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid ApplyUpdateWorkflow output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to apply workflow draft update',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
