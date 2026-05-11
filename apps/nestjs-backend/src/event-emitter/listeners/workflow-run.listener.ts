import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkflowRunnerService } from '../../features/workflow/workflow-runner.service';
import type { ButtonClickEvent } from '../events';
import { Events } from '../events';

@Injectable()
export class WorkflowRunListener {
  private readonly logger = new Logger(WorkflowRunListener.name);

  constructor(private readonly workflowRunnerService: WorkflowRunnerService) {}

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
}
