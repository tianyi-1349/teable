import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditLogListener } from './audit-log.listener';

describe('AuditLogListener', () => {
  const prismaService = {
    auditLog: {
      create: vi.fn(),
    },
  };
  const cls = {
    get: vi.fn(),
  };
  const eventEmitterService = {
    emit: vi.fn(),
  };

  let listener: AuditLogListener;

  beforeEach(() => {
    vi.clearAllMocks();
    listener = new AuditLogListener(
      prismaService as never,
      cls as never,
      eventEmitterService as never
    );
  });

  it('persists relative record audit logs', async () => {
    cls.get.mockImplementation((key: string) => {
      if (key === 'user.id') return 'usr123';
      if (key === 'user.name') return 'Ada';
      if (key === 'origin') {
        return { ip: '127.0.0.1', byApi: false, userAgent: 'test', referer: '' };
      }
      return undefined;
    });
    prismaService.auditLog.create.mockResolvedValue({ id: 'log123' });

    await listener.handleCreateRelativeAuditLog({
      action: 'base.duplicate',
      resourceId: 'bse123',
      recordCount: 4,
      params: { shareId: 'shr123' },
    });

    expect(prismaService.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'base.duplicate',
          resourceType: 'base',
          resourceId: 'bse123',
          actorId: 'usr123',
          actorName: 'Ada',
          recordCount: 4,
        }),
      })
    );
    expect(eventEmitterService.emit).toHaveBeenCalledWith('audit-log.saved', {
      auditLogIds: ['log123'],
    });
  });

  it('skips when actor is missing', async () => {
    cls.get.mockReturnValue(undefined);

    await listener.handleCreateRelativeAuditLog({
      action: 'table.import',
      resourceId: 'tbl123',
    });

    expect(prismaService.auditLog.create).not.toHaveBeenCalled();
    expect(eventEmitterService.emit).not.toHaveBeenCalled();
  });
});
