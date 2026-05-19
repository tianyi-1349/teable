import type { IWorkflowRunDetailVo } from '@teable/openapi';
import type { IGetWorkflowRunEndpointResult } from '@teable/v2-contract-http';
import {
  getWorkflowRunInputSchema,
  getWorkflowRunResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetWorkflowRunEndpoint = async (
  rawInput: unknown,
  getWorkflowRun: (
    baseId: string,
    workflowId: string,
    runId: string
  ) => Promise<IWorkflowRunDetailVo>
): Promise<IGetWorkflowRunEndpointResult> => {
  const parsed = getWorkflowRunInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetWorkflowRun input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const run = await getWorkflowRun(parsed.data.baseId, parsed.data.workflowId, parsed.data.runId);
    const validated = getWorkflowRunResponseDataSchema.safeParse({ run });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetWorkflowRun output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to get workflow run',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
