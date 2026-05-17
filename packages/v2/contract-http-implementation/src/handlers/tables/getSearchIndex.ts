import type { ISearchIndexByQueryRo, ISearchIndexVo } from '@teable/openapi';
import type { IGetSearchIndexEndpointResult } from '@teable/v2-contract-http';
import { getSearchIndexInputSchema, mapDomainErrorToHttpError } from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetSearchIndexEndpoint = async (
  rawInput: unknown,
  getSearchIndex: (tableId: string, query: ISearchIndexByQueryRo) => Promise<ISearchIndexVo>
): Promise<IGetSearchIndexEndpointResult> => {
  const parsed = getSearchIndexInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetSearchIndex input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const searchIndex = await getSearchIndex(parsed.data.tableId, parsed.data.query);
    return { status: 200, body: { ok: true, data: { searchIndex } } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get search index',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
