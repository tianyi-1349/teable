import type { IShareViewCollaboratorsRo, IShareViewCollaboratorsVo } from '@teable/openapi';
import type { IGetShareViewCollaboratorsEndpointResult } from '@teable/v2-contract-http';
import {
  getShareViewCollaboratorsInputSchema,
  getShareViewCollaboratorsResponseDataSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetShareViewCollaboratorsEndpoint = async (
  rawInput: unknown,
  getShareViewCollaborators: (
    shareId: string,
    query?: IShareViewCollaboratorsRo
  ) => Promise<IShareViewCollaboratorsVo>
): Promise<IGetShareViewCollaboratorsEndpointResult> => {
  const parsed = getShareViewCollaboratorsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetShareViewCollaborators input' });
    return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }

  try {
    const collaborators = await getShareViewCollaborators(parsed.data.shareId, parsed.data.query);
    const validated = getShareViewCollaboratorsResponseDataSchema.safeParse({ collaborators });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetShareViewCollaborators output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return { status: 200, body: { ok: true, data: validated.data } };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get share view collaborators',
    });
    return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
  }
};
