import { Module, forwardRef } from '@nestjs/common';
import { EventJobModule } from '../../event-emitter/event-job/event-job.module';
import { WorkflowModule } from './workflow.module';
import { WORKFLOW_SCHEDULE_QUEUE, WorkflowScheduleService } from './workflow-schedule.service';
import { WorkflowScheduleProcessor } from './workflow-schedule.processor';

@Module({
  imports: [
    forwardRef(() => WorkflowModule),
    EventJobModule.registerQueue(WORKFLOW_SCHEDULE_QUEUE),
  ],
  providers: [WorkflowScheduleService, WorkflowScheduleProcessor],
  exports: [WorkflowScheduleService],
})
export class WorkflowScheduleModule {}
