import { FieldKeyType } from '@teable/core';
import { keyBy } from 'lodash';
import type { IUpdateRecordsOperation } from '../../../cache/types';
import { OperationName } from '../../../cache/types';
import type { ICellContext } from '../../calculation/utils/changes';
import type { RecordOpenApiService } from '../../record/open-api/record-open-api.service';
import type { RecordService } from '../../record/record.service';
import type { TableDomainQueryService } from '../../table-domain';

export interface IUpdateRecordsPayload {
  windowId: string;
  tableId: string;
  userId: string;
  recordIds: string[];
  fieldIds: string[];
  cellContexts: ICellContext[];
  orderIndexesBefore?: Record<string, number>[];
  orderIndexesAfter?: Record<string, number>[];
}

export class UpdateRecordsOperation {
  constructor(
    private readonly recordOpenApiService: RecordOpenApiService,
    private readonly recordService: RecordService,
    private readonly tableDomainQueryService: TableDomainQueryService
  ) {}

  private async buildWritableRecords(
    tableId: string,
    recordIds: string[],
    fieldIds: string[],
    cellContexts: ICellContext[] | undefined,
    ordersMap: IUpdateRecordsOperation['result']['ordersMap'] | undefined,
    valueKey: 'oldValue' | 'newValue'
  ) {
    const table = await this.tableDomainQueryService.getTableDomainById(tableId);
    const writableFieldIds = new Set(
      table.fieldList.filter((field) => !field.isComputed).map((field) => field.id)
    );
    const effectiveFieldIds = fieldIds.filter((fieldId) => writableFieldIds.has(fieldId));
    const cellContextMap = keyBy(
      cellContexts ?? [],
      (cellContext) => `${cellContext.recordId}-${cellContext.fieldId}`
    );

    return recordIds.flatMap((recordId) => {
      const fields = effectiveFieldIds.reduce<Record<string, unknown>>((acc, fieldId) => {
        const key = `${recordId}-${fieldId}`;
        const cellContext = cellContextMap[key];
        if (cellContext) {
          const value = cellContext[valueKey];
          acc[fieldId] = value == null ? null : value;
        }
        return acc;
      }, {});
      const order =
        valueKey === 'oldValue' ? ordersMap?.[recordId]?.oldOrder : ordersMap?.[recordId]?.newOrder;
      return Object.keys(fields).length || order ? [{ id: recordId, fields, order }] : [];
    });
  }

  async event2Operation(payload: IUpdateRecordsPayload): Promise<IUpdateRecordsOperation> {
    const { tableId, recordIds, fieldIds, cellContexts, orderIndexesAfter, orderIndexesBefore } =
      payload;

    const ordersMap = recordIds.reduce<{
      [recordId: string]: {
        newOrder?: Record<string, number>;
        oldOrder?: Record<string, number>;
      };
    }>((acc, recordId, index) => {
      if (orderIndexesAfter?.[index] == orderIndexesBefore?.[index]) {
        return acc;
      }

      acc[recordId] = {
        newOrder: orderIndexesAfter?.[index],
        oldOrder: orderIndexesBefore?.[index],
      };
      return acc;
    }, {});

    return {
      name: OperationName.UpdateRecords,
      params: {
        tableId,
        recordIds,
        fieldIds,
      },
      result: {
        cellContexts,
        ordersMap,
      },
    };
  }

  async undo(operation: IUpdateRecordsOperation) {
    const { params, result } = operation;
    const { tableId, recordIds, fieldIds } = params;
    const { cellContexts, ordersMap } = result;

    const records = await this.buildWritableRecords(
      tableId,
      recordIds,
      fieldIds,
      cellContexts,
      ordersMap,
      'oldValue'
    );

    if (!records.length) {
      return operation;
    }

    await this.recordService.updateRecordIndexes(tableId, records);

    await this.recordOpenApiService.updateRecords(tableId, {
      fieldKeyType: FieldKeyType.Id,
      records,
    });

    return operation;
  }

  async redo(operation: IUpdateRecordsOperation) {
    const { params, result } = operation;
    const { tableId, recordIds, fieldIds } = params;
    const { cellContexts, ordersMap } = result;

    const records = await this.buildWritableRecords(
      tableId,
      recordIds,
      fieldIds,
      cellContexts,
      ordersMap,
      'newValue'
    );

    if (!records.length) {
      return operation;
    }

    await this.recordService.updateRecordIndexes(tableId, records);

    await this.recordOpenApiService.updateRecords(tableId, {
      fieldKeyType: FieldKeyType.Id,
      records,
    });

    return operation;
  }
}
