import type { IWorkflowRo, IWorkflowVo } from '@teable/openapi';
import type { ICreateWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  createWorkflowInputSchema,
  createWorkflowResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeCreateWorkflowEndpoint = async (
  rawInput: unknown,
  createWorkflow: (baseId: string, ro: IWorkflowRo) => Promise<IWorkflowVo>
): Promise<ICreateWorkflowEndpointResult> => {
  const parsed = createWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid CreateWorkflow input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const { baseId, ...ro } = parsed.data;

  try {
    const workflow = await createWorkflow(baseId, ro);
    const validated = createWorkflowResponseDataSchema.safeParse({ workflow });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid CreateWorkflow output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to create workflow',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
