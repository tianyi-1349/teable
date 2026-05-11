import { describe, expect, it, vi, beforeEach } from 'vitest';
import { WorkflowRunListener } from './workflow-run.listener';

describe('WorkflowRunListener', () => {
  const workflowRunnerService = {
    executeWorkflowRun: vi.fn(),
  };
  const workflowService = {
    createRecordTriggerRuns: vi.fn(),
  };

  let listener: WorkflowRunListener;

  beforeEach(() => {
    vi.clearAllMocks();
    listener = new WorkflowRunListener(workflowRunnerService as never, workflowService as never);
  });

  it('executes workflow run from button click event', async () => {
    await listener.handleButtonClick({ payload: { runId: 'wrun123' } } as never);

    expect(workflowRunnerService.executeWorkflowRun).toHaveBeenCalledWith('wrun123');
  });

  it('ignores button click events without run id', async () => {
    await listener.handleButtonClick({ payload: {} } as never);

    expect(workflowRunnerService.executeWorkflowRun).not.toHaveBeenCalled();
  });

  it('creates and executes workflow runs from record create event', async () => {
    workflowService.createRecordTriggerRuns.mockResolvedValue([
      { runId: 'wrun123', workflowId: 'wfl123' },
      { runId: 'wrun456', workflowId: 'wfl456' },
    ]);
    const payload = { tableId: 'tbl123', record: { id: 'rec123', fields: {} } };

    await listener.handleRecordCreate({ payload } as never);

    expect(workflowService.createRecordTriggerRuns).toHaveBeenCalledWith(
      'tbl123',
      'recordCreated',
      payload
    );
    expect(workflowRunnerService.executeWorkflowRun).toHaveBeenNthCalledWith(1, 'wrun123');
    expect(workflowRunnerService.executeWorkflowRun).toHaveBeenNthCalledWith(2, 'wrun456');
  });

  it('creates and executes workflow runs from record update event', async () => {
    workflowService.createRecordTriggerRuns.mockResolvedValue([
      { runId: 'wrun123', workflowId: 'wfl123' },
    ]);
    const payload = { tableId: 'tbl123', record: { id: 'rec123', fields: { fld123: 'next' } } };

    await listener.handleRecordUpdate({ payload } as never);

    expect(workflowService.createRecordTriggerRuns).toHaveBeenCalledWith(
      'tbl123',
      'recordUpdated',
      payload
    );
    expect(workflowRunnerService.executeWorkflowRun).toHaveBeenCalledWith('wrun123');
  });

  it('keeps record event handling errors inside listener', async () => {
    workflowService.createRecordTriggerRuns.mockRejectedValue(new Error('boom'));

    await expect(
      listener.handleRecordCreate({ payload: { tableId: 'tbl123', record: [] } } as never)
    ).resolves.toBeUndefined();

    expect(workflowRunnerService.executeWorkflowRun).not.toHaveBeenCalled();
  });
});
