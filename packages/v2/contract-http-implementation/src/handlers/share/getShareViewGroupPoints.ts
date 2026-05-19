import type { IGroupPointsVo, IShareViewGroupPointsRo } from '@teable/openapi';
import type { IGetShareViewGroupPointsEndpointResult } from '@teable/v2-contract-http';
import {
  getShareViewGroupPointsInputSchema,
  getShareViewGroupPointsResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetShareViewGroupPointsEndpoint = async (
  rawInput: unknown,
  getShareViewGroupPoints: (
    shareId: string,
    query?: IShareViewGroupPointsRo
  ) => Promise<IGroupPointsVo>
): Promise<IGetShareViewGroupPointsEndpointResult> => {
  const parsed = getShareViewGroupPointsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetShareViewGroupPoints input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const groupPoints = await getShareViewGroupPoints(parsed.data.shareId, parsed.data.query);
    const validated = getShareViewGroupPointsResponseDataSchema.safeParse({ groupPoints });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetShareViewGroupPoints output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get share view group points',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
