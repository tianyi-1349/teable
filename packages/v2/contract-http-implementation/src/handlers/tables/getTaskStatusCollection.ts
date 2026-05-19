import type { ITaskStatusCollectionVo } from '@teable/openapi';
import type { IGetTaskStatusCollectionEndpointResult } from '@teable/v2-contract-http';
import {
  getTaskStatusCollectionInputSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetTaskStatusCollectionEndpoint = async (
  rawInput: unknown,
  getTaskStatusCollection: (tableId: string) => Promise<ITaskStatusCollectionVo>
): Promise<IGetTaskStatusCollectionEndpointResult> => {
  const parsed = getTaskStatusCollectionInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({
      message: 'Invalid GetTaskStatusCollection input',
    });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const taskStatusCollection = await getTaskStatusCollection(parsed.data.tableId);
    return { status: 200, body: { ok: true, data: { taskStatusCollection } } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get task status collection',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
