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
    workflowNode: {
      create: vi.fn(),
      createMany: vi.fn(),
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
  const aiService = {
    generateText: vi.fn(),
  };

  let service: WorkflowService;

  beforeEach(() => {
    vi.clearAllMocks();
    prismaService.$tx.mockImplementation((fn) => fn(prismaService));
    service = new WorkflowService(prismaService as never, cls as never, aiService as never);
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
      cls as never,
      aiService as never
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

  it('creates an inactive AI workflow draft for review', async () => {
    prismaService.workflow.aggregate.mockResolvedValue({ _max: { order: 1 } });
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'AI draft',
      description: 'Draft',
      order: 2,
      isActive: false,
      activeSnapshotId: null,
      createdBy: userId,
      createdTime: new Date(),
      lastModifiedTime: null,
      lastModifiedBy: userId,
      nodes: [],
    });
    aiService.generateText.mockResolvedValue(
      JSON.stringify({ name: 'AI draft', description: 'Draft', script: 'return { ok: true };' })
    );

    const result = await service.aiCreateWorkflowDraft(baseId, {
      prompt: 'When a button is clicked, summarize the record',
      tableId: 'tbl123',
      fieldId: 'fld123',
    });

    expect(prismaService.workflow.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'AI draft' }),
      })
    );
    expect(prismaService.workflowNode.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ nodeType: 'trigger', kind: 'buttonClick' }),
          expect.objectContaining({
            nodeType: 'action',
            kind: 'runScript',
            config: { script: 'return { ok: true };', source: 'aiDraft' },
          }),
        ]),
      })
    );
    expect(result).toMatchObject({ id: workflowId, isActive: false });
  });

  it('creates a manual test run with a temporary snapshot for inactive draft', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'Draft',
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
    prismaService.workflowSnapshot.aggregate.mockResolvedValue({ _max: { version: 1 } });
    prismaService.workflowSnapshot.create.mockResolvedValue({ id: 'wsn-test' });
    prismaService.workflowRun.create.mockResolvedValue({
      id: runId,
      workflowId,
      snapshotId: 'wsn-test',
      triggerType: 'manualTest',
      status: 'pending',
    });

    const result = await service.createTestRun(baseId, workflowId, { manual: true });

    expect(prismaService.workflowSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ workflowId, version: 2 }),
      })
    );
    expect(prismaService.workflowRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workflowId,
          snapshotId: 'wsn-test',
          triggerType: 'manualTest',
          status: 'pending',
          input: { manual: true },
        }),
      })
    );
    expect(result).toMatchObject({ id: runId, status: 'pending' });
  });
});
