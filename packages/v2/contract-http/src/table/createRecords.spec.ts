import type { CreateRecordsResult } from '@teable/v2-core';
import { describe, expect, it } from 'vitest';

import { mapCreateRecordsResultToDto, createRecordsResponseDataSchema } from './createRecords';

describe('mapCreateRecordsResultToDto', () => {
  it('serializes batch-created record fields before output validation', () => {
    const result = {
      records: [
        {
          id: () => ({ toString: () => 'rec_test' }),
          fields: () => ({
            entries: () => [
              {
                fieldId: { toString: () => 'fld_date' },
                value: { toValue: () => new Date('2024-06-15T00:00:00.000Z') },
              },
              {
                fieldId: { toString: () => 'fld_attachment' },
                value: {
                  toValue: () => [
                    {
                      id: 'act_test',
                      token: 'tok_test',
                      name: 'file.txt',
                      path: 'table/file.txt',
                      size: 4,
                      mimetype: 'text/plain',
                      width: undefined,
                    },
                  ],
                },
              },
            ],
          }),
        },
      ],
      events: [],
      fieldKeyMapping: new Map(),
    } as unknown as CreateRecordsResult;

    const mapped = mapCreateRecordsResultToDto(result);

    expect(mapped.isOk()).toBe(true);
    if (mapped.isErr()) return;

    expect(mapped.value.records[0]?.fields).toEqual({
      fld_date: '2024-06-15T00:00:00.000Z',
      fld_attachment: [
        {
          id: 'act_test',
          token: 'tok_test',
          name: 'file.txt',
          path: 'table/file.txt',
          size: 4,
          mimetype: 'text/plain',
        },
      ],
    });
    expect(createRecordsResponseDataSchema.safeParse(mapped.value).success).toBe(true);
  });
});
