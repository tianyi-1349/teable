import type {
  IGetCommentRecordCountEndpointResult,
  IGetCommentTableCountEndpointResult,
} from '@teable/v2-contract-http';
import type { IGetRecordsRo } from '@teable/openapi';
import {
  getCommentRecordCountInputSchema,
  getCommentTableCountInputSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetCommentRecordCountEndpoint = async (
  rawInput: unknown,
  getCommentRecordCount: (tableId: string, recordId: string) => Promise<{ count: number }>
): Promise<IGetCommentRecordCountEndpointResult> => {
  const parsed = getCommentRecordCountInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetCommentRecordCount input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const result = await getCommentRecordCount(parsed.data.tableId, parsed.data.recordId);
    return {
      status: 200,
      body: {
        ok: true,
        data: { count: result.count },
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get comment record count',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};

export const executeGetCommentTableCountEndpoint = async (
  rawInput: unknown,
  getCommentTableCount: (
    tableId: string,
    query: IGetRecordsRo
  ) => Promise<Array<{ recordId: string; count: number }>>
): Promise<IGetCommentTableCountEndpointResult> => {
  const parsed = getCommentTableCountInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetCommentTableCount input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const counts = await getCommentTableCount(parsed.data.tableId, parsed.data.query);
    return {
      status: 200,
      body: {
        ok: true,
        data: { counts },
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get comment table count',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
