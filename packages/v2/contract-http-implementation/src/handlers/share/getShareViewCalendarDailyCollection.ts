import type {
  ICalendarDailyCollectionVo,
  IShareViewCalendarDailyCollectionRo,
} from '@teable/openapi';
import type { IGetShareViewCalendarDailyCollectionEndpointResult } from '@teable/v2-contract-http';
import {
  getShareViewCalendarDailyCollectionInputSchema,
  getShareViewCalendarDailyCollectionResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetShareViewCalendarDailyCollectionEndpoint = async (
  rawInput: unknown,
  getShareViewCalendarDailyCollection: (
    shareId: string,
    query: IShareViewCalendarDailyCollectionRo
  ) => Promise<ICalendarDailyCollectionVo>
): Promise<IGetShareViewCalendarDailyCollectionEndpointResult> => {
  const parsed = getShareViewCalendarDailyCollectionInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({
      message: 'Invalid GetShareViewCalendarDailyCollection input',
    });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const calendarDailyCollection = await getShareViewCalendarDailyCollection(
      parsed.data.shareId,
      parsed.data.query
    );
    const validated = getShareViewCalendarDailyCollectionResponseDataSchema.safeParse({
      calendarDailyCollection,
    });
    if (!validated.success) {
      const error = domainError.validation({
        message: 'Invalid GetShareViewCalendarDailyCollection output',
      });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message:
        cause instanceof Error
          ? cause.message
          : 'Failed to get share view calendar daily collection',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
