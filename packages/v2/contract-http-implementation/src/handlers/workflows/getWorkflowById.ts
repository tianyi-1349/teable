import type { IWorkflowDetailVo } from '@teable/openapi';
import type { IGetWorkflowByIdEndpointResult } from '@teable/v2-contract-http';
import {
  getWorkflowByIdInputSchema,
  getWorkflowByIdResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetWorkflowByIdEndpoint = async (
  rawInput: unknown,
  getWorkflowById: (baseId: string, workflowId: string) => Promise<IWorkflowDetailVo>
): Promise<IGetWorkflowByIdEndpointResult> => {
  const parsed = getWorkflowByIdInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetWorkflowById input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const workflow = await getWorkflowById(parsed.data.baseId, parsed.data.workflowId);
    const validated = getWorkflowByIdResponseDataSchema.safeParse({ workflow });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetWorkflowById output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to get workflow by id',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
