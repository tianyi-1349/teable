import { Injectable } from '@nestjs/common';
import { PrismaService } from '@teable/db-main-prisma';
import { Prisma } from '@prisma/client';
import { ScriptRuntimeService } from './script/script-runtime.service';
import { WorkflowAiService } from './workflow-ai.service';

interface IWorkflowSnapshotNode {
  id: string;
  nodeType: string;
  kind: string;
  parentNodeId?: string | null;
  nextNodeId?: string | null;
  config?: unknown;
}

interface IWorkflowSnapshot {
  baseId: string;
  nodes?: IWorkflowSnapshotNode[];
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return (value ?? Prisma.JsonNull) as Prisma.InputJsonValue;
}

function getScript(config: unknown): string | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { script, code } = config as { script?: unknown; code?: unknown };
  return typeof script === 'string' ? script : typeof code === 'string' ? code : undefined;
}

function getAiGenerateConfig(config: unknown): { prompt: string; modelKey?: string } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { prompt, modelKey } = config as { prompt?: unknown; modelKey?: unknown };
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return undefined;
  }
  return {
    prompt,
    ...(typeof modelKey === 'string' && modelKey.trim() && { modelKey }),
  };
}

function sortActionsByChain(actions: IWorkflowSnapshotNode[]) {
  const actionMap = new Map(actions.map((action) => [action.id, action]));
  const firstAction = actions.find(
    (action) => !action.parentNodeId || !actionMap.has(action.parentNodeId)
  );
  if (!firstAction) {
    return actions;
  }

  const sorted: IWorkflowSnapshotNode[] = [];
  const visited = new Set<string>();
  let current: IWorkflowSnapshotNode | undefined = firstAction;

  while (current && !visited.has(current.id)) {
    sorted.push(current);
    visited.add(current.id);
    current = current.nextNodeId ? actionMap.get(current.nextNodeId) : undefined;
  }

  const remaining = actions.filter((action) => !visited.has(action.id));
  return [...sorted, ...remaining];
}

@Injectable()
export class WorkflowRunnerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly scriptRuntimeService: ScriptRuntimeService,
    private readonly workflowAiService: WorkflowAiService
  ) {}

  async executeWorkflowRun(runId: string): Promise<void> {
    const run = await this.prismaService.workflowRun.findUniqueOrThrow({
      where: { id: runId },
      select: {
        id: true,
        input: true,
        workflow: { select: { baseId: true } },
        snapshot: { select: { snapshot: true } },
      },
    });
    const startedTime = new Date();
    const snapshot = (run.snapshot?.snapshot ?? {}) as Partial<IWorkflowSnapshot>;
    const baseId = snapshot.baseId ?? run.workflow.baseId;
    const actions = sortActionsByChain(
      (snapshot.nodes ?? []).filter((node) => node.nodeType === 'action')
    );

    await this.prismaService.workflowRun.update({
      where: { id: runId },
      data: { status: 'running', startedTime },
    });

    if (!actions.length) {
      await this.prismaService.workflowRun.update({
        where: { id: runId },
        data: {
          status: 'completed',
          finishedTime: startedTime,
          durationMs: 0,
          output: { skipped: true, reason: 'No workflow runner actions are configured yet' },
        },
      });
      return;
    }

    let currentInput: unknown = run.input;

    try {
      for (const action of actions) {
        currentInput = await this.executeAction(runId, baseId, action, currentInput);
      }

      const finishedTime = new Date();
      await this.prismaService.workflowRun.update({
        where: { id: runId },
        data: {
          status: 'completed',
          finishedTime,
          durationMs: finishedTime.getTime() - startedTime.getTime(),
          output: toJson(currentInput),
        },
      });
    } catch (error) {
      const finishedTime = new Date();
      const message = error instanceof Error ? error.message : String(error);
      await this.prismaService.workflowRun.update({
        where: { id: runId },
        data: {
          status: 'failed',
          finishedTime,
          durationMs: finishedTime.getTime() - startedTime.getTime(),
          error: { message },
        },
      });
    }
  }

  private async executeAction(
    runId: string,
    baseId: string,
    action: IWorkflowSnapshotNode,
    input: unknown
  ): Promise<unknown> {
    const step = await this.prismaService.workflowRunStep.create({
      data: {
        runId,
        nodeId: action.id,
        status: 'running',
        input: toJson(input),
      },
      select: { id: true, startedTime: true },
    });

    const invalidMessage = this.getInvalidActionMessage(action);
    if (invalidMessage) {
      await this.prismaService.workflowRunStep.update({
        where: { id: step.id },
        data: {
          status: 'failed',
          finishedTime: new Date(),
          error: { message: invalidMessage },
        },
      });
      throw new Error(invalidMessage);
    }

    try {
      const output = await this.executeConfiguredAction(baseId, action, input);
      const finishedTime = new Date();
      await this.prismaService.workflowRunStep.update({
        where: { id: step.id },
        data: {
          status: 'completed',
          output: toJson(output),
          finishedTime,
          durationMs: finishedTime.getTime() - step.startedTime.getTime(),
        },
      });
      return output;
    } catch (error) {
      const finishedTime = new Date();
      const message = error instanceof Error ? error.message : String(error);
      await this.prismaService.workflowRunStep.update({
        where: { id: step.id },
        data: {
          status: 'failed',
          error: { message },
          finishedTime,
          durationMs: finishedTime.getTime() - step.startedTime.getTime(),
        },
      });
      throw error;
    }
  }

  private getInvalidActionMessage(action: IWorkflowSnapshotNode) {
    if (action.kind === 'runScript' && !getScript(action.config)) {
      return `Run Script node ${action.id} is missing script content`;
    }
    if (action.kind === 'aiGenerate' && !getAiGenerateConfig(action.config)) {
      return `AI Generate node ${action.id} is missing prompt`;
    }
    if (!['runScript', 'aiGenerate'].includes(action.kind)) {
      return `Unsupported workflow action ${action.kind}`;
    }
    return undefined;
  }

  private async executeConfiguredAction(
    baseId: string,
    action: IWorkflowSnapshotNode,
    input: unknown
  ) {
    if (action.kind === 'runScript') {
      return this.scriptRuntimeService.execute(getScript(action.config)!, { baseId, input });
    }

    const config = getAiGenerateConfig(action.config)!;
    const prompt = this.interpolatePrompt(config.prompt, input);
    const text = await this.workflowAiService.generateText(baseId, {
      prompt,
      ...(config.modelKey && { modelKey: config.modelKey }),
    });
    return { text };
  }

  private interpolatePrompt(prompt: string, input: unknown) {
    return prompt.replace(/\{\{\s*input\s*\}\}/g, () => JSON.stringify(input));
  }
}
