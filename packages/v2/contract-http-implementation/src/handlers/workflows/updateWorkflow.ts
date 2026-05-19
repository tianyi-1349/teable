import type { IUpdateWorkflowRo, IWorkflowVo } from '@teable/openapi';
import type { IUpdateWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  mapDomainErrorToHttpError,
  updateWorkflowInputSchema,
  updateWorkflowResponseDataSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeUpdateWorkflowEndpoint = async (
  rawInput: unknown,
  updateWorkflow: (
    baseId: string,
    workflowId: string,
    ro: IUpdateWorkflowRo
  ) => Promise<IWorkflowVo>
): Promise<IUpdateWorkflowEndpointResult> => {
  const parsed = updateWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid UpdateWorkflow input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const { baseId, workflowId, ...ro } = parsed.data;

  try {
    const workflow = await updateWorkflow(baseId, workflowId, ro);
    const validated = updateWorkflowResponseDataSchema.safeParse({ workflow });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid UpdateWorkflow output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to update workflow',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
