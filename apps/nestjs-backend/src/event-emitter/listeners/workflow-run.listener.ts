import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkflowService } from '../../features/workflow/workflow.service';
import type { ButtonClickEvent } from '../events';
import { Events } from '../events';

@Injectable()
export class WorkflowRunListener {
  private readonly logger = new Logger(WorkflowRunListener.name);

  constructor(private readonly workflowService: WorkflowService) {}

  @OnEvent(Events.TABLE_BUTTON_CLICK, { async: true })
  async handleButtonClick(event: ButtonClickEvent): Promise<void> {
    const { runId } = event.payload;
    if (!runId) {
      return;
    }

    try {
      await this.workflowService.completeEmptyRun(runId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Complete workflow run ${runId} failed: ${message}`);
    }
  }
}
