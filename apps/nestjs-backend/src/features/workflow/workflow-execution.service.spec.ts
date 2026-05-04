import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkflowExecutionService } from './workflow-execution.service';

describe('WorkflowExecutionService', () => {
  const workflowExecution = {
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  };

  const prismaService = {
    txClient: vi.fn(() => ({ workflowExecution })),
    workflowExecution,
  };

  let service: WorkflowExecutionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkflowExecutionService(prismaService as never);
  });

  it('should list executions with parsed payload and next cursor', async () => {
    workflowExecution.findMany.mockResolvedValue([
      {
        id: 'exe3',
        workflowId: 'wfl1',
        baseId: 'bse1',
        triggerType: 'buttonClick',
        status: 'succeeded',
        eventPayload: JSON.stringify({ recordId: 'rec3' }),
        steps: JSON.stringify([
          {
            id: 'step-1',
            index: 0,
            actionType: 'createRecord',
            status: 'succeeded',
            startedTime: '2026-05-02T10:00:00.000Z',
            completedTime: '2026-05-02T10:00:01.000Z',
            errorMessage: null,
          },
        ]),
        actionCount: 2,
        errorMessage: null,
        createdBy: null,
        createdTime: new Date('2026-05-02T10:00:00.000Z'),
        completedTime: new Date('2026-05-02T10:00:01.000Z'),
      },
      {
        id: 'exe2',
        workflowId: 'wfl1',
        baseId: 'bse1',
        triggerType: 'buttonClick',
        status: 'failed',
        eventPayload: JSON.stringify({ recordId: 'rec2' }),
        steps: null,
        actionCount: 2,
        errorMessage: 'boom',
        createdBy: 'usr1',
        createdTime: new Date('2026-05-02T09:00:00.000Z'),
        completedTime: new Date('2026-05-02T09:00:01.000Z'),
      },
      {
        id: 'exe1',
        workflowId: 'wfl1',
        baseId: 'bse1',
        triggerType: 'buttonClick',
        status: 'running',
        eventPayload: JSON.stringify({ recordId: 'rec1' }),
        steps: null,
        actionCount: 1,
        errorMessage: null,
        createdBy: 'usr2',
        createdTime: new Date('2026-05-02T08:00:00.000Z'),
        completedTime: null,
      },
    ]);

    const result = await service.getExecutionList('bse1', 'wfl1', { take: 2 });

    expect(workflowExecution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 3,
        cursor: undefined,
        skip: 0,
        orderBy: { id: 'desc' },
      })
    );
    expect(result.executions).toHaveLength(2);
    expect(result.executions[0]).toMatchObject({
      id: 'exe3',
      eventPayload: { recordId: 'rec3' },
      steps: [
        expect.objectContaining({
          id: 'step-1',
          actionType: 'createRecord',
          status: 'succeeded',
        }),
      ],
    });
    expect(result.nextCursor).toBe('exe1');
  });

  it('should persist step logs as JSON', async () => {
    await service.updateExecutionSteps('exe1', [
      {
        id: 'step-1',
        index: 0,
        actionType: 'httpRequest',
        status: 'running',
        startedTime: '2026-05-02T10:00:00.000Z',
        completedTime: null,
        errorMessage: null,
      },
    ]);

    expect(workflowExecution.update).toHaveBeenCalledWith({
      where: { id: 'exe1' },
      data: {
        steps: JSON.stringify([
          {
            id: 'step-1',
            index: 0,
            actionType: 'httpRequest',
            status: 'running',
            startedTime: '2026-05-02T10:00:00.000Z',
            completedTime: null,
            errorMessage: null,
          },
        ]),
      },
    });
  });

  it('should skip the cursor item on later pages', async () => {
    workflowExecution.findMany.mockResolvedValue([]);

    await service.getExecutionList('bse1', 'wfl1', { take: 2, cursor: 'exe2' });

    expect(workflowExecution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: 'exe2' },
        skip: 1,
      })
    );
  });
});
