import { describe, expect, it } from 'vitest';
import {
  assertWorkflowRunStepTransition,
  assertWorkflowRunTransition,
  buildWorkflowRunFailureData,
  buildWorkflowRunStepSuccessData,
  buildWorkflowRunSuccessData,
} from './workflow-run-state';

describe('workflow-run-state', () => {
  const startedTime = new Date('2026-05-13T00:00:00.000Z');
  const finishedTime = new Date('2026-05-13T00:00:02.500Z');

  it('builds run success and failure data with duration', () => {
    expect(buildWorkflowRunSuccessData(startedTime, finishedTime, { ok: true })).toEqual({
      status: 'completed',
      finishedTime,
      durationMs: 2500,
      output: { ok: true },
    });
    expect(buildWorkflowRunFailureData(startedTime, finishedTime, 'boom')).toEqual({
      status: 'failed',
      finishedTime,
      durationMs: 2500,
      error: { message: 'boom' },
    });
  });

  it('builds step success data with duration', () => {
    expect(buildWorkflowRunStepSuccessData(startedTime, finishedTime, null)).toEqual({
      status: 'completed',
      output: expect.anything(),
      finishedTime,
      durationMs: 2500,
    });
  });

  it('guards terminal run transitions', () => {
    expect(() => assertWorkflowRunTransition('pending', 'running')).not.toThrow();
    expect(() => assertWorkflowRunTransition('running', 'completed')).not.toThrow();
    expect(() => assertWorkflowRunTransition('completed', 'running')).toThrow(
      'Invalid workflow status transition from completed to running'
    );
  });

  it('guards terminal step transitions', () => {
    expect(() => assertWorkflowRunStepTransition('running', 'completed')).not.toThrow();
    expect(() => assertWorkflowRunStepTransition('failed', 'running')).toThrow(
      'Invalid workflow status transition from failed to running'
    );
  });
});
