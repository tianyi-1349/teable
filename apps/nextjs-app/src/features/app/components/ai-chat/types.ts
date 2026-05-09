import type { IAiChatContext, IAiChatMessage, IAiChatSession } from '@teable/openapi';

export type IChatSession = IAiChatSession;
export type IChatMessage = IAiChatMessage;
export type IChatContext = IAiChatContext;

export interface IChatStreamEvent {
  type: 'text' | 'tool-call' | 'usage' | 'error' | 'done';
  content?: string;
  name?: string;
  args?: unknown;
  credit?: number;
  tokens?: number;
  message?: string;
}
