import { Injectable } from '@nestjs/common';
import { PrismaService } from '@teable/db-main-prisma';
import type {
  IWorkflowExecutionListQuery,
  IWorkflowExecutionStep,
  IWorkflowExecutionListVo,
  IWorkflowExecutionStatus,
  IWorkflowExecutionVo,
  IWorkflowTriggerType,
} from '@teable/openapi';

type IWorkflowExecutionRecord = {
  id: string;
  workflowId: string;
  baseId: string;
  triggerType: string | null;
  status: string;
  eventPayload: string | null;
  steps: string | null;
  actionCount: number;
  errorMessage: string | null;
  createdBy: string | null;
  createdTime: Date;
  completedTime: Date | null;
};

@Injectable()
export class WorkflowExecutionService {
  constructor(private readonly prismaService: PrismaService) {}

  private parseJson(value: string | null | undefined): Record<string, unknown> | undefined {
    if (!value) {
      return undefined;
    }

    return JSON.parse(value) as Record<string, unknown>;
  }

  private parseSteps(value: string | null | undefined): IWorkflowExecutionStep[] | undefined {
    if (!value) {
      return undefined;
    }

    return JSON.parse(value) as IWorkflowExecutionStep[];
  }

  private stringifyJson(value: unknown): string | null {
    if (value == null) {
      return null;
    }

    return JSON.stringify(value);
  }

  private toVo(execution: IWorkflowExecutionRecord): IWorkflowExecutionVo {
    return {
      id: execution.id,
      workflowId: execution.workflowId,
      baseId: execution.baseId,
      triggerType: (execution.triggerType as IWorkflowTriggerType | null | undefined) ?? undefined,
      status: execution.status as IWorkflowExecutionStatus,
      eventPayload: this.parseJson(execution.eventPayload),
      steps: this.parseSteps(execution.steps),
      actionCount: execution.actionCount,
      errorMessage: execution.errorMessage,
      createdBy: execution.createdBy,
      createdTime: execution.createdTime.toISOString(),
      completedTime: execution.completedTime?.toISOString() ?? null,
    };
  }

  async createExecution(params: {
    workflowId: string;
    baseId: string;
    triggerType?: IWorkflowTriggerType;
    eventPayload?: Record<string, unknown>;
    actionCount?: number;
    createdBy?: string;
  }) {
    const execution = await this.prismaService.txClient().workflowExecution.create({
      data: {
        workflowId: params.workflowId,
        baseId: params.baseId,
        triggerType: params.triggerType,
        status: 'running',
        eventPayload: params.eventPayload ? JSON.stringify(params.eventPayload) : null,
        actionCount: params.actionCount ?? 0,
        createdBy: params.createdBy ?? null,
      },
      select: { id: true },
    });

    return execution;
  }

  async markExecutionSucceeded(executionId: string) {
    await this.prismaService.txClient().workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'succeeded',
        errorMessage: null,
        completedTime: new Date(),
      },
    });
  }

  async updateExecutionSteps(executionId: string, steps: IWorkflowExecutionStep[]) {
    await this.prismaService.txClient().workflowExecution.update({
      where: { id: executionId },
      data: {
        steps: this.stringifyJson(steps),
      },
    });
  }

  async markExecutionFailed(executionId: string, errorMessage: string) {
    await this.prismaService.txClient().workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        errorMessage,
        completedTime: new Date(),
      },
    });
  }

  async getExecutionList(
    baseId: string,
    workflowId: string,
    query: IWorkflowExecutionListQuery = {}
  ): Promise<IWorkflowExecutionListVo> {
    const take = query.take ?? 20;
    const data = await this.prismaService.workflowExecution.findMany({
      where: {
        baseId,
        workflowId,
      },
      take: take + 1,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
        workflowId: true,
        baseId: true,
        triggerType: true,
        status: true,
        eventPayload: true,
        steps: true,
        actionCount: true,
        errorMessage: true,
        createdBy: true,
        createdTime: true,
        completedTime: true,
      },
    });

    const executions = data.map((item) => this.toVo(item));
    let nextCursor: string | null | undefined;

    if (executions.length > take) {
      const nextItem = executions.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return {
      executions,
      nextCursor,
    };
  }
}
