import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { workflowDetailVoSchema, type IWorkflowDetailVo } from './types';

const AI_CREATE_WORKFLOW_DRAFT = '/base/{baseId}/workflow/ai-create-draft';

export const aiCreateWorkflowDraftRoSchema = z.object({
  prompt: z.string().trim().min(1),
  tableId: z.string().optional(),
  fieldId: z.string().optional(),
  recordId: z.string().optional(),
  modelKey: z.string().optional(),
  triggerType: z
    .enum([
      'buttonClick',
      'recordCreated',
      'recordUpdated',
      'recordMatchesConditions',
      'schedule',
      'webhook',
      'formSubmitted',
      'emailReceived',
    ])
    .optional(),
  preferActionKind: z
    .enum([
      'runScript',
      'aiGenerate',
      'updateRecords',
      'createRecords',
      'queryRecords',
      'sendEmail',
      'httpRequest',
      'condition',
      'loop',
    ])
    .optional(),
});

export type IAiCreateWorkflowDraftRo = z.infer<typeof aiCreateWorkflowDraftRoSchema>;

export const AiCreateWorkflowDraftRoute: RouteConfig = registerRoute({
  method: 'post',
  path: AI_CREATE_WORKFLOW_DRAFT,
  description: 'Create an inactive automation workflow draft with AI',
  request: {
    params: z.object({ baseId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: aiCreateWorkflowDraftRoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created inactive workflow draft',
      content: {
        'application/json': {
          schema: workflowDetailVoSchema,
        },
      },
    },
  },
  tags: ['automation'],
});

export const aiCreateWorkflowDraft = async (
  baseId: string,
  aiCreateWorkflowDraftRo: IAiCreateWorkflowDraftRo
) => {
  return axios.post<IWorkflowDetailVo>(
    urlBuilder(AI_CREATE_WORKFLOW_DRAFT, { baseId }),
    aiCreateWorkflowDraftRo
  );
};
