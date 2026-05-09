export interface IChatContext {
  title?: string;
  modelKey?: string;
  contextNodes?: Array<{ type: string; id: string }>;
  viewId?: string;
  tableId?: string;
  selectedRecordIds?: string[];
  view?: {
    name: string;
    filter?: unknown;
    sort?: unknown;
    group?: unknown;
  };
  selectedRecords?: Array<Record<string, unknown>>;
  referencedNodes?: Array<{ type: string; id: string; name?: string }>;
  attachments?: Array<{ name: string; url: string; type: string }>;
}

export interface IChatSession {
  id: string;
  baseId: string;
  title?: string;
  modelKey?: string;
  contextNodes?: Array<{ type: string; id: string }>;
  viewId?: string;
  tableId?: string;
  selectedRecordIds?: string[];
  creditUsed: number;
  tokenUsed: number;
  createdBy: string;
  createdTime: Date;
  lastModifiedTime?: Date;
}

export interface IChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
  toolCalls?: Array<{ id: string; name: string; arguments: string }>;
  toolCallResults?: Array<{ id: string; name: string; result: string }>;
  creditUsed: number;
  tokenUsed: number;
  createdTime: Date;
}

export interface IToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface IToolCallResult {
  toolCallId: string;
  toolName: string;
  result: unknown;
  error?: string;
}
