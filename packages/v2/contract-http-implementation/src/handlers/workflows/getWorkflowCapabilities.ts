import type { IWorkflowCapabilitiesVo } from '@teable/openapi';
import type { IGetWorkflowCapabilitiesEndpointResult } from '@teable/v2-contract-http';
import {
  getWorkflowCapabilitiesResponseDataSchema,
  getWorkflowCapabilitiesInputSchema,
  mapDomainErrorToHttpError,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeGetWorkflowCapabilitiesEndpoint = async (
  rawInput: unknown,
  getWorkflowCapabilities: () => IWorkflowCapabilitiesVo | Promise<IWorkflowCapabilitiesVo>
): Promise<IGetWorkflowCapabilitiesEndpointResult> => {
  const parsed = getWorkflowCapabilitiesInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid GetWorkflowCapabilities input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const capabilities = await Promise.resolve(getWorkflowCapabilities());
    const validated = getWorkflowCapabilitiesResponseDataSchema.safeParse({ capabilities });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid GetWorkflowCapabilities output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return {
      status: 200,
      body: {
        ok: true,
        data: validated.data,
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to get workflow capabilities',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
