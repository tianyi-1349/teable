import type { IRecord } from '@teable/core';
import type { ShareViewFormSubmitRo } from '@teable/openapi';
import type { IFormSubmitShareViewEndpointResult } from '@teable/v2-contract-http';
import {
  formSubmitShareViewInputSchema,
  formSubmitShareViewResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeFormSubmitShareViewEndpoint = async (
  rawInput: unknown,
  formSubmitShareView: (shareId: string, ro: ShareViewFormSubmitRo) => Promise<IRecord>
): Promise<IFormSubmitShareViewEndpointResult> => {
  const parsed = formSubmitShareViewInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid FormSubmitShareView input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const { shareId, fields, typecast } = parsed.data;

  try {
    const record = await formSubmitShareView(shareId, { fields, typecast });
    const validated = formSubmitShareViewResponseDataSchema.safeParse({ record });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid FormSubmitShareView output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to submit share form',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
