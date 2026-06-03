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
  nextRunAt?: string;
  timezone?: string;
};

const cronPartCount = 5;
const defaultTimeZone = 'UTC';

const getTimeZone = (timezone?: string) => timezone?.trim() || defaultTimeZone;

const isValidTimeZone = (timezone: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
};

const addCronRange = (
  values: Set<number>,
  min: number,
  max: number,
  start: number,
  end: number,
  step = 1
) => {
  if (start < min || end > max || start > end || step < 1) {
    return false;
  }

  for (let value = start; value <= end; value += step) {
    values.add(value);
  }
  return true;
};

const addCronFieldSegment = (values: Set<number>, segment: string, min: number, max: number) => {
  const [rangePart, stepPart] = segment.split('/');
  const step = stepPart == null ? 1 : Number(stepPart);
  if (!Number.isInteger(step) || step < 1) {
    return false;
  }

  if (rangePart === '*') {
    return addCronRange(values, min, max, min, max, step);
  }

  if (rangePart.includes('-')) {
    const [start, end] = rangePart.split('-').map(Number);
    return Number.isInteger(start) && Number.isInteger(end)
      ? addCronRange(values, min, max, start, end, step)
      : false;
  }

  const value = Number(rangePart);
  return Number.isInteger(value) ? addCronRange(values, min, max, value, value, step) : false;
};

const parseCronField = (field: string, min: number, max: number): Set<number> | undefined => {
  const values = new Set<number>();

  for (const rawSegment of field.split(',')) {
    const segment = rawSegment.trim();
    if (!segment || !addCronFieldSegment(values, segment, min, max)) {
      return undefined;
    }
  }

  return values.size ? values : undefined;
};

const getTimeZoneParts = (date: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    minute: 'numeric',
    hour: 'numeric',
    day: 'numeric',
    month: 'numeric',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(value('weekday'));

  return {
    minute: Number(value('minute')),
    hour: Number(value('hour')),
    day: Number(value('day')),
    month: Number(value('month')),
    weekday,
  };
};

type IParsedWorkflowCron = {
  minute: Set<number>;
  hour: Set<number>;
  day: Set<number>;
  month: Set<number>;
  weekday: Set<number>;
};

const matchesWorkflowCron = (cron: IParsedWorkflowCron, candidate: Date, timezone: string) => {
  const parts = getTimeZoneParts(candidate, timezone);
  const normalizedWeekday = parts.weekday === 0 ? 7 : parts.weekday;

  return (
    cron.minute.has(parts.minute) &&
    cron.hour.has(parts.hour) &&
    cron.day.has(parts.day) &&
    cron.month.has(parts.month) &&
    (cron.weekday.has(parts.weekday) || cron.weekday.has(normalizedWeekday))
  );
};

export const parseWorkflowCron = (cron: string): IParsedWorkflowCron | undefined => {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== cronPartCount) {
    return undefined;
  }

  const [minute, hour, day, month, weekday] = parts;
  const minuteSet = parseCronField(minute, 0, 59);
  const hourSet = parseCronField(hour, 0, 23);
  const daySet = parseCronField(day, 1, 31);
  const monthSet = parseCronField(month, 1, 12);
  const weekdaySet = parseCronField(weekday, 0, 7);

  if (!minuteSet || !hourSet || !daySet || !monthSet || !weekdaySet) {
    return undefined;
  }

  const parsed: IParsedWorkflowCron = {
    minute: minuteSet,
    hour: hourSet,
    day: daySet,
    month: monthSet,
    weekday: weekdaySet,
  };

  return parsed;
};

const getOneTimeNextRunAt = (config: IWorkflowScheduleConfig, now: Date) => {
  const runAt = config.runAt ? new Date(config.runAt) : undefined;
  return runAt && Number.isFinite(runAt.getTime()) && runAt.getTime() > now.getTime()
    ? runAt.toISOString()
    : undefined;
};

const getIntervalNextRunAt = (config: IWorkflowScheduleConfig, now: Date) => {
  const intervalSeconds = Math.floor(config.intervalSeconds ?? 0);
  return intervalSeconds > 0
    ? new Date(now.getTime() + intervalSeconds * 1000).toISOString()
    : undefined;
};

