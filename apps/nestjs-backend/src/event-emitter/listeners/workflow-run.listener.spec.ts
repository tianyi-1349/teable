import { describe, expect, it, vi, beforeEach } from 'vitest';
import { WorkflowRunListener } from './workflow-run.listener';

describe('WorkflowRunListener', () => {
  const workflowService = {
    completeEmptyRun: vi.fn(),
  };

  let listener: WorkflowRunListener;

  beforeEach(() => {
    vi.clearAllMocks();
    listener = new WorkflowRunListener(workflowService as never);
  });

  it('completes workflow run from button click event', async () => {
    await listener.handleButtonClick({ payload: { runId: 'wrun123' } } as never);

    expect(workflowService.completeEmptyRun).toHaveBeenCalledWith('wrun123');
  });

  it('ignores button click events without run id', async () => {
    await listener.handleButtonClick({ payload: {} } as never);

    expect(workflowService.completeEmptyRun).not.toHaveBeenCalled();
  });
});
