import type { IGroupPointsRo, IGroupPointsVo } from '@teable/openapi';
import type { IGetGroupPointsEndpointResult } from '@teable/v2-contract-http';
import { getGroupPointsInputSchema, mapDomainErrorToHttpError } from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetGroupPointsEndpoint = async (
  rawInput: unknown,
  getGroupPoints: (tableId: string, query?: IGroupPointsRo) => Promise<IGroupPointsVo>
): Promise<IGetGroupPointsEndpointResult> => {
  const parsed = getGroupPointsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetGroupPoints input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const groupPoints = await getGroupPoints(parsed.data.tableId, parsed.data.query);
    return { status: 200, body: { ok: true, data: { groupPoints } } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get group points',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
