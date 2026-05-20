import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { generateLogId } from '@teable/core';
import type { Prisma } from '@teable/db-main-prisma';
import { PrismaService } from '@teable/db-main-prisma';
import { ClsService } from 'nestjs-cls';
import type { IClsStore } from '../../types/cls';
import { EventEmitterService } from '../event-emitter.service';
import { Events } from '../events';

interface IAuditLogCreateRelativePayload {
  action: string;
  resourceId: string;
  recordCount?: number;
  params?: Record<string, unknown>;
  logId?: string;
}

const resolveResourceType = (action: string) => {
  if (action.startsWith('base.') || action === 'template.apply' || action === 'share.base.copy') {
    return 'base';
  }

  return 'table';
};

const toJsonValue = (value: unknown): Prisma.InputJsonValue => JSON.parse(JSON.stringify(value));

@Injectable()
export class AuditLogListener {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cls: ClsService<IClsStore>,
    private readonly eventEmitterService: EventEmitterService
  ) {}

  @OnEvent(Events.TABLE_RECORD_CREATE_RELATIVE, { async: true })
  async handleCreateRelativeAuditLog(payload: IAuditLogCreateRelativePayload) {
    const userId = this.cls.get('user.id');
    const userName = this.cls.get('user.name');
    const origin = this.cls.get('origin');

    if (!userId) {
      return;
    }

    const auditLog = await this.prismaService.auditLog.create({
      data: {
        id: payload.logId ?? generateLogId(),
        action: payload.action,
        resourceType: resolveResourceType(payload.action),
        resourceId: payload.resourceId,
        actorId: userId,
        actorName: userName,
        recordCount: payload.recordCount ?? null,
        metadata: toJsonValue({
          params: payload.params ?? null,
          origin: origin ?? null,
        }),
      },
    });

    this.eventEmitterService.emit(Events.AUDIT_LOG_SAVED, {
      auditLogIds: [auditLog.id],
    });
  }
}
