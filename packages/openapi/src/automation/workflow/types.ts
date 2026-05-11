import { z } from '../../zod';

export const workflowNodeTypeSchema = z.enum(['trigger', 'action', 'logic']);

export const workflowNodeSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  nodeType: workflowNodeTypeSchema,
  kind: z.string(),
  parentNodeId: z.string().nullable().optional(),
  nextNodeId: z.string().nullable().optional(),
  branchKey: z.string().nullable().optional(),
  config: z.unknown().optional(),
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
  triggerType: z.string(),
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
        config: z.unknown().optional(),
      })
    )
    .optional(),
});

export type IUpdateWorkflowRo = z.infer<typeof updateWorkflowRoSchema>;

export const duplicateWorkflowRoSchema = z.object({
  name: z.string().trim().min(1).optional(),
});

export type IDuplicateWorkflowRo = z.infer<typeof duplicateWorkflowRoSchema>;
