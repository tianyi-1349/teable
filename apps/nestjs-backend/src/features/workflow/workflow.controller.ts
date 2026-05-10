import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import type {
  IDuplicateWorkflowRo,
  IUpdateWorkflowRo,
  IWorkflowDetailVo,
  IWorkflowRo,
  IWorkflowRunDetailVo,
  IWorkflowRunVo,
  IWorkflowVo,
} from '@teable/openapi';
import {
  duplicateWorkflowRoSchema,
  updateWorkflowRoSchema,
  workflowRoSchema,
} from '@teable/openapi';
import { EmitControllerEvent } from '../../event-emitter/decorators/emit-controller-event.decorator';
import { Events } from '../../event-emitter/events';
import { ZodValidationPipe } from '../../zod.validation.pipe';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { WorkflowService } from './workflow.service';

@Controller('api/base/:baseId/workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  @Permissions('automation|read')
  getWorkflowList(@Param('baseId') baseId: string): Promise<IWorkflowVo[]> {
    return this.workflowService.getWorkflowList(baseId);
  }

  @Get(':workflowId')
  @Permissions('automation|read')
  getWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowDetailVo> {
    return this.workflowService.getWorkflow(baseId, workflowId);
  }

  @Get(':workflowId/run')
  @Permissions('automation|read')
  getWorkflowRunList(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowRunVo[]> {
    return this.workflowService.getWorkflowRunList(baseId, workflowId);
  }

  @Get(':workflowId/run/:runId')
  @Permissions('automation|read')
  getWorkflowRun(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Param('runId') runId: string
  ): Promise<IWorkflowRunDetailVo> {
    return this.workflowService.getWorkflowRun(baseId, workflowId, runId);
  }

  @Post()
  @Permissions('automation|create')
  @EmitControllerEvent(Events.WORKFLOW_CREATE)
  createWorkflow(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(workflowRoSchema)) ro: IWorkflowRo
  ): Promise<IWorkflowVo> {
    return this.workflowService.createWorkflow(baseId, ro);
  }

  @Put(':workflowId')
  @Permissions('automation|update')
  @EmitControllerEvent(Events.WORKFLOW_UPDATE)
  updateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body(new ZodValidationPipe(updateWorkflowRoSchema)) ro: IUpdateWorkflowRo
  ): Promise<IWorkflowVo> {
    return this.workflowService.updateWorkflow(baseId, workflowId, ro);
  }

  @Post(':workflowId/duplicate')
  @Permissions('automation|create')
  @EmitControllerEvent(Events.WORKFLOW_CREATE)
  duplicateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body(new ZodValidationPipe(duplicateWorkflowRoSchema)) ro: IDuplicateWorkflowRo
  ): Promise<IWorkflowVo> {
    return this.workflowService.duplicateWorkflow(baseId, workflowId, ro);
  }

  @Post(':workflowId/activate')
  @Permissions('automation|update')
  @EmitControllerEvent(Events.WORKFLOW_ACTIVATE)
  activateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowVo> {
    return this.workflowService.activateWorkflow(baseId, workflowId);
  }

  @Post(':workflowId/deactivate')
  @Permissions('automation|update')
  @EmitControllerEvent(Events.WORKFLOW_DEACTIVATE)
  deactivateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowVo> {
    return this.workflowService.deactivateWorkflow(baseId, workflowId);
  }

  @Delete(':workflowId')
  @Permissions('automation|delete')
  @EmitControllerEvent(Events.WORKFLOW_DELETE)
  deleteWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<void> {
    return this.workflowService.deleteWorkflow(baseId, workflowId);
  }
}
