import type { IWorkflowRunDetailVo } from '@teable/openapi';
import type { IListWorkflowRunsEndpointResult } from '@teable/v2-contract-http';
import {
  listWorkflowRunsInputSchema,
  listWorkflowRunsResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeListWorkflowRunsEndpoint = async (
  rawInput: unknown,
  listWorkflowRuns: (baseId: string, workflowId: string) => Promise<IWorkflowRunDetailVo[]>
): Promise<IListWorkflowRunsEndpointResult> => {
  const parsed = listWorkflowRunsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid ListWorkflowRuns input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const runs = await listWorkflowRuns(parsed.data.baseId, parsed.data.workflowId);
    const validated = listWorkflowRunsResponseDataSchema.safeParse({ runs });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid ListWorkflowRuns output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to list workflow runs',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
