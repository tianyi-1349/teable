import type {
  IGetPublishedAppRuntimeManifestEndpointResult,
  IPublishedAppRuntimeManifestDto,
} from '@teable/v2-contract-http';
import {
  getPublishedAppRuntimeManifestInputSchema,
  mapDomainErrorToHttpError,
  publishedAppRuntimeManifestSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetPublishedAppRuntimeManifestEndpoint = async (
  rawInput: unknown,
  getRuntimeManifest: (shareId: string) => Promise<IPublishedAppRuntimeManifestDto>
): Promise<IGetPublishedAppRuntimeManifestEndpointResult> => {
  const parsed = getPublishedAppRuntimeManifestInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({
      message: 'Invalid GetPublishedAppRuntimeManifest input',
    });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const manifest = await getRuntimeManifest(parsed.data.shareId);
    const manifestParsed = publishedAppRuntimeManifestSchema.safeParse(manifest);
    if (!manifestParsed.success) {
      const error = domainError.validation({
        message: 'Invalid PublishedApp runtime manifest output',
      });
      return {
        status: 500,
        body: { ok: false, error: mapDomainErrorToHttpError(error) },
      };
    }

    return {
      status: 200,
      body: {
        ok: true,
        data: { manifest: manifestParsed.data },
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message:
        cause instanceof Error ? cause.message : 'Failed to get published app runtime manifest',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
