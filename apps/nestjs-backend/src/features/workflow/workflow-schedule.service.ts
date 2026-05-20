import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import type { IWorkflowDetailVo } from '@teable/openapi';
import { Queue } from 'bullmq';
import type { JobsOptions } from 'bullmq';

import { workflowScheduleFacadeToken } from './workflow-schedule.facade';
import { type IWorkflowScheduleConfig, IWorkflowScheduleFacade } from './workflow-schedule.facade';

export const WORKFLOW_SCHEDULE_QUEUE = 'workflowScheduleQueue';
export const WORKFLOW_SCHEDULE_JOB = 'workflowScheduleTick';

type IWorkflowScheduleJobData = {
  workflowId: string;
  baseId: string;
};

@Injectable()
export class WorkflowScheduleService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowScheduleService.name);

  constructor(
    @Inject(workflowScheduleFacadeToken)
    private readonly workflowFacade: IWorkflowScheduleFacade,
    @InjectQueue(WORKFLOW_SCHEDULE_QUEUE)
    private readonly queue: Queue<IWorkflowScheduleJobData>
  ) {}

  async onModuleInit() {
    const workflows = await this.workflowFacade.listActiveScheduleWorkflows();
    await Promise.all(workflows.map((workflow) => this.syncWorkflowSchedule(workflow)));
  }

  async syncWorkflowSchedule(workflow: IWorkflowDetailVo) {
    const config = this.workflowFacade.getScheduleTriggerConfig(workflow);
    const jobId = this.getJobId(workflow.id);
    await this.removeWorkflowSchedule(workflow.id);

    if (!workflow.isActive || !config || config.mode === 'manual') {
      return;
    }

    const repeat = this.toRepeatOptions(config);
    if (!repeat) {
      this.logger.warn(`Skip invalid schedule config for workflow ${workflow.id}`);
      return;
    }

    await this.queue.add(
      WORKFLOW_SCHEDULE_JOB,
      {
        workflowId: workflow.id,
        baseId: workflow.baseId,
      },
      {
        jobId,
        repeat,
      }
    );
  }

  async removeWorkflowSchedule(workflowId: string) {
    if (!('getRepeatableJobs' in this.queue) || !('removeRepeatableByKey' in this.queue)) {
      return;
    }

    const repeatableJobs = await this.queue.getRepeatableJobs();
    const jobId = this.getJobId(workflowId);
    const matchedJobs = repeatableJobs.filter((job) => job.id === jobId);
    await Promise.all(matchedJobs.map((job) => this.queue.removeRepeatableByKey(job.key)));
  }

  private getJobId(workflowId: string) {
    return `workflow:schedule:${workflowId}`;
  }

  private toRepeatOptions(config: IWorkflowScheduleConfig): JobsOptions['repeat'] | undefined {
    if (config.mode === 'interval') {
      const every = Math.max(1, Math.floor(config.intervalSeconds ?? 0)) * 1000;
      return every >= 1000 ? { every } : undefined;
    }

    if (config.mode === 'cron' && config.cron) {
      return { pattern: config.cron };
    }

    return undefined;
  }
}
