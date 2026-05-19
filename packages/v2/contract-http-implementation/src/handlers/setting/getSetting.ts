import type { ISettingVo } from '@teable/openapi';
import type { IGetSettingEndpointResult } from '@teable/v2-contract-http';
import {
  getSettingInputSchema,
  getSettingResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetSettingEndpoint = async (
  rawInput: unknown,
  getSetting: () => Promise<ISettingVo>
): Promise<IGetSettingEndpointResult> => {
  const parsed = getSettingInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetSetting input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const setting = await getSetting();
    const validated = getSettingResponseDataSchema.safeParse({ setting });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetSetting output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get setting',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
