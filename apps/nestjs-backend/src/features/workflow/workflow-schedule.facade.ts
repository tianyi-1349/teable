import type { IWorkflowDetailVo } from '@teable/openapi';

export type IWorkflowScheduleConfig = {
  mode?: 'manual' | 'interval' | 'cron' | 'oneTime';
  intervalSeconds?: number;
  cron?: string;
  timezone?: string;
  runAt?: string;
};

export interface IWorkflowScheduleFacade {
  listActiveScheduleWorkflows(): Promise<IWorkflowDetailVo[]>;
  getScheduleTriggerConfig(
    workflow: Pick<IWorkflowDetailVo, 'nodes'>
  ): IWorkflowScheduleConfig | undefined;
}

export const workflowScheduleFacadeToken = Symbol('workflowScheduleFacade');
