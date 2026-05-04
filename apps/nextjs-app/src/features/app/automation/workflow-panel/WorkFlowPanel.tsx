import type { IFieldVo } from '@teable/core';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { AutomationPage, type AutomationPageApi } from '../Pages';
import { AppModeConfigEditorCard } from './AppModeConfigEditorCard';

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
  tableId?: string;
  buttonField?: IFieldVo;
  headLeft?: React.ReactNode;
}

const WorkFlowPanel = forwardRef<WorkFlowPanelRef, WorkFlowPanelProps>((_props, ref) => {
  const { baseId, workflowId, tableId, buttonField, headLeft } = _props;
  const pageApiRef = useRef<AutomationPageApi>();

  useImperativeHandle(
    ref,
    () => {
      return {
        getWorkflow: () => pageApiRef.current?.getWorkflow(),
        checkCanActive: () =>
          pageApiRef.current?.checkCanActive() ?? { canActive: false, message: '' },
        activeWorkflow: async () => {
          await pageApiRef.current?.activeWorkflow();
        },
      };
    },
    []
  );

  return (
    <div className="grid h-full gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
      <AutomationPage
        baseId={baseId}
        workflowId={workflowId}
        tableId={tableId}
        buttonField={buttonField}
        headLeft={headLeft}
        onRegisterApi={(api) => {
          pageApiRef.current = api;
        }}
      />
      <div className="overflow-auto pr-1">
        <AppModeConfigEditorCard baseId={baseId} />
      </div>
    </div>
  );
});

WorkFlowPanel.displayName = 'WorkFlowPanel';

export { WorkFlowPanel };
