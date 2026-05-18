import { CellValueType, DbFieldType, FieldType, FieldKeyType, HttpErrorCode } from '@teable/core';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { CustomHttpException } from '../../../custom.exception';
import { Events } from '../../../event-emitter/events';
import { RecordOpenApiService } from './record-open-api.service';

describe('RecordOpenApiService.buttonClick', () => {
  const fieldFindFirstOrThrow = vi.fn();
  const prismaService = {
    txClient: vi.fn(() => ({
      field: {
        findFirstOrThrow: fieldFindFirstOrThrow,
      },
    })),
  };

  const recordService = {
    getRecord: vi.fn(),
  };

  const eventEmitterService = {
    emitAsync: vi.fn(),
  };
  const workflowService = {
    createButtonRun: vi.fn(),
  };

  let service: RecordOpenApiService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RecordOpenApiService(
      prismaService as never,
      recordService as never,
      {} as never,
      {} as never,
      { bigTransactionTimeout: 1000 } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      eventEmitterService as never,
      workflowService as never
    );
  });

  it('should increment button count and emit button click event with workflow id', async () => {
    fieldFindFirstOrThrow.mockResolvedValue({
      id: 'fldButton0000000001',
      type: FieldType.Button,
      name: 'Run',
      description: null,
      options: JSON.stringify({
        label: 'Run',
        color: 'teal',
        workflow: {
          id: 'wfl123',
          name: 'Deploy',
          isActive: true,
        },
      }),
      cellValueType: CellValueType.String,
      isMultipleCellValue: false,
      dbFieldType: DbFieldType.Json,
      dbFieldName: 'run_workflow',
      tableId: 'tbl123',
      order: 1,
      version: 1,
      createdBy: 'usr123',
      createdTime: new Date(),
    });
    recordService.getRecord.mockResolvedValue({
      id: 'rec123',
      fields: {
        fldButton0000000001: { count: 1 },
      },
    });
    vi.spyOn(service, 'updateRecord').mockResolvedValue({
      id: 'rec123',
      fields: {
        fldButton0000000001: { count: 2 },
      },
    } as never);
    workflowService.createButtonRun.mockResolvedValue({ runId: 'wrun123' });

    const result = await service.buttonClick('tbl123', 'rec123', 'fldButton0000000001');

    expect(recordService.getRecord).toHaveBeenCalledWith('tbl123', 'rec123', {
      fieldKeyType: FieldKeyType.Id,
    });
    expect(eventEmitterService.emitAsync).toHaveBeenCalledWith(
      Events.TABLE_BUTTON_CLICK,
      expect.objectContaining({
        tableId: 'tbl123',
        fieldId: 'fldButton0000000001',
        workflowId: 'wfl123',
        runId: 'wrun123',
        record: expect.objectContaining({
          id: 'rec123',
        }),
      })
    );
    expect(result.record.fields).toEqual({
      fldButton0000000001: { count: 2 },
    });
    expect(result.runId).toBe('wrun123');
  });

  it('should reject inactive workflow before record update', async () => {
    fieldFindFirstOrThrow.mockResolvedValue({
      id: 'fldButton0000000001',
      type: FieldType.Button,
      name: 'Run',
      description: null,
      options: JSON.stringify({
        label: 'Run',
        color: 'teal',
        workflow: {
          id: 'wfl123',
          name: 'Deploy',
          isActive: false,
        },
      }),
      cellValueType: CellValueType.String,
      isMultipleCellValue: false,
      dbFieldType: DbFieldType.Json,
      dbFieldName: 'run_workflow',
      tableId: 'tbl123',
      order: 1,
      version: 1,
      createdBy: 'usr123',
      createdTime: new Date(),
    });

    await expect(
      service.buttonClick('tbl123', 'rec123', 'fldButton0000000001')
    ).rejects.toMatchObject({
      code: HttpErrorCode.VALIDATION_ERROR,
    } satisfies Partial<CustomHttpException>);

    expect(eventEmitterService.emitAsync).not.toHaveBeenCalled();
    expect(workflowService.createButtonRun).not.toHaveBeenCalled();
  });

  it('should still return updated record when emitting workflow event fails', async () => {
    fieldFindFirstOrThrow.mockResolvedValue({
      id: 'fldButton0000000001',
      type: FieldType.Button,
      name: 'Run',
      description: null,
      options: JSON.stringify({
        label: 'Run',
        color: 'teal',
        workflow: {
          id: 'wfl123',
          name: 'Deploy',
          isActive: true,
        },
      }),
      cellValueType: CellValueType.String,
      isMultipleCellValue: false,
      dbFieldType: DbFieldType.Json,
      dbFieldName: 'run_workflow',
      tableId: 'tbl123',
      order: 1,
      version: 1,
      createdBy: 'usr123',
      createdTime: new Date(),
    });
    recordService.getRecord.mockResolvedValue({
      id: 'rec123',
      fields: {
        fldButton0000000001: { count: 1 },
      },
    });
    vi.spyOn(service, 'updateRecord').mockResolvedValue({
      id: 'rec123',
      fields: {
        fldButton0000000001: { count: 2 },
      },
    } as never);
    workflowService.createButtonRun.mockResolvedValue({ runId: 'wrun123' });
    eventEmitterService.emitAsync.mockRejectedValue(new Error('queue unavailable'));

    const result = await service.buttonClick('tbl123', 'rec123', 'fldButton0000000001');

    expect(result.record.fields).toEqual({
      fldButton0000000001: { count: 2 },
    });
    expect(result.runId).toBe('wrun123');
    expect(eventEmitterService.emitAsync).toHaveBeenCalledTimes(1);
  });
});
