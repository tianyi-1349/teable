/* eslint-disable sonarjs/no-duplicate-string */
import { HttpErrorCode } from '@teable/core';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createWorkflowWebhookSignature } from './workflow-webhook-signature';
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
    createWorkflowDraft: vi.fn(),
  };
  const recordService = {
    filterRecordIdsByFilter: vi.fn(),
  };
  const cacheService = {
    incr: vi.fn(),
  };
  const thresholdConfig = {
    webhook: {
      workflowRateLimit: 2,
    },
  };
  const workflowScheduleService = {
    syncWorkflowSchedule: vi.fn(),
    removeWorkflowSchedule: vi.fn(),
  };

  let service: WorkflowService;

  beforeEach(() => {
    vi.clearAllMocks();
    prismaService.$tx.mockImplementation((fn) => fn(prismaService));
    service = new WorkflowService(
      prismaService as never,
      cls as never,
      aiService as never,
      recordService as never,
      cacheService as never,
      thresholdConfig as never,
      workflowScheduleService as never
    );
  });

  it('creates a pending button workflow run', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [{ kind: 'buttonClick' }],
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
  }, 10000);

  it('creates a pending webhook workflow run', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [{ kind: 'webhook', config: {} }],
    });
    cacheService.incr.mockResolvedValue(1);
    prismaService.workflowRun.create.mockResolvedValue({ id: runId });

    const result = await service.createWebhookRun(workflowId, {
      message: 'hello',
    });

    expect(prismaService.workflowRun.create).toHaveBeenCalledWith({
      data: {
        workflowId,
        snapshotId: 'wsn123',
        triggerType: 'webhook',
        status: 'pending',
        input: expect.objectContaining({
          message: 'hello',
          __automationContext: expect.objectContaining({
            source: 'automation',
            workflowId,
            baseId,
            webhook: expect.objectContaining({
              bodySizeBytes: 19,
              signatureRequired: false,
              signatureVerified: false,
              timestampHeaderPresent: false,
              rateLimit: 2,
            }),
          }),
        }),
        createdBy: userId,
      },
      select: { id: true },
    });
    expect(result).toEqual({ runId });
  });

  it('records webhook signature audit metadata for successful signed runs', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [{ kind: 'webhook', config: { signatureSecret: 'sig-secret' } }],
    });
    cacheService.incr.mockResolvedValue(1);
    prismaService.workflowRun.create.mockResolvedValue({ id: runId });
    const rawBody = '{"message":"hello"}';
    const timestamp = `${Math.floor(Date.now() / 1000)}`;
    const signature = createWorkflowWebhookSignature({
      secret: 'sig-secret',
      timestamp,
      rawBody,
    });

    await service.createWebhookRun(
      workflowId,
      { message: 'hello' },
      { signature, timestamp, rawBody }
    );

    expect(prismaService.workflowRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          input: expect.objectContaining({
            __automationContext: expect.objectContaining({
              webhook: expect.objectContaining({
                signatureRequired: true,
                signatureVerified: true,
                timestampHeaderPresent: true,
              }),
            }),
          }),
        }),
      })
    );
  });

  it('accepts custom webhook signature and timestamp headers from trigger config', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [
        {
          kind: 'webhook',
          config: {
            signatureSecret: 'sig-secret',
            signatureHeader: 'X-Custom-Signature',
            timestampHeader: 'X-Custom-Timestamp',
          },
        },
      ],
    });
    cacheService.incr.mockResolvedValue(1);
    prismaService.workflowRun.create.mockResolvedValue({ id: runId });
    const rawBody = '{"message":"hello"}';
    const timestamp = `${Math.floor(Date.now() / 1000)}`;
    const signature = createWorkflowWebhookSignature({
      secret: 'sig-secret',
      timestamp,
      rawBody,
    });
    const signatureHeader = 'x-custom-signature';
    const timestampHeader = 'x-custom-timestamp';

    await service.createWebhookRun(
      workflowId,
      { message: 'hello' },
      {
        rawBody,
        headers: {
          [signatureHeader]: `sha256=${signature}`,
          [timestampHeader]: timestamp,
        },
      }
    );

    expect(prismaService.workflowRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          input: expect.objectContaining({
            __automationContext: expect.objectContaining({
              webhook: expect.objectContaining({
                signatureRequired: true,
                signatureVerified: true,
                timestampHeaderPresent: true,
                signatureHeader,
                timestampHeader,
              }),
            }),
          }),
        }),
      })
    );
  });

  it('rejects webhook run when secret does not match trigger config', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [{ kind: 'webhook', config: { secret: 'expected-secret' } }],
    });

    await expect(
      service.createWebhookRun(workflowId, { message: 'hello' }, { secret: 'wrong-secret' })
    ).rejects.toMatchObject({
      code: HttpErrorCode.UNAUTHORIZED,
      message: 'Invalid webhook secret',
    });
  });

  it('rejects webhook run when workflow rate limit is exceeded', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [{ kind: 'webhook', config: {} }],
    });
    cacheService.incr.mockResolvedValue(3);

    await expect(service.createWebhookRun(workflowId, { message: 'hello' })).rejects.toMatchObject({
      code: HttpErrorCode.TOO_MANY_REQUESTS,
      message: 'Webhook rate limit exceeded',
    });
  });

  it('creates a pending schedule workflow run', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [{ kind: 'schedule' }],
    });
    prismaService.workflowRun.create.mockResolvedValue({ id: runId });

    const result = await service.createScheduleRun(workflowId, {
      tick: 'manual',
    });

    expect(prismaService.workflowRun.create).toHaveBeenCalledWith({
      data: {
        workflowId,
        snapshotId: 'wsn123',
        triggerType: 'schedule',
        status: 'pending',
        input: expect.objectContaining({
          tick: 'manual',
          __automationContext: expect.objectContaining({
            source: 'automation',
            workflowId,
            baseId,
          }),
        }),
        createdBy: userId,
      },
      select: { id: true },
    });
    expect(result).toEqual({ runId });
  });

  it('creates a pending form submitted workflow run', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [{ kind: 'formSubmitted' }],
    });
    prismaService.workflowRun.create.mockResolvedValue({ id: runId });

    const result = await service.createFormSubmittedRun(workflowId, {
      submissionId: 'sub123',
    });

    expect(prismaService.workflowRun.create).toHaveBeenCalledWith({
      data: {
        workflowId,
        snapshotId: 'wsn123',
        triggerType: 'formSubmitted',
        status: 'pending',
        input: expect.objectContaining({
          submissionId: 'sub123',
          __automationContext: expect.objectContaining({
            source: 'automation',
            workflowId,
            baseId,
          }),
        }),
        createdBy: userId,
      },
      select: { id: true },
    });
    expect(result).toEqual({ runId });
  });

  it('creates a pending email received workflow run', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [{ kind: 'emailReceived' }],
    });
    prismaService.workflowRun.create.mockResolvedValue({ id: runId });

    const result = await service.createEmailReceivedRun(workflowId, {
      subject: 'New ticket',
      from: 'ops@example.com',
    });

    expect(prismaService.workflowRun.create).toHaveBeenCalledWith({
      data: {
        workflowId,
        snapshotId: 'wsn123',
        triggerType: 'emailReceived',
        status: 'pending',
        input: expect.objectContaining({
          subject: 'New ticket',
          from: 'ops@example.com',
          __automationContext: expect.objectContaining({
            source: 'automation',
            workflowId,
            baseId,
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

  it('applies workflow run trigger and status filters at query time', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      nodes: [],
    });
    prismaService.workflowRun.findMany.mockResolvedValue([{ id: runId, workflowId }]);

    await service.getWorkflowRunList(baseId, workflowId, {
      triggerType: 'schedule',
      status: 'success',
    });

    expect(prismaService.workflowRun.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { workflowId, triggerType: 'schedule', status: 'success' },
      })
    );
  });

  it('filters workflow run list by webhook audit metadata', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      nodes: [],
    });
    prismaService.workflowRun.findMany.mockResolvedValue([
      {
        id: 'run-with-audit',
        workflowId,
        input: {
          __automationContext: {
            webhook: { signatureVerified: true, rateLimit: 0 },
          },
        },
      },
      {
        id: 'run-without-audit-match',
        workflowId,
        input: {
          __automationContext: {
            webhook: { signatureVerified: false, rateLimit: 0 },
          },
        },
      },
    ]);

    const result = await service.getWorkflowRunList(baseId, workflowId, {
      webhookAudit: 'signatureVerified',
    });

    expect(result).toEqual([
      expect.objectContaining({
        id: 'run-with-audit',
      }),
    ]);
  });

  it('summarizes workflow webhook audit metadata for recent runs', async () => {
    const latestWebhookRunAt = new Date('2026-06-02T08:30:00.000Z');
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      nodes: [],
    });
    prismaService.workflowRun.findMany.mockResolvedValue([
      {
        triggerType: 'webhook',
        startedTime: latestWebhookRunAt,
        input: {
          __automationContext: {
            webhook: {
              signatureRequired: true,
              signatureVerified: true,
              timestampHeaderPresent: true,
              bodySizeBytes: 128,
              rateLimit: 60,
            },
          },
        },
      },
      {
        triggerType: 'webhook',
        startedTime: new Date('2026-06-02T08:00:00.000Z'),
        input: {
          __automationContext: {
            webhook: {
              signatureRequired: true,
              signatureVerified: false,
              timestampHeaderPresent: false,
              bodySizeBytes: 32,
              rateLimit: 0,
            },
          },
        },
      },
      {
        triggerType: 'schedule',
        startedTime: new Date('2026-06-02T07:30:00.000Z'),
        input: {},
      },
    ]);

    const result = await service.getWorkflowRunSummary(baseId, workflowId);

    expect(prismaService.workflowRun.findMany).toHaveBeenCalledWith({
      where: { workflowId },
      select: {
        triggerType: true,
        input: true,
        startedTime: true,
      },
      orderBy: { startedTime: 'desc' },
      take: 100,
    });
    expect(result).toEqual({
      totalRuns: 3,
      webhookRuns: 2,
      signatureRequiredRuns: 2,
      signatureVerifiedRuns: 1,
      signatureFailedRuns: 1,
      timestampHeaderPresentRuns: 1,
      timestampHeaderMissingRuns: 1,
      rateLimitedRuns: 1,
      averageBodySizeBytes: 80,
      maxBodySizeBytes: 128,
      latestWebhookRunAt,
    });
  });

  it('lists paginated workflow webhook audit metadata', async () => {
    const firstStartedTime = new Date('2026-06-02T08:30:00.000Z');
    const secondStartedTime = new Date('2026-06-02T08:00:00.000Z');
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      nodes: [],
    });
    prismaService.workflowRun.findMany.mockResolvedValue([
      {
        id: 'webhook-run-1',
        status: 'succeeded',
        startedTime: firstStartedTime,
        input: {
          __automationContext: {
            webhook: {
              signatureHeader: 'x-custom-signature',
              timestampHeader: 'x-custom-timestamp',
              signatureRequired: true,
              signatureVerified: true,
              timestampHeaderPresent: true,
              bodySizeBytes: 128,
              rateLimit: 60,
            },
          },
        },
      },
      {
        id: 'webhook-run-2',
        status: 'failed',
        startedTime: secondStartedTime,
        input: {
          __automationContext: {
            webhook: {
              signatureRequired: true,
              signatureVerified: false,
              timestampHeaderPresent: false,
              rateLimit: 0,
            },
          },
        },
      },
    ]);

    const result = await service.getWorkflowWebhookAuditList(baseId, workflowId, {
      take: 1,
      cursor: 'previous-run',
    });

    expect(prismaService.workflowRun.findMany).toHaveBeenCalledWith({
      where: { workflowId, triggerType: 'webhook' },
      select: {
        id: true,
        status: true,
        startedTime: true,
        input: true,
      },
      orderBy: { startedTime: 'desc' },
      cursor: { id: 'previous-run' },
      skip: 1,
      take: 2,
    });
    expect(result).toEqual({
      items: [
        {
          runId: 'webhook-run-1',
          status: 'succeeded',
          startedTime: firstStartedTime,
          signatureHeader: 'x-custom-signature',
          timestampHeader: 'x-custom-timestamp',
          signatureRequired: true,
          signatureVerified: true,
          timestampHeaderPresent: true,
          bodySizeBytes: 128,
          rateLimit: 60,
        },
      ],
      nextCursor: 'webhook-run-2',
    });
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
      recordService as never,
      cacheService as never,
      thresholdConfig as never,
      workflowScheduleService as never
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
          kind: 'aiGenerate',
          config: { prompt: 'Summarize {{ input }}' },
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
    expect(workflowScheduleService.syncWorkflowSchedule).toHaveBeenCalledWith(
      expect.objectContaining({ id: workflowId, isActive: false })
    );
    expect(result).toMatchObject({ isActive: true, activeSnapshotId: 'wsn123' });
  });

  it('applies draft updates by refreshing the active snapshot', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'Deploy',
      description: null,
      order: 1,
      isActive: true,
      activeSnapshotId: 'wsn-old',
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
          kind: 'aiGenerate',
          config: { prompt: 'Summarize {{ input }}' },
        },
      ],
    });
    prismaService.workflowSnapshot.aggregate.mockResolvedValue({ _max: { version: 3 } });
    prismaService.workflowSnapshot.create.mockResolvedValue({ id: 'wsn124' });
    prismaService.workflow.update.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'Deploy',
      isActive: true,
      activeSnapshotId: 'wsn124',
    });

    const result = await service.applyUpdateWorkflow(baseId, workflowId);

    expect(prismaService.workflowSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workflowId,
          version: 4,
          createdBy: userId,
        }),
      })
    );
    expect(prismaService.workflow.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: workflowId },
        data: expect.objectContaining({ isActive: true, activeSnapshotId: 'wsn124' }),
      })
    );
    expect(workflowScheduleService.syncWorkflowSchedule).toHaveBeenCalledWith(
      expect.objectContaining({ id: workflowId, isActive: true })
    );
    expect(result).toMatchObject({ isActive: true, activeSnapshotId: 'wsn124' });
  });

  it('removes schedule registration when workflow is deactivated', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'Schedule workflow',
      description: null,
      order: 1,
      isActive: true,
      activeSnapshotId: 'wsn123',
      createdBy: userId,
      createdTime: new Date(),
      lastModifiedTime: null,
      lastModifiedBy: null,
      nodes: [
        {
          id: 'wtr123',
          workflowId,
          nodeType: 'trigger',
          kind: 'schedule',
          config: { mode: 'interval', intervalSeconds: 60 },
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
    prismaService.workflow.update.mockResolvedValue({ id: workflowId, isActive: false });

    await service.deactivateWorkflow(baseId, workflowId);

    expect(workflowScheduleService.removeWorkflowSchedule).toHaveBeenCalledWith(workflowId);
  });

  it('parses schedule trigger config from workflow nodes', () => {
    const config = service.getScheduleTriggerConfig({
      nodes: [
        {
          id: 'wtr123',
          workflowId,
          nodeType: 'trigger',
          kind: 'schedule',
          config: {
            mode: 'oneTime',
            cron: '*/5 * * * *',
            timezone: 'Asia/Shanghai',
            runAt: '2026-05-31T00:10:00.000Z',
          },
        },
      ],
    } as never);

    expect(config).toEqual({
      mode: 'oneTime',
      cron: '*/5 * * * *',
      intervalSeconds: undefined,
      timezone: 'Asia/Shanghai',
      runAt: '2026-05-31T00:10:00.000Z',
    });
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

  it('rejects activation when action capability is marked unrunnable', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'Sandboxed script',
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
          kind: 'runScript',
          config: { script: 'return input;' },
        },
      ],
    });

    prismaService.workflowSnapshot.aggregate.mockResolvedValue({ _max: { version: 1 } });
    prismaService.workflowSnapshot.create.mockResolvedValue({ id: 'wsn-run-script' });
    prismaService.workflow.update.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'Sandboxed script',
      isActive: true,
      activeSnapshotId: 'wsn-run-script',
    });

    const result = await service.activateWorkflow(baseId, workflowId);

    expect(prismaService.workflowSnapshot.create).toHaveBeenCalled();
    expect(result).toMatchObject({ isActive: true, activeSnapshotId: 'wsn-run-script' });
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
    aiService.createWorkflowDraft.mockResolvedValue(
      JSON.stringify({
        name: 'AI draft',
        description: 'Draft',
        triggerType: 'buttonClick',
        actionKind: 'runScript',
        actionConfig: { script: 'return { ok: true };' },
      })
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

  it('creates AI draft with generated trigger and non-script action config', async () => {
    prismaService.workflow.aggregate.mockResolvedValue({ _max: { order: 1 } });
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'AI webhook draft',
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
    aiService.createWorkflowDraft.mockResolvedValue(
      JSON.stringify({
        name: 'AI webhook draft',
        description: 'Draft',
        triggerType: 'webhook',
        triggerConfig: { bodySizeLimitKb: 16 },
        actionKind: 'aiGenerate',
        actionConfig: { prompt: 'Summarize {{ input }}' },
      })
    );

    await service.aiCreateWorkflowDraft(baseId, {
      prompt: 'Summarize webhook payloads',
      triggerType: 'webhook',
      preferActionKind: 'aiGenerate',
    });

    expect(prismaService.workflowNode.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ nodeType: 'trigger', kind: 'webhook' }),
          expect.objectContaining({
            nodeType: 'action',
            kind: 'aiGenerate',
            config: { prompt: 'Summarize {{ input }}', source: 'aiDraft' },
          }),
        ]),
      })
    );
  });

  it('creates AI draft with multiple generated actions and field mappings', async () => {
    prismaService.workflow.aggregate.mockResolvedValue({ _max: { order: 1 } });
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      name: 'AI multi-step draft',
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
    aiService.createWorkflowDraft.mockResolvedValue(
      JSON.stringify({
        name: 'AI multi-step draft',
        description: 'Draft',
        triggerType: 'recordCreated',
        fieldMappings: { recordId: '{{ input.record.id }}' },
        testPlan: {
          input: { record: { id: 'rec1' }, tableId: 'tbl1', items: [1, 2] },
          expectedActionKinds: ['queryRecords', 'loop'],
          activationChecks: ['Confirm query table mapping', 'Confirm loop maxIterations'],
        },
        actions: [
          { kind: 'queryRecords', config: { tableId: '{{ input.tableId }}', take: 5 } },
          { kind: 'loop', config: { itemsPath: '{{ input.items }}', maxIterations: 10 } },
        ],
      })
    );

    await service.aiCreateWorkflowDraft(baseId, {
      prompt: 'When a record is created, query recent records and loop through items',
      triggerType: 'recordCreated',
      preferActionKind: 'queryRecords',
    });

    expect(prismaService.workflowNode.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            nodeType: 'trigger',
            kind: 'recordCreated',
            config: expect.objectContaining({
              fieldMappings: { recordId: '{{ input.record.id }}' },
              testPlan: expect.objectContaining({
                expectedActionKinds: ['queryRecords', 'loop'],
              }),
            }),
          }),
          expect.objectContaining({ nodeType: 'action', kind: 'queryRecords' }),
          expect.objectContaining({ nodeType: 'action', kind: 'loop' }),
        ]),
      })
    );
  });

  it('rejects webhook run when signature is invalid', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [{ kind: 'webhook', config: { signatureSecret: 'sig-secret' } }],
    });

    await expect(
      service.createWebhookRun(
        workflowId,
        { message: 'hello' },
        {
          signature: 'wrong',
          timestamp: `${Math.floor(Date.now() / 1000)}`,
          rawBody: '{"message":"hello"}',
        }
      )
    ).rejects.toMatchObject({
      code: HttpErrorCode.UNAUTHORIZED,
      message: 'Invalid webhook signature',
    });
  });

  it('rejects webhook run when timestamp is expired', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [
        {
          kind: 'webhook',
          config: { signatureSecret: 'sig-secret', timestampToleranceSeconds: 60 },
        },
      ],
    });

    const rawBody = '{"message":"hello"}';
    const expiredTimestamp = `${Math.floor(Date.now() / 1000) - 3600}`;
    const signature = createWorkflowWebhookSignature({
      secret: 'sig-secret',
      timestamp: expiredTimestamp,
      rawBody,
    });

    await expect(
      service.createWebhookRun(
        workflowId,
        { message: 'hello' },
        { signature, timestamp: expiredTimestamp, rawBody }
      )
    ).rejects.toMatchObject({
      code: HttpErrorCode.UNAUTHORIZED,
      message: 'Webhook timestamp expired',
    });
  });

  it('rejects webhook run when signature timestamp header is missing', async () => {
    prismaService.workflow.findFirstOrThrow.mockResolvedValue({
      id: workflowId,
      baseId,
      activeSnapshotId: 'wsn123',
      nodes: [{ kind: 'webhook', config: { signatureSecret: 'sig-secret' } }],
    });

    await expect(
      service.createWebhookRun(
        workflowId,
        { message: 'hello' },
        { signature: 'sha256=abc', rawBody: '{"message":"hello"}' }
      )
    ).rejects.toMatchObject({
      code: HttpErrorCode.UNAUTHORIZED,
      message: 'Missing webhook timestamp header',
    });
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

  it('creates a node test run with a trimmed snapshot ending at the target action node', async () => {
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
      nodes: [
        {
          id: 'wtr123',
          workflowId,
          nodeType: 'trigger',
          kind: 'buttonClick',
          nextNodeId: 'wa123',
          config: {},
        },
        {
          id: 'wa123',
          workflowId,
          nodeType: 'action',
          kind: 'runScript',
          parentNodeId: 'wtr123',
          nextNodeId: 'wa124',
          config: { script: 'return input;' },
        },
        {
          id: 'wa124',
          workflowId,
          nodeType: 'action',
          kind: 'aiGenerate',
          parentNodeId: 'wa123',
          config: { prompt: 'Summarize {{ input }}' },
        },
      ],
    });
    prismaService.workflowSnapshot.aggregate.mockResolvedValue({ _max: { version: 1 } });
    prismaService.workflowSnapshot.create.mockResolvedValue({ id: 'wsn-node-test' });
    prismaService.workflowRun.create.mockResolvedValue({
      id: runId,
      workflowId,
      snapshotId: 'wsn-node-test',
      triggerType: 'manualNodeTest',
      status: 'pending',
    });

    const result = await service.createTestNodeRun(baseId, workflowId, 'wa123', { manual: true });

    expect(prismaService.workflowSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workflowId,
          version: 2,
          snapshot: expect.objectContaining({
            nodes: expect.arrayContaining([
              expect.objectContaining({ id: 'wtr123' }),
              expect.objectContaining({ id: 'wa123' }),
            ]),
          }),
        }),
      })
    );
    expect(prismaService.workflowRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workflowId,
          snapshotId: 'wsn-node-test',
          triggerType: 'manualNodeTest',
          input: expect.objectContaining({ manual: true }),
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
    recordService.filterRecordIdsByFilter.mockResolvedValue(['rec123']);
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

  it('creates record trigger runs when record matches conditions after update transition', async () => {
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
    recordService.filterRecordIdsByFilter
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(['rec123']);
    prismaService.workflowRun.create.mockResolvedValue({ id: runId, workflowId });

    const result = await service.createRecordTriggerRuns('tbl123', 'recordMatchesConditions', {
      tableId: 'tbl123',
      record: {
        id: 'rec123',
        fields: {
          fldStatus: { oldValue: 'Pending', newValue: 'Open' },
        },
      },
    });

    expect(result).toEqual([{ runId, workflowId }]);
  });

  it('does not create record trigger runs when record was already matching conditions before update', async () => {
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
    recordService.filterRecordIdsByFilter
      .mockResolvedValueOnce(['rec123'])
      .mockResolvedValueOnce(['rec123']);

    const result = await service.createRecordTriggerRuns('tbl123', 'recordMatchesConditions', {
      tableId: 'tbl123',
      record: {
        id: 'rec123',
        fields: {
          fldStatus: { oldValue: 'Open', newValue: 'Open' },
        },
      },
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
