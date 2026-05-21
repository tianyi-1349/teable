import { CellFormat, type FieldKeyType, type IRecord, type ISnapshotBase } from '@teable/core';
import type { IVisualTableDefaultField } from '../field/constant';

type IFieldKeySource = {
  cellValue2String: (cellValue: unknown) => string;
  [FieldKeyType.Id]: string;
  [FieldKeyType.Name]: string;
  [FieldKeyType.DbFieldName]: string;
};

type IDbRecordSnapshot = { [fieldName: string]: unknown } & IVisualTableDefaultField;

export function assertAllRecordIdsFound(
  recordIds: string[],
  result: Pick<IVisualTableDefaultField, '__id'>[]
) {
  const foundIds = new Set(result.map((record) => record.__id));
  return recordIds.filter((recordId) => !foundIds.has(recordId));
}

export function buildSnapshotsFromDbRecords(
  result: IDbRecordSnapshot[],
  recordIdsMap: Record<string, number>,
  primaryField: IFieldKeySource,
  fieldKeyType: FieldKeyType,
  cellFormat: CellFormat,
  mapRecordFields: (record: IDbRecordSnapshot) => IRecord['fields']
): ISnapshotBase<IRecord>[] {
  return result
    .sort((a, b) => recordIdsMap[a.__id] - recordIdsMap[b.__id])
    .map((record) => {
      const recordFields = mapRecordFields(record);
      const name =
        recordFields[fieldKeyType in primaryField ? (primaryField[fieldKeyType] as string) : ''];

      return {
        id: record.__id,
        v: record.__version,
        type: 'json0',
        data: {
          fields: recordFields,
          name:
            cellFormat === CellFormat.Text ? (name as string) : primaryField.cellValue2String(name),
          id: record.__id,
          autoNumber: record.__auto_number,
          createdTime: record.__created_time?.toISOString(),
          lastModifiedTime: record.__last_modified_time?.toISOString(),
          createdBy: record.__created_by,
          lastModifiedBy: record.__last_modified_by || undefined,
        },
      };
    });
}
