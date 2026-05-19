import type { IRecordsVo, IShareViewRecordsRo } from '@teable/openapi';
import type { IGetShareViewRecordsEndpointResult } from '@teable/v2-contract-http';
import {
  getShareViewRecordsInputSchema,
  getShareViewRecordsResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetShareViewRecordsEndpoint = async (
  rawInput: unknown,
  getShareViewRecords: (shareId: string, query?: IShareViewRecordsRo) => Promise<IRecordsVo>
): Promise<IGetShareViewRecordsEndpointResult> => {
  const parsed = getShareViewRecordsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetShareViewRecords input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const records = await getShareViewRecords(parsed.data.shareId, parsed.data.query);
    const validated = getShareViewRecordsResponseDataSchema.safeParse({ records });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetShareViewRecords output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return {
      status: 200,
      body: {
        ok: true,
        data: validated.data,
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get share view records',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
