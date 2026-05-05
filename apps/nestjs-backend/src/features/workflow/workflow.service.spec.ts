import { DriverClient } from '@teable/core';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { WorkflowService } from './workflow.service';

describe('WorkflowService', () => {
  const txWorkflow = {
    aggregate: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const txField = {
    findMany: vi.fn(),
    updateMany: vi.fn(),
  };

  const txRaw = {
    $executeRaw: vi.fn(),
  };

  const directWorkflow = {
    findFirstOrThrow: vi.fn(),
  };

  const prismaService = {
    txClient: vi.fn(() => ({ workflow: txWorkflow, field: txField, ...txRaw })),
    workflow: directWorkflow,
    tableMeta: { findFirst: vi.fn() },
    $tx: vi.fn(async (fn: () => Promise<unknown>) => await fn()),
  };

  const cls = {
    get: vi.fn((key: string) => (key === 'user.id' ? 'usr123' : undefined)),
  };

  const dbProvider = { driver: DriverClient.Pg };

  let service: WorkflowService;

  beforeEach(() => {
    vi.clearAllMocks();
    txField.findMany.mockResolvedValue([]);
    txField.updateMany.mockResolvedValue({ count: 1 });
    txRaw.$executeRaw.mockResolvedValue([]);
    service = new WorkflowService(prismaService as never, cls as never, dbProvider as never);
  });

  it('getWorkflowById should parse stored json fields', async () => {
    directWorkflow.findFirstOrThrow.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      name: 'My workflow',
      description: 'desc',
      trigger: JSON.stringify({ type: 'buttonClick', config: { tableId: 'tbl123' } }),
      conditions: JSON.stringify([{ field: 'Status', operator: 'eq', value: 'Done' }]),
      actions: JSON.stringify([{ type: 'httpRequest', config: { url: 'https://example.com' } }]),
      isActive: true,
      createdTime: new Date('2026-05-02T00:00:00.000Z'),
      lastModifiedTime: new Date('2026-05-02T01:00:00.000Z'),
    });

    const result = await service.getWorkflowById('bse123', 'wfl123');

    expect(result).toMatchObject({
      id: 'wfl123',
      trigger: { type: 'buttonClick', config: { tableId: 'tbl123' } },
      conditions: [{ field: 'Status', operator: 'eq', value: 'Done' }],
      actions: [{ type: 'httpRequest', config: { url: 'https://example.com' } }],
      isActive: true,
    });
  });

  it('createWorkflow should assign next order and serialize workflow schema', async () => {
    txWorkflow.aggregate.mockResolvedValue({ _max: { order: 4 } });
    txWorkflow.create.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      name: 'Deploy',
      description: null,
      trigger: JSON.stringify({ type: 'webhook', config: { path: '/deploy' } }),
      conditions: JSON.stringify([]),
      actions: JSON.stringify([{ type: 'runScript', config: { script: 'echo ok' } }]),
      isActive: false,
      createdTime: new Date('2026-05-02T00:00:00.000Z'),
      lastModifiedTime: null,
    });

    const result = await service.createWorkflow('bse123', {
      name: 'Deploy',
      trigger: { type: 'webhook', config: { path: '/deploy' } },
      conditions: [],
      actions: [{ type: 'runScript', config: { script: 'echo ok' } }],
    });

    expect(txWorkflow.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          baseId: 'bse123',
          order: 5,
          createdBy: 'usr123',
          trigger: JSON.stringify({ type: 'webhook', config: { path: '/deploy' } }),
        }),
      })
    );
    expect(result.name).toBe('Deploy');
  });

  it('updateWorkflow should serialize changed schema and keep modifier', async () => {
    vi.spyOn(service, 'getWorkflowById').mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      name: 'Old workflow',
      description: null,
      trigger: { type: 'buttonClick', config: { tableId: 'tbl123' } },
      conditions: [],
      actions: [],
      isActive: false,
      createdTime: '2026-05-02T00:00:00.000Z',
      lastModifiedTime: null,
    });

    txWorkflow.update.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      name: 'New workflow',
      description: 'updated',
      trigger: JSON.stringify({ type: 'schedule', config: { cron: '0 10 * * 1' } }),
      conditions: JSON.stringify([{ field: 'Status', operator: 'eq', value: 'Ready' }]),
      actions: JSON.stringify([{ type: 'sendEmail', config: { to: 'team@example.com' } }]),
      isActive: true,
      createdTime: new Date('2026-05-02T00:00:00.000Z'),
      lastModifiedTime: new Date('2026-05-02T02:00:00.000Z'),
    });

    const result = await service.updateWorkflow('bse123', 'wfl123', {
      name: 'New workflow',
      description: 'updated',
      trigger: { type: 'schedule', config: { cron: '0 10 * * 1' } },
      conditions: [{ field: 'Status', operator: 'eq', value: 'Ready' }],
      actions: [{ type: 'sendEmail', config: { to: 'team@example.com' } }],
      isActive: true,
    });

    expect(txWorkflow.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'wfl123' },
        data: expect.objectContaining({
          lastModifiedBy: 'usr123',
          trigger: JSON.stringify({ type: 'schedule', config: { cron: '0 10 * * 1' } }),
          isActive: true,
        }),
      })
    );
    expect(result.isActive).toBe(true);
    expect(result.trigger).toEqual({ type: 'schedule', config: { cron: '0 10 * * 1' } });
  });

  it('updateWorkflow should sync button workflow metadata when button trigger is active', async () => {
    vi.spyOn(service, 'getWorkflowById').mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      name: 'Deploy',
      description: null,
      trigger: {
        type: 'buttonClick',
        config: { tableId: 'tbl123', watchFieldIds: ['fldButton1'] },
      },
      conditions: [],
      actions: [],
      isActive: false,
      createdTime: '2026-05-02T00:00:00.000Z',
      lastModifiedTime: null,
    });

    txWorkflow.update.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      name: 'Deploy',
      description: null,
      trigger: JSON.stringify({
        type: 'buttonClick',
        config: { tableId: 'tbl123', watchFieldIds: ['fldButton1'] },
      }),
      conditions: JSON.stringify([]),
      actions: JSON.stringify([]),
      isActive: true,
      createdTime: new Date('2026-05-02T00:00:00.000Z'),
      lastModifiedTime: new Date('2026-05-02T02:00:00.000Z'),
    });
    txField.findMany.mockResolvedValue([
      {
        id: 'fldButton1',
        tableId: 'tbl123',
        options: JSON.stringify({
          label: 'Run',
          color: 'teal',
          workflow: { id: 'wfl123', name: 'Deploy', isActive: false },
        }),
      },
    ]);

    await service.updateWorkflow('bse123', 'wfl123', { isActive: true });

    expect(txField.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'fldButton1', tableId: 'tbl123' },
      data: {
        options: JSON.stringify({
          label: 'Run',
          color: 'teal',
          workflow: { id: 'wfl123', name: 'Deploy', isActive: true },
        }),
        lastModifiedBy: 'usr123',
      },
    });
  });

  it('createWorkflow should sync button workflow metadata immediately for buttonClick trigger', async () => {
    txWorkflow.aggregate.mockResolvedValue({ _max: { order: 1 } });
    txWorkflow.create.mockResolvedValue({
      id: 'wfl999',
      baseId: 'bse123',
      name: 'Button flow',
      description: null,
      trigger: JSON.stringify({
        type: 'buttonClick',
        config: { tableId: 'tbl123', watchFieldIds: ['fldButton1'] },
      }),
      conditions: JSON.stringify([]),
      actions: JSON.stringify([]),
      isActive: true,
      createdTime: new Date('2026-05-02T00:00:00.000Z'),
      lastModifiedTime: null,
    });
    txField.findMany.mockResolvedValue([
      {
        id: 'fldButton1',
        tableId: 'tbl123',
        options: JSON.stringify({
          label: 'Run',
          color: 'teal',
        }),
      },
    ]);

    await service.createWorkflow('bse123', {
      name: 'Button flow',
      trigger: {
        type: 'buttonClick',
        config: { tableId: 'tbl123', watchFieldIds: ['fldButton1'] },
      },
      conditions: [],
      actions: [],
      isActive: true,
    });

    expect(txField.updateMany).toHaveBeenCalledWith({
      where: { id: 'fldButton1', tableId: 'tbl123' },
      data: {
        options: JSON.stringify({
          label: 'Run',
          color: 'teal',
          workflow: { id: 'wfl999', name: 'Button flow', isActive: true },
        }),
        lastModifiedBy: 'usr123',
      },
    });
  });

  it('deleteWorkflow should clear button workflow metadata before permanent delete', async () => {
    vi.spyOn(service, 'getWorkflowById').mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      name: 'Button flow',
      description: null,
      trigger: {
        type: 'buttonClick',
        config: { tableId: 'tbl123', watchFieldIds: ['fldButton1'] },
      },
      conditions: [],
      actions: [],
      isActive: true,
      createdTime: '2026-05-02T00:00:00.000Z',
      lastModifiedTime: null,
    });
    txField.findMany.mockResolvedValue([
      {
        id: 'fldButton1',
        tableId: 'tbl123',
        options: JSON.stringify({
          label: 'Run',
          color: 'teal',
          workflow: { id: 'wfl123', name: 'Button flow', isActive: true },
        }),
      },
    ]);
    txWorkflow.delete.mockResolvedValue(undefined);

    await service.deleteWorkflow('bse123', 'wfl123', true);

    expect(txField.updateMany).toHaveBeenCalledWith({
      where: { id: 'fldButton1', tableId: 'tbl123' },
      data: {
        options: JSON.stringify({
          label: 'Run',
          color: 'teal',
          workflow: { id: 'wfl123', name: 'Button flow', isActive: false },
        }),
        lastModifiedBy: 'usr123',
      },
    });
    expect(txWorkflow.delete).toHaveBeenCalledWith({ where: { id: 'wfl123' } });
  });
});
