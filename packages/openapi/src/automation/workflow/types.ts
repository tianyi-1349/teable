import { z } from '../../zod';

export const workflowTriggerTypeSchema = z.enum([
  'buttonClick',
  'recordCreated',
  'recordUpdated',
  'recordCreatedOrUpdated',
  'schedule',
  'formSubmitted',
  'webhook',
]);

export type IWorkflowTriggerType = z.infer<typeof workflowTriggerTypeSchema>;

export const workflowActionTypeSchema = z.enum([
  'ai',
  'createRecord',
  'updateRecord',
  'sendEmail',
  'httpRequest',
  'runScript',
  'crossBaseAccess',
]);

export type IWorkflowActionType = z.infer<typeof workflowActionTypeSchema>;

export const workflowExecutionStatusSchema = z.enum(['running', 'succeeded', 'failed']);

export type IWorkflowExecutionStatus = z.infer<typeof workflowExecutionStatusSchema>;

export const workflowExecutionStepStatusSchema = z.enum([
  'running',
  'succeeded',
  'failed',
  'skipped',
]);

export type IWorkflowExecutionStepStatus = z.infer<typeof workflowExecutionStepStatusSchema>;

export const workflowRecordSchema = z.record(z.string(), z.unknown());

export const aiActionConfigSchema = z.object({
  tableId: z.string().optional(),
  recordId: z.string().optional(),
  targetFieldId: z.string().optional(),
  fieldIds: z.array(z.string()).optional(),
  sourceText: z.string().optional(),
  sourceFieldId: z.string().optional(),
  instructions: z.string().optional(),
  prompt: z.string().optional(),
  modelKey: z.string().optional(),
});

export const createRecordActionConfigSchema = z.object({
  tableId: z.string(),
  fields: z.record(z.string(), z.unknown()),
});

export const updateRecordActionConfigSchema = z.object({
  tableId: z.string(),
  recordId: z.string().optional(),
  targetFieldId: z.string().optional(),
  fields: z.record(z.string(), z.unknown()),
});

export const httpRequestActionConfigSchema = z.object({
  url: z.string().min(1),
  method: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.unknown().optional(),
});

export const workflowActionConfigSchemaMap: Record<string, z.ZodTypeAny> = {
  ai: aiActionConfigSchema,
  createRecord: createRecordActionConfigSchema,
  updateRecord: updateRecordActionConfigSchema,
  httpRequest: httpRequestActionConfigSchema,
};

export const workflowTriggerSchema = z.object({
  type: workflowTriggerTypeSchema,
  config: workflowRecordSchema.optional(),
});

export type IWorkflowTrigger = z.infer<typeof workflowTriggerSchema>;

export const workflowConditionSchema = z.object({
  id: z.string().optional(),
  field: z.string().optional(),
  operator: z.string().optional(),
  value: z.unknown().optional(),
  enabled: z.boolean().optional(),
});

export type IWorkflowCondition = z.infer<typeof workflowConditionSchema>;

export const workflowActionSchema = z.object({
  id: z.string().optional(),
  type: workflowActionTypeSchema,
  name: z.string().optional(),
  config: workflowRecordSchema.optional(),
});

export type IWorkflowAction = z.infer<typeof workflowActionSchema>;

export const workflowBaseSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  trigger: workflowTriggerSchema.optional(),
  conditions: z.array(workflowConditionSchema).optional(),
  actions: z.array(workflowActionSchema).optional(),
  isActive: z.boolean().optional(),
});

export const workflowCreateRoSchema = workflowBaseSchema;

export type IWorkflowCreateRo = z.infer<typeof workflowCreateRoSchema>;

export const workflowUpdateRoSchema = workflowBaseSchema.partial();

export type IWorkflowUpdateRo = z.infer<typeof workflowUpdateRoSchema>;

export const workflowVoSchema = z.object({
  id: z.string(),
  baseId: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  trigger: workflowTriggerSchema.optional(),
  conditions: z.array(workflowConditionSchema).optional(),
  actions: z.array(workflowActionSchema).optional(),
  isActive: z.boolean(),
  createdTime: z.string().optional(),
  lastModifiedTime: z.string().nullable().optional(),
});

export type IWorkflowVo = z.infer<typeof workflowVoSchema>;

export const workflowExecutionEventPayloadSchema = z.record(z.string(), z.unknown());

export const workflowExecutionStepSchema = z.object({
  id: z.string(),
  index: z.number().int().nonnegative(),
  actionId: z.string().optional(),
  actionType: workflowActionTypeSchema,
  actionName: z.string().optional(),
  status: workflowExecutionStepStatusSchema,
  startedTime: z.string(),
  completedTime: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
});

export type IWorkflowExecutionStep = z.infer<typeof workflowExecutionStepSchema>;

export const workflowExecutionVoSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  baseId: z.string(),
  triggerType: workflowTriggerTypeSchema.nullish(),
  status: workflowExecutionStatusSchema,
  eventPayload: workflowExecutionEventPayloadSchema.optional(),
  steps: z.array(workflowExecutionStepSchema).optional(),
  actionCount: z.number(),
  errorMessage: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  createdTime: z.string(),
  completedTime: z.string().nullable().optional(),
});

export type IWorkflowExecutionVo = z.infer<typeof workflowExecutionVoSchema>;

export const workflowExecutionListQuerySchema = z.object({
  take: z
    .string()
    .or(z.number())
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default(20)
    .optional(),
  cursor: z.string().optional().nullable(),
});

export type IWorkflowExecutionListQuery = z.infer<typeof workflowExecutionListQuerySchema>;

export const workflowExecutionListVoSchema = z.object({
  executions: z.array(workflowExecutionVoSchema),
  nextCursor: z.string().optional().nullable(),
});

export type IWorkflowExecutionListVo = z.infer<typeof workflowExecutionListVoSchema>;
