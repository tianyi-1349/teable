import type { ISearchCountRo, ISearchCountVo } from '@teable/openapi';
import type { IGetSearchCountEndpointResult } from '@teable/v2-contract-http';
import { getSearchCountInputSchema, mapDomainErrorToHttpError } from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetSearchCountEndpoint = async (
  rawInput: unknown,
  getSearchCount: (tableId: string, query: ISearchCountRo) => Promise<ISearchCountVo>
): Promise<IGetSearchCountEndpointResult> => {
  const parsed = getSearchCountInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetSearchCount input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const searchCount = await getSearchCount(parsed.data.tableId, parsed.data.query);
    return { status: 200, body: { ok: true, data: { searchCount } } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get search count',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
