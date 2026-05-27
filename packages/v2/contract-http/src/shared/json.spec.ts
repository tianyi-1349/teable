import { describe, expect, it } from 'vitest';

import { jsonValueSchema, toJsonRecord, toJsonValue } from './json';

const DATE_ISO = '2026-01-15T00:30:00.000Z';
const NESTED_DATE_ISO = '2026-01-16T00:30:00.000Z';

describe('JSON serialization helpers', () => {
  it('serializes values into output-schema-safe JSON', () => {
    expect(toJsonValue(new Date(DATE_ISO))).toBe(DATE_ISO);
    expect(
      toJsonRecord({
        date: new Date(DATE_ISO),
        nested: { dates: [new Date(NESTED_DATE_ISO), undefined] },
        skipped: undefined,
      })
    ).toEqual({
      date: DATE_ISO,
      nested: { dates: [NESTED_DATE_ISO, null] },
    });
  });

  it('produces values accepted by the JSON schema', () => {
    const value = toJsonRecord({ date: new Date(DATE_ISO) });

    expect(jsonValueSchema.safeParse(value).success).toBe(true);
  });
});
