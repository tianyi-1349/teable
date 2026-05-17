import type { ICommentVo, IGetCommentListQueryRo } from '@teable/openapi';
import type { IListCommentsEndpointResult } from '@teable/v2-contract-http';
import {
  listCommentsInputSchema,
  listCommentsResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeListCommentsEndpoint = async (
  rawInput: unknown,
  listComments: (
    tableId: string,
    recordId: string,
    query: IGetCommentListQueryRo
  ) => Promise<{ comments: ICommentVo[]; nextCursor?: string | null }>
): Promise<IListCommentsEndpointResult> => {
  const parsed = listCommentsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid ListComments input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const result = await listComments(parsed.data.tableId, parsed.data.recordId, {
      take: parsed.data.take,
      cursor: parsed.data.cursor,
      includeCursor: parsed.data.includeCursor,
      direction: parsed.data.direction,
    });
    const validated = listCommentsResponseDataSchema.safeParse({
      comments: result.comments,
      nextCursor: result.nextCursor ?? null,
    });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid ListComments output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to list comments',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
