import type {
  IGetShareViewEndpointResult,
  IGetShareViewResponseDataDto,
} from '@teable/v2-contract-http';
import {
  getShareViewInputSchema,
  getShareViewResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetShareViewEndpoint = async (
  rawInput: unknown,
  getShareView: (shareId: string) => Promise<IGetShareViewResponseDataDto['shareView']>
): Promise<IGetShareViewEndpointResult> => {
  const parsed = getShareViewInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetShareView input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const shareView = await getShareView(parsed.data.shareId);
    const validated = getShareViewResponseDataSchema.safeParse({ shareView });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetShareView output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return {
      status: 200,
      body: {
        ok: true,
        data: validated.data as IGetShareViewResponseDataDto,
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get share view',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
