import type { IGetViewByIdEndpointResult, IGetViewByIdRequestDto } from '@teable/v2-contract-http';
import {
  getViewByIdInputSchema,
  mapDomainErrorToHttpError,
  mapDomainErrorToHttpStatus,
  mapGetViewByIdResultToDto,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';
import { GetViewByIdQuery } from '@teable/v2-core';
import type { GetViewByIdResult, IExecutionContext, IQueryBus } from '@teable/v2-core';

export const executeGetViewByIdEndpoint = async (
  context: IExecutionContext,
  rawInput: unknown,
  queryBus: IQueryBus
): Promise<IGetViewByIdEndpointResult> => {
  const parsed = getViewByIdInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetViewById input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const queryResult = GetViewByIdQuery.create(parsed.data as IGetViewByIdRequestDto);
  if (queryResult.isErr()) {
    const error = queryResult.error;
    return {
      status: mapDomainErrorToHttpStatus(error),
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const result = await queryBus.execute<GetViewByIdQuery, GetViewByIdResult>(
    context,
    queryResult.value
  );
  if (result.isErr()) {
    const error = result.error;
    return {
      status: mapDomainErrorToHttpStatus(error),
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  const mapped = mapGetViewByIdResultToDto(result.value);
  if (mapped.isErr()) {
    const error = mapped.error;
    return {
      status: mapDomainErrorToHttpStatus(error),
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      data: mapped.value,
    },
  };
};
