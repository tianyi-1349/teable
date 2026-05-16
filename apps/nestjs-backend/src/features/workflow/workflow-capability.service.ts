import { Injectable } from '@nestjs/common';
import type { IWorkflowActionCapability } from './actions/action-definition';
import { getWorkflowActionCapabilities } from './actions/action-capability';

@Injectable()
export class WorkflowCapabilityService {
  getCapabilities(): { actions: IWorkflowActionCapability[] } {
    return {
      actions: getWorkflowActionCapabilities(),
    };
  }
}
