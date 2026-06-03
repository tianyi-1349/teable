import { z } from '../../zod';

export const workflowNodeTypeSchema = z.enum(['trigger', 'action', 'logic']);

export const workflowRunTriggerTypeSchema = z.enum([
  'buttonClick',
  'recordCreated',
  'recordUpdated',
  'recordMatchesConditions',
  'schedule',
  'webhook',
  'formSubmitted',
  'emailReceived',
  'manualTest',
  'manualNodeTest',
]);

export const workflowWebhookTriggerConfigSchema = z.object({
  secret: z.string().optional(),
  signatureSecret: z.string().optional(),
  signatureHeader: z.string().optional(),
  timestampHeader: z.string().optional(),
  bodySizeLimitKb: z.number().int().positive().optional(),
  timestampToleranceSeconds: z.number().int().positive().optional(),
});

export const workflowScheduleTriggerConfigSchema = z.object({
  mode: z.enum(['manual', 'interval', 'cron', 'oneTime']).optional(),
  intervalSeconds: z.number().int().positive().optional(),
  cron: z.string().optional(),
  timezone: z.string().optional(),
  runAt: z.string().datetime().optional(),
});

export const workflowRunScriptActionConfigSchema = z.object({
  script: z.string().optional(),
  code: z.string().optional(),
});

export const workflowAiGenerateActionConfigSchema = z.object({
  prompt: z.string().optional(),
  modelKey: z.string().optional(),
});

export const workflowUpdateRecordsActionConfigSchema = z.object({
  tableId: z.string(),
  recordId: z.string(),
  fields: z.record(z.string(), z.unknown()),
});

export const workflowCreateRecordsActionConfigSchema = z.object({
  tableId: z.string(),
  records: z.array(z.record(z.string(), z.unknown())),
});

export const workflowQueryRecordsActionConfigSchema = z.object({
  tableId: z.string(),
  filter: z.record(z.string(), z.unknown()).optional(),
  take: z.number().int().positive().optional(),
});

export const workflowSendEmailActionConfigSchema = z.object({
  to: z.array(z.string()).min(1),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
});

export const workflowHttpRequestActionConfigSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
  url: z.string(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.unknown().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

export const workflowConditionActionConfigSchema = z.object({
  expression: z.string().trim().min(1),
  output: z.unknown().optional(),
});

export const workflowLoopActionConfigSchema = z.object({
  itemsPath: z.string().trim().min(1),
  maxIterations: z.number().int().positive().optional(),
});

export const workflowNodeConfigSchema = z.union([
  workflowWebhookTriggerConfigSchema,
  workflowScheduleTriggerConfigSchema,
  workflowRunScriptActionConfigSchema,
  workflowAiGenerateActionConfigSchema,
  workflowUpdateRecordsActionConfigSchema,
  workflowCreateRecordsActionConfigSchema,
  workflowQueryRecordsActionConfigSchema,
  workflowSendEmailActionConfigSchema,
  workflowHttpRequestActionConfigSchema,
  workflowConditionActionConfigSchema,
  workflowLoopActionConfigSchema,
  z.record(z.string(), z.unknown()),
  z.unknown(),
]);

export const workflowNodeSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  nodeType: workflowNodeTypeSchema,
  kind: z.string(),
  parentNodeId: z.string().nullable().optional(),
  nextNodeId: z.string().nullable().optional(),
  branchKey: z.string().nullable().optional(),
  config: workflowNodeConfigSchema.optional(),
  testStatus: z.string().nullable().optional(),
  testOutput: z.unknown().optional(),
});

export type IWorkflowNode = z.infer<typeof workflowNodeSchema>;

export const workflowVoSchema = z.object({
  id: z.string(),
  baseId: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  order: z.number(),
  isActive: z.boolean(),
  activeSnapshotId: z.string().nullable().optional(),
  createdBy: z.string(),
  createdTime: z.string().or(z.date()),
  lastModifiedTime: z.string().or(z.date()).nullable().optional(),
  lastModifiedBy: z.string().nullable().optional(),
});

export type IWorkflowVo = z.infer<typeof workflowVoSchema>;

export const workflowDetailVoSchema = workflowVoSchema.extend({
  nodes: z.array(workflowNodeSchema).default([]),
});

