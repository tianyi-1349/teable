import { MessageSquare } from '@teable/icons';
import { Button, cn } from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';
import { AiChatInput } from './AiChatInput';
import { AiChatMessageList } from './AiChatMessageList';
import { AiChatSidebar } from './AiChatSidebar';
import { useAiChat } from './useAiChat';

export interface IAiChatPanelProps {
  baseId: string;
  tableId?: string;
  viewId?: string;
  selectedRecords?: Array<Record<string, unknown>>;
  viewContext?: {
    name: string;
    filter?: unknown;
    sort?: unknown;
    group?: unknown;
  };
  defaultSessionId?: string;
  onClose?: () => void;
}

export const AiChatPanel = (props: IAiChatPanelProps) => {
  const { baseId, tableId, viewId, selectedRecords, viewContext, defaultSessionId } = props;
  const { t } = useTranslation('common');
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(defaultSessionId);
  const {
    sessions,
    messages,
    isLoading,
    streamingContent,
    toolCalls,
    creditUsage,
    loadSessions,
    loadMessages,
    createSession,
    sendMessage,
    deleteSession,
    selectSession,
  } = useAiChat({
    baseId,
    initialSessionId: defaultSessionId,
  });

  // Load sessions on mount
  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      void loadMessages(currentSessionId);
    }
  }, [currentSessionId, loadMessages]);

  const handleSendMessage = useCallback(
    async (content: string, attachments?: Array<{ name: string; url: string; type: string }>) => {
      const sessionId = currentSessionId || (await createSession()).id;
      setCurrentSessionId(sessionId);

      await sendMessage(sessionId, content, {
        view: viewContext,
        selectedRecords,
        tableId,
        viewId,
        attachments,
      });
    },
    [currentSessionId, createSession, sendMessage, viewContext, selectedRecords, tableId, viewId]
  );

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setCurrentSessionId(sessionId);
      selectSession(sessionId);
    },
    [selectSession]
  );

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      await deleteSession(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(undefined);
      }
    },
    [deleteSession, currentSessionId]
  );

  return (
    <div className="flex size-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="size-8 p-0"
          >
            <MessageSquare className="size-4" />
          </Button>
          <span className="font-medium">{t('aiChat.title', 'AI Chat')}</span>
        </div>
        <div className="flex items-center gap-2">
          {creditUsage > 0 && (
            <span className="text-xs text-muted-foreground">
              {t('aiChat.creditUsed', 'Credit: {{count}}', {
                count: creditUsage.toFixed(4) as unknown as number,
              })}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <AiChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onNewSession={() => {
              setCurrentSessionId(undefined);
            }}
          />
        )}

        {/* Main Chat Area */}
        <div className={cn('flex flex-1 flex-col', showSidebar && 'border-l')}>
          <AiChatMessageList
            messages={messages}
            streamingContent={streamingContent}
            toolCalls={toolCalls}
            isLoading={isLoading}
            viewContext={viewContext}
            selectedRecords={selectedRecords}
          />

          <AiChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            tableId={tableId}
            baseId={baseId}
          />
        </div>
      </div>
    </div>
  );
};
