import type { ITemplateQueryRoSchema, ITemplateVo } from '@teable/openapi';
import type { IListPublishedTemplatesEndpointResult } from '@teable/v2-contract-http';
import {
  listPublishedTemplatesInputSchema,
  listPublishedTemplatesResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeListPublishedTemplatesEndpoint = async (
  rawInput: unknown,
  listPublishedTemplates: (query?: ITemplateQueryRoSchema) => Promise<ITemplateVo[]>
): Promise<IListPublishedTemplatesEndpointResult> => {
  const parsed = listPublishedTemplatesInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid ListPublishedTemplates input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const templates = await listPublishedTemplates(parsed.data.query);
    const validated = listPublishedTemplatesResponseDataSchema.safeParse({ templates });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid ListPublishedTemplates output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to list published templates',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
