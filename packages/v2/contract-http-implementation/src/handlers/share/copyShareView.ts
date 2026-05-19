import type { IRangesRo } from '@teable/openapi';
import type {
  ICopyShareViewEndpointResult,
  ICopyShareViewResponseDataDto,
} from '@teable/v2-contract-http';
import {
  copyShareViewInputSchema,
  copyShareViewResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeCopyShareViewEndpoint = async (
  rawInput: unknown,
  copyShareView: (
    shareId: string,
    ro: Partial<IRangesRo>
  ) => Promise<ICopyShareViewResponseDataDto['copy']>
): Promise<ICopyShareViewEndpointResult> => {
  const parsed = copyShareViewInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid CopyShareView input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const { shareId, ...ro } = parsed.data;

  try {
    const copy = await copyShareView(shareId, ro);
    const validated = copyShareViewResponseDataSchema.safeParse({ copy });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid CopyShareView output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return {
      status: 200,
      body: {
        ok: true,
        data: validated.data as ICopyShareViewResponseDataDto,
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to copy share view',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
