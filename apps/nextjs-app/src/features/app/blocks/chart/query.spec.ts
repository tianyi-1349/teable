import type { IBaseQueryVo } from '@teable/openapi';
import { describe, expect, it } from 'vitest';
import { applyInteractionFilter, formatRes } from './query';

describe('chart query helpers', () => {
  it('formats column names with spaces for recharts keys', () => {
    const res = formatRes({
      columns: [
        {
          column: 'Region Name',
          name: 'Region Name',
        },
      ],
      rows: [
        {
          'Region Name': 'APAC',
        },
      ],
    } as unknown as IBaseQueryVo);

    expect(res.columns[0].column).toBe('Region_Name');
    expect(res.rows[0].Region_Name).toBe('APAC');
  });

  it('filters rows by interaction dimension/value', () => {
    const source = {
      columns: [{ column: 'country', name: 'country' }],
      rows: [{ country: 'US' }, { country: 'CN' }, { country: 'US' }],
    } as unknown as IBaseQueryVo;

    const filtered = applyInteractionFilter(source, {
      source: 'combo',
      dimensionColumn: 'country',
      dimensionValues: ['US'],
    });

    expect(filtered.rows).toEqual([{ country: 'US' }, { country: 'US' }]);
  });

  it('supports multi-select interaction filter values', () => {
    const source = {
      columns: [{ column: 'country', name: 'country' }],
      rows: [{ country: 'US' }, { country: 'CN' }, { country: 'JP' }],
    } as unknown as IBaseQueryVo;

    const filtered = applyInteractionFilter(source, {
      source: 'table',
      dimensionColumn: 'country',
      dimensionValues: ['US', 'JP'],
    });

    expect(filtered.rows).toEqual([{ country: 'US' }, { country: 'JP' }]);
  });
});
