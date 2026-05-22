import type { TableRecordReadModel } from '@teable/v2-core';
import { describe, expect, it } from 'vitest';

import { mapTableRecordToDto, tableRecordDtoSchema } from './recordDto';

describe('mapTableRecordToDto', () => {
  it('serializes Date cell values before output validation', () => {
    const record: TableRecordReadModel = {
      id: 'rec_test',
      version: 1,
      fields: {
        dateField: new Date('2024-06-15T00:00:00.000Z'),
        formulaField: 2024,
        nested: {
          dates: [new Date('2024-06-16T00:00:00.000Z')],
        },
      },
    };

    const mapped = mapTableRecordToDto(record);

    expect(mapped.isOk()).toBe(true);
    if (mapped.isErr()) return;

    expect(mapped.value.fields).toEqual({
      dateField: '2024-06-15T00:00:00.000Z',
      formulaField: 2024,
      nested: {
        dates: ['2024-06-16T00:00:00.000Z'],
      },
    });
    expect(tableRecordDtoSchema.safeParse(mapped.value).success).toBe(true);
  });
});
