import type { ISearchIndexByQueryRo, ISearchIndexVo } from '@teable/openapi';
import type { IGetShareViewSearchIndexEndpointResult } from '@teable/v2-contract-http';
import {
  getShareViewSearchIndexInputSchema,
  getShareViewSearchIndexResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetShareViewSearchIndexEndpoint = async (
  rawInput: unknown,
  getShareViewSearchIndex: (
    shareId: string,
    query?: ISearchIndexByQueryRo
  ) => Promise<ISearchIndexVo>
): Promise<IGetShareViewSearchIndexEndpointResult> => {
  const parsed = getShareViewSearchIndexInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetShareViewSearchIndex input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const searchIndex = await getShareViewSearchIndex(parsed.data.shareId, parsed.data.query);
    const validated = getShareViewSearchIndexResponseDataSchema.safeParse({ searchIndex });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetShareViewSearchIndex output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get share view search index',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
