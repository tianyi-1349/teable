import type { IRowCountVo, IShareViewRowCountRo } from '@teable/openapi';
import type { IGetShareViewRowCountEndpointResult } from '@teable/v2-contract-http';
import {
  getShareViewRowCountInputSchema,
  getShareViewRowCountResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetShareViewRowCountEndpoint = async (
  rawInput: unknown,
  getShareViewRowCount: (shareId: string, query?: IShareViewRowCountRo) => Promise<IRowCountVo>
): Promise<IGetShareViewRowCountEndpointResult> => {
  const parsed = getShareViewRowCountInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetShareViewRowCount input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const rowCount = await getShareViewRowCount(parsed.data.shareId, parsed.data.query);
    const validated = getShareViewRowCountResponseDataSchema.safeParse({ rowCount });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetShareViewRowCount output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to get share view row count',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
