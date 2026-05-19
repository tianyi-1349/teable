import type { ICalendarDailyCollectionRo, ICalendarDailyCollectionVo } from '@teable/openapi';
import type { IGetCalendarDailyCollectionEndpointResult } from '@teable/v2-contract-http';
import {
  getCalendarDailyCollectionInputSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetCalendarDailyCollectionEndpoint = async (
  rawInput: unknown,
  getCalendarDailyCollection: (
    tableId: string,
    query: ICalendarDailyCollectionRo
  ) => Promise<ICalendarDailyCollectionVo>
): Promise<IGetCalendarDailyCollectionEndpointResult> => {
  const parsed = getCalendarDailyCollectionInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({
      message: 'Invalid GetCalendarDailyCollection input',
    });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const calendarDailyCollection = await getCalendarDailyCollection(
      parsed.data.tableId,
      parsed.data.query
    );
    return { status: 200, body: { ok: true, data: { calendarDailyCollection } } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get calendar daily collection',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
