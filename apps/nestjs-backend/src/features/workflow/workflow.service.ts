import { Injectable } from '@nestjs/common';
import {
  generateWorkflowActionId,
  generateWorkflowId,
  generateWorkflowTriggerId,
  getUniqName,
  HttpErrorCode,
  type IFilter,
} from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import { Prisma } from '@prisma/client';
import type {
  IAiCreateWorkflowDraftRo,
  IDuplicateWorkflowRo,
  IUpdateWorkflowRo,
  IWorkflowDetailVo,
  IWorkflowRo,
  IWorkflowRunDetailVo,
  IWorkflowRunVo,
  IWorkflowVo,
} from '@teable/openapi';
import { ClsService } from 'nestjs-cls';
import { CustomHttpException } from '../../custom.exception';
import type { IClsStore } from '../../types/cls';
import { RecordService } from '../record/record.service';
import { getWorkflowActionCapability } from './actions/action-capability';
import { WorkflowAiService } from './workflow-ai.service';
import { buildWorkflowRunSuccessData } from './workflow-run-state';

type IRecordTriggerType = 'recordCreated' | 'recordUpdated';

type IRecordTriggerConfig = {
  tableId?: string;
  filter?: IFilter;
};

type IWorkflowActionConfig = {
  script?: string;
  code?: string;
  prompt?: string;
};

