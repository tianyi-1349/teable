import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import type {
  IAiCreateWorkflowDraftRo,
  IDuplicateWorkflowRo,
  IUpdateWorkflowRo,
  IWorkflowCapabilitiesVo,
  IWorkflowDetailVo,
  IWorkflowRo,
  IWorkflowRunDetailVo,
  IWorkflowRunVo,
  IWorkflowVo,
} from '@teable/openapi';
import {
  aiCreateWorkflowDraftRoSchema,
  duplicateWorkflowRoSchema,
  testNodeWorkflowRoSchema,
  testRunWorkflowRoSchema,
  updateWorkflowRoSchema,
  workflowRoSchema,
} from '@teable/openapi';
import { EmitControllerEvent } from '../../event-emitter/decorators/emit-controller-event.decorator';
import { Events } from '../../event-emitter/events';
import { ZodValidationPipe } from '../../zod.validation.pipe';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { WorkflowCapabilityService } from './workflow-capability.service';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WorkflowService } from './workflow.service';

const automationReadPermission = 'automation|read';
const automationCreatePermission = 'automation|create';
const automationUpdatePermission = 'automation|update';
const workflowIdParam = ':workflowId';

const normalizeDirectTriggerBody = (body: unknown, baseId: string, source: string) => ({
  ...(typeof body === 'object' && body != null
    ? (body as Record<string, unknown>)
    : { value: body }),
  source,
  baseId,
});

