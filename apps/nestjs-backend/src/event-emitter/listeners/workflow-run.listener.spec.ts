import { describe, expect, it, vi, beforeEach } from 'vitest';
import { WorkflowRunListener } from './workflow-run.listener';

describe('WorkflowRunListener', () => {
  const workflowRunnerService = {
    executeWorkflowRun: vi.fn(),
  };

  let listener: WorkflowRunListener;

  beforeEach(() => {
    vi.clearAllMocks();
    listener = new WorkflowRunListener(workflowRunnerService as never);
  });

  it('executes workflow run from button click event', async () => {
    await listener.handleButtonClick({ payload: { runId: 'wrun123' } } as never);

    expect(workflowRunnerService.executeWorkflowRun).toHaveBeenCalledWith('wrun123');
  });

  it('ignores button click events without run id', async () => {
    await listener.handleButtonClick({ payload: {} } as never);

    expect(workflowRunnerService.executeWorkflowRun).not.toHaveBeenCalled();
  });
});
