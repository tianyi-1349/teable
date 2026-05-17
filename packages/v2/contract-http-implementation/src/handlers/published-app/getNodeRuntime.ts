import type {
  IGetPublishedAppNodeRuntimeEndpointResult,
  IPublishedAppNodeRuntimeDto,
} from '@teable/v2-contract-http';
import {
  getPublishedAppNodeRuntimeInputSchema,
  mapDomainErrorToHttpError,
  publishedAppNodeRuntimeSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetPublishedAppNodeRuntimeEndpoint = async (
  rawInput: unknown,
  getNodeRuntime: (shareId: string, nodeId: string) => Promise<IPublishedAppNodeRuntimeDto>
): Promise<IGetPublishedAppNodeRuntimeEndpointResult> => {
  const parsed = getPublishedAppNodeRuntimeInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({
      message: 'Invalid GetPublishedAppNodeRuntime input',
    });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const runtime = await getNodeRuntime(parsed.data.shareId, parsed.data.nodeId);
    const runtimeParsed = publishedAppNodeRuntimeSchema.safeParse(runtime);
    if (!runtimeParsed.success) {
      const error = domainError.validation({
        message: 'Invalid PublishedApp node runtime output',
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
        data: { runtime: runtimeParsed.data },
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get published app node runtime',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
