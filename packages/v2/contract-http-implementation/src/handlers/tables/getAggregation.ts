import type { IAggregationRo, IAggregationVo } from '@teable/openapi';
import type { IGetAggregationEndpointResult } from '@teable/v2-contract-http';
import { getAggregationInputSchema, mapDomainErrorToHttpError } from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetAggregationEndpoint = async (
  rawInput: unknown,
  getAggregation: (tableId: string, query?: IAggregationRo) => Promise<IAggregationVo>
): Promise<IGetAggregationEndpointResult> => {
  const parsed = getAggregationInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetAggregation input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const aggregation = await getAggregation(parsed.data.tableId, parsed.data.query);
    return { status: 200, body: { ok: true, data: { aggregation } } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get aggregation',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
