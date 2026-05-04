import { BaseQueryColumnType, type IBaseQuery } from '@teable/openapi';
import { describe, expect, it } from 'vitest';
import { mergeInteractionFilterToQuery } from './plugin-chart.service';

describe('mergeInteractionFilterToQuery', () => {
  it('returns original query when filter is missing', () => {
    const query = { from: 'tbl1' } as IBaseQuery;
    expect(mergeInteractionFilterToQuery(query)).toBe(query);
  });

  it('adds interaction filter into empty where', () => {
    const query = { from: 'tbl1' } as IBaseQuery;
    const merged = mergeInteractionFilterToQuery(
      query,
      JSON.stringify({
        dimensionColumn: 'country',
        dimensionValues: ['US', 'JP'],
      })
    );

    expect(merged.where).toEqual({
      conjunction: 'or',
      filterSet: [
        {
          column: 'country',
          type: BaseQueryColumnType.Field,
          operator: 'is',
          value: 'US',
        },
        {
          column: 'country',
          type: BaseQueryColumnType.Field,
          operator: 'is',
          value: 'JP',
        },
      ],
    });
  });

  it('combines interaction filter with existing where using and', () => {
    const query = {
      from: 'tbl1',
      where: {
        conjunction: 'and',
        filterSet: [
          {
            column: 'status',
            type: BaseQueryColumnType.Field,
            operator: 'is',
            value: 'Active',
          },
        ],
      },
    } as unknown as IBaseQuery;

    const merged = mergeInteractionFilterToQuery(
      query,
      JSON.stringify({
        dimensionColumn: 'country',
        dimensionValues: ['US'],
      })
    );

    expect(merged.where).toEqual({
      conjunction: 'and',
      filterSet: [
        query.where,
        {
          conjunction: 'or',
          filterSet: [
            {
              column: 'country',
              type: BaseQueryColumnType.Field,
              operator: 'is',
              value: 'US',
            },
          ],
        },
      ],
    });
  });
});
