import type {
  ICommentSubscribeMutationEndpointResult,
  IGetCommentSubscribeEndpointResult,
} from '@teable/v2-contract-http';
import { commentSubscribeInputSchema, mapDomainErrorToHttpError } from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetCommentSubscribeEndpoint = async (
  rawInput: unknown,
  getSubscribeDetail: (
    tableId: string,
    recordId: string
  ) => Promise<{ tableId: string; recordId: string; createdBy: string } | null>
): Promise<IGetCommentSubscribeEndpointResult> => {
  const parsed = commentSubscribeInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetCommentSubscribe input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const subscription = await getSubscribeDetail(parsed.data.tableId, parsed.data.recordId);
    return {
      status: 200,
      body: {
        ok: true,
        data: { subscription },
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get comment subscription',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};

const okMutationBody = {
  ok: true as const,
  data: { success: true as const },
};

export const executeCommentSubscribeEndpoint = async (
  rawInput: unknown,
  subscribeComment: (tableId: string, recordId: string) => Promise<void>
): Promise<ICommentSubscribeMutationEndpointResult> => {
  const parsed = commentSubscribeInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid CommentSubscribe input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    await subscribeComment(parsed.data.tableId, parsed.data.recordId);
    return { status: 200, body: okMutationBody };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to subscribe comment',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};

export const executeCommentUnsubscribeEndpoint = async (
  rawInput: unknown,
  unsubscribeComment: (tableId: string, recordId: string) => Promise<void>
): Promise<ICommentSubscribeMutationEndpointResult> => {
  const parsed = commentSubscribeInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid CommentUnsubscribe input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    await unsubscribeComment(parsed.data.tableId, parsed.data.recordId);
    return { status: 200, body: okMutationBody };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to unsubscribe comment',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
