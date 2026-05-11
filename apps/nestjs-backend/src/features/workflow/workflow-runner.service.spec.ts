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
  let service: WorkflowRunnerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkflowRunnerService(prismaService as never, scriptRuntimeService as never);
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

  it('executes runScript actions and records step output', async () => {
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
    scriptRuntimeService.execute.mockResolvedValue({ result: { ok: true }, logs: [] });

    await service.executeWorkflowRun(runId);

    expect(scriptRuntimeService.execute).toHaveBeenCalledWith('return input;', {
      baseId,
      input: { recordId: 'rec123' },
    });
    expect(prismaService.workflowRunStep.update).toHaveBeenCalledWith({
      where: { id: 'step123' },
      data: expect.objectContaining({
        status: 'completed',
        output: { result: { ok: true }, logs: [] },
      }),
    });
    expect(prismaService.workflowRun.update).toHaveBeenLastCalledWith({
      where: { id: runId },
      data: expect.objectContaining({
        status: 'completed',
        output: { result: { ok: true }, logs: [] },
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
});
