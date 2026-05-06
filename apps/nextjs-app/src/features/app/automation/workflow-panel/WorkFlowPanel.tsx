import type { IFieldVo } from '@teable/core';
import { forwardRef, useImperativeHandle } from 'react';
import { AutomationPage } from '../Pages';
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
  const workflowLabel = buttonField?.name || workflowId;

  useImperativeHandle(
    ref,
    () => {
      return {
        getWorkflow: () => undefined,
        checkCanActive: () => ({ canActive: false, message: '' }),
        activeWorkflow: async () => undefined,
      };
    },
    []
  );

  return (
    <div className="grid h-full gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-h-0 overflow-hidden rounded-2xl border border-border/60 bg-background">
        <div className="border-b border-border/60 px-3 py-2">{headLeft}</div>
        <div className="grid h-[calc(100%-45px)] min-h-0 grid-rows-[auto_minmax(0,1fr)]">
          <div className="border-b border-border/60 bg-muted/20 px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium text-foreground">Workflow context</div>
                <div className="text-xs text-muted-foreground">
                  Keep automation setup and app-mode governance in the same workspace.
                </div>
              </div>
              <div className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                Enterprise preview
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Workflow
                </div>
                <div className="mt-1 truncate font-medium text-foreground">{workflowLabel}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Workflow ID
                </div>
                <div className="mt-1 truncate font-mono text-foreground">{workflowId}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Base ID
                </div>
                <div className="mt-1 truncate font-mono text-foreground">{baseId}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Trigger field
                </div>
                <div className="mt-1 truncate font-medium text-foreground">
                  {buttonField ? buttonField.name : tableId ? tableId : 'Not linked yet'}
                </div>
              </div>
            </div>
          </div>
          <div className="min-h-0 overflow-auto">
            <AutomationPage />
          </div>
        </div>
      </div>
      <div className="overflow-auto pr-1">
        <AppModeConfigEditorCard
          baseId={baseId}
          workflowContext={{
            workflowId,
            workflowLabel,
            triggerFieldName: buttonField?.name,
            tableId,
          }}
        />
      </div>
    </div>
  );
});

WorkFlowPanel.displayName = 'WorkFlowPanel';

export { WorkFlowPanel };