const getCronNextRunAt = (config: IWorkflowScheduleConfig, now: Date) => {
  if (!config.cron) {
    return undefined;
  }

  const timezone = getTimeZone(config.timezone);
  if (!isValidTimeZone(timezone)) {
    return undefined;
  }

  const cron = parseWorkflowCron(config.cron);
  if (!cron) {
    return undefined;
  }

  const nextMinute = new Date(now.getTime());
  nextMinute.setUTCSeconds(0, 0);
  nextMinute.setUTCMinutes(nextMinute.getUTCMinutes() + 1);

  for (let offset = 0; offset < 366 * 24 * 60; offset += 1) {
    const candidate = new Date(nextMinute.getTime() + offset * 60 * 1000);
    if (matchesWorkflowCron(cron, candidate, timezone)) {
      return candidate.toISOString();
    }
  }

  return undefined;
};

export const getWorkflowScheduleNextRunAt = (
  config: IWorkflowScheduleConfig,
  now = new Date()
): string | undefined => {
  if (config.mode === 'oneTime') {
    return getOneTimeNextRunAt(config, now);
  }

  if (config.mode === 'interval') {
    return getIntervalNextRunAt(config, now);
  }

  return config.mode === 'cron' ? getCronNextRunAt(config, now) : undefined;
};

export const getWorkflowScheduleNextRunList = (
  config: IWorkflowScheduleConfig,
  now = new Date(),
  count = 5
): string[] => {
  const limit = Math.max(0, Math.min(20, Math.floor(count)));
  if (!limit) {
    return [];
  }

  if (config.mode === 'interval') {
    const intervalSeconds = Math.floor(config.intervalSeconds ?? 0);
    if (intervalSeconds <= 0) {
      return [];
    }
    return Array.from({ length: limit }, (_, index) =>
      new Date(now.getTime() + intervalSeconds * 1000 * (index + 1)).toISOString()
    );
  }

  const runs: string[] = [];
  let cursor = new Date(now.getTime());
  for (let index = 0; index < limit; index += 1) {
    const nextRunAt = getWorkflowScheduleNextRunAt(config, cursor);
    if (!nextRunAt) {
      break;
    }
    runs.push(nextRunAt);
    if (config.mode === 'oneTime') {
      break;
    }
    cursor = new Date(new Date(nextRunAt).getTime() + 60 * 1000);
  }
  return runs;
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
    await this.removeWorkflowSchedule(workflow.id);

    if (!workflow.isActive || !config || config.mode === 'manual') {
      return;
    }

    const jobOptions = this.toJobOptions(config, workflow.id);
    if (!jobOptions) {
      this.logger.warn(`Skip invalid schedule config for workflow ${workflow.id}`);
      return;
    }
    const nextRunAt = getWorkflowScheduleNextRunAt(config);

    await this.queue.add(
      WORKFLOW_SCHEDULE_JOB,
      {
        workflowId: workflow.id,
        baseId: workflow.baseId,
        nextRunAt,
        timezone: getTimeZone(config.timezone),
      },
      jobOptions
    );
  }

  async removeWorkflowSchedule(workflowId: string) {
    if (!('getRepeatableJobs' in this.queue) || !('removeRepeatableByKey' in this.queue)) {
      return;
    }

    if ('remove' in this.queue && typeof this.queue.remove === 'function') {
      await this.queue.remove(this.getJobId(workflowId));
    }

    const repeatableJobs = await this.queue.getRepeatableJobs();
    const jobId = this.getJobId(workflowId);
    const matchedJobs = repeatableJobs.filter((job) => job.id === jobId);
    await Promise.all(matchedJobs.map((job) => this.queue.removeRepeatableByKey(job.key)));
  }

  private getJobId(workflowId: string) {
    return `workflow:schedule:${workflowId}`;
  }

  private toJobOptions(
    config: IWorkflowScheduleConfig,
    workflowId: string
  ): JobsOptions | undefined {
    const jobId = this.getJobId(workflowId);
    if (config.mode === 'oneTime') {
      const nextRunAt = getWorkflowScheduleNextRunAt(config);
      if (!nextRunAt) {
        return undefined;
      }
      return { jobId, delay: Math.max(0, new Date(nextRunAt).getTime() - Date.now()) };
    }

    const repeat = this.toRepeatOptions(config);
    return repeat ? { jobId, repeat } : undefined;
  }

  private toRepeatOptions(config: IWorkflowScheduleConfig): JobsOptions['repeat'] | undefined {
    if (config.mode === 'interval') {
      const every = Math.max(1, Math.floor(config.intervalSeconds ?? 0)) * 1000;
      return every >= 1000 ? { every } : undefined;
    }

    if (config.mode === 'cron' && config.cron) {
      const timezone = getTimeZone(config.timezone);
      if (!isValidTimeZone(timezone) || !parseWorkflowCron(config.cron)) {
        return undefined;
      }
      return { pattern: config.cron, tz: timezone };
    }

    return undefined;
  }
}
