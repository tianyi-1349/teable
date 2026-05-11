import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkflowRunnerService } from './workflow-runner.service';

describe('WorkflowRunnerService', () => {
  const runId = 'wrun123';
  const baseId = 'bse123';
  const startedTime = new Date('2026-05-11T00:00:00.000Z');
  const prismaService = {
    workflowRun: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    workflowRunStep: {
      create: vi.fn(),
      update: vi.fn(),
    },
  };
  const scriptRuntimeService = {
    execute: vi.fn(),
  };
  const workflowAiService = {
    generateText: vi.fn(),
  };
  const recordsService = {
    updateRecord: vi.fn(),
    multipleCreateRecords: vi.fn(),
  };
  const recordService = {
    getRecords: vi.fn(),
  };
  const permissionService = {
    validPermissions: vi.fn(),
  };
  const clsService = {
    get: vi.fn(),
    set: vi.fn(),
  };
  let service: WorkflowRunnerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkflowRunnerService(
      prismaService as never,
      scriptRuntimeService as never,
      workflowAiService as never,
      recordsService as never,
      recordService as never,
      permissionService as never,
      clsService as never
    );
  });

  it('completes a run without script actions', async () => {
    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
      id: runId,
      input: { recordId: 'rec123' },
      workflow: { baseId },
      snapshot: { snapshot: { baseId, nodes: [] } },
    });

    await service.executeWorkflowRun(runId);

    expect(prismaService.workflowRun.update).toHaveBeenCalledWith({
      where: { id: runId },
      data: expect.objectContaining({ status: 'running' }),
    });
    expect(prismaService.workflowRun.update).toHaveBeenCalledWith({
      where: { id: runId },
      data: expect.objectContaining({
        status: 'completed',
        output: { skipped: true, reason: 'No workflow runner actions are configured yet' },
      }),
    });
  });

  it('marks run failed when runScript execution is disabled', async () => {
    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
      id: runId,
      input: { recordId: 'rec123' },
      workflow: { baseId },
      snapshot: {
        snapshot: {
          baseId,
          nodes: [
            {
              id: 'wa123',
              nodeType: 'action',
              kind: 'runScript',
              config: { script: 'return input;' },
            },
          ],
        },
      },
    });
    prismaService.workflowRunStep.create.mockResolvedValue({ id: 'step123', startedTime });
    scriptRuntimeService.execute.mockRejectedValue(
      new Error(
        'Run Script workflow actions are disabled until a process-isolated sandbox is available'
      )
    );

    await service.executeWorkflowRun(runId);

    expect(scriptRuntimeService.execute).toHaveBeenCalledWith('return input;', {
      baseId,
      input: { recordId: 'rec123' },
    });
    expect(prismaService.workflowRunStep.update).toHaveBeenCalledWith({
      where: { id: 'step123' },
      data: expect.objectContaining({
        status: 'failed',
        error: {
          message:
            'Run Script workflow actions are disabled until a process-isolated sandbox is available',
        },
      }),
    });
    expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
      where: { id: runId },
      data: expect.objectContaining({
        status: 'failed',
        error: {
          message:
            'Run Script workflow actions are disabled until a process-isolated sandbox is available',
        },
      }),
    });
  });

  it('executes non-script actions by parent and next node chain order', async () => {
    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
      id: runId,
      input: { count: 0 },
      workflow: { baseId },
      snapshot: {
        snapshot: {
          baseId,
          nodes: [
            {
              id: 'wa-second',
              nodeType: 'action',
              kind: 'aiGenerate',
              parentNodeId: 'wa-first',
              config: { prompt: 'second {{ input }}' },
            },
            {
              id: 'wa-first',
              nodeType: 'action',
              kind: 'aiGenerate',
              nextNodeId: 'wa-second',
              config: { prompt: 'first {{ input }}' },
            },
          ],
        },
      },
    });
    prismaService.workflowRunStep.create
      .mockResolvedValueOnce({ id: 'step-first', startedTime })
      .mockResolvedValueOnce({ id: 'step-second', startedTime });
    workflowAiService.generateText
      .mockResolvedValueOnce('first output')
      .mockResolvedValueOnce('second output');

    await service.executeWorkflowRun(runId);

    expect(workflowAiService.generateText).toHaveBeenNthCalledWith(1, baseId, {
      prompt: 'first {"count":0}',
    });
    expect(workflowAiService.generateText).toHaveBeenNthCalledWith(2, baseId, {
      prompt: 'second {"text":"first output"}',
    });
    expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
      where: { id: runId },
      data: expect.objectContaining({
        status: 'completed',
        output: { text: 'second output' },
      }),
    });
  });

  it('marks run failed when a script action fails', async () => {
    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
      id: runId,
      input: {},
      workflow: { baseId },
      snapshot: {
        snapshot: {
          baseId,
          nodes: [
            {
              id: 'wa123',
              nodeType: 'action',
              kind: 'runScript',
              config: { script: 'throw error;' },
            },
          ],
        },
      },
    });
    prismaService.workflowRunStep.create.mockResolvedValue({ id: 'step123', startedTime });
    scriptRuntimeService.execute.mockRejectedValue(new Error('boom'));

    await service.executeWorkflowRun(runId);

    expect(prismaService.workflowRunStep.update).toHaveBeenCalledWith({
      where: { id: 'step123' },
      data: expect.objectContaining({ status: 'failed', error: { message: 'boom' } }),
    });
    expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
      where: { id: runId },
      data: expect.objectContaining({ status: 'failed', error: { message: 'boom' } }),
    });
  });

  it('executes aiGenerate actions and records generated text', async () => {
    prismaService.workflowRun.findUniqueOrThrow.mockResolvedValue({
      id: runId,
      input: { recordId: 'rec123' },
      workflow: { baseId },
      snapshot: {
        snapshot: {
          baseId,
          nodes: [
            {
              id: 'wa-ai',
              nodeType: 'action',
              kind: 'aiGenerate',
              config: { prompt: 'Summarize {{ input }}', modelKey: 'gpt' },
            },
          ],
        },
      },
    });
    prismaService.workflowRunStep.create.mockResolvedValue({ id: 'step-ai', startedTime });
    workflowAiService.generateText.mockResolvedValue('Generated summary');

    await service.executeWorkflowRun(runId);

    expect(workflowAiService.generateText).toHaveBeenCalledWith(baseId, {
      prompt: 'Summarize {"recordId":"rec123"}',
      modelKey: 'gpt',
    });
    expect(prismaService.workflowRunStep.update).toHaveBeenCalledWith({
      where: { id: 'step-ai' },
      data: expect.objectContaining({
        status: 'completed',
        output: { text: 'Generated summary' },
      }),
    });
    expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
      where: { id: runId },
      data: expect.objectContaining({
        status: 'completed',
        output: { text: 'Generated summary' },
      }),
    });
  });
});
