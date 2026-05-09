import { useCallback } from 'react';
import { Plus, Trash2, MessageSquare, Clock4 } from '@teable/icons';
import { Button, cn } from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';
import type { IChatSession } from './types';

export interface IAiChatSidebarProps {
  sessions: IChatSession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewSession: () => void;
}

export const AiChatSidebar = (props: IAiChatSidebarProps) => {
  const { sessions, currentSessionId, onSelectSession, onDeleteSession, onNewSession } = props;
  const { t } = useTranslation('common');

  const handleDelete = useCallback(
    (e: React.MouseEvent, sessionId: string) => {
      e.stopPropagation();
      onDeleteSession(sessionId);
    },
    [onDeleteSession]
  );

  return (
    <div className="flex w-64 flex-col border-r bg-muted/30">
      {/* New Chat Button */}
      <div className="border-b p-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onNewSession}
        >
          <Plus className="size-4" />
          {t('aiChat.sidebar.newChat', 'New Chat')}
        </Button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t('aiChat.sidebar.noSessions', 'No chat history')}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  'group flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm hover:bg-muted',
                  currentSessionId === session.id && 'bg-muted'
                )}
              >
                <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">
                    {session.title || t('aiChat.sidebar.newChat', 'New Chat')}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock4 className="size-3" />
                    {formatRelativeTime(session.lastModifiedTime || session.createdTime)}
                  </div>
                  {session.creditUsed > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {session.creditUsed.toFixed(3)} credits
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="invisible group-hover:visible size-6 shrink-0 p-0"
                  onClick={(e) => handleDelete(e, session.id)}
                >
                  <Trash2 className="size-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
