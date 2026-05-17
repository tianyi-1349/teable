import type { IPublicSettingVo } from '@teable/openapi';
import type { IGetPublicSettingEndpointResult } from '@teable/v2-contract-http';
import {
  getPublicSettingInputSchema,
  getPublicSettingResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetPublicSettingEndpoint = async (
  rawInput: unknown,
  getPublicSetting: () => Promise<IPublicSettingVo>
): Promise<IGetPublicSettingEndpointResult> => {
  const parsed = getPublicSettingInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetPublicSetting input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const setting = await getPublicSetting();
    const validated = getPublicSettingResponseDataSchema.safeParse({ setting });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetPublicSetting output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get public setting',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