export type IWorkflowDetailVo = z.infer<typeof workflowDetailVoSchema>;

export const workflowRunStepVoSchema = z.object({
  id: z.string(),
  runId: z.string(),
  nodeId: z.string(),
  status: z.string(),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  error: z.unknown().optional(),
  startedTime: z.string().or(z.date()),
  finishedTime: z.string().or(z.date()).nullable().optional(),
  durationMs: z.number().nullable().optional(),
});

export type IWorkflowRunStepVo = z.infer<typeof workflowRunStepVoSchema>;

export const workflowRunVoSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  snapshotId: z.string().nullable().optional(),
  triggerType: workflowRunTriggerTypeSchema.or(z.string()),
  status: z.string(),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  error: z.unknown().optional(),
  startedTime: z.string().or(z.date()),
  finishedTime: z.string().or(z.date()).nullable().optional(),
  durationMs: z.number().nullable().optional(),
  createdBy: z.string(),
});

export type IWorkflowRunVo = z.infer<typeof workflowRunVoSchema>;

export const workflowRunDetailVoSchema = workflowRunVoSchema.extend({
  steps: z.array(workflowRunStepVoSchema).default([]),
});

export type IWorkflowRunDetailVo = z.infer<typeof workflowRunDetailVoSchema>;

export const workflowRunWebhookAuditSummaryVoSchema = z.object({
  totalRuns: z.number().int().nonnegative(),
  webhookRuns: z.number().int().nonnegative(),
  signatureRequiredRuns: z.number().int().nonnegative(),
  signatureVerifiedRuns: z.number().int().nonnegative(),
  signatureFailedRuns: z.number().int().nonnegative(),
  timestampHeaderPresentRuns: z.number().int().nonnegative(),
  timestampHeaderMissingRuns: z.number().int().nonnegative(),
  rateLimitedRuns: z.number().int().nonnegative(),
  averageBodySizeBytes: z.number().nonnegative().nullable(),
  maxBodySizeBytes: z.number().int().nonnegative().nullable(),
  latestWebhookRunAt: z.string().or(z.date()).nullable(),
});

export type IWorkflowRunWebhookAuditSummaryVo = z.infer<
  typeof workflowRunWebhookAuditSummaryVoSchema
>;

export const workflowRunWebhookAuditItemVoSchema = z.object({
  runId: z.string(),
  status: z.string(),
  startedTime: z.string().or(z.date()),
  signatureHeader: z.string().optional(),
  timestampHeader: z.string().optional(),
  signatureRequired: z.boolean().optional(),
  signatureVerified: z.boolean().optional(),
  timestampHeaderPresent: z.boolean().optional(),
  bodySizeBytes: z.number().int().nonnegative().optional(),
  rateLimit: z.number().int().nonnegative().optional(),
});

export type IWorkflowRunWebhookAuditItemVo = z.infer<typeof workflowRunWebhookAuditItemVoSchema>;

export const workflowRunWebhookAuditListVoSchema = z.object({
  items: z.array(workflowRunWebhookAuditItemVoSchema),
  nextCursor: z.string().nullable(),
});

export type IWorkflowRunWebhookAuditListVo = z.infer<typeof workflowRunWebhookAuditListVoSchema>;

export const workflowRoSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  trigger: z
    .object({
      type: z.string(),
      config: z.unknown().optional(),
    })
    .optional(),
  actions: z
    .array(
      z.object({
        type: z.string(),
        config: z.unknown().optional(),
      })
    )
    .optional(),
});

export type IWorkflowRo = z.infer<typeof workflowRoSchema>;

export const updateWorkflowRoSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        nodeType: workflowNodeTypeSchema,
        kind: z.string(),
        parentNodeId: z.string().nullable().optional(),
        nextNodeId: z.string().nullable().optional(),
        branchKey: z.string().nullable().optional(),
        config: workflowNodeConfigSchema.optional(),
      })
    )
    .optional(),
});

export type IUpdateWorkflowRo = z.infer<typeof updateWorkflowRoSchema>;

export const duplicateWorkflowRoSchema = z.object({
  name: z.string().trim().min(1).optional(),
});

export type IDuplicateWorkflowRo = z.infer<typeof duplicateWorkflowRoSchema>;
