import { Injectable } from '@nestjs/common';
import {
  generateWorkflowActionId,
  generateWorkflowId,
  generateWorkflowTriggerId,
  getUniqName,
  HttpErrorCode,
} from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import { Prisma } from '@prisma/client';
import type {
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

const WORKFLOW_NOT_FOUND_LOCALIZATION = {
  i18nKey: 'httpErrors.baseNode.notFound',
} as const;

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cls: ClsService<IClsStore>
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

      if (ro.trigger) {
        await prisma.workflowNode.create({
          data: {
            id: generateWorkflowTriggerId(),
            workflowId: workflow.id,
            nodeType: 'trigger',
            kind: ro.trigger.type,
            config: ro.trigger.config as Prisma.InputJsonValue,
            createdBy: this.userId,
            lastModifiedBy: this.userId,
          },
        });
      }

      return workflow;
    });
  }

  async updateWorkflow(
    baseId: string,
    workflowId: string,
    ro: IUpdateWorkflowRo
  ): Promise<IWorkflowVo> {
    return this.prismaService.workflow
      .update({
        where: { id: workflowId, baseId, deletedTime: null },
        data: {
          ...(ro.name !== undefined && { name: ro.name }),
          ...(ro.description !== undefined && { description: ro.description }),
          lastModifiedBy: this.userId,
        },
        select: this.selectWorkflow(),
      })
      .catch(() => {
        throw new CustomHttpException('Workflow not found', HttpErrorCode.NOT_FOUND, {
          localization: WORKFLOW_NOT_FOUND_LOCALIZATION,
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
    const latest = await this.prismaService.workflowSnapshot.aggregate({
      where: { workflowId },
      _max: { version: true },
    });
    const version = (latest._max.version ?? 0) + 1;

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
        select: { id: true, activeSnapshotId: true },
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
        input: input as Prisma.InputJsonValue,
        createdBy: this.userId,
      },
      select: { id: true },
    });

    return { runId: run.id };
  }

  async completeEmptyRun(runId: string): Promise<void> {
    const startedTime = new Date();
    await this.prismaService.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'completed',
        startedTime,
        finishedTime: startedTime,
        durationMs: 0,
        output: { skipped: true, reason: 'No workflow runner actions are implemented yet' },
      },
    });
  }
}
