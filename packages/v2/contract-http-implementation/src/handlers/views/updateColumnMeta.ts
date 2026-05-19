import type { IUpdateViewColumnMetaEndpointResult } from '@teable/v2-contract-http';
import {
  mapDomainErrorToHttpError,
  mapDomainErrorToHttpStatus,
  updateViewColumnMetaInputSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeUpdateViewColumnMetaEndpoint = async (
  rawInput: unknown,
  updateViewColumnMeta: (tableId: string, viewId: string, columnMetaRo: unknown) => Promise<void>
): Promise<IUpdateViewColumnMetaEndpointResult> => {
  const parsed = updateViewColumnMetaInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid UpdateViewColumnMeta input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const { tableId, viewId, columnMeta } = parsed.data;

  try {
    await updateViewColumnMeta(tableId, viewId, columnMeta);
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error &&
      'tags' in error
    ) {
      const domainLikeError = error as {
        code: string;
        message: string;
        tags: ReadonlyArray<
          | 'validation'
          | 'conflict'
          | 'not-found'
          | 'invariant'
          | 'not-implemented'
          | 'unauthorized'
          | 'forbidden'
          | 'infrastructure'
          | 'unexpected'
        >;
        details?: Readonly<Record<string, unknown>>;
      };
      return {
        status: mapDomainErrorToHttpStatus(domainLikeError),
        body: { ok: false, error: mapDomainErrorToHttpError(domainLikeError) },
      };
    }

    const unexpectedError = domainError.unexpected({
      message: error instanceof Error ? error.message : 'Failed to update view column meta',
    });
    return {
      status: mapDomainErrorToHttpStatus(unexpectedError),
      body: { ok: false, error: mapDomainErrorToHttpError(unexpectedError) },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      data: {
        success: true,
      },
    },
  };
};
