import type { IRecordIndexRo, IRecordIndexVo } from '@teable/openapi';
import type { IGetRecordIndexEndpointResult } from '@teable/v2-contract-http';
import { getRecordIndexInputSchema, mapDomainErrorToHttpError } from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetRecordIndexEndpoint = async (
  rawInput: unknown,
  getRecordIndex: (tableId: string, query: IRecordIndexRo) => Promise<IRecordIndexVo>
): Promise<IGetRecordIndexEndpointResult> => {
  const parsed = getRecordIndexInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetRecordIndex input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const recordIndex = await getRecordIndex(parsed.data.tableId, parsed.data.query);
    return { status: 200, body: { ok: true, data: { recordIndex } } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get record index',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