const WORKFLOW_NOT_FOUND_LOCALIZATION = {
  i18nKey: 'httpErrors.baseNode.notFound',
} as const;

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cls: ClsService<IClsStore>,
    private readonly workflowAiService: WorkflowAiService,
    private readonly recordService: RecordService
  ) {}

  private get userId() {
    return this.cls.get('user.id');
  }

  private selectWorkflow() {
    return {
      id: true,
      baseId: true,
      name: true,
      description: true,
      order: true,
      isActive: true,
      activeSnapshotId: true,
      createdBy: true,
      createdTime: true,
      lastModifiedTime: true,
      lastModifiedBy: true,
    };
  }

  private selectWorkflowNode() {
    return {
      id: true,
      workflowId: true,
      nodeType: true,
      kind: true,
      parentNodeId: true,
      nextNodeId: true,
      branchKey: true,
      config: true,
      testStatus: true,
      testOutput: true,
    };
  }

  private selectWorkflowRun() {
    return {
      id: true,
      workflowId: true,
      snapshotId: true,
      triggerType: true,
      status: true,
      input: true,
      output: true,
      error: true,
      startedTime: true,
      finishedTime: true,
      durationMs: true,
      createdBy: true,
    };
  }

  private selectWorkflowRunStep() {
    return {
      id: true,
      runId: true,
      nodeId: true,
      status: true,
      input: true,
      output: true,
      error: true,
      startedTime: true,
      finishedTime: true,
      durationMs: true,
    };
  }

  async getWorkflowList(baseId: string): Promise<IWorkflowVo[]> {
    return this.prismaService.workflow.findMany({
      where: { baseId, deletedTime: null },
      select: this.selectWorkflow(),
      orderBy: { order: 'asc' },
    });
  }

  async getWorkflow(baseId: string, workflowId: string): Promise<IWorkflowDetailVo> {
    const workflow = await this.prismaService.workflow
      .findFirstOrThrow({
        where: { id: workflowId, baseId, deletedTime: null },
        select: {
          ...this.selectWorkflow(),
          nodes: {
            select: this.selectWorkflowNode(),
            orderBy: { createdTime: 'asc' },
          },
        },
      })
      .catch(() => {
        throw new CustomHttpException('Workflow not found', HttpErrorCode.NOT_FOUND, {
          localization: WORKFLOW_NOT_FOUND_LOCALIZATION,
        });
      });

    return {
      ...workflow,
      nodes: workflow.nodes.map((node) => ({
        ...node,
        nodeType: node.nodeType as 'trigger' | 'action' | 'logic',
      })),
    };
  }

  async getWorkflowRunList(baseId: string, workflowId: string): Promise<IWorkflowRunVo[]> {
    await this.getWorkflow(baseId, workflowId);
    return this.prismaService.workflowRun.findMany({
      where: { workflowId },
      select: this.selectWorkflowRun(),
      orderBy: { startedTime: 'desc' },
      take: 100,
    });
  }

  async getWorkflowRun(
    baseId: string,
    workflowId: string,
    runId: string
  ): Promise<IWorkflowRunDetailVo> {
    await this.getWorkflow(baseId, workflowId);
    return this.prismaService.workflowRun
      .findFirstOrThrow({
        where: { id: runId, workflowId },
        select: {
          ...this.selectWorkflowRun(),
          steps: {
            select: this.selectWorkflowRunStep(),
            orderBy: { startedTime: 'asc' },
          },
        },
      })
      .catch(() => {
        throw new CustomHttpException('Workflow run not found', HttpErrorCode.NOT_FOUND, {
          localization: WORKFLOW_NOT_FOUND_LOCALIZATION,
        });
      });
  }

  async createWorkflow(baseId: string, ro: IWorkflowRo): Promise<IWorkflowVo> {
    const maxOrder = await this.prismaService.workflow.aggregate({
      where: { baseId, deletedTime: null },
      _max: { order: true },
    });

    return this.prismaService.$tx(async (prisma) => {
      const workflow = await prisma.workflow.create({
        data: {
          id: generateWorkflowId(),
          baseId,
          name: ro.name,
          description: ro.description,
          order: (maxOrder._max.order ?? 0) + 1,
          createdBy: this.userId,
          lastModifiedBy: this.userId,
        },
        select: this.selectWorkflow(),
      });

      const actionIds = ro.actions?.map(() => generateWorkflowActionId()) ?? [];
      const triggerId = ro.trigger ? generateWorkflowTriggerId() : undefined;

      if (ro.trigger && triggerId) {
        await prisma.workflowNode.create({
          data: {
            id: triggerId,
            workflowId: workflow.id,
            nodeType: 'trigger',
            kind: ro.trigger.type,
            nextNodeId: actionIds[0],
            config: ro.trigger.config as Prisma.InputJsonValue,
            createdBy: this.userId,
            lastModifiedBy: this.userId,
          },
        });
      }

      if (ro.actions?.length) {
        await prisma.workflowNode.createMany({
          data: ro.actions.map((action, index) => ({
            id: actionIds[index],
            workflowId: workflow.id,
            nodeType: 'action',
            kind: action.type,
            parentNodeId: index === 0 ? triggerId : actionIds[index - 1],
            nextNodeId: actionIds[index + 1],
            config: action.config as Prisma.InputJsonValue,
            createdBy: this.userId,
            lastModifiedBy: this.userId,
          })),
        });
      }

      return workflow;
    });
  }

  async aiCreateWorkflowDraft(
    baseId: string,
    ro: IAiCreateWorkflowDraftRo
  ): Promise<IWorkflowDetailVo> {
    const draft = await this.generateWorkflowDraft(baseId, ro);
    const maxOrder = await this.prismaService.workflow.aggregate({
      where: { baseId, deletedTime: null },
      _max: { order: true },
    });

    const workflowId = generateWorkflowId();
    const triggerId = generateWorkflowTriggerId();
    const actionId = generateWorkflowActionId();

    await this.prismaService.$tx(async (prisma) => {
      await prisma.workflow.create({
        data: {
          id: workflowId,
          baseId,
          name: draft.name,
          description: draft.description,
          order: (maxOrder._max.order ?? 0) + 1,
          createdBy: this.userId,
          lastModifiedBy: this.userId,
        },
      });

      await prisma.workflowNode.createMany({
        data: [
          {
            id: triggerId,
            workflowId,
            nodeType: 'trigger',
            kind: 'buttonClick',
            nextNodeId: actionId,
            config: {
              tableId: ro.tableId,
              fieldId: ro.fieldId,
              recordId: ro.recordId,
              source: 'aiDraft',
            } as Prisma.InputJsonValue,
            createdBy: this.userId,
            lastModifiedBy: this.userId,
          },
          {
            id: actionId,
            workflowId,
            nodeType: 'action',
            kind: 'runScript',
            parentNodeId: triggerId,
            config: { script: draft.script, source: 'aiDraft' } as Prisma.InputJsonValue,
            createdBy: this.userId,
            lastModifiedBy: this.userId,
          },
        ],
      });
    });

    return this.getWorkflow(baseId, workflowId);
  }

  private async generateWorkflowDraft(
    baseId: string,
    ro: IAiCreateWorkflowDraftRo
  ): Promise<{ name: string; description: string; script: string }> {
    const fallback = this.createFallbackDraft(ro.prompt);
    const prompt = [
      'Create a Teable automation workflow draft.',
      'Return only compact JSON with keys: name, description, script.',
      'The workflow must be inactive until a user reviews and activates it.',
      'The trigger is buttonClick. The single action is runScript.',
      'The script runs in an async function with input, console.log, JSON, and ai.generateText available.',
      'Do not include network requests, secrets, imports, require, eval, filesystem access, or destructive operations.',
      `User request: ${ro.prompt}`,
      `Context: ${JSON.stringify({ tableId: ro.tableId, fieldId: ro.fieldId, recordId: ro.recordId })}`,
    ].join('\n');

    try {
      const text = await this.workflowAiService.generateText(baseId, {
        prompt,
        ...(ro.modelKey && { modelKey: ro.modelKey }),
      });
      return this.normalizeGeneratedDraft(text, fallback);
    } catch {
      return fallback;
    }
  }

  private normalizeGeneratedDraft(
    text: string,
    fallback: { name: string; description: string; script: string }
  ) {
    try {
      const jsonText = text
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/i, '')
        .trim();
      const parsed = JSON.parse(jsonText) as Partial<typeof fallback>;
      const name =
        typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : fallback.name;
      const description =
        typeof parsed.description === 'string' && parsed.description.trim()
          ? parsed.description.trim()
          : fallback.description;
      const script =
        typeof parsed.script === 'string' && parsed.script.trim()
          ? parsed.script.trim()
          : fallback.script;

      return {
        name: name.slice(0, 100),
        description: description.slice(0, 500),
        script: this.sanitizeDraftScript(script),
      };
    } catch {
      return fallback;
    }
  }

  private createFallbackDraft(prompt: string) {
    const name = `AI draft: ${prompt.trim().slice(0, 40) || 'Run script'}`;
    return {
      name,
      description: 'Inactive AI-created workflow draft. Review the script before activation.',
      script: [
        'console.log("AI-created workflow draft input", input);',
        'return {',
        '  reviewed: false,',
        '  message: "Review and replace this draft script before activating the workflow.",',
        '  input,',
        '};',
      ].join('\n'),
    };
  }

  private sanitizeDraftScript(script: string) {
    const deniedPatterns = [
      /\brequire\s*\(/,
      /\bimport\s+/,
      /\beval\s*\(/,
      /\bFunction\s*\(/,
      /process\./,
    ];
    if (deniedPatterns.some((pattern) => pattern.test(script))) {
      return this.createFallbackDraft('Run script').script;
    }
    return script.slice(0, 8000);
  }

  async updateWorkflow(
    baseId: string,
    workflowId: string,
    ro: IUpdateWorkflowRo
  ): Promise<IWorkflowVo> {
    const workflow = await this.prismaService.workflow
      .findFirstOrThrow({
        where: { id: workflowId, baseId, deletedTime: null },
        select: { id: true },
      })
      .catch(() => {
        throw new CustomHttpException('Workflow not found', HttpErrorCode.NOT_FOUND, {
          localization: WORKFLOW_NOT_FOUND_LOCALIZATION,
        });
      });

    return this.prismaService.$tx(async (prisma) => {
      if (ro.nodes) {
        const nextNodeIds = ro.nodes.map((node) => node.id);
        await prisma.workflowNode.deleteMany({
          where: {
            workflowId: workflow.id,
            id: { notIn: nextNodeIds },
          },
        });
        await Promise.all(
          ro.nodes.map((node) =>
            prisma.workflowNode.upsert({
              where: { id: node.id },
              create: {
                id: node.id,
                workflowId: workflow.id,
                nodeType: node.nodeType,
                kind: node.kind,
                parentNodeId: node.parentNodeId,
                nextNodeId: node.nextNodeId,
                branchKey: node.branchKey,
                config: node.config as Prisma.InputJsonValue,
                createdBy: this.userId,
                lastModifiedBy: this.userId,
              },
              update: {
                workflowId: workflow.id,
                nodeType: node.nodeType,
                kind: node.kind,
                parentNodeId: node.parentNodeId,
                nextNodeId: node.nextNodeId,
                branchKey: node.branchKey,
                config: node.config as Prisma.InputJsonValue,
                lastModifiedBy: this.userId,
              },
            })
          )
        );
      }

      return prisma.workflow.update({
        where: { id: workflowId },
        data: {
          ...(ro.name !== undefined && { name: ro.name }),
          ...(ro.description !== undefined && { description: ro.description }),
          lastModifiedBy: this.userId,
        },
        select: this.selectWorkflow(),
      });
    });
  }

  async deleteWorkflow(baseId: string, workflowId: string, permanent = false): Promise<void> {
    const workflow = await this.prismaService.workflow.findFirst({
      where: { id: workflowId, baseId, deletedTime: null },
      select: { id: true },
    });
    if (!workflow) {
      throw new CustomHttpException('Workflow not found', HttpErrorCode.NOT_FOUND, {
        localization: WORKFLOW_NOT_FOUND_LOCALIZATION,
      });
    }

    if (permanent) {
      await this.prismaService.workflow.delete({ where: { id: workflowId } });
      return;
    }

    await this.prismaService.workflow.update({
      where: { id: workflowId },
      data: {
        deletedTime: new Date(),
        lastModifiedBy: this.userId,
      },
    });
  }

  async duplicateWorkflow(
    baseId: string,
    workflowId: string,
    ro: IDuplicateWorkflowRo = {}
  ): Promise<IWorkflowVo> {
    const source = await this.getWorkflow(baseId, workflowId);
    const names = (await this.getWorkflowList(baseId)).map(({ name }) => name);
    const name = ro.name ?? getUniqName(source.name, names);
    const maxOrder = await this.prismaService.workflow.aggregate({
      where: { baseId, deletedTime: null },
      _max: { order: true },
    });

    return this.prismaService.$tx(async (prisma) => {
      const workflow = await prisma.workflow.create({
        data: {
          id: generateWorkflowId(),
          baseId,
          name,
          description: source.description,
          order: (maxOrder._max.order ?? 0) + 1,
          createdBy: this.userId,
          lastModifiedBy: this.userId,
        },
        select: this.selectWorkflow(),
      });

      if (source.nodes.length) {
        await prisma.workflowNode.createMany({
          data: source.nodes.map((node) => ({
            id: generateWorkflowActionId(),
            workflowId: workflow.id,
            nodeType: node.nodeType,
            kind: node.kind,
            parentNodeId: node.parentNodeId,
            nextNodeId: node.nextNodeId,
            branchKey: node.branchKey,
            config: node.config as Prisma.InputJsonValue,
            testStatus: node.testStatus,
            testOutput: node.testOutput as Prisma.InputJsonValue,
            createdBy: this.userId,
            lastModifiedBy: this.userId,
          })),
        });
      }

      return workflow;
    });
  }

  async activateWorkflow(baseId: string, workflowId: string): Promise<IWorkflowVo> {
    const workflow = await this.getWorkflow(baseId, workflowId);
    this.assertWorkflowCanActivate(workflow);
    const version = await this.getNextSnapshotVersion(workflowId);

    return this.prismaService.$tx(async (prisma) => {
      const snapshot = await prisma.workflowSnapshot.create({
        data: {
          workflowId,
          version,
          snapshot: workflow as Prisma.InputJsonValue,
          createdBy: this.userId,
        },
        select: { id: true },
      });

      return prisma.workflow.update({
        where: { id: workflowId },
        data: {
          isActive: true,
          activeSnapshotId: snapshot.id,
          lastModifiedBy: this.userId,
        },
        select: this.selectWorkflow(),
      });
    });
  }

  async deactivateWorkflow(baseId: string, workflowId: string): Promise<IWorkflowVo> {
    await this.getWorkflow(baseId, workflowId);
    return this.prismaService.workflow.update({
      where: { id: workflowId },
      data: {
        isActive: false,
        lastModifiedBy: this.userId,
      },
      select: this.selectWorkflow(),
    });
  }

  async createButtonRun(workflowId: string, input: unknown): Promise<{ runId: string }> {
    const workflow = await this.prismaService.workflow
      .findFirstOrThrow({
        where: { id: workflowId, deletedTime: null, isActive: true },
        select: { id: true, baseId: true, activeSnapshotId: true },
      })
      .catch(() => {
        throw new CustomHttpException('Workflow not found or inactive', HttpErrorCode.NOT_FOUND, {
          localization: WORKFLOW_NOT_FOUND_LOCALIZATION,
        });
      });

    const run = await this.prismaService.workflowRun.create({
      data: {
        workflowId: workflow.id,
        snapshotId: workflow.activeSnapshotId,
        triggerType: 'buttonClick',
        status: 'pending',
        input: {
          ...(typeof input === 'object' && input != null ? input : { value: input }),
          __automationContext: {
            source: 'automation',
            workflowId: workflow.id,
            baseId: workflow.baseId,
            timestamp: new Date().toISOString(),
          },
        } as Prisma.InputJsonValue,
        createdBy: this.userId,
      },
      select: { id: true },
    });

    return { runId: run.id };
  }

  async createRecordTriggerRuns(
    tableId: string,
    triggerType: IRecordTriggerType,
    input: unknown
  ): Promise<{ runId: string; workflowId: string }[]> {
    const table = await this.prismaService.tableMeta.findFirst({
      where: { id: tableId, deletedTime: null },
      select: { baseId: true },
    });
    if (!table) {
      return [];
    }

    const workflows = await this.prismaService.workflow.findMany({
      where: {
        baseId: table.baseId,
        deletedTime: null,
        isActive: true,
        activeSnapshotId: { not: null },
        nodes: {
          some: {
            nodeType: 'trigger',
            kind: triggerType,
          },
        },
      },
      select: {
        id: true,
        activeSnapshotId: true,
        nodes: {
          where: {
            nodeType: 'trigger',
            kind: triggerType,
          },
          select: { config: true },
        },
      },
    });

    const matchedWorkflows = (
      await Promise.all(
        workflows.map(async (workflow) => {
          const isMatched = await this.matchRecordTriggerNodes(workflow.nodes, tableId, input);
          return isMatched ? workflow : undefined;
        })
      )
    ).filter((workflow): workflow is (typeof workflows)[number] => Boolean(workflow));

    if (!matchedWorkflows.length) {
      return [];
    }

    const runs = await Promise.all(
      matchedWorkflows.map((workflow) =>
        this.prismaService.workflowRun.create({
          data: {
            workflowId: workflow.id,
            snapshotId: workflow.activeSnapshotId,
            triggerType,
            status: 'pending',
            input: {
              ...(typeof input === 'object' && input != null ? input : { value: input }),
              __automationContext: {
                source: 'automation',
                workflowId: workflow.id,
                baseId: table.baseId,
                timestamp: new Date().toISOString(),
              },
            } as Prisma.InputJsonValue,
            createdBy: this.userId,
          },
          select: { id: true, workflowId: true },
        })
      )
    );

    return runs.map((run) => ({ runId: run.id, workflowId: run.workflowId }));
  }

  private matchRecordTriggerConfig(config: unknown, tableId: string) {
    const triggerConfig = config as IRecordTriggerConfig | null;
    return !triggerConfig?.tableId || triggerConfig.tableId === tableId;
  }

  private async matchRecordTriggerNodes(
    nodes: { config: unknown }[],
    tableId: string,
    input: unknown
  ) {
    for (const node of nodes) {
      if (await this.matchRecordTriggerNode(node.config, tableId, input)) {
        return true;
      }
    }
    return false;
  }

  private async matchRecordTriggerNode(config: unknown, tableId: string, input: unknown) {
    if (!this.matchRecordTriggerConfig(config, tableId)) {
      return false;
    }

    const triggerConfig = config as IRecordTriggerConfig | null;
    if (!triggerConfig?.filter) {
      return true;
    }

    const recordIds = this.getInputRecordIds(input);
    if (!recordIds.length) {
      return false;
    }

    const matchedRecordIds = await this.recordService.filterRecordIdsByFilter(
      tableId,
      recordIds,
      triggerConfig.filter
    );
    return matchedRecordIds.length > 0;
  }

  private getInputRecordIds(input: unknown) {
    const record = (input as { record?: unknown } | null)?.record;
    const records = Array.isArray(record) ? record : record ? [record] : [];
    return records
      .map((item) => (item as { id?: unknown } | null)?.id)
      .filter((id): id is string => typeof id === 'string' && Boolean(id));
  }

  private assertWorkflowCanActivate(workflow: IWorkflowDetailVo) {
    const trigger = workflow.nodes.find((node) => node.nodeType === 'trigger');
    if (!trigger) {
      throw new CustomHttpException(
        'Workflow requires a trigger before activation',
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    const actions = workflow.nodes.filter((node) => node.nodeType === 'action');
    if (!actions.length) {
      throw new CustomHttpException(
        'Workflow requires at least one action before activation',
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    const invalidAction = actions.find(
      (action) => !this.isRunnableAction(action.kind, action.config)
    );
    if (invalidAction) {
      throw new CustomHttpException(
        `Workflow action ${invalidAction.kind} is not runnable`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }
  }

  private isRunnableAction(kind: string, config: unknown) {
    const capability = getWorkflowActionCapability(kind);
    if (!capability?.runnable) {
      return false;
    }

    const actionConfig = config as IWorkflowActionConfig | null;
    if (kind === 'runScript') {
      return Boolean(actionConfig?.script || actionConfig?.code);
    }
    if (kind === 'aiGenerate') {
      return Boolean(actionConfig?.prompt);
    }
    return false;
  }

  async createTestRun(baseId: string, workflowId: string, input: unknown): Promise<IWorkflowRunVo> {
    const workflow = await this.getWorkflow(baseId, workflowId);
    const snapshotId =
      workflow.activeSnapshotId ?? (await this.createWorkflowSnapshot(workflowId, workflow));
    const runInput =
      input ??
      ({
        manual: true,
        source: 'workflowTestRun',
        workflowId,
      } as const);

    return this.prismaService.workflowRun.create({
      data: {
        workflowId,
        snapshotId,
        triggerType: 'manualTest',
        status: 'pending',
        input: {
          ...runInput,
          __automationContext: {
            source: 'automation',
            workflowId,
            baseId,
            timestamp: new Date().toISOString(),
          },
        } as Prisma.InputJsonValue,
        createdBy: this.userId,
      },
      select: this.selectWorkflowRun(),
    });
  }

  private async createWorkflowSnapshot(
    workflowId: string,
    workflow: IWorkflowDetailVo
  ): Promise<string> {
    const version = await this.getNextSnapshotVersion(workflowId);
    const snapshot = await this.prismaService.workflowSnapshot.create({
      data: {
        workflowId,
        version,
        snapshot: workflow as Prisma.InputJsonValue,
        createdBy: this.userId,
      },
      select: { id: true },
    });
    return snapshot.id;
  }

  private async getNextSnapshotVersion(workflowId: string) {
    const latest = await this.prismaService.workflowSnapshot.aggregate({
      where: { workflowId },
      _max: { version: true },
    });
    return (latest._max.version ?? 0) + 1;
  }

  async completeEmptyRun(runId: string): Promise<void> {
    const startedTime = new Date();
    await this.prismaService.workflowRun.update({
      where: { id: runId },
      data: {
        startedTime,
        ...buildWorkflowRunSuccessData(startedTime, startedTime, {
          skipped: true,
          reason: 'No workflow runner actions are implemented yet',
        }),
      },
    });
  }
}
