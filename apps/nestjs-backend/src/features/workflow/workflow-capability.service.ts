import { Injectable } from '@nestjs/common';
import type { IWorkflowActionCapability } from './actions/action-definition';

@Injectable()
export class WorkflowCapabilityService {
  getCapabilities(): { actions: IWorkflowActionCapability[] } {
    return {
      actions: [
        { kind: 'queryRecords', configurable: true, runnable: true },
        { kind: 'createRecords', configurable: true, runnable: true },
        { kind: 'updateRecords', configurable: true, runnable: true },
        { kind: 'aiGenerate', configurable: true, runnable: true },
        { kind: 'runScript', configurable: true, runnable: false, reason: 'requiresSandbox' },
      ],
    };
  }
}
