import type { IDuplicateWorkflowRo, IWorkflowVo } from '@teable/openapi';
import type { IDuplicateWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  duplicateWorkflowInputSchema,
  duplicateWorkflowResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeDuplicateWorkflowEndpoint = async (
  rawInput: unknown,
  duplicateWorkflow: (
    baseId: string,
    workflowId: string,
    ro: IDuplicateWorkflowRo
  ) => Promise<IWorkflowVo>
): Promise<IDuplicateWorkflowEndpointResult> => {
  const parsed = duplicateWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid DuplicateWorkflow input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const { baseId, workflowId, ...ro } = parsed.data;

  try {
    const workflow = await duplicateWorkflow(baseId, workflowId, ro);
    const validated = duplicateWorkflowResponseDataSchema.safeParse({ workflow });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid DuplicateWorkflow output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return {
      status: 201,
      body: {
        ok: true,
        data: validated.data,
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to duplicate workflow',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
