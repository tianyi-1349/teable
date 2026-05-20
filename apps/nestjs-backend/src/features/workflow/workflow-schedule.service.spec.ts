import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IWorkflowScheduleFacade } from './workflow-schedule.facade';
import { WORKFLOW_SCHEDULE_JOB, WorkflowScheduleService } from './workflow-schedule.service';

describe('WorkflowScheduleService', () => {
  const workflowJobId = 'workflow:schedule:wfl123';
  const queue = {
    add: vi.fn(),
    getRepeatableJobs: vi.fn(),
    removeRepeatableByKey: vi.fn(),
  };

  const workflowService: IWorkflowScheduleFacade = {
    listActiveScheduleWorkflows: vi.fn(async () => []),
    getScheduleTriggerConfig: vi.fn(),
  };

  let service: WorkflowScheduleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkflowScheduleService(workflowService as never, queue as never);
  });

  it('registers interval schedule jobs for active workflows', async () => {
    vi.mocked(workflowService.getScheduleTriggerConfig).mockReturnValue({
      mode: 'interval',
      intervalSeconds: 30,
    });
    queue.getRepeatableJobs.mockResolvedValue([]);

    await service.syncWorkflowSchedule({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      nodes: [],
    } as never);

    expect(queue.add).toHaveBeenCalledWith(
      WORKFLOW_SCHEDULE_JOB,
      { workflowId: 'wfl123', baseId: 'bse123' },
      expect.objectContaining({
        jobId: workflowJobId,
        repeat: { every: 30000 },
      })
    );
  });

  it('removes existing repeatable jobs by workflow id', async () => {
    queue.getRepeatableJobs.mockResolvedValue([
      { id: 'workflow:schedule:wfl123', key: 'repeat-key-1' },
      { id: 'workflow:schedule:other', key: 'repeat-key-2' },
    ]);

    await service.removeWorkflowSchedule('wfl123');

    expect(queue.removeRepeatableByKey).toHaveBeenCalledWith('repeat-key-1');
    expect(queue.removeRepeatableByKey).toHaveBeenCalledTimes(1);
  });

  it('restores active schedules on module init', async () => {
    vi.mocked(workflowService.listActiveScheduleWorkflows).mockResolvedValue([
      {
        id: 'wfl123',
        baseId: 'bse123',
        name: 'workflow-1',
        order: 1,
        isActive: true,
        createdBy: 'usr123',
        createdTime: new Date(),
        nodes: [],
      },
    ]);
    vi.mocked(workflowService.getScheduleTriggerConfig).mockReturnValue({
      mode: 'cron',
      cron: '*/5 * * * *',
    });
    queue.getRepeatableJobs.mockResolvedValue([]);

    await service.onModuleInit();

    expect(queue.add).toHaveBeenCalledWith(
      WORKFLOW_SCHEDULE_JOB,
      { workflowId: 'wfl123', baseId: 'bse123' },
      expect.objectContaining({
        jobId: workflowJobId,
        repeat: { pattern: '*/5 * * * *' },
      })
    );
  });
});
