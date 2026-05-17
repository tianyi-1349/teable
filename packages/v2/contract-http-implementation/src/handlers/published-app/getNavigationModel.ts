import type {
  IGetPublishedAppNavigationModelEndpointResult,
  IPublishedNavigationModelDto,
} from '@teable/v2-contract-http';
import {
  getPublishedAppNavigationModelInputSchema,
  mapDomainErrorToHttpError,
  publishedNavigationModelSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetPublishedAppNavigationModelEndpoint = async (
  rawInput: unknown,
  getNavigationModel: (
    shareId: string,
    currentNodeId?: string
  ) => Promise<IPublishedNavigationModelDto>
): Promise<IGetPublishedAppNavigationModelEndpointResult> => {
  const parsed = getPublishedAppNavigationModelInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({
      message: 'Invalid GetPublishedAppNavigationModel input',
    });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const navigation = await getNavigationModel(parsed.data.shareId, parsed.data.currentNodeId);
    const navigationParsed = publishedNavigationModelSchema.safeParse(navigation);
    if (!navigationParsed.success) {
      const error = domainError.validation({
        message: 'Invalid PublishedApp navigation model output',
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
        data: { navigation: navigationParsed.data },
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message:
        cause instanceof Error ? cause.message : 'Failed to get published app navigation model',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
