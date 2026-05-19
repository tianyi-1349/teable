import type { IUpdateViewPropertyEndpointResult } from '@teable/v2-contract-http';
import { mapDomainErrorToHttpError, mapDomainErrorToHttpStatus } from '@teable/v2-contract-http';
import { UpdateViewNameCommand } from '@teable/v2-core';
import type { ICommandBus, IExecutionContext, UpdateViewNameResult } from '@teable/v2-core';

export const executeUpdateViewNameCommandEndpoint = async (
  context: IExecutionContext,
  rawInput: unknown,
  commandBus: ICommandBus
): Promise<IUpdateViewPropertyEndpointResult> => {
  const commandResult = UpdateViewNameCommand.create(rawInput);
  if (commandResult.isErr()) {
    const error = commandResult.error;
    return {
      status: mapDomainErrorToHttpStatus(error),
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const result = await commandBus.execute<UpdateViewNameCommand, UpdateViewNameResult>(
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
    body: { ok: true, data: { success: true } },
  };
};
