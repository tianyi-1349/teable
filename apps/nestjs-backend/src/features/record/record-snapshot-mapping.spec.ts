import { CellFormat, FieldKeyType } from '@teable/core';
import { describe, expect, it } from 'vitest';
import { assertAllRecordIdsFound, buildSnapshotsFromDbRecords } from './record-snapshot-mapping';

describe('assertAllRecordIdsFound', () => {
  it('returns missing record ids from query results', () => {
    expect(
      assertAllRecordIdsFound(['recA', 'recB', 'recC'], [{ __id: 'recC' }, { __id: 'recA' }])
    ).toEqual(['recB']);
  });

  it('returns an empty array when every requested record exists', () => {
    expect(assertAllRecordIdsFound(['recA'], [{ __id: 'recA' }])).toEqual([]);
  });
});

describe('buildSnapshotsFromDbRecords', () => {
  const primaryField = {
    id: 'fldTitle',
    name: 'Title',
    dbFieldName: 'title',
    cellValue2String: (cellValue: unknown) => `string:${String(cellValue ?? '')}`,
  };

  it('keeps requested order and uses primary field stringification for json cell format', () => {
    const snapshots = buildSnapshotsFromDbRecords(
      [
        {
          __id: 'recB',
          __version: 2,
          __auto_number: 12,
          __created_time: new Date('2026-03-20T00:00:00.000Z'),
          __last_modified_time: new Date('2026-03-21T00:00:00.000Z'),
          __created_by: 'usrB',
          __last_modified_by: 'usrC',
        },
        {
          __id: 'recA',
          __version: 1,
          __auto_number: 11,
          __created_time: new Date('2026-03-18T00:00:00.000Z'),
          __last_modified_time: undefined,
          __created_by: 'usrA',
          __last_modified_by: undefined,
        },
      ],
      { recA: 0, recB: 1 },
      primaryField,
      FieldKeyType.Name,
      CellFormat.Json,
      (record) => ({
        Title: record.__id === 'recA' ? 'Alpha' : 'Beta',
      })
    );

    expect(snapshots).toEqual([
      {
        id: 'recA',
        v: 1,
        type: 'json0',
        data: {
          fields: { Title: 'Alpha' },
          name: 'string:Alpha',
          id: 'recA',
          autoNumber: 11,
          createdTime: '2026-03-18T00:00:00.000Z',
          lastModifiedTime: undefined,
          createdBy: 'usrA',
          lastModifiedBy: undefined,
        },
      },
      {
        id: 'recB',
        v: 2,
        type: 'json0',
        data: {
          fields: { Title: 'Beta' },
          name: 'string:Beta',
          id: 'recB',
          autoNumber: 12,
          createdTime: '2026-03-20T00:00:00.000Z',
          lastModifiedTime: '2026-03-21T00:00:00.000Z',
          createdBy: 'usrB',
          lastModifiedBy: 'usrC',
        },
      },
    ]);
  });

  it('keeps text cell format names unchanged', () => {
    const snapshots = buildSnapshotsFromDbRecords(
      [
        {
          __id: 'recA',
          __version: 1,
          __auto_number: 1,
          __created_time: new Date('2026-03-18T00:00:00.000Z'),
          __last_modified_time: undefined,
          __created_by: 'usrA',
          __last_modified_by: undefined,
        },
      ],
      { recA: 0 },
      primaryField,
      FieldKeyType.Id,
      CellFormat.Text,
      () => ({ fldTitle: 'Plain Title' })
    );

    expect(snapshots[0]?.data.name).toBe('Plain Title');
  });
});
