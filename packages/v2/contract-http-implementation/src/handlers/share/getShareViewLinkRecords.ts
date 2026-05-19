import type { IShareViewLinkRecordsRo, IShareViewLinkRecordsVo } from '@teable/openapi';
import type { IGetShareViewLinkRecordsEndpointResult } from '@teable/v2-contract-http';
import {
  getShareViewLinkRecordsInputSchema,
  getShareViewLinkRecordsResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetShareViewLinkRecordsEndpoint = async (
  rawInput: unknown,
  getShareViewLinkRecords: (
    shareId: string,
    query: IShareViewLinkRecordsRo
  ) => Promise<IShareViewLinkRecordsVo>
): Promise<IGetShareViewLinkRecordsEndpointResult> => {
  const parsed = getShareViewLinkRecordsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetShareViewLinkRecords input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const linkRecords = await getShareViewLinkRecords(parsed.data.shareId, parsed.data.query);
    const validated = getShareViewLinkRecordsResponseDataSchema.safeParse({ linkRecords });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetShareViewLinkRecords output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get share view link records',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
