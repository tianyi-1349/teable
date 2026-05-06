import { useIsHydrated } from '@teable/sdk/hooks';
import { Button, Dialog, DialogContent, Spin } from '@teable/ui-lib';
import { XIcon } from 'lucide-react';
import { lazy, Suspense, useRef } from 'react';
import type { WorkFlowPanelRef } from '@overridable/WorkFlowPanel';
import { useWorkFlowPanelStore } from './useWorkFlowPaneStore';

const WorkFlowPanelLazy = lazy(() =>
  import('@overridable/WorkFlowPanel').then((module) => ({
    default: module.WorkFlowPanel,
  }))
);

export const WorkFlowPanelModal = () => {
  const { baseId = '', workflowId = '', closeModal, open } = useWorkFlowPanelStore();
  const isHydrated = useIsHydrated();
  const workflowRef = useRef<WorkFlowPanelRef>(null);
  if (!isHydrated || !baseId || !workflowId || !open) {
    return null;
  }

  const handleClose = () => {
    closeModal();
  };

  return (
    <Dialog open={open}>
      <DialogContent
        closeable={false}
        className="flex max-w-7xl p-2"
        style={{ width: 'calc(100% - 40px)', height: 'calc(100% - 100px)' }}
      >
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="flex size-full items-center justify-center">
                <Spin />
              </div>
            }
          >
            <WorkFlowPanelLazy
              baseId={baseId}
              workflowId={workflowId}
              headLeft={
                <Button variant={'ghost'} size={'icon-xs'} onClick={handleClose}>
                  <XIcon className="size-4 shrink-0" />
                </Button>
              }
              ref={workflowRef}
            />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
};
