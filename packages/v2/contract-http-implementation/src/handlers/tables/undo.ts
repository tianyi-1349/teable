import type { IUndoVo } from '@teable/openapi';
import type { IUndoEndpointResult } from '@teable/v2-contract-http';
import { mapDomainErrorToHttpError, undoInputSchema } from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeUndoEndpoint = async (
  rawInput: unknown,
  undo: (tableId: string, windowId: string) => Promise<IUndoVo>
): Promise<IUndoEndpointResult> => {
  const parsed = undoInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid Undo input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const result = await undo(parsed.data.tableId, parsed.data.windowId);
    return { status: 200, body: { ok: true, data: { undo: result } } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to undo',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
