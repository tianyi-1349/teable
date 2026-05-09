import { useEffect, useRef } from 'react';
import { User, Bot, Loader2, Wrench } from 'lucide-react';
import { cn } from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';
import type { IChatMessage } from './types';

export interface IAiChatMessageListProps {
  messages: IChatMessage[];
  streamingContent?: string;
  toolCalls?: Array<{ name: string; args: unknown }>;
  isLoading: boolean;
  viewContext?: { name: string };
  selectedRecords?: Array<Record<string, unknown>>;
}

export const AiChatMessageList = (props: IAiChatMessageListProps) => {
  const { messages, streamingContent, toolCalls, isLoading, viewContext, selectedRecords } = props;
  const { t } = useTranslation('common');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, toolCalls]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Context info */}
      {viewContext && (
        <div className="mb-4 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          {t('aiChat.context.view', 'View: {{name}}', { name: viewContext.name })}
        </div>
      )}

      {selectedRecords && selectedRecords.length > 0 && (
        <div className="mb-4 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          {t('aiChat.context.selectedRecords', '{{count}} records selected', {
            count: selectedRecords.length,
          })}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}

        {/* Tool calls in progress */}
        {toolCalls &&
          toolCalls.length > 0 &&
          toolCalls.map((tc, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <Wrench className="size-4 text-muted-foreground" />
              </div>
              <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                {t('aiChat.toolCall', 'Using {{name}}...', { name: tc.name })}
              </div>
            </div>
          ))}

        {/* Streaming content */}
        {streamingContent && (
          <div className="flex items-start gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="size-4 animate-spin text-primary" />
            </div>
            <div className="flex-1 rounded-lg bg-muted px-3 py-2">
              <div className="whitespace-pre-wrap text-sm">{streamingContent}</div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && !toolCalls?.length && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {t('aiChat.thinking', 'AI is thinking...')}
          </div>
        )}
      </div>

      <div ref={messagesEndRef} />
    </div>
  );
};

const ChatMessageItem = ({ message }: { message: IChatMessage }) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-start gap-2', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary/10' : 'bg-muted'
        )}
      >
        {isUser ? (
          <User className="size-4 text-primary" />
        ) : (
          <Bot className="size-4 text-muted-foreground" />
        )}
      </div>

      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>

        {/* Tool call results */}
        {message.toolCallResults && message.toolCallResults.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.toolCallResults.map((tc, i) => (
              <div
                key={i}
                className="rounded bg-background/50 px-2 py-1 text-xs text-muted-foreground"
              >
                <Wrench className="mr-1 inline-block size-3" />
                {tc.name}: {typeof tc.result === 'string' ? tc.result : JSON.stringify(tc.result)}
              </div>
            ))}
          </div>
        )}

        {/* Credit usage */}
        {message.creditUsed > 0 && (
          <div className="mt-1 text-xs opacity-60">
            {message.tokenUsed} tokens
          </div>
        )}
      </div>
    </div>
  );
};
