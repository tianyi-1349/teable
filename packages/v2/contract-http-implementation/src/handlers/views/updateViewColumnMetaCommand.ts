import type { IUpdateViewColumnMetaEndpointResult } from '@teable/v2-contract-http';
import { mapDomainErrorToHttpError, mapDomainErrorToHttpStatus } from '@teable/v2-contract-http';
import { UpdateViewColumnMetaCommand } from '@teable/v2-core';
import type { ICommandBus, IExecutionContext, UpdateViewColumnMetaResult } from '@teable/v2-core';

export const executeUpdateViewColumnMetaCommandEndpoint = async (
  context: IExecutionContext,
  rawInput: unknown,
  commandBus: ICommandBus
): Promise<IUpdateViewColumnMetaEndpointResult> => {
  const commandResult = UpdateViewColumnMetaCommand.create(rawInput);
  if (commandResult.isErr()) {
    const error = commandResult.error;
    return {
      status: mapDomainErrorToHttpStatus(error),
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const result = await commandBus.execute<UpdateViewColumnMetaCommand, UpdateViewColumnMetaResult>(
    context,
    commandResult.value
  );
  if (result.isErr()) {
    const error = result.error;
    return {
      status: mapDomainErrorToHttpStatus(error),
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
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
