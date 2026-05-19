import type { IButtonClickVo } from '@teable/openapi';
import type { IButtonClickShareViewEndpointResult } from '@teable/v2-contract-http';
import {
  buttonClickShareViewInputSchema,
  buttonClickShareViewResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeButtonClickShareViewEndpoint = async (
  rawInput: unknown,
  buttonClickShareView: (
    shareId: string,
    recordId: string,
    fieldId: string
  ) => Promise<IButtonClickVo>
): Promise<IButtonClickShareViewEndpointResult> => {
  const parsed = buttonClickShareViewInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid ButtonClickShareView input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const result = await buttonClickShareView(
      parsed.data.shareId,
      parsed.data.recordId,
      parsed.data.fieldId
    );
    const validated = buttonClickShareViewResponseDataSchema.safeParse({ result });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid ButtonClickShareView output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to click share button',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
