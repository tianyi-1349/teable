import { FieldKeyType } from '@teable/core';
import { describe, expect, it } from 'vitest';
import { buildViewProjection } from './record-view-projection';

describe('buildViewProjection', () => {
  const fields = [
    { id: 'fldTitle', name: 'Title' },
    { id: 'fldStatus', name: 'Status' },
  ];

  it('returns visible fields when column meta uses visible flags', () => {
    expect(
      buildViewProjection(
        {
          fldTitle: { order: 0, visible: true },
          fldStatus: { order: 1, visible: false },
        },
        fields,
        FieldKeyType.Name
      )
    ).toEqual({ Title: true });
  });

  it('returns non-hidden fields when column meta uses hidden flags', () => {
    expect(
      buildViewProjection(
        {
          fldTitle: { order: 0, hidden: false },
          fldStatus: { order: 1, hidden: true },
        },
        fields,
        FieldKeyType.Id
      )
    ).toEqual({ fldTitle: true });
  });

  it('ignores unknown fields and returns undefined when no projection survives', () => {
    expect(
      buildViewProjection(
        {
          fldMissing: { order: 0, visible: true },
        },
        fields,
        FieldKeyType.Id
      )
    ).toBeUndefined();
  });

  it('returns undefined when column meta has no visibility semantics', () => {
    expect(
      buildViewProjection(
        {
          fldTitle: { order: 0, width: 200 },
        } as never,
        fields,
        FieldKeyType.Id
      )
    ).toBeUndefined();
  });
});
