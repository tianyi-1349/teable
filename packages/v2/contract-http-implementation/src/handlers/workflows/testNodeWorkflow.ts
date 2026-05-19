import type { ITestNodeWorkflowRo, IWorkflowRunVo } from '@teable/openapi';
import type { ITestNodeWorkflowEndpointResult } from '@teable/v2-contract-http';
import {
  mapDomainErrorToHttpError,
  testNodeWorkflowInputSchema,
  testNodeWorkflowResponseDataSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

export const executeTestNodeWorkflowEndpoint = async (
  rawInput: unknown,
  testNodeWorkflow: (
    baseId: string,
    workflowId: string,
    nodeId: string,
    input?: ITestNodeWorkflowRo['input']
  ) => Promise<IWorkflowRunVo>
): Promise<ITestNodeWorkflowEndpointResult> => {
  const parsed = testNodeWorkflowInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const error = domainError.validation({ message: 'Invalid TestNodeWorkflow input' });
    return {
      status: 400,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }

  try {
    const run = await testNodeWorkflow(
      parsed.data.baseId,
      parsed.data.workflowId,
      parsed.data.nodeId,
      parsed.data.input
    );
    const validated = testNodeWorkflowResponseDataSchema.safeParse({ run });
    if (!validated.success) {
      const error = domainError.validation({ message: 'Invalid TestNodeWorkflow output' });
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
      message: cause instanceof Error ? cause.message : 'Failed to test node workflow',
    });
    return {
      status: 500,
      body: { ok: false, error: mapDomainErrorToHttpError(error) },
    };
  }
};
