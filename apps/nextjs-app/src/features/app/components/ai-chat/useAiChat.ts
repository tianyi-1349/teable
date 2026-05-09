import {
  aiChatStream,
  createAiChatSession,
  deleteAiChatSession,
  getAiChatMessages,
  getAiChatSessions,
} from '@teable/openapi';
import { useCallback, useRef, useState } from 'react';
import type { IChatContext, IChatMessage, IChatSession, IChatStreamEvent } from './types';

interface IUseAiChatOptions {
  baseId: string;
  initialSessionId?: string;
}

interface IStreamStateSetters {
  setStreamingContent: (value: string) => void;
  setToolCalls: (value: Array<{ name: string; args: unknown }>) => void;
  setCreditUsage: (updater: (prev: number) => number) => void;
}

const parseStreamChunk = (chunk: string) => {
  const lines = chunk.split('\n');
  const buffer = lines.pop() || '';
  const events: IChatStreamEvent[] = [];

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;

    try {
      events.push(JSON.parse(line.slice(6)) as IChatStreamEvent);
    } catch {
      // Ignore partial or malformed SSE payloads.
    }
  }

  return { buffer, events };
};

const applyStreamEvents = (
  events: IChatStreamEvent[],
  currentContent: string,
  currentToolCalls: Array<{ name: string; args: unknown }>,
  setters: IStreamStateSetters
) => {
  let assistantContent = currentContent;

  for (const event of events) {
    switch (event.type) {
      case 'text':
        assistantContent += event.content || '';
        setters.setStreamingContent(assistantContent);
        break;
      case 'tool-call':
        currentToolCalls.push({ name: event.name || '', args: event.args });
        setters.setToolCalls([...currentToolCalls]);
        break;
      case 'usage':
        setters.setCreditUsage((prev) => prev + (event.credit || 0));
        break;
      case 'error':
        console.error('Chat error:', event.message);
        break;
    }
  }

  return { assistantContent };
};

export const useAiChat = (options: IUseAiChatOptions) => {
  const { baseId } = options;
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
      const { data } = await getAiChatSessions(baseId);
      setSessions(data.data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, [baseId]);

  const createSession = useCallback(
    async (context?: Partial<IChatContext>) => {
      const { data } = await createAiChatSession(baseId, { context });
      const newSession = data.data as IChatSession;
      setSessions((prev) => [newSession, ...prev]);
      return newSession;
    },
    [baseId]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await deleteAiChatSession(baseId, sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    },
    [baseId]
  );

  // ===== Message Management =====

  const loadMessages = useCallback(
    async (sessionId: string) => {
      try {
        const { data } = await getAiChatMessages(baseId, sessionId);
        setMessages(data.data || []);
        setStreamingContent('');
        setToolCalls([]);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    },
    [baseId]
  );

  const selectSession = useCallback(
    (sessionId: string) => {
      void loadMessages(sessionId);
    },
    [loadMessages]
  );

  // ===== Streaming Chat =====

  const sendMessage = useCallback(
    async (sessionId: string, content: string, context?: IChatContext) => {
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
        const res = await aiChatStream(
          baseId,
          {
            message: content,
            sessionId,
            context,
          },
          abortControllerRef.current.signal
        );

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        let assistantContent = '';
        const currentToolCalls: Array<{ name: string; args: unknown }> = [];

        let done = false;
        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (!result.value) continue;

          const parsed = parseStreamChunk(
            `${buffer}${decoder.decode(result.value, { stream: true })}`
          );
          buffer = parsed.buffer;

          const next = applyStreamEvents(parsed.events, assistantContent, currentToolCalls, {
            setStreamingContent,
            setToolCalls,
            setCreditUsage,
          });
          assistantContent = next.assistantContent;
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
