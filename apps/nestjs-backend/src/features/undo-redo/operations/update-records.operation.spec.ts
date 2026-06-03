import { FieldKeyType } from '@teable/core';
import type { IUpdateRecordsOperation } from '../../../cache/types';
import { OperationName } from '../../../cache/types';
import { UpdateRecordsOperation } from './update-records.operation';

describe('UpdateRecordsOperation', () => {
  const recordOpenApiService = {
    updateRecords: vi.fn(),
  };
  const recordService = {
    updateRecordIndexes: vi.fn(),
  };
  const tableDomainQueryService = {
    getTableDomainById: vi.fn(),
  };

  const operation = new UpdateRecordsOperation(
    recordOpenApiService as never,
    recordService as never,
    tableDomainQueryService as never
  );

  beforeEach(() => {
    vi.clearAllMocks();
    tableDomainQueryService.getTableDomainById.mockResolvedValue({
      fieldList: [
        { id: 'fldWritable', isComputed: false },
        { id: 'fldComputed', isComputed: true },
      ],
    });
  });

  const updateOperation: IUpdateRecordsOperation = {
    name: OperationName.UpdateRecords,
    params: {
      tableId: 'tbl1',
      recordIds: ['rec1'],
      fieldIds: ['fldWritable', 'fldComputed', 'fldMissing'],
    },
    result: {
      cellContexts: [
        {
          recordId: 'rec1',
          fieldId: 'fldWritable',
          oldValue: 'old writable',
          newValue: 'new writable',
        },
        {
          recordId: 'rec1',
          fieldId: 'fldComputed',
          oldValue: 'old computed',
          newValue: 'new computed',
        },
        {
          recordId: 'rec1',
          fieldId: 'fldMissing',
          oldValue: 'old missing',
          newValue: 'new missing',
        },
      ],
      ordersMap: {
        rec1: {
          oldOrder: { view1: 1 },
          newOrder: { view1: 2 },
        },
      },
    },
  };

  it('filters computed and missing fields when undoing record updates', async () => {
    await operation.undo(updateOperation);

    expect(recordOpenApiService.updateRecords).toHaveBeenCalledWith('tbl1', {
      fieldKeyType: FieldKeyType.Id,
      records: [
        {
          id: 'rec1',
          fields: {
            fldWritable: 'old writable',
          },
          order: { view1: 1 },
        },
      ],
    });
  });

  it('filters computed and missing fields when redoing record updates', async () => {
    await operation.redo(updateOperation);

    expect(recordOpenApiService.updateRecords).toHaveBeenCalledWith('tbl1', {
      fieldKeyType: FieldKeyType.Id,
      records: [
        {
          id: 'rec1',
          fields: {
            fldWritable: 'new writable',
          },
          order: { view1: 2 },
        },
      ],
    });
  });

  it('skips undo writes when no writable fields or order changes remain', async () => {
    await operation.undo({
      ...updateOperation,
      params: {
        ...updateOperation.params,
        fieldIds: ['fldComputed', 'fldMissing'],
      },
      result: {
        cellContexts: updateOperation.result.cellContexts,
        ordersMap: {},
      },
    });

    expect(recordService.updateRecordIndexes).not.toHaveBeenCalled();
    expect(recordOpenApiService.updateRecords).not.toHaveBeenCalled();
  });
});
