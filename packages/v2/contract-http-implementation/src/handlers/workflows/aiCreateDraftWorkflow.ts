import type { IAiCreateWorkflowDraftRo, IWorkflowDetailVo } from '@teable/openapi';
import type { IAiCreateDraftWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  aiCreateDraftWorkflowInputSchema,
  aiCreateDraftWorkflowResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeAiCreateDraftWorkflowEndpoint = async (
  rawInput: unknown,
  aiCreateDraftWorkflow: (
    baseId: string,
    ro: IAiCreateWorkflowDraftRo
  ) => Promise<IWorkflowDetailVo>
): Promise<IAiCreateDraftWorkflowEndpointResult> => {
  const parsed = aiCreateDraftWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid AiCreateDraftWorkflow input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const { baseId, ...ro } = parsed.data;

  try {
    const workflow = await aiCreateDraftWorkflow(baseId, ro);
    const validated = aiCreateDraftWorkflowResponseDataSchema.safeParse({ workflow });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid AiCreateDraftWorkflow output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to create AI workflow draft',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
