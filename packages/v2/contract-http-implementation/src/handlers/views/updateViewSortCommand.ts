import type { IUpdateViewSortEndpointResult } from '@teable/v2-contract-http';
import { mapDomainErrorToHttpError, mapDomainErrorToHttpStatus } from '@teable/v2-contract-http';
import { UpdateViewSortCommand } from '@teable/v2-core';
import type { ICommandBus, IExecutionContext, UpdateViewSortResult } from '@teable/v2-core';

export const executeUpdateViewSortCommandEndpoint = async (
  context: IExecutionContext,
  rawInput: unknown,
  commandBus: ICommandBus
): Promise<IUpdateViewSortEndpointResult> => {
  const commandResult = UpdateViewSortCommand.create(rawInput);
  if (commandResult.isErr()) {
    const error = commandResult.error;
    return {
      status: mapDomainErrorToHttpStatus(error),
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const result = await commandBus.execute<UpdateViewSortCommand, UpdateViewSortResult>(
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
