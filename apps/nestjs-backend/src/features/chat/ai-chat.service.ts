import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@teable/db-main-prisma';
import type { IChatContext, IChatMessage, IChatSession } from './chat.types';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(private readonly prismaService: PrismaService) {}

  // ===== Session Management =====

  async createSession(
    baseId: string,
    userId: string,
    context: Partial<IChatContext> = {}
  ): Promise<IChatSession> {
    const session = await this.prismaService.chatSession.create({
      data: {
        baseId,
        createdBy: userId,
        title: context.title || 'New Chat',
        modelKey: context.modelKey,
        contextNodes: context.contextNodes ? JSON.stringify(context.contextNodes) : null,
        viewId: context.viewId,
        tableId: context.tableId,
        selectedRecordIds: context.selectedRecordIds
          ? JSON.stringify(context.selectedRecordIds)
          : null,
      },
    });

    return this.mapSession(session);
  }

  async getSessions(userId: string, baseId?: string): Promise<IChatSession[]> {
    const where: Record<string, unknown> = {
      createdBy: userId,
      deletedTime: null,
    };
    if (baseId) {
      where.baseId = baseId;
    }

    const sessions = await this.prismaService.chatSession.findMany({
      where,
      orderBy: { lastModifiedTime: 'desc' },
      take: 50,
    });

    return sessions.map(this.mapSession);
  }

  async getSession(sessionId: string, userId: string): Promise<IChatSession | null> {
    const session = await this.prismaService.chatSession.findFirst({
      where: {
        id: sessionId,
        createdBy: userId,
        deletedTime: null,
      },
    });

    return session ? this.mapSession(session) : null;
  }

  async updateSession(
    sessionId: string,
    userId: string,
    updates: Partial<IChatSession>
  ): Promise<IChatSession | null> {
    const updateData: Record<string, unknown> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.modelKey !== undefined) updateData.modelKey = updates.modelKey;
    if (updates.creditUsed !== undefined) updateData.creditUsed = updates.creditUsed;
    if (updates.tokenUsed !== undefined) updateData.tokenUsed = updates.tokenUsed;

    const session = await this.prismaService.chatSession.updateMany({
      where: {
        id: sessionId,
        createdBy: userId,
        deletedTime: null,
      },
      data: updateData,
    });

    if (session.count === 0) return null;

    return this.getSession(sessionId, userId);
  }

  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    const result = await this.prismaService.chatSession.updateMany({
      where: {
        id: sessionId,
        createdBy: userId,
        deletedTime: null,
      },
      data: { deletedTime: new Date() },
    });

    return result.count > 0;
  }

  // ===== Message Management =====

  async addMessage(
    sessionId: string,
    userId: string,
    message: Omit<IChatMessage, 'id' | 'sessionId' | 'createdTime'>
  ): Promise<IChatMessage> {
    const session = await this.getSession(sessionId, userId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    const dbMessage = await this.prismaService.chatMessage.create({
      data: {
        sessionId,
        role: message.role,
        content: message.content,
        attachments: message.attachments ? JSON.stringify(message.attachments) : null,
        toolCalls: message.toolCalls ? JSON.stringify(message.toolCalls) : null,
        toolCallResults: message.toolCallResults ? JSON.stringify(message.toolCallResults) : null,
        creditUsed: message.creditUsed || 0,
        tokenUsed: message.tokenUsed || 0,
      },
    });

    return this.mapMessage(dbMessage);
  }

  async getMessages(sessionId: string, userId: string): Promise<IChatMessage[]> {
    const session = await this.getSession(sessionId, userId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    const messages = await this.prismaService.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdTime: 'asc' },
    });

    return messages.map(this.mapMessage);
  }

  async updateMessageCredit(
    sessionId: string,
    messageId: string,
    creditUsed: number,
    tokenUsed: number
  ): Promise<void> {
    await this.prismaService.chatMessage.update({
      where: { id: messageId },
      data: { creditUsed, tokenUsed },
    });

    await this.prismaService.chatSession.update({
      where: { id: sessionId },
      data: {
        creditUsed: { increment: creditUsed },
        tokenUsed: { increment: tokenUsed },
      },
    });
  }

  // ===== Context Helpers =====

  buildContextFromRequest(context: IChatContext): string {
    const parts: string[] = [];

    // View context
    if (context.view) {
      parts.push(`Current View: ${context.view.name}`);
      if (context.view.filter) {
        parts.push(`Active Filters: ${JSON.stringify(context.view.filter)}`);
      }
      if (context.view.sort) {
        parts.push(`Sort Order: ${JSON.stringify(context.view.sort)}`);
      }
      if (context.view.group) {
        parts.push(`Grouped By: ${JSON.stringify(context.view.group)}`);
      }
    }

    // Selected records
    if (context.selectedRecords && context.selectedRecords.length > 0) {
      parts.push(
        `Selected Records (${context.selectedRecords.length}): ${JSON.stringify(context.selectedRecords.slice(0, 10))}`
      );
    }

    // Referenced nodes
    if (context.referencedNodes && context.referencedNodes.length > 0) {
      parts.push(
        `Referenced Nodes: ${context.referencedNodes.map((n) => `${n.type}:${n.id}`).join(', ')}`
      );
    }

    return parts.join('\n');
  }

  // ===== Private Helpers =====

  private mapSession(session: Record<string, unknown>): IChatSession {
    return {
      id: session.id as string,
      baseId: session.baseId as string,
      title: session.title as string | undefined,
      modelKey: session.modelKey as string | undefined,
      contextNodes: session.contextNodes ? JSON.parse(session.contextNodes as string) : undefined,
      viewId: session.viewId as string | undefined,
      tableId: session.tableId as string | undefined,
      selectedRecordIds: session.selectedRecordIds
        ? JSON.parse(session.selectedRecordIds as string)
        : undefined,
      creditUsed: session.creditUsed as number,
      tokenUsed: session.tokenUsed as number,
      createdBy: session.createdBy as string,
      createdTime: session.createdTime as Date,
      lastModifiedTime: session.lastModifiedTime as Date | undefined,
    };
  }

  private mapMessage(msg: Record<string, unknown>): IChatMessage {
    return {
      id: msg.id as string,
      sessionId: msg.sessionId as string,
      role: msg.role as IChatMessage['role'],
      content: msg.content as string,
      attachments: msg.attachments ? JSON.parse(msg.attachments as string) : undefined,
      toolCalls: msg.toolCalls ? JSON.parse(msg.toolCalls as string) : undefined,
      toolCallResults: msg.toolCallResults ? JSON.parse(msg.toolCallResults as string) : undefined,
      creditUsed: msg.creditUsed as number,
      tokenUsed: msg.tokenUsed as number,
      createdTime: msg.createdTime as Date,
    };
  }
}
