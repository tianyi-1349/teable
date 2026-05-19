import type { IQueryBaseRo, IRowCountVo } from '@teable/openapi';
import type { IGetRowCountEndpointResult } from '@teable/v2-contract-http';
import { getRowCountInputSchema, mapDomainErrorToHttpError } from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetRowCountEndpoint = async (
  rawInput: unknown,
  getRowCount: (tableId: string, query?: IQueryBaseRo) => Promise<IRowCountVo>
): Promise<IGetRowCountEndpointResult> => {
  const parsed = getRowCountInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetRowCount input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const rowCount = await getRowCount(parsed.data.tableId, parsed.data.query);
    return { status: 200, body: { ok: true, data: { rowCount: rowCount.rowCount } } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get row count',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
