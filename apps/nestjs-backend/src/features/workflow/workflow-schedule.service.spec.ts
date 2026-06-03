import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IWorkflowScheduleFacade } from './workflow-schedule.facade';
import {
  getWorkflowScheduleNextRunList,
  getWorkflowScheduleNextRunAt,
  parseWorkflowCron,
  WORKFLOW_SCHEDULE_JOB,
  WorkflowScheduleService,
} from './workflow-schedule.service';

describe('WorkflowScheduleService', () => {
  const workflowJobId = 'workflow:schedule:wfl123';
  const workflowId = 'wfl123';
  const baseId = 'bse123';
  const nowIso = '2026-05-31T00:00:00.000Z';
  const oneTimeRunAtIso = '2026-05-31T00:10:00.000Z';
  const shanghaiTimezone = 'Asia/Shanghai';
  const queue = {
    add: vi.fn(),
    getRepeatableJobs: vi.fn(),
    remove: vi.fn(),
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
      id: workflowId,
      baseId,
      isActive: true,
      nodes: [],
    } as never);

    expect(queue.add).toHaveBeenCalledWith(
      WORKFLOW_SCHEDULE_JOB,
      expect.objectContaining({
        workflowId,
        baseId,
        timezone: 'UTC',
      }),
      expect.objectContaining({
        jobId: workflowJobId,
        repeat: { every: 30000 },
      })
    );
  });

  it('removes existing repeatable jobs by workflow id', async () => {
    queue.getRepeatableJobs.mockResolvedValue([
      { id: workflowJobId, key: 'repeat-key-1' },
      { id: 'workflow:schedule:other', key: 'repeat-key-2' },
    ]);

    await service.removeWorkflowSchedule(workflowId);

    expect(queue.removeRepeatableByKey).toHaveBeenCalledWith('repeat-key-1');
    expect(queue.remove).toHaveBeenCalledWith(workflowJobId);
    expect(queue.removeRepeatableByKey).toHaveBeenCalledTimes(1);
  });

  it('registers one-time schedule jobs with delay', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(nowIso));
    vi.mocked(workflowService.getScheduleTriggerConfig).mockReturnValue({
      mode: 'oneTime',
      runAt: '2026-05-31T00:05:00.000Z',
    });
    queue.getRepeatableJobs.mockResolvedValue([]);

    await service.syncWorkflowSchedule({
      id: workflowId,
      baseId,
      isActive: true,
      nodes: [],
    } as never);

    expect(queue.add).toHaveBeenCalledWith(
      WORKFLOW_SCHEDULE_JOB,
      expect.objectContaining({
        workflowId,
        baseId,
        nextRunAt: '2026-05-31T00:05:00.000Z',
      }),
      expect.objectContaining({
        jobId: workflowJobId,
        delay: 300000,
      })
    );

    vi.useRealTimers();
  });

  it('restores active schedules on module init', async () => {
    vi.mocked(workflowService.listActiveScheduleWorkflows).mockResolvedValue([
      {
        id: workflowId,
        baseId,
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
      timezone: shanghaiTimezone,
    });
    queue.getRepeatableJobs.mockResolvedValue([]);

    await service.onModuleInit();

    expect(queue.add).toHaveBeenCalledWith(
      WORKFLOW_SCHEDULE_JOB,
      expect.objectContaining({
        workflowId,
        baseId,
        timezone: shanghaiTimezone,
      }),
      expect.objectContaining({
        jobId: workflowJobId,
        repeat: { pattern: '*/5 * * * *', tz: shanghaiTimezone },
      })
    );
  });

  it('skips invalid cron and timezone configs', async () => {
    vi.mocked(workflowService.getScheduleTriggerConfig).mockReturnValue({
      mode: 'cron',
      cron: '*/0 * * * *',
      timezone: 'Invalid/Timezone',
    });
    queue.getRepeatableJobs.mockResolvedValue([]);

    await service.syncWorkflowSchedule({
      id: workflowId,
      baseId,
      isActive: true,
      nodes: [],
    } as never);

    expect(queue.add).not.toHaveBeenCalled();
  });

  it('computes observable next run values for one-time, interval and cron schedules', () => {
    expect(
      getWorkflowScheduleNextRunAt({ mode: 'oneTime', runAt: oneTimeRunAtIso }, new Date(nowIso))
    ).toBe(oneTimeRunAtIso);

    expect(
      getWorkflowScheduleNextRunAt(
        { mode: 'oneTime', runAt: '2026-05-30T23:59:00.000Z' },
        new Date(nowIso)
      )
    ).toBeUndefined();

    expect(
      getWorkflowScheduleNextRunAt({ mode: 'interval', intervalSeconds: 30 }, new Date(nowIso))
    ).toBe('2026-05-31T00:00:30.000Z');

    expect(
      getWorkflowScheduleNextRunAt(
        { mode: 'cron', cron: '30 8 * * *', timezone: shanghaiTimezone },
        new Date(nowIso)
      )
    ).toBe('2026-05-31T00:30:00.000Z');
  });

  it('computes bounded future run lists for schedule observability', () => {
    expect(
      getWorkflowScheduleNextRunList({ mode: 'interval', intervalSeconds: 30 }, new Date(nowIso), 3)
    ).toEqual(['2026-05-31T00:00:30.000Z', '2026-05-31T00:01:00.000Z', '2026-05-31T00:01:30.000Z']);

    expect(
      getWorkflowScheduleNextRunList(
        { mode: 'oneTime', runAt: oneTimeRunAtIso },
        new Date(nowIso),
        3
      )
    ).toEqual([oneTimeRunAtIso]);

    expect(
      getWorkflowScheduleNextRunList(
        { mode: 'cron', cron: '0 * * * *', timezone: 'UTC' },
        new Date(nowIso),
        2
      )
    ).toEqual(['2026-05-31T01:00:00.000Z', '2026-05-31T02:00:00.000Z']);
  });

  it('parses strict five-part workflow cron expressions', () => {
    expect(parseWorkflowCron('*/5 8-18 * * 1-5')).toBeDefined();
    expect(parseWorkflowCron('* * *')).toBeUndefined();
    expect(parseWorkflowCron('60 * * * *')).toBeUndefined();
  });
});
