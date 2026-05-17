import type { IAggregationVo, IShareViewAggregationsRo } from '@teable/openapi';
import type { IGetShareViewAggregationsEndpointResult } from '@teable/v2-contract-http';
import {
  getShareViewAggregationsInputSchema,
  getShareViewAggregationsResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetShareViewAggregationsEndpoint = async (
  rawInput: unknown,
  getShareViewAggregations: (
    shareId: string,
    query?: IShareViewAggregationsRo
  ) => Promise<IAggregationVo>
): Promise<IGetShareViewAggregationsEndpointResult> => {
  const parsed = getShareViewAggregationsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetShareViewAggregations input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const aggregations = await getShareViewAggregations(parsed.data.shareId, parsed.data.query);
    const validated = getShareViewAggregationsResponseDataSchema.safeParse({ aggregations });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetShareViewAggregations output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get share view aggregations',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
