import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkflowRunnerService } from '../../features/workflow/workflow-runner.service';
import { WorkflowService } from '../../features/workflow/workflow.service';
import { ButtonClickEvent, RecordCreateEvent, RecordUpdateEvent, Events } from '../events';

@Injectable()
export class WorkflowRunListener {
  private readonly logger = new Logger(WorkflowRunListener.name);

  constructor(
    private readonly workflowRunnerService: WorkflowRunnerService,
    private readonly workflowService: WorkflowService
  ) {}

  @OnEvent(Events.TABLE_BUTTON_CLICK, { async: true })
  async handleButtonClick(event: ButtonClickEvent): Promise<void> {
    const { runId } = event.payload;
    if (!runId) {
      return;
    }

    try {
      await this.workflowRunnerService.executeWorkflowRun(runId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Execute workflow run ${runId} failed: ${message}`);
    }
  }

  @OnEvent(Events.TABLE_RECORD_CREATE, { async: true })
  async handleRecordCreate(event: RecordCreateEvent): Promise<void> {
    await this.handleRecordTrigger('recordCreated', event.payload.tableId, event.payload);
  }

  @OnEvent(Events.TABLE_RECORD_UPDATE, { async: true })
  async handleRecordUpdate(event: RecordUpdateEvent): Promise<void> {
    await this.handleRecordTrigger('recordUpdated', event.payload.tableId, event.payload);
    await this.handleRecordTrigger('recordMatchesConditions', event.payload.tableId, event.payload);
  }

  private async handleRecordTrigger(
    triggerType: 'recordCreated' | 'recordUpdated' | 'recordMatchesConditions',
    tableId: string,
    input: unknown
  ) {
    try {
      const runs = await this.workflowService.createRecordTriggerRuns(tableId, triggerType, input);
      for (const { runId } of runs) {
        await this.workflowRunnerService.executeWorkflowRun(runId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Execute ${triggerType} workflow runs for table ${tableId} failed: ${message}`
      );
    }
  }
}
