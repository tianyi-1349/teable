import type { ISearchCountRo, ISearchCountVo } from '@teable/openapi';
import type { IGetShareViewSearchCountEndpointResult } from '@teable/v2-contract-http';
import {
  getShareViewSearchCountInputSchema,
  getShareViewSearchCountResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetShareViewSearchCountEndpoint = async (
  rawInput: unknown,
  getShareViewSearchCount: (shareId: string, query?: ISearchCountRo) => Promise<ISearchCountVo>
): Promise<IGetShareViewSearchCountEndpointResult> => {
  const parsed = getShareViewSearchCountInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetShareViewSearchCount input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const searchCount = await getShareViewSearchCount(parsed.data.shareId, parsed.data.query);
    const validated = getShareViewSearchCountResponseDataSchema.safeParse({ searchCount });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetShareViewSearchCount output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get share view search count',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
