import { Injectable } from '@nestjs/common';
import { getWorkflowActionCapabilities } from './actions/action-capability';
import type { IWorkflowActionCapability } from './actions/action-definition';

@Injectable()
export class WorkflowCapabilityService {
  getCapabilities(): { actions: IWorkflowActionCapability[] } {
    return {
      actions: getWorkflowActionCapabilities(),
    };
  }
}