@Controller('api/base/:baseId/workflow')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowRunnerService: WorkflowRunnerService,
    private readonly workflowCapabilityService: WorkflowCapabilityService
  ) {}

  @Get()
  @Permissions(automationReadPermission)
  getWorkflowList(@Param('baseId') baseId: string): Promise<IWorkflowVo[]> {
    return this.workflowService.getWorkflowList(baseId);
  }

  @Get('capabilities')
  @Permissions(automationReadPermission)
  getWorkflowCapabilities(): IWorkflowCapabilitiesVo {
    return this.workflowCapabilityService.getCapabilities();
  }

  @Get(workflowIdParam)
  @Permissions(automationReadPermission)
  getWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowDetailVo> {
    return this.workflowService.getWorkflow(baseId, workflowId);
  }

  @Get(`${workflowIdParam}/run`)
  @Permissions(automationReadPermission)
  getWorkflowRunList(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowRunVo[]> {
    return this.workflowService.getWorkflowRunList(baseId, workflowId);
  }

  @Get(`${workflowIdParam}/run/:runId`)
  @Permissions(automationReadPermission)
  getWorkflowRun(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Param('runId') runId: string
  ): Promise<IWorkflowRunDetailVo> {
    return this.workflowService.getWorkflowRun(baseId, workflowId, runId);
  }

  @Post(`${workflowIdParam}/test-run`)
  @Permissions(automationUpdatePermission)
  async testRunWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body(new ZodValidationPipe(testRunWorkflowRoSchema)) ro: { input?: unknown }
  ): Promise<IWorkflowRunVo> {
    const run = await this.workflowService.createTestRun(baseId, workflowId, ro.input);
    await this.workflowRunnerService.executeWorkflowRun(run.id);
    return this.workflowService.getWorkflowRun(baseId, workflowId, run.id);
  }

  @Post(`${workflowIdParam}/test-node`)
  @Permissions(automationUpdatePermission)
  async testNodeWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body(new ZodValidationPipe(testNodeWorkflowRoSchema)) ro: { nodeId: string; input?: unknown }
  ): Promise<IWorkflowRunVo> {
    const run = await this.workflowService.createTestNodeRun(
      baseId,
      workflowId,
      ro.nodeId,
      ro.input
    );
    await this.workflowRunnerService.executeWorkflowRun(run.id);
    return this.workflowService.getWorkflowRun(baseId, workflowId, run.id);
  }

  @Post(`${workflowIdParam}/webhook`)
  async triggerWebhookWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body() body: unknown,
    @Headers('x-webhook-secret') webhookSecret?: string,
    @Headers('x-webhook-signature') webhookSignature?: string,
    @Headers('x-webhook-timestamp') webhookTimestamp?: string,
    @Req() req?: Request
  ): Promise<IWorkflowRunVo> {
    const run = await this.workflowService.createWebhookRun(
      workflowId,
      normalizeDirectTriggerBody(body, baseId, 'workflowWebhook'),
      {
        secret: webhookSecret,
        signature: webhookSignature,
        timestamp: webhookTimestamp,
        rawBody:
          typeof req?.body === 'string' || Buffer.isBuffer(req?.body)
            ? req.body.toString()
            : JSON.stringify(body ?? null),
      }
    );
    await this.workflowRunnerService.executeWorkflowRun(run.runId);
    return this.workflowService.getWorkflowRun(baseId, workflowId, run.runId);
  }

  @Post(`${workflowIdParam}/schedule`)
  @Permissions(automationUpdatePermission)
  async triggerScheduleWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body() body: unknown
  ): Promise<IWorkflowRunVo> {
    const run = await this.workflowService.createScheduleRun(
      workflowId,
      normalizeDirectTriggerBody(body, baseId, 'workflowSchedule')
    );
    await this.workflowRunnerService.executeWorkflowRun(run.runId);
    return this.workflowService.getWorkflowRun(baseId, workflowId, run.runId);
  }

  @Post(`${workflowIdParam}/form-submitted`)
  @Permissions(automationUpdatePermission)
  async triggerFormSubmittedWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body() body: unknown
  ): Promise<IWorkflowRunVo> {
    const run = await this.workflowService.createFormSubmittedRun(
      workflowId,
      normalizeDirectTriggerBody(body, baseId, 'workflowFormSubmitted')
    );
    await this.workflowRunnerService.executeWorkflowRun(run.runId);
    return this.workflowService.getWorkflowRun(baseId, workflowId, run.runId);
  }

  @Post(`${workflowIdParam}/email-received`)
  @Permissions(automationUpdatePermission)
  async triggerEmailReceivedWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body() body: unknown
  ): Promise<IWorkflowRunVo> {
    const run = await this.workflowService.createEmailReceivedRun(
      workflowId,
      normalizeDirectTriggerBody(body, baseId, 'workflowEmailReceived')
    );
    await this.workflowRunnerService.executeWorkflowRun(run.runId);
    return this.workflowService.getWorkflowRun(baseId, workflowId, run.runId);
  }

  @Post()
  @Permissions(automationCreatePermission)
  @EmitControllerEvent(Events.WORKFLOW_CREATE)
  createWorkflow(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(workflowRoSchema)) ro: IWorkflowRo
  ): Promise<IWorkflowVo> {
    return this.workflowService.createWorkflow(baseId, ro);
  }

  @Post('ai-create-draft')
  @Permissions(automationCreatePermission)
  @EmitControllerEvent(Events.WORKFLOW_CREATE)
  aiCreateWorkflowDraft(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(aiCreateWorkflowDraftRoSchema)) ro: IAiCreateWorkflowDraftRo
  ): Promise<IWorkflowDetailVo> {
    return this.workflowService.aiCreateWorkflowDraft(baseId, ro);
  }

  @Put(workflowIdParam)
  @Permissions(automationUpdatePermission)
  @EmitControllerEvent(Events.WORKFLOW_UPDATE)
  updateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body(new ZodValidationPipe(updateWorkflowRoSchema)) ro: IUpdateWorkflowRo
  ): Promise<IWorkflowVo> {
    return this.workflowService.updateWorkflow(baseId, workflowId, ro);
  }

  @Post(`${workflowIdParam}/duplicate`)
  @Permissions(automationCreatePermission)
  @EmitControllerEvent(Events.WORKFLOW_CREATE)
  duplicateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string,
    @Body(new ZodValidationPipe(duplicateWorkflowRoSchema)) ro: IDuplicateWorkflowRo
  ): Promise<IWorkflowVo> {
    return this.workflowService.duplicateWorkflow(baseId, workflowId, ro);
  }

  @Post(`${workflowIdParam}/activate`)
  @Permissions(automationUpdatePermission)
  @EmitControllerEvent(Events.WORKFLOW_ACTIVATE)
  activateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowVo> {
    return this.workflowService.activateWorkflow(baseId, workflowId);
  }

  @Post(`${workflowIdParam}/apply-update`)
  @Permissions(automationUpdatePermission)
  @EmitControllerEvent(Events.WORKFLOW_APPLY_UPDATE)
  applyUpdateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowVo> {
    return this.workflowService.applyUpdateWorkflow(baseId, workflowId);
  }

  @Post(`${workflowIdParam}/deactivate`)
  @Permissions(automationUpdatePermission)
  @EmitControllerEvent(Events.WORKFLOW_DEACTIVATE)
  deactivateWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<IWorkflowVo> {
    return this.workflowService.deactivateWorkflow(baseId, workflowId);
  }

  @Delete(workflowIdParam)
  @Permissions('automation|delete')
  @EmitControllerEvent(Events.WORKFLOW_DELETE)
  deleteWorkflow(
    @Param('baseId') baseId: string,
    @Param('workflowId') workflowId: string
  ): Promise<void> {
    return this.workflowService.deleteWorkflow(baseId, workflowId);
  }
}
