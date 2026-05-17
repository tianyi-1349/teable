import type { ICommentVo } from '@teable/openapi';
import type { IGetCommentByIdEndpointResult } from '@teable/v2-contract-http';
import {
  getCommentByIdInputSchema,
  getCommentByIdResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetCommentByIdEndpoint = async (
  rawInput: unknown,
  getCommentById: (commentId: string) => Promise<ICommentVo | null>
): Promise<IGetCommentByIdEndpointResult> => {
  const parsed = getCommentByIdInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetCommentById input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const comment = (await getCommentById(parsed.data.commentId)) ?? null;
    const validated = getCommentByIdResponseDataSchema.safeParse({ comment });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetCommentById output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to get comment by id',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
