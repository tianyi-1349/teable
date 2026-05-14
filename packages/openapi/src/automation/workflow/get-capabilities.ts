import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';

export const workflowActionUnavailableReasonSchema = z.enum([
  'requiresSandbox',
  'notImplemented',
  'missingPermission',
]);

export const workflowActionCapabilitySchema = z.object({
  kind: z.string(),
  configurable: z.boolean(),
  runnable: z.boolean(),
  reason: workflowActionUnavailableReasonSchema.optional(),
});

export type IWorkflowActionCapability = z.infer<typeof workflowActionCapabilitySchema>;

export const workflowCapabilitiesVoSchema = z.object({
  actions: z.array(workflowActionCapabilitySchema),
});

export type IWorkflowCapabilitiesVo = z.infer<typeof workflowCapabilitiesVoSchema>;

export const GET_WORKFLOW_CAPABILITIES = '/base/{baseId}/workflow/capabilities';

export const GetWorkflowCapabilitiesRoute = registerRoute({
  method: 'get',
  path: GET_WORKFLOW_CAPABILITIES,
  description: 'get automation workflow capabilities',
  tags: ['automation'],
  request: {
    params: z.object({ baseId: z.string() }),
  },
  responses: {
    200: {
      description: 'Workflow capabilities',
      content: {
        'application/json': {
          schema: workflowCapabilitiesVoSchema,
        },
      },
    },
  },
});

export const getWorkflowCapabilities = async (baseId: string) => {
  return axios.get<IWorkflowCapabilitiesVo>(urlBuilder(GET_WORKFLOW_CAPABILITIES, { baseId }));
};
