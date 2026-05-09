import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Headers,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { streamText, tool as createTool } from 'ai';
import { AiService } from '../ai/ai.service';
import { AiChatService } from './ai-chat.service';
import { AiChatToolsService } from './ai-chat-tools.service';
import { ChatService } from './chat.service';

interface IChatRequest {
  message: string;
  sessionId?: string;
  modelKey?: string;
  context?: {
    view?: {
      name: string;
      filter?: unknown;
      sort?: unknown;
      group?: unknown;
    };
    selectedRecords?: Array<Record<string, unknown>>;
    referencedNodes?: Array<{ type: string; id: string; name?: string }>;
    attachments?: Array<{ name: string; url: string; type: string }>;
    tableId?: string;
    viewId?: string;
  };
}

@Controller('api/chat')
export class AiChatController {
  private readonly logger = new Logger(AiChatController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly aiChatService: AiChatService,
    private readonly aiChatToolsService: AiChatToolsService,
    private readonly chatService: ChatService
  ) {}

  // ===== Session Management =====

  @Post(':baseId/sessions')
  async createSession(
    @Param('baseId') baseId: string,
    @Req() req: Request,
    @Body() body: { title?: string; modelKey?: string; context?: Record<string, unknown> }
  ) {
    const userId = this.getUserId(req);
    const session = await this.aiChatService.createSession(baseId, userId, {
      title: body.title,
      modelKey: body.modelKey,
      ...body.context,
    });
    return { data: session };
  }

  @Get(':baseId/sessions')
  async getSessions(@Param('baseId') baseId: string, @Req() req: Request) {
    const userId = this.getUserId(req);
    const sessions = await this.aiChatService.getSessions(userId, baseId);
    return { data: sessions };
  }

  @Get(':baseId/sessions/:sessionId/messages')
  async getMessages(
    @Param('baseId') _baseId: string,
    @Param('sessionId') sessionId: string,
    @Req() req: Request
  ) {
    const userId = this.getUserId(req);
    const messages = await this.aiChatService.getMessages(sessionId, userId);
    return { data: messages };
  }

  @Delete(':baseId/sessions/:sessionId')
  async deleteSession(
    @Param('baseId') _baseId: string,
    @Param('sessionId') sessionId: string,
    @Req() req: Request
  ) {
    const userId = this.getUserId(req);
    const success = await this.aiChatService.deleteSession(sessionId, userId);
    return { data: { success } };
  }

  // ===== Chat Streaming =====

  @Post(':baseId/chat/stream')
  async chatStream(
    @Param('baseId') baseId: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: IChatRequest
  ) {
    const userId = this.getUserId(req);

    // Create or get session
    let sessionId = body.sessionId;
    if (!sessionId) {
      const session = await this.aiChatService.createSession(baseId, userId, {
        title: body.message.slice(0, 50),
        modelKey: body.modelKey,
        tableId: body.context?.tableId,
        viewId: body.context?.viewId,
        selectedRecordIds: body.context?.selectedRecords?.map((r) => r.id as string),
      });
      sessionId = session.id;
    }

    // Save user message
    await this.aiChatService.addMessage(sessionId, userId, {
      role: 'user',
      content: body.message,
      attachments: body.context?.attachments,
      creditUsed: 0,
      tokenUsed: 0,
    });

    // Build context-aware prompt
    const contextInfo = this.aiChatService.buildContextFromRequest({
      view: body.context?.view,
      selectedRecords: body.context?.selectedRecords,
      referencedNodes: body.context?.referencedNodes,
    });

    const systemPrompt = `You are Teable AI assistant. You help users analyze and manage their spreadsheet data.

${contextInfo ? `Current Context:\n${contextInfo}\n` : ''}

Rules:
- Always respond in the same language as the user
- If you need to modify data, use the available tools
- If you're unsure about table/field IDs, ask the user
- For complex tasks, explain your plan before executing
- Be concise but helpful`;

    // Get model
    const modelKey = body.modelKey || 'default';
    const { model } = await this.aiService.getModelConfig(modelKey);

    // Get available tools
    const tools = this.aiChatToolsService.getTools(baseId, body.context?.tableId);
    const toolDefinitions = tools.reduce((acc, t) => {
      acc[t.name] = createTool({
        description: t.description,
        parameters: t.parameters,
        execute: async (args) => {
          const result = await this.aiChatToolsService.executeTool(tools, t.name, args);
          return result.error ? { error: result.error } : { result: result.result };
        },
      });
      return acc;
    }, {} as Record<string, ReturnType<typeof createTool>>);

    // Stream response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let assistantContent = '';
    let toolCalls: Array<{ id: string; name: string; args: string }> = [];
    let totalTokens = 0;
    let totalCredit = 0;

    try {
      const result = streamText({
        model: model,
        system: systemPrompt,
        prompt: body.message,
        tools: toolDefinitions,
        maxSteps: 5,
        onFinish: async ({ usage }) => {
          totalTokens = (usage?.totalTokens || 0);
          totalCredit = this.calculateCredit(totalTokens, modelKey);

          // Save assistant message
          await this.aiChatService.addMessage(sessionId, userId, {
            role: 'assistant',
            content: assistantContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            creditUsed: totalCredit,
            tokenUsed: totalTokens,
          });

          // Update session totals
          await this.aiChatService.updateSession(sessionId, userId, {
            creditUsed: totalCredit,
            tokenUsed: totalTokens,
          });

          // Send usage info
          res.write(`data: ${JSON.stringify({ type: 'usage', credit: totalCredit, tokens: totalTokens })}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
        },
        onChunk: ({ chunk }) => {
          if (chunk.type === 'text-delta') {
            assistantContent += chunk.textDelta;
            res.write(`data: ${JSON.stringify({ type: 'text', content: chunk.textDelta })}\n\n`);
          }
          if (chunk.type === 'tool-call') {
            toolCalls.push({
              id: chunk.toolCallId,
              name: chunk.toolName,
              args: JSON.stringify(chunk.args),
            });
            res.write(`data: ${JSON.stringify({ type: 'tool-call', name: chunk.toolName, args: chunk.args })}\n\n`);
          }
        },
      });

      // Consume the stream to trigger callbacks
      for await (const _ of result.textStream) {
        // Stream is consumed by onChunk callbacks
      }
    } catch (error) {
      this.logger.error('Chat stream failed', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Chat stream failed' })}\n\n`);
      res.end();
    }
  }

  // ===== Proxy for legacy chart endpoint =====

  @Post(':baseId/chart')
  async chartCompletions(@Req() req: Request, @Res() res: Response) {
    return this.chatService.completions(req, res);
  }

  // ===== Private Helpers =====

  private getUserId(req: Request): string {
    return (req.user as { id: string })?.id || 'anonymous';
  }

  private calculateCredit(tokens: number, modelKey: string): number {
    // Simplified credit calculation
    const ratePer1kTokens = 0.002; // $0.002 per 1k tokens
    return (tokens / 1000) * ratePer1kTokens;
  }
}
