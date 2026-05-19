import { Prisma } from '@prisma/client';

export const WORKFLOW_RUN_STATUSES = ['pending', 'running', 'completed', 'failed'] as const;
export type IWorkflowRunStatus = (typeof WORKFLOW_RUN_STATUSES)[number];

export const WORKFLOW_RUN_STEP_STATUSES = ['running', 'completed', 'failed'] as const;
export type IWorkflowRunStepStatus = (typeof WORKFLOW_RUN_STEP_STATUSES)[number];

const workflowRunTransitions: Record<IWorkflowRunStatus, IWorkflowRunStatus[]> = {
  pending: ['running', 'completed', 'failed'],
  running: ['completed', 'failed'],
  completed: [],
  failed: [],
};

const workflowRunStepTransitions: Record<IWorkflowRunStepStatus, IWorkflowRunStepStatus[]> = {
  running: ['completed', 'failed'],
  completed: [],
  failed: [],
};

function assertTransition<TStatus extends string>(
  current: TStatus,
  next: TStatus,
  transitions: Record<TStatus, TStatus[]>
) {
  if (!transitions[current]?.includes(next)) {
    throw new Error(`Invalid workflow status transition from ${current} to ${next}`);
  }
}

export function assertWorkflowRunTransition(current: IWorkflowRunStatus, next: IWorkflowRunStatus) {
  assertTransition(current, next, workflowRunTransitions);
}

export function assertWorkflowRunStepTransition(
  current: IWorkflowRunStepStatus,
  next: IWorkflowRunStepStatus
) {
  assertTransition(current, next, workflowRunStepTransitions);
}

export function buildWorkflowRunStartData(startedTime: Date) {
  return {
    status: 'running' satisfies IWorkflowRunStatus,
    startedTime,
  };
}

export function buildWorkflowRunSuccessData(
  startedTime: Date,
  finishedTime: Date,
  output: unknown
) {
  return {
    status: 'completed' satisfies IWorkflowRunStatus,
    finishedTime,
    durationMs: finishedTime.getTime() - startedTime.getTime(),
    output: toJson(output),
  };
}

export function buildWorkflowRunFailureData(
  startedTime: Date,
  finishedTime: Date,
  message: string
) {
  return {
    status: 'failed' satisfies IWorkflowRunStatus,
    finishedTime,
    durationMs: finishedTime.getTime() - startedTime.getTime(),
    error: { message },
  };
}

export function buildWorkflowRunStepStartData(runId: string, nodeId: string, input: unknown) {
  return {
    runId,
    nodeId,
    status: 'running' satisfies IWorkflowRunStepStatus,
    input: toJson(input),
  };
}

export function buildWorkflowRunStepSuccessData(
  startedTime: Date,
  finishedTime: Date,
  output: unknown
) {
  return {
    status: 'completed' satisfies IWorkflowRunStepStatus,
    output: toJson(output),
    finishedTime,
    durationMs: finishedTime.getTime() - startedTime.getTime(),
  };
}

export function buildWorkflowRunStepFailureData(
  startedTime: Date,
  finishedTime: Date,
  message: string
) {
  return {
    status: 'failed' satisfies IWorkflowRunStepStatus,
    error: { message },
    finishedTime,
    durationMs: finishedTime.getTime() - startedTime.getTime(),
  };
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return (value ?? Prisma.JsonNull) as Prisma.InputJsonValue;
}
