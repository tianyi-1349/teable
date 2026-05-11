import type { IWorkflowDetailVo } from '@teable/openapi';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { AutomationPage } from '../Pages';

export interface WorkFlowPanelRef {
  getWorkflow?: () => unknown | undefined;
  checkCanActive?: () => {
    canActive: boolean;
    message: string;
  };
  activeWorkflow?: () => Promise<void>;
}

interface WorkFlowPanelProps {
  baseId: string;
  workflowId: string;
  headLeft?: React.ReactNode;
}

const WorkFlowPanel = forwardRef<WorkFlowPanelRef, WorkFlowPanelProps>((props, ref) => {
  const [workflow, setWorkflow] = useState<IWorkflowDetailVo | undefined>();

  useImperativeHandle(
    ref,
    () => {
      return {
        getWorkflow: () => workflow,
        checkCanActive: () => ({
          canActive: Boolean(workflow && !workflow.isActive && workflow.nodes.length > 1),
          message: workflow ? '' : 'Workflow is not loaded',
        }),
      };
    },
    [workflow]
  );

  return <AutomationPage {...props} onWorkflowChange={setWorkflow} />;
});

WorkFlowPanel.displayName = 'WorkFlowPanel';

export { WorkFlowPanel };
