import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Cuppy, MessageSquare, X } from '@teable/icons';
import { ReactQueryKeys, useView } from '@teable/sdk';
import { Button, cn } from '@teable/ui-lib';
import { useMemo } from 'react';
import { useChatPanelStore } from '../sidebar/useChatPanelStore';
import { AiChatPanel } from './AiChatPanel';

interface IAiChatDockProps {
  baseId: string;
  tableId?: string;
  viewId?: string;
}

interface IActiveViewContext {
  tableId?: string;
  viewId?: string;
  query?: {
    filter?: unknown;
    orderBy?: unknown;
    groupBy?: unknown;
  };
}

interface IGridSelectionContext {
  rows?: [number, number][];
  selectedRecords?: Array<Record<string, unknown>>;
  timestamp?: number;
  addToChat?: boolean;
}

export const AiChatDock = ({ baseId, tableId, viewId }: IAiChatDockProps) => {
  const queryClient = useQueryClient();
  const view = useView(viewId);
  const { status, open, close, toggleExpanded } = useChatPanelStore();
  const activeViewContext = queryClient.getQueryData<IActiveViewContext>(
    ReactQueryKeys.activeViewContext(baseId)
  );
  const { data: gridSelectionContext } = useQuery<IGridSelectionContext | null>({
    queryKey: ReactQueryKeys.gridSelection(baseId),
    queryFn: () =>
      queryClient.getQueryData<IGridSelectionContext>(ReactQueryKeys.gridSelection(baseId)) ?? null,
    staleTime: Infinity,
  });
  const isOpen = status !== 'close';
  const isExpanded = status === 'expanded';

  const viewContext = useMemo(
    () =>
      view
        ? {
            name: view.name,
            filter: activeViewContext?.query?.filter ?? view.filter,
            sort: activeViewContext?.query?.orderBy ?? view.sort,
            group: activeViewContext?.query?.groupBy ?? view.group,
          }
        : undefined,
    [
      activeViewContext?.query?.filter,
      activeViewContext?.query?.groupBy,
      activeViewContext?.query?.orderBy,
      view,
    ]
  );

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        className="absolute bottom-5 right-5 z-30 size-12 rounded-full bg-background p-0 shadow-lg"
        onClick={open}
        aria-label="Open AI Chat"
      >
        <Cuppy className="size-7" />
      </Button>
    );
  }

  return (
    <aside
      className={cn(
        'z-20 flex h-full shrink-0 flex-col border-l bg-background shadow-sm',
        isExpanded ? 'absolute inset-y-0 right-0 w-[min(960px,calc(100%-48px))]' : 'w-[420px]'
      )}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <Button variant="ghost" size="sm" className="gap-2" onClick={toggleExpanded}>
          <MessageSquare className="size-4" />
          <span className="text-sm font-medium">AI Chat</span>
        </Button>
        <Button variant="ghost" size="icon" className="size-8" onClick={close}>
          <X className="size-4" />
        </Button>
      </div>
      <AiChatPanel
        baseId={baseId}
        tableId={tableId}
        viewId={viewId}
        viewContext={viewContext}
        selectedRecords={gridSelectionContext?.selectedRecords}
      />
    </aside>
  );
};
