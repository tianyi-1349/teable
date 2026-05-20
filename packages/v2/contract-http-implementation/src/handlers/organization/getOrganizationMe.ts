import type { IOrganizationMeVo } from '@teable/openapi';
import type { IGetOrganizationMeEndpointResult } from '@teable/v2-contract-http';
import {
  getOrganizationMeInputSchema,
  getOrganizationMeResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetOrganizationMeEndpoint = async (
  rawInput: unknown,
  getOrganizationMe: () => Promise<IOrganizationMeVo>
): Promise<IGetOrganizationMeEndpointResult> => {
  const parsed = getOrganizationMeInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetOrganizationMe input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const organization = await getOrganizationMe();
    const validated = getOrganizationMeResponseDataSchema.safeParse({ organization });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetOrganizationMe output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get organization info',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
