import type { IBaseQueryVo } from '@teable/openapi';
import type { IChartInteractionFilter } from './types';

export const formatRes = (res?: IBaseQueryVo): IBaseQueryVo => {
  if (!res) {
    return {
      rows: [],
      columns: [],
    };
  }
  const { columns, rows } = res;
  // recharts does not support column name with space
  const formatColumn = (column: string) => column.replaceAll(' ', '_');
  return {
    columns: columns.map((column) => ({
      ...column,
      column: formatColumn(column.column),
    })),
    rows: rows.map((row) => {
      const newRow: Record<string, unknown> = {};
      columns.forEach((column) => {
        newRow[formatColumn(column.column)] = row[column.column];
      });
      return newRow;
    }),
  };
};

export const applyInteractionFilter = (
  res: IBaseQueryVo,
  interactionFilter?: IChartInteractionFilter
): IBaseQueryVo => {
  if (!interactionFilter) {
    return res;
  }
  const { dimensionColumn, dimensionValues } = interactionFilter;
  if (!dimensionValues.length) {
    return res;
  }
  const valueSet = new Set(dimensionValues);
  return {
    ...res,
    rows: res.rows.filter((row) => valueSet.has(row[dimensionColumn] as string | number)),
  };
};
