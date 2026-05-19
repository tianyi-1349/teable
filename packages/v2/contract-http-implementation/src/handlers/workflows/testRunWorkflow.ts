import type { ITestRunWorkflowRo, IWorkflowRunVo } from '@teable/openapi';
import type { ITestRunWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  mapDomainErrorToHttpError,
  testRunWorkflowInputSchema,
  testRunWorkflowResponseDataSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeTestRunWorkflowEndpoint = async (
  rawInput: unknown,
  testRunWorkflow: (
    baseId: string,
    workflowId: string,
    input?: ITestRunWorkflowRo['input']
  ) => Promise<IWorkflowRunVo>
): Promise<ITestRunWorkflowEndpointResult> => {
  const parsed = testRunWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid TestRunWorkflow input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const run = await testRunWorkflow(
      parsed.data.baseId,
      parsed.data.workflowId,
      parsed.data.input
    );
    const validated = testRunWorkflowResponseDataSchema.safeParse({ run });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid TestRunWorkflow output' });
      return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
    }
    return {
      status: 201,
      body: {
        ok: true,
        data: validated.data,
      },
    };
  } catch (cause) {
    const error = domainError.unexpected({
      message: cause instanceof Error ? cause.message : 'Failed to test run workflow',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
