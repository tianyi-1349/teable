import type { IGetDepartmentListRo, IGetDepartmentListVo } from '@teable/openapi';
import type { IGetDepartmentListEndpointResult } from '@teable/v2-contract-http';
import {
  getDepartmentListInputSchema,
  getDepartmentListResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetDepartmentListEndpoint = async (
  rawInput: unknown,
  getDepartmentList: (query?: IGetDepartmentListRo) => Promise<IGetDepartmentListVo>
): Promise<IGetDepartmentListEndpointResult> => {
  const parsed = getDepartmentListInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetDepartmentList input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const departments = await getDepartmentList(parsed.data);
    const validated = getDepartmentListResponseDataSchema.safeParse({ departments });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetDepartmentList output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get department list',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
