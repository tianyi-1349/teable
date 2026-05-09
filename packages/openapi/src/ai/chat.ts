import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../axios';
import { registerRoute, urlBuilder } from '../utils';
import { z } from '../zod';

export const AI_CHAT_SESSIONS = '/{baseId}/ai/chat/sessions';
export const AI_CHAT_SESSION = '/{baseId}/ai/chat/sessions/{sessionId}';
export const AI_CHAT_MESSAGES = '/{baseId}/ai/chat/sessions/{sessionId}/messages';
export const AI_CHAT_STREAM = '/{baseId}/ai/chat/stream';

export const aiChatNodeSchema = z.object({
  type: z.string(),
  id: z.string(),
  name: z.string().optional(),
});

export const aiChatAttachmentSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string(),
});

export const aiChatContextSchema = z.object({
  title: z.string().optional(),
  modelKey: z.string().optional(),
  contextNodes: z.array(aiChatNodeSchema.omit({ name: true })).optional(),
  viewId: z.string().optional(),
  tableId: z.string().optional(),
  selectedRecordIds: z.array(z.string()).optional(),
  view: z
    .object({
      name: z.string(),
      filter: z.unknown().optional(),
      sort: z.unknown().optional(),
      group: z.unknown().optional(),
    })
    .optional(),
  selectedRecords: z.array(z.record(z.string(), z.unknown())).optional(),
  referencedNodes: z.array(aiChatNodeSchema).optional(),
  attachments: z.array(aiChatAttachmentSchema).optional(),
});

export const aiChatSessionSchema = z.object({
  id: z.string(),
  baseId: z.string(),
  title: z.string().optional(),
  modelKey: z.string().optional(),
  contextNodes: z.array(aiChatNodeSchema.omit({ name: true })).optional(),
  viewId: z.string().optional(),
  tableId: z.string().optional(),
  selectedRecordIds: z.array(z.string()).optional(),
  creditUsed: z.number(),
  tokenUsed: z.number(),
  createdBy: z.string(),
  createdTime: z.coerce.date(),
  lastModifiedTime: z.coerce.date().optional(),
});

export const aiChatMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  attachments: z.array(aiChatAttachmentSchema).optional(),
  toolCalls: z.array(z.object({ id: z.string(), name: z.string(), args: z.string() })).optional(),
  toolCallResults: z
    .array(z.object({ id: z.string(), name: z.string(), result: z.unknown() }))
    .optional(),
  creditUsed: z.number(),
  tokenUsed: z.number(),
  createdTime: z.coerce.date(),
});

export const createAiChatSessionRoSchema = z.object({
  title: z.string().optional(),
  modelKey: z.string().optional(),
  context: aiChatContextSchema.optional(),
});

export const aiChatStreamRoSchema = z.object({
  message: z.string(),
  sessionId: z.string().optional(),
  modelKey: z.string().optional(),
  context: aiChatContextSchema.optional(),
});

export const aiChatSessionVoSchema = z.object({ data: aiChatSessionSchema });
export const aiChatSessionsVoSchema = z.object({ data: z.array(aiChatSessionSchema) });
export const aiChatMessagesVoSchema = z.object({ data: z.array(aiChatMessageSchema) });
export const deleteAiChatSessionVoSchema = z.object({ data: z.object({ success: z.boolean() }) });

export type IAiChatContext = z.infer<typeof aiChatContextSchema>;
export type IAiChatSession = z.infer<typeof aiChatSessionSchema>;
export type IAiChatMessage = z.infer<typeof aiChatMessageSchema>;
export type ICreateAiChatSessionRo = z.infer<typeof createAiChatSessionRoSchema>;
export type IAiChatStreamRo = z.infer<typeof aiChatStreamRoSchema>;
export type IAiChatSessionVo = z.infer<typeof aiChatSessionVoSchema>;
export type IAiChatSessionsVo = z.infer<typeof aiChatSessionsVoSchema>;
export type IAiChatMessagesVo = z.infer<typeof aiChatMessagesVoSchema>;
export type IDeleteAiChatSessionVo = z.infer<typeof deleteAiChatSessionVoSchema>;

export const createAiChatSessionRoute: RouteConfig = registerRoute({
  method: 'post',
  path: AI_CHAT_SESSIONS,
  description: 'Create an AI chat session',
  request: {
    params: z.object({ baseId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: createAiChatSessionRoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Returns the created AI chat session.',
      content: { 'application/json': { schema: aiChatSessionVoSchema } },
    },
  },
  tags: ['ai'],
});

export const getAiChatSessionsRoute: RouteConfig = registerRoute({
  method: 'get',
  path: AI_CHAT_SESSIONS,
  description: 'List AI chat sessions for a base',
  request: { params: z.object({ baseId: z.string() }) },
  responses: {
    200: {
      description: 'Returns AI chat sessions.',
      content: { 'application/json': { schema: aiChatSessionsVoSchema } },
    },
  },
  tags: ['ai'],
});

export const getAiChatMessagesRoute: RouteConfig = registerRoute({
  method: 'get',
  path: AI_CHAT_MESSAGES,
  description: 'List messages for an AI chat session',
  request: { params: z.object({ baseId: z.string(), sessionId: z.string() }) },
  responses: {
    200: {
      description: 'Returns AI chat messages.',
      content: { 'application/json': { schema: aiChatMessagesVoSchema } },
    },
  },
  tags: ['ai'],
});

export const deleteAiChatSessionRoute: RouteConfig = registerRoute({
  method: 'delete',
  path: AI_CHAT_SESSION,
  description: 'Delete an AI chat session',
  request: { params: z.object({ baseId: z.string(), sessionId: z.string() }) },
  responses: {
    200: {
      description: 'Returns deletion status.',
      content: { 'application/json': { schema: deleteAiChatSessionVoSchema } },
    },
  },
  tags: ['ai'],
});

export const aiChatStreamRoute: RouteConfig = registerRoute({
  method: 'post',
  path: AI_CHAT_STREAM,
  description: 'Stream an AI chat response with tool calls',
  request: {
    params: z.object({ baseId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: aiChatStreamRoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Returns a server-sent event stream.',
    },
  },
  tags: ['ai'],
});

export const createAiChatSession = (baseId: string, ro: ICreateAiChatSessionRo) => {
  return axios.post<IAiChatSessionVo>(urlBuilder(AI_CHAT_SESSIONS, { baseId }), ro);
};

export const getAiChatSessions = (baseId: string) => {
  return axios.get<IAiChatSessionsVo>(urlBuilder(AI_CHAT_SESSIONS, { baseId }));
};

export const getAiChatMessages = (baseId: string, sessionId: string) => {
  return axios.get<IAiChatMessagesVo>(urlBuilder(AI_CHAT_MESSAGES, { baseId, sessionId }));
};

export const deleteAiChatSession = (baseId: string, sessionId: string) => {
  return axios.delete<IDeleteAiChatSessionVo>(urlBuilder(AI_CHAT_SESSION, { baseId, sessionId }));
};

export const aiChatStream = (baseId: string, ro: IAiChatStreamRo, signal?: AbortSignal) => {
  return fetch(urlBuilder(`/api${AI_CHAT_STREAM}`, { baseId }), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(ro),
    signal,
  });
};
