import type { IWorkflowVo } from '@teable/openapi';
import type { IListWorkflowsEndpointResult } from '@teable/v2-contract-http';
import {
  listWorkflowsInputSchema,
  listWorkflowsResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeListWorkflowsEndpoint = async (
  rawInput: unknown,
  listWorkflows: (baseId: string) => Promise<IWorkflowVo[]>
): Promise<IListWorkflowsEndpointResult> => {
  const parsed = listWorkflowsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid ListWorkflows input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const workflows = await listWorkflows(parsed.data.baseId);
    const validated = listWorkflowsResponseDataSchema.safeParse({ workflows });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid ListWorkflows output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to list workflows',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
