import type { IWorkflowDetailVo } from '@teable/openapi';
import { activateWorkflow, getWorkflow } from '@teable/openapi';
import { toast } from '@teable/ui-lib/shadcn/ui/sonner';
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

const checkWorkflowCanActive = (workflow?: IWorkflowDetailVo) => {
  if (!workflow) {
    return { canActive: false, message: 'Workflow is not loaded' };
  }
  if (workflow.isActive) {
    return { canActive: false, message: 'Workflow is already active' };
  }
  if (!workflow.nodes.some((node) => node.nodeType === 'trigger')) {
    return { canActive: false, message: 'Workflow requires a trigger before activation' };
  }
  const actions = workflow.nodes.filter((node) => node.nodeType === 'action');
  if (!actions.length) {
    return { canActive: false, message: 'Workflow requires at least one action before activation' };
  }
  const invalidAction = actions.find((action) => {
    const config = action.config as { script?: string; code?: string; prompt?: string } | undefined;
    if (action.kind === 'runScript') {
      return !config?.script && !config?.code;
    }
    if (action.kind === 'aiGenerate') {
      return !config?.prompt;
    }
    return true;
  });
  if (invalidAction) {
    return { canActive: false, message: `Workflow action ${invalidAction.kind} is not runnable` };
  }
  return { canActive: true, message: '' };
};

const WorkFlowPanel = forwardRef<WorkFlowPanelRef, WorkFlowPanelProps>((props, ref) => {
  const [workflow, setWorkflow] = useState<IWorkflowDetailVo | undefined>();

  useImperativeHandle(
    ref,
    () => {
      return {
        getWorkflow: () => workflow,
        checkCanActive: () => checkWorkflowCanActive(workflow),
        activeWorkflow: async () => {
          const checkResult = checkWorkflowCanActive(workflow);
          if (!checkResult.canActive) {
            toast.error(checkResult.message);
            return;
          }
          await activateWorkflow(props.baseId, props.workflowId);
          const { data } = await getWorkflow(props.baseId, props.workflowId);
          setWorkflow(data);
          toast.success('Workflow activated');
        },
      };
    },
    [props.baseId, props.workflowId, workflow]
  );

  return <AutomationPage {...props} onWorkflowChange={setWorkflow} />;
});

WorkFlowPanel.displayName = 'WorkFlowPanel';

export { WorkFlowPanel };
