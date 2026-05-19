import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import type { NestWorkerOptions } from '@nestjs/bullmq/dist/interfaces/worker-options.interface';
import { Injectable } from '@nestjs/common';
import type { Job, Queue } from 'bullmq';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WORKFLOW_SCHEDULE_JOB, WORKFLOW_SCHEDULE_QUEUE } from './workflow-schedule.service';
import { WorkflowService } from './workflow.service';

type IWorkflowScheduleJobData = {
  workflowId: string;
  baseId: string;
};

const queueOptions: NestWorkerOptions = {
  removeOnComplete: {
    count: 1000,
  },
  removeOnFail: {
    count: 1000,
  },
};

@Processor(WORKFLOW_SCHEDULE_QUEUE, queueOptions)
@Injectable()
export class WorkflowScheduleProcessor extends WorkerHost {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowRunnerService: WorkflowRunnerService,
    @InjectQueue(WORKFLOW_SCHEDULE_QUEUE)
    public readonly queue: Queue<IWorkflowScheduleJobData>
  ) {
    super();
  }

  async process(job: Job<IWorkflowScheduleJobData>) {
    if (job.name !== WORKFLOW_SCHEDULE_JOB || !job.data?.workflowId) {
      return;
    }

    const run = await this.workflowService.createScheduleRun(job.data.workflowId, {
      source: 'workflowScheduleProcessor',
      schedule: {
        jobId: job.id,
        repeatJobKey: job.repeatJobKey,
      },
      triggeredAt: new Date().toISOString(),
    });
    await this.workflowRunnerService.executeWorkflowRun(run.runId);
  }
}
