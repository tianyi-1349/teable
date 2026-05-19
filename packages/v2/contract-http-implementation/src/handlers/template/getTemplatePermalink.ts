import type { ITemplatePermalinkVo } from '@teable/openapi';
import type { IGetTemplatePermalinkEndpointResult } from '@teable/v2-contract-http';
import {
  getTemplatePermalinkInputSchema,
  getTemplatePermalinkResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetTemplatePermalinkEndpoint = async (
  rawInput: unknown,
  getTemplatePermalink: (identifier: string) => Promise<ITemplatePermalinkVo>
): Promise<IGetTemplatePermalinkEndpointResult> => {
  const parsed = getTemplatePermalinkInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetTemplatePermalink input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const permalink = await getTemplatePermalink(parsed.data.identifier);
    const validated = getTemplatePermalinkResponseDataSchema.safeParse({ permalink });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetTemplatePermalink output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get template permalink',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
