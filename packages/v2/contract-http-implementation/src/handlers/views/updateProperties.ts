import {
  mapDomainErrorToHttpError,
  mapDomainErrorToHttpStatus,
  type IUpdateViewFilterEndpointResult,
  type IUpdateViewGroupEndpointResult,
  type IUpdateViewSortEndpointResult,
  updateViewFilterInputSchema,
  updateViewGroupInputSchema,
  updateViewSortInputSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

type UpdateViewPropertyExecutor<T> = (tableId: string, viewId: string, payload: T) => Promise<void>;

const okBody = {
  ok: true as const,
  data: {
    success: true as const,
  },
};

export const executeUpdateViewFilterEndpoint = async (
  rawInput: unknown,
  updateViewFilter: UpdateViewPropertyExecutor<unknown>
): Promise<IUpdateViewFilterEndpointResult> => {
  const parsed = updateViewFilterInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid UpdateViewFilter input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  const { tableId, viewId, filter } = parsed.data;
  try {
    await updateViewFilter(tableId, viewId, filter);
  } catch (error) {
    const unexpectedError = domainError.unexpected({
      message: error instanceof Error ? error.message : 'Failed to update view filter',
    });
    return {
      status: mapDomainErrorToHttpStatus(unexpectedError),
      body: { ok: false, error: mapDomainErrorToHttpError(unexpectedError) },
    };
  }

  return { status: 200, body: okBody };
};

export const executeUpdateViewSortEndpoint = async (
  rawInput: unknown,
  updateViewSort: UpdateViewPropertyExecutor<unknown>
): Promise<IUpdateViewSortEndpointResult> => {
  const parsed = updateViewSortInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid UpdateViewSort input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  const { tableId, viewId, sort } = parsed.data;
  try {
    await updateViewSort(tableId, viewId, sort);
  } catch (error) {
    const unexpectedError = domainError.unexpected({
      message: error instanceof Error ? error.message : 'Failed to update view sort',
    });
    return {
      status: mapDomainErrorToHttpStatus(unexpectedError),
      body: { ok: false, error: mapDomainErrorToHttpError(unexpectedError) },
    };
  }

  return { status: 200, body: okBody };
};

export const executeUpdateViewGroupEndpoint = async (
  rawInput: unknown,
  updateViewGroup: UpdateViewPropertyExecutor<unknown>
): Promise<IUpdateViewGroupEndpointResult> => {
  const parsed = updateViewGroupInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid UpdateViewGroup input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  const { tableId, viewId, group } = parsed.data;
  try {
    await updateViewGroup(tableId, viewId, group);
  } catch (error) {
    const unexpectedError = domainError.unexpected({
      message: error instanceof Error ? error.message : 'Failed to update view group',
    });
    return {
      status: mapDomainErrorToHttpStatus(unexpectedError),
      body: { ok: false, error: mapDomainErrorToHttpError(unexpectedError) },
    };
  }

  return { status: 200, body: okBody };
};
