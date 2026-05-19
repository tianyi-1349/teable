import type { IDeleteWorkflowEndpointResult } from '@teable/v2-contract-http';
import { deleteWorkflowInputSchema, mapDomainErrorToHttpError } from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeDeleteWorkflowEndpoint = async (
  rawInput: unknown,
  deleteWorkflow: (baseId: string, workflowId: string) => Promise<void>
): Promise<IDeleteWorkflowEndpointResult> => {
  const parsed = deleteWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid DeleteWorkflow input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    await deleteWorkflow(parsed.data.baseId, parsed.data.workflowId);
    return {
      status: 200,
      body: {
        ok: true,
        data: { success: true },
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to delete workflow',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
