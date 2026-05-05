import { Injectable } from '@nestjs/common';
import {
  DriverClient,
  FieldType,
  generateWorkflowId,
  getUniqName,
  HttpErrorCode,
  type IButtonFieldOptions,
} from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import type {
  IWorkflowAction,
  IWorkflowCondition,
  IWorkflowCreateRo,
  IWorkflowTrigger,
  IWorkflowUpdateRo,
  IWorkflowVo,
} from '@teable/openapi';
import { ClsService } from 'nestjs-cls';
import { CustomHttpException } from '../../custom.exception';
import { InjectDbProvider } from '../../db-provider/db.provider';
import { IDbProvider } from '../../db-provider/db.provider.interface';
import type { IClsStore } from '../../types/cls';

type IWorkflowRecord = {
  id: string;
  baseId: string;
  name: string;
  description: string | null;
  trigger: string | null;
  conditions: string | null;
  actions: string | null;
  isActive: boolean;
  createdTime: Date;
  lastModifiedTime: Date | null;
};

type IWorkflowRuntimeRecord = Pick<
  IWorkflowRecord,
  'id' | 'baseId' | 'name' | 'trigger' | 'conditions' | 'actions' | 'isActive'
>;

type IButtonBinding = {
  tableId: string;
  fieldIds: string[];
};

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cls: ClsService<IClsStore>,
    @InjectDbProvider() private readonly dbProvider: IDbProvider
  ) {}

  private get userId() {
    return this.cls.get('user.id');
  }

  async getTableBaseId(tableId: string) {
    return this.prismaService.tableMeta.findFirst({
      where: { id: tableId, deletedTime: null },
      select: { baseId: true },
    });
  }

  private parseJson<T>(value: string | null | undefined): T | undefined {
    if (!value) {
      return undefined;
    }

    return JSON.parse(value) as T;
  }

  private parseJsonSafe<T>(value: string | null | undefined): T | undefined {
    if (!value) {
      return undefined;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }

  private stringifyJson(value: unknown): string | null {
    if (value == null) {
      return null;
    }

    return JSON.stringify(value);
  }

  private getButtonBinding(trigger?: IWorkflowTrigger): IButtonBinding | null {
    if (trigger?.type !== 'buttonClick') {
      return null;
    }

    const tableId = typeof trigger.config?.tableId === 'string' ? trigger.config.tableId : '';
    const watchFieldIds = Array.isArray(trigger.config?.watchFieldIds)
      ? trigger.config.watchFieldIds.filter(
          (fieldId: unknown): fieldId is string => typeof fieldId === 'string'
        )
      : [];

    if (!tableId || watchFieldIds.length === 0) {
      return null;
    }

    return {
      tableId,
      fieldIds: watchFieldIds,
    };
  }

  private async syncButtonFieldWorkflowMeta(
    baseId: string,
    workflowId: string,
    workflowName: string,
    isActive: boolean,
    binding: IButtonBinding | null
  ) {
    if (!binding) {
      return;
    }

    const fields = await this.prismaService.txClient().field.findMany({
      where: {
        tableId: binding.tableId,
        id: { in: binding.fieldIds },
        type: FieldType.Button,
        deletedTime: null,
        table: {
          baseId,
          deletedTime: null,
        },
      },
      select: {
        id: true,
        tableId: true,
        options: true,
      },
    });

    await Promise.all(
      fields.map((field) => {
        const options = this.parseJsonSafe<IButtonFieldOptions>(field.options);
        const nextOptions: IButtonFieldOptions = {
          ...((options ?? {}) as IButtonFieldOptions),
          workflow: {
            id: workflowId,
            name: workflowName,
            isActive,
          },
        };

        return this.prismaService.txClient().field.updateMany({
          where: { id: field.id, tableId: field.tableId },
          data: { options: JSON.stringify(nextOptions), lastModifiedBy: this.userId },
        });
      })
    );
  }

  private toVo(workflow: IWorkflowRecord): IWorkflowVo {
    return {
      id: workflow.id,
      baseId: workflow.baseId,
      name: workflow.name,
      description: workflow.description,
      trigger: this.parseJson<IWorkflowTrigger>(workflow.trigger),
      conditions: this.parseJson<IWorkflowCondition[]>(workflow.conditions),
      actions: this.parseJson<IWorkflowAction[]>(workflow.actions),
      isActive: workflow.isActive,
      createdTime: workflow.createdTime.toISOString(),
      lastModifiedTime: workflow.lastModifiedTime?.toISOString() ?? null,
    };
  }

  private async getNextOrder(baseId: string): Promise<number> {
    const maxOrder = await this.prismaService.txClient().workflow.aggregate({
      where: { baseId, deletedTime: null },
      _max: { order: true },
    });

    return (maxOrder._max.order ?? 0) + 1;
  }

  private async lockBaseRow(baseId: string) {
    if (this.dbProvider.driver !== DriverClient.Pg) {
      return;
    }

    await this.prismaService.txClient()
      .$executeRaw`select id from base where id = ${baseId} for update`;
  }

  async getWorkflowById(baseId: string, workflowId: string): Promise<IWorkflowVo> {
    const workflow = await this.prismaService.workflow
      .findFirstOrThrow({
        where: { id: workflowId, baseId, deletedTime: null },
        select: {
          id: true,
          baseId: true,
          name: true,
          description: true,
          trigger: true,
          conditions: true,
          actions: true,
          isActive: true,
          createdTime: true,
          lastModifiedTime: true,
        },
      })
      .catch(() => {
        throw new CustomHttpException('Workflow not found', HttpErrorCode.NOT_FOUND);
      });

    return this.toVo(workflow);
  }

  async getWorkflowRuntimeById(workflowId: string, baseId?: string) {
    const workflow = (await this.prismaService.workflow.findFirst({
      where: {
        id: workflowId,
        ...(baseId ? { baseId } : {}),
        deletedTime: null,
      },
      select: {
        id: true,
        baseId: true,
        name: true,
        trigger: true,
        conditions: true,
        actions: true,
        isActive: true,
      },
    })) as IWorkflowRuntimeRecord | null;

    if (!workflow) {
      return null;
    }

    return {
      id: workflow.id,
      baseId: workflow.baseId,
      name: workflow.name,
      trigger: this.parseJson<IWorkflowTrigger>(workflow.trigger),
      conditions: this.parseJson<IWorkflowCondition[]>(workflow.conditions),
      actions: this.parseJson<IWorkflowAction[]>(workflow.actions),
      isActive: workflow.isActive,
    };
  }

  async createWorkflow(baseId: string, ro: IWorkflowCreateRo = {}): Promise<IWorkflowVo> {
    return await this.prismaService.$tx(async () => {
      await this.lockBaseRow(baseId);
      const order = await this.getNextOrder(baseId);
      const workflow = await this.prismaService.txClient().workflow.create({
        data: {
          id: generateWorkflowId(),
          baseId,
          name: ro.name?.trim() || 'Untitled automation',
          description: ro.description ?? null,
          trigger: this.stringifyJson(ro.trigger),
          conditions: this.stringifyJson(ro.conditions),
          actions: this.stringifyJson(ro.actions),
          isActive: ro.isActive ?? false,
          order,
          createdBy: this.userId,
        },
        select: {
          id: true,
          baseId: true,
          name: true,
          description: true,
          trigger: true,
          conditions: true,
          actions: true,
          isActive: true,
          createdTime: true,
          lastModifiedTime: true,
        },
      });
      const nextWorkflow = this.toVo(workflow);
      await this.syncButtonFieldWorkflowMeta(
        baseId,
        workflow.id,
        nextWorkflow.name,
        nextWorkflow.isActive,
        this.getButtonBinding(nextWorkflow.trigger)
      );

      return nextWorkflow;
    });
  }

  async updateWorkflow(
    baseId: string,
    workflowId: string,
    ro: IWorkflowUpdateRo
  ): Promise<IWorkflowVo> {
    const previousWorkflow = await this.getWorkflowById(baseId, workflowId);

    const data: Record<string, unknown> = {
      lastModifiedBy: this.userId,
    };

    if (Object.prototype.hasOwnProperty.call(ro, 'name')) {
      data.name = ro.name?.trim() || 'Untitled automation';
    }
    if (Object.prototype.hasOwnProperty.call(ro, 'description')) {
      data.description = ro.description ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(ro, 'trigger')) {
      data.trigger = this.stringifyJson(ro.trigger);
    }
    if (Object.prototype.hasOwnProperty.call(ro, 'conditions')) {
      data.conditions = this.stringifyJson(ro.conditions);
    }
    if (Object.prototype.hasOwnProperty.call(ro, 'actions')) {
      data.actions = this.stringifyJson(ro.actions);
    }
    if (Object.prototype.hasOwnProperty.call(ro, 'isActive')) {
      data.isActive = ro.isActive ?? false;
    }

    return await this.prismaService.$tx(async () => {
      const workflow = await this.prismaService.txClient().workflow.update({
        where: { id: workflowId },
        data,
        select: {
          id: true,
          baseId: true,
          name: true,
          description: true,
          trigger: true,
          conditions: true,
          actions: true,
          isActive: true,
          createdTime: true,
          lastModifiedTime: true,
        },
      });

      const nextWorkflow = this.toVo(workflow);
      const previousBinding = this.getButtonBinding(previousWorkflow.trigger);
      const nextBinding = this.getButtonBinding(nextWorkflow.trigger);

      await this.syncButtonFieldWorkflowMeta(
        baseId,
        workflowId,
        nextWorkflow.name,
        false,
        previousBinding
      );
      await this.syncButtonFieldWorkflowMeta(
        baseId,
        workflowId,
        nextWorkflow.name,
        nextWorkflow.isActive,
        nextBinding
      );

      return nextWorkflow;
    });
  }

  async deleteWorkflow(baseId: string, workflowId: string, permanent?: boolean): Promise<void> {
    const workflow = await this.getWorkflowById(baseId, workflowId);
    const binding = this.getButtonBinding(workflow.trigger);
    await this.prismaService.$tx(async () => {
      await this.syncButtonFieldWorkflowMeta(baseId, workflowId, workflow.name, false, binding);

      if (permanent) {
        await this.prismaService.txClient().workflow.delete({
          where: { id: workflowId },
        });
        return;
      }

      await this.prismaService.txClient().workflow.update({
        where: { id: workflowId },
        data: {
          deletedTime: new Date(),
          isActive: false,
          lastModifiedBy: this.userId,
        },
      });
    });
  }

  async duplicateWorkflow(
    baseId: string,
    workflowId: string,
    nextName?: string
  ): Promise<IWorkflowVo> {
    const workflow = await this.getWorkflowById(baseId, workflowId);
    const name =
      nextName?.trim() ||
      getUniqName(
        workflow.name,
        (
          await this.prismaService.workflow.findMany({
            where: { baseId, deletedTime: null },
            select: { name: true },
          })
        ).map((item) => item.name)
      );

    return this.createWorkflow(baseId, {
      name,
      description: workflow.description ?? undefined,
      trigger: workflow.trigger,
      conditions: workflow.conditions,
      actions: workflow.actions,
      isActive: false,
    });
  }
}
