import { useCallback, useRef, useState } from 'react';
import type { IChatContext, IChatMessage, IChatSession, IChatStreamEvent } from './types';

interface IUseAiChatOptions {
  baseId: string;
  initialSessionId?: string;
}

export const useAiChat = (options: IUseAiChatOptions) => {
  const { baseId, initialSessionId } = options;
  const [sessions, setSessions] = useState<IChatSession[]>([]);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [toolCalls, setToolCalls] = useState<Array<{ name: string; args: unknown }>>([]);
  const [creditUsage, setCreditUsage] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ===== Session Management =====

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${baseId}/sessions`, {
        credentials: 'include',
      });
      const json = await res.json();
      setSessions(json.data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, [baseId]);

  const createSession = useCallback(
    async (context?: Partial<IChatContext>) => {
      const res = await fetch(`/api/chat/${baseId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ context }),
      });
      const json = await res.json();
      const newSession = json.data as IChatSession;
      setSessions((prev) => [newSession, ...prev]);
      return newSession;
    },
    [baseId]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await fetch(`/api/chat/${baseId}/sessions/${sessionId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    },
    [baseId]
  );

  // ===== Message Management =====

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/${baseId}/sessions/${sessionId}/messages`, {
        credentials: 'include',
      });
      const json = await res.json();
      setMessages(json.data || []);
      setStreamingContent('');
      setToolCalls([]);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [baseId]);

  const selectSession = useCallback(
    (sessionId: string) => {
      void loadMessages(sessionId);
    },
    [loadMessages]
  );

  // ===== Streaming Chat =====

  const sendMessage = useCallback(
    async (
      sessionId: string,
      content: string,
      context?: IChatContext
    ) => {
      // Abort previous stream
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setStreamingContent('');
      setToolCalls([]);

      // Add user message optimistically
      const userMessage: IChatMessage = {
        id: `temp-${Date.now()}`,
        sessionId,
        role: 'user',
        content,
        creditUsed: 0,
        tokenUsed: 0,
        createdTime: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const res = await fetch(`/api/chat/${baseId}/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            message: content,
            sessionId,
            context,
          }),
          signal: abortControllerRef.current.signal,
        });

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        let assistantContent = '';
        const currentToolCalls: Array<{ name: string; args: unknown }> = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            try {
              const event: IChatStreamEvent = JSON.parse(line.slice(6));

              switch (event.type) {
                case 'text':
                  assistantContent += event.content || '';
                  setStreamingContent(assistantContent);
                  break;

                case 'tool-call':
                  currentToolCalls.push({ name: event.name || '', args: event.args });
                  setToolCalls([...currentToolCalls]);
                  break;

                case 'usage':
                  setCreditUsage((prev) => prev + (event.credit || 0));
                  break;

                case 'error':
                  console.error('Chat error:', event.message);
                  break;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }

        // Add assistant message
        const assistantMessage: IChatMessage = {
          id: `temp-${Date.now()}-assistant`,
          sessionId,
          role: 'assistant',
          content: assistantContent,
          creditUsed: 0,
          tokenUsed: 0,
          createdTime: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent('');
        setToolCalls([]);

        // Reload sessions to update credit
        void loadSessions();
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Chat stream failed:', error);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [baseId, loadSessions]
  );

  return {
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
  };
};
