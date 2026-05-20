import type { IGetDepartmentUserRo, IGetDepartmentUserVo } from '@teable/openapi';
import type { IGetDepartmentUsersEndpointResult } from '@teable/v2-contract-http';
import {
  getDepartmentUsersInputSchema,
  getDepartmentUsersResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetDepartmentUsersEndpoint = async (
  rawInput: unknown,
  getDepartmentUsers: (query?: IGetDepartmentUserRo) => Promise<IGetDepartmentUserVo>
): Promise<IGetDepartmentUsersEndpointResult> => {
  const parsed = getDepartmentUsersInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetDepartmentUsers input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const data = await getDepartmentUsers(parsed.data);
    const validated = getDepartmentUsersResponseDataSchema.safeParse(data);
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetDepartmentUsers output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get department users',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
