import { describe, expect, it, vi, beforeEach } from 'vitest';
import { WorkflowService } from './workflow.service';

describe('WorkflowService', () => {
  const userId = 'usr123';
  const workflowId = 'wfl123';
  const baseId = 'bse123';
  const runId = 'wrun123';

  const prismaService = {
    workflow: {
      findFirstOrThrow: vi.fn(),
      findMany: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    workflowRun: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirstOrThrow: vi.fn(),
    },
    workflowSnapshot: {
      aggregate: vi.fn(),
      create: vi.fn(),
    },
    $tx: vi.fn(),
  };

  const cls = {
    get: vi.fn((key: string) => (key === 'user.id' ? userId : undefined)),
  };

  let service: WorkflowService;

  beforeEach(() => {
    vi.clearAllMocks();
    prismaService.$tx.mockImplementation((fn) => fn(prismaService));
    service = new WorkflowService(prismaService as never, cls as never);
  });

  it('creates a pending button workflow run', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      activeSnapshotId: 'wsn123',
    });
    prismaService.workflowRun.create.mockResolvedValue({ id: runId });

    const result = await service.createButtonRun(workflowId, {
      tableId: 'tbl123',
      recordId: 'rec123',
    });

    expect(prismaService.workflowRun.create).toHaveBeenCalledWith({
      data: {
        workflowId,
        snapshotId: 'wsn123',
        triggerType: 'buttonClick',
        status: 'pending',
        input: {
          tableId: 'tbl123',
          recordId: 'rec123',
        },
        createdBy: userId,
      },
      select: { id: true },
    });
    expect(result).toEqual({ runId });
  });

  it('lists workflow runs after validating workflow ownership', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'Deploy',
      description: null,
      order: 1,
      isActive: true,
      activeSnapshotId: null,
      createdBy: userId,
      createdTime: new Date(),
      lastModifiedTime: null,
      lastModifiedBy: null,
      nodes: [],
    });
    prismaService.workflowRun.findMany.mockResolvedValue([{ id: runId, workflowId }]);

    const result = await service.getWorkflowRunList(baseId, workflowId);

    expect(prismaService.workflow.findFirstOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: workflowId, baseId, deletedTime: null } })
    );
    expect(prismaService.workflowRun.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { workflowId } })
    );
    expect(result).toEqual([{ id: runId, workflowId }]);
  });

  it('completes an empty workflow run skeleton', async () => {
    prismaService.workflowRun.create.mockReset();
    prismaService.workflowRun.findMany.mockReset();
    const update = vi.fn().mockResolvedValue({ id: runId });
    const runService = new WorkflowService(
      {
        ...prismaService,
        workflowRun: {
          ...prismaService.workflowRun,
          update,
        },
      } as never,
      cls as never
    );

    await runService.completeEmptyRun(runId);

    expect(update).toHaveBeenCalledWith({
      where: { id: runId },
      data: expect.objectContaining({
        status: 'completed',
        durationMs: 0,
        output: { skipped: true, reason: 'No workflow runner actions are implemented yet' },
      }),
    });
  });

  it('activates workflow by creating a new active snapshot', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'Deploy',
      description: null,
      order: 1,
      isActive: false,
      activeSnapshotId: null,
      createdBy: userId,
      createdTime: new Date(),
      lastModifiedTime: null,
      lastModifiedBy: null,
      nodes: [],
    });
    prismaService.workflowSnapshot.aggregate.mockResolvedValue({ _max: { version: 2 } });
    prismaService.workflowSnapshot.create.mockResolvedValue({ id: 'wsn123' });
    prismaService.workflow.update.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'Deploy',
      isActive: true,
      activeSnapshotId: 'wsn123',
    });

    const result = await service.activateWorkflow(baseId, workflowId);

    expect(prismaService.workflowSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workflowId,
          version: 3,
          createdBy: userId,
        }),
      })
    );
    expect(prismaService.workflow.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: workflowId },
        data: expect.objectContaining({ isActive: true, activeSnapshotId: 'wsn123' }),
      })
    );
    expect(result).toMatchObject({ isActive: true, activeSnapshotId: 'wsn123' });
  });
});
