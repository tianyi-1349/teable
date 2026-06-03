import type { IWorkflowRunVo } from '@teable/openapi';
import { describe, expect, it, vi } from 'vitest';
import { executeTriggerScheduleWorkflowEndpoint } from './triggerScheduleWorkflow';

const run: IWorkflowRunVo = {
  id: 'wfr123',
  workflowId: 'wfl123',
  snapshotId: 'wsn123',
  triggerType: 'schedule',
  status: 'completed',
  input: { source: 'workflowSchedule' },
  startedTime: '2026-05-31T00:00:00.000Z',
  finishedTime: '2026-05-31T00:00:01.000Z',
  durationMs: 1000,
  createdBy: 'usr123',
};

describe('executeTriggerScheduleWorkflowEndpoint', () => {
  it('wraps a schedule workflow run in the v2 response contract', async () => {
    const triggerScheduleWorkflow = vi.fn(async () => run);

    const result = await executeTriggerScheduleWorkflowEndpoint(
      { baseId: 'bse123', workflowId: 'wfl123', body: { source: 'manualScheduleTest' } },
      triggerScheduleWorkflow
    );

    expect(triggerScheduleWorkflow).toHaveBeenCalledWith('bse123', 'wfl123', {
      source: 'manualScheduleTest',
    });
    expect(result).toEqual({ status: 201, body: { ok: true, data: { run } } });
  });

  it('returns validation error for invalid input', async () => {
    const result = await executeTriggerScheduleWorkflowEndpoint(
      { workflowId: 'wfl123' },
      vi.fn(async () => run)
    );

    expect(result.status).toBe(400);
    expect(result.body.ok).toBe(false);
  });

  it('returns output validation error when handler returns an invalid run', async () => {
    const result = await executeTriggerScheduleWorkflowEndpoint(
      { baseId: 'bse123', workflowId: 'wfl123' },
      vi.fn(async () => ({ ...run, id: 123 }) as never)
    );

    expect(result.status).toBe(500);
    expect(result.body.ok).toBe(false);
  });
});
