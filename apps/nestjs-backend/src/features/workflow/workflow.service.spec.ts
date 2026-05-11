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
      deleteMany: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    workflowSnapshot: {
      aggregate: vi.fn(),
      create: vi.fn(),
    },
    tableMeta: {
      findFirst: vi.fn(),
    },
    $tx: vi.fn(),
  };

  const cls = {
    get: vi.fn((key: string) => (key === 'user.id' ? userId : undefined)),
  };
  const aiService = {
    generateText: vi.fn(),
  };
  const recordService = {
    filterRecordIdsByFilter: vi.fn(),
  };

  let service: WorkflowService;

  beforeEach(() => {
    vi.clearAllMocks();
    prismaService.$tx.mockImplementation((fn) => fn(prismaService));
    service = new WorkflowService(
      prismaService as never,
      cls as never,
      aiService as never,
      recordService as never
    );
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
        input: expect.objectContaining({
          tableId: 'tbl123',
          recordId: 'rec123',
          __automationContext: expect.objectContaining({
            source: 'automation',
            workflowId,
          }),
        }),
        createdBy: userId,
      },
      select: { id: true },
    });
    expect(result).toEqual({ runId });
  });

  it('creates workflow with trigger and initial actions', async () => {
    prismaService.workflow.aggregate.mockResolvedValue({ _max: { order: 0 } });
    prismaService.workflow.create.mockResolvedValue({ id: workflowId });

    const result = await service.createWorkflow(baseId, {
      name: 'Record trigger',
      trigger: { type: 'recordCreated', config: { tableId: 'tbl123' } },
      actions: [{ type: 'runScript', config: { script: 'return input;' } }],
    });

    expect(prismaService.workflowNode.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workflowId,
          nodeType: 'trigger',
          kind: 'recordCreated',
          nextNodeId: expect.any(String),
        }),
      })
    );
    expect(prismaService.workflowNode.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            workflowId,
            nodeType: 'action',
            kind: 'runScript',
            parentNodeId: expect.any(String),
            config: { script: 'return input;' },
          }),
        ],
      })
    );
    expect(result).toEqual({ id: workflowId });
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

  it('updates workflow draft nodes without changing active snapshot', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({ id: workflowId });
    prismaService.workflowNode.upsert.mockResolvedValue({ id: 'wa123' });
    prismaService.workflow.update.mockResolvedValue({ id: workflowId, name: 'Draft' });

    const result = await service.updateWorkflow(baseId, workflowId, {
      name: 'Draft',
      nodes: [
        {
          id: 'wa123',
          nodeType: 'action',
          kind: 'runScript',
          config: { script: 'return { ok: true };' },
        },
      ],
    });

    expect(prismaService.workflowNode.upsert).toHaveBeenCalledWith({
      where: { id: 'wa123' },
      create: expect.objectContaining({
        id: 'wa123',
        workflowId,
        nodeType: 'action',
        kind: 'runScript',
        config: { script: 'return { ok: true };' },
        createdBy: userId,
        lastModifiedBy: userId,
      }),
      update: expect.objectContaining({
        workflowId,
        nodeType: 'action',
        kind: 'runScript',
        config: { script: 'return { ok: true };' },
        lastModifiedBy: userId,
      }),
    });
    expect(prismaService.workflowNode.deleteMany).toHaveBeenCalledWith({
      where: {
        workflowId,
        id: { notIn: ['wa123'] },
      },
    });
    expect(prismaService.workflow.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: workflowId },
        data: expect.objectContaining({ name: 'Draft', lastModifiedBy: userId }),
      })
    );
    expect(result).toEqual({ id: workflowId, name: 'Draft' });
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
      aiService as never,
      recordService as never
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
      nodes: [
        {
          id: 'wtr123',
          workflowId,
          nodeType: 'trigger',
          kind: 'buttonClick',
          config: {},
        },
        {
          id: 'wa123',
          workflowId,
          nodeType: 'action',
          kind: 'runScript',
          config: { script: 'return input;' },
        },
      ],
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

  it('rejects activation without a trigger', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'No trigger',
      description: null,
      order: 1,
      isActive: false,
      activeSnapshotId: null,
      createdBy: userId,
      createdTime: new Date(),
      lastModifiedTime: null,
      lastModifiedBy: null,
      nodes: [
        {
          id: 'wa123',
          workflowId,
          nodeType: 'action',
          kind: 'runScript',
          config: { script: 'return input;' },
        },
      ],
    });

    await expect(service.activateWorkflow(baseId, workflowId)).rejects.toThrow(
      'Workflow requires a trigger before activation'
    );
    expect(prismaService.workflowSnapshot.create).not.toHaveBeenCalled();
  });

  it('rejects activation without actions', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'No action',
      description: null,
      order: 1,
      isActive: false,
      activeSnapshotId: null,
      createdBy: userId,
      createdTime: new Date(),
      lastModifiedTime: null,
      lastModifiedBy: null,
      nodes: [
        {
          id: 'wtr123',
          workflowId,
          nodeType: 'trigger',
          kind: 'recordCreated',
          config: {},
        },
      ],
    });

    await expect(service.activateWorkflow(baseId, workflowId)).rejects.toThrow(
      'Workflow requires at least one action before activation'
    );
    expect(prismaService.workflowSnapshot.create).not.toHaveBeenCalled();
  });

  it('rejects activation with invalid action config', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'Invalid action',
      description: null,
      order: 1,
      isActive: false,
      activeSnapshotId: null,
      createdBy: userId,
      createdTime: new Date(),
      lastModifiedTime: null,
      lastModifiedBy: null,
      nodes: [
        {
          id: 'wtr123',
          workflowId,
          nodeType: 'trigger',
          kind: 'recordCreated',
          config: {},
        },
        {
          id: 'wa123',
          workflowId,
          nodeType: 'action',
          kind: 'aiGenerate',
          config: {},
        },
      ],
    });

    await expect(service.activateWorkflow(baseId, workflowId)).rejects.toThrow(
      'Workflow action aiGenerate is not runnable'
    );
    expect(prismaService.workflowSnapshot.create).not.toHaveBeenCalled();
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
          input: expect.objectContaining({
            manual: true,
            __automationContext: expect.objectContaining({
              source: 'automation',
              workflowId,
              baseId,
            }),
          }),
        }),
      })
    );
    expect(result).toMatchObject({ id: runId, status: 'pending' });
  });

  it('creates active record trigger runs for matching table', async () => {
    prismaService.tableMeta.findFirst.mockResolvedValue({ baseId });
    prismaService.workflow.findMany.mockResolvedValue([
      {
        id: workflowId,
        activeSnapshotId: 'wsn123',
        nodes: [{ config: { tableId: 'tbl123' } }],
      },
    ]);
    prismaService.workflowRun.create.mockResolvedValue({ id: runId, workflowId });

    const input = { tableId: 'tbl123', record: { id: 'rec123', fields: {} } };
    const result = await service.createRecordTriggerRuns('tbl123', 'recordCreated', input);

    expect(prismaService.workflow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          baseId,
          isActive: true,
          nodes: { some: { nodeType: 'trigger', kind: 'recordCreated' } },
        }),
      })
    );
    expect(prismaService.workflowRun.create).toHaveBeenCalledWith({
      data: {
        workflowId,
        snapshotId: 'wsn123',
        triggerType: 'recordCreated',
        status: 'pending',
        input: expect.objectContaining({
          ...input,
          __automationContext: expect.objectContaining({
            source: 'automation',
            workflowId,
            baseId,
          }),
        }),
        createdBy: userId,
      },
      select: { id: true, workflowId: true },
    });
    expect(result).toEqual([{ runId, workflowId }]);
  });

  it('creates record trigger runs only when the trigger filter matches', async () => {
    const filter = {
      conjunction: 'and' as const,
      filterSet: [{ fieldId: 'fldStatus', operator: 'is', value: 'Open' }],
    };
    prismaService.tableMeta.findFirst.mockResolvedValue({ baseId });
    prismaService.workflow.findMany.mockResolvedValue([
      {
        id: workflowId,
        activeSnapshotId: 'wsn123',
        nodes: [{ config: { tableId: 'tbl123', filter } }],
      },
    ]);
    recordService.filterRecordIdsByFilter.mockResolvedValue(['rec123']);
    prismaService.workflowRun.create.mockResolvedValue({ id: runId, workflowId });

    const input = { tableId: 'tbl123', record: { id: 'rec123', fields: {} } };
    const result = await service.createRecordTriggerRuns('tbl123', 'recordCreated', input);

    expect(recordService.filterRecordIdsByFilter).toHaveBeenCalledWith(
      'tbl123',
      ['rec123'],
      filter
    );
    expect(prismaService.workflowRun.create).toHaveBeenCalled();
    expect(result).toEqual([{ runId, workflowId }]);
  });

  it('does not create record trigger runs when the trigger filter does not match', async () => {
    const filter = {
      conjunction: 'and' as const,
      filterSet: [{ fieldId: 'fldStatus', operator: 'is', value: 'Open' }],
    };
    prismaService.tableMeta.findFirst.mockResolvedValue({ baseId });
    prismaService.workflow.findMany.mockResolvedValue([
      {
        id: workflowId,
        activeSnapshotId: 'wsn123',
        nodes: [{ config: { tableId: 'tbl123', filter } }],
      },
    ]);
    recordService.filterRecordIdsByFilter.mockResolvedValue([]);

    const result = await service.createRecordTriggerRuns('tbl123', 'recordUpdated', {
      tableId: 'tbl123',
      record: { id: 'rec123', fields: {} },
    });

    expect(prismaService.workflowRun.create).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('does not create record trigger runs when trigger table does not match', async () => {
    prismaService.tableMeta.findFirst.mockResolvedValue({ baseId });
    prismaService.workflow.findMany.mockResolvedValue([
      {
        id: workflowId,
        activeSnapshotId: 'wsn123',
        nodes: [{ config: { tableId: 'tbl999' } }],
      },
    ]);

    const result = await service.createRecordTriggerRuns('tbl123', 'recordUpdated', {
      tableId: 'tbl123',
    });

    expect(prismaService.workflowRun.create).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('does not create record trigger runs when table is missing', async () => {
    prismaService.tableMeta.findFirst.mockResolvedValue(null);

    const result = await service.createRecordTriggerRuns('tbl123', 'recordCreated', {
      tableId: 'tbl123',
    });

    expect(prismaService.workflow.findMany).not.toHaveBeenCalled();
    expect(prismaService.workflowRun.create).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
