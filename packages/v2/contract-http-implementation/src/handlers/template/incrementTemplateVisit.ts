import type { IIncrementTemplateVisitEndpointResult } from '@teable/v2-contract-http';
import {
  incrementTemplateVisitInputSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeIncrementTemplateVisitEndpoint = async (
  rawInput: unknown,
  incrementTemplateVisit: (templateId: string) => Promise<void>
): Promise<IIncrementTemplateVisitEndpointResult> => {
  const parsed = incrementTemplateVisitInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid IncrementTemplateVisit input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    await incrementTemplateVisit(parsed.data.templateId);
    return { status: 200, body: { ok: true, data: { success: true } } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to increment template visit',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
