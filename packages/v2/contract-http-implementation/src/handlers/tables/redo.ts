import type { IRedoVo } from '@teable/openapi';
import type { IRedoEndpointResult } from '@teable/v2-contract-http';
import { mapDomainErrorToHttpError, redoInputSchema } from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeRedoEndpoint = async (
  rawInput: unknown,
  redo: (tableId: string, windowId: string) => Promise<IRedoVo>
): Promise<IRedoEndpointResult> => {
  const parsed = redoInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid Redo input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const result = await redo(parsed.data.tableId, parsed.data.windowId);
    return { status: 200, body: { ok: true, data: { redo: result } } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to redo',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
