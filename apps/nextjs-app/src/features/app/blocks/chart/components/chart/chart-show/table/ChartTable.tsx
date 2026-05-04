/* eslint-disable @typescript-eslint/no-explicit-any */
import { CellFormat } from '@teable/core';
import { CellValue } from '@teable/sdk';
import { cn, TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from '@teable/ui-lib';
import { useContext, useMemo } from 'react';
import { useBaseQueryData } from '../../../../hooks/useBaseQueryData';
import type { ITableConfig } from '../../../../types';
import { ChartContext } from '../../../ChartProvider';
import { sortTableColumns, tableConfigColumnsToMap } from '../../utils';

export const ChartTable = (props: { config?: ITableConfig }) => {
  const queryData = useBaseQueryData(CellFormat.Json);
  const { interactionFilter, interactionConfig, onInteractionFilterChange } =
    useContext(ChartContext);
  const { config } = props;
  const { columns: configColumns } = config ?? {};
  const columns = queryData?.columns;
  const configColumnMap = useMemo(() => tableConfigColumnsToMap(configColumns), [configColumns]);

  const sortedColumns = useMemo(
    () => (columns ? sortTableColumns(columns, configColumnMap) : []),
    [columns, configColumnMap]
  );

  const handleRowClick = (row: Record<string, unknown>) => {
    const dimensionColumn = interactionFilter?.dimensionColumn ?? sortedColumns[0]?.column;
    if (!dimensionColumn) {
      return;
    }
    const dimensionValue = row[dimensionColumn];
    if (dimensionValue == null) {
      return;
    }
    const currentValues =
      interactionFilter?.dimensionColumn === dimensionColumn
        ? interactionFilter.dimensionValues
        : [];
    const normalizedValue = dimensionValue as string | number;
    const exists = currentValues.includes(normalizedValue);
    const nextValues =
      interactionConfig.mode === 'single'
        ? exists
          ? interactionConfig.clearBehavior === 'toggle-empty'
            ? []
            : currentValues
          : [normalizedValue]
        : exists
          ? currentValues.filter((value) => value !== normalizedValue)
          : [...currentValues, normalizedValue];
    if (!nextValues.length) {
      void onInteractionFilterChange(undefined);
      return;
    }
    void onInteractionFilterChange({
      source: 'table',
      dimensionColumn,
      dimensionValues: nextValues,
    });
  };

  return (
    <div className="size-full overflow-auto p-4">
      <Table>
        <TableHeader>
          <TableRow>
            {sortedColumns.map(({ column, name }) => (
              <TableHead
                style={{
                  width: configColumnMap[column]?.width
                    ? `${configColumnMap[column]?.width}px`
                    : 'auto',
                }}
                key={column}
              >
                {configColumnMap[column]?.label || name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {queryData?.rows.slice(0, 50).map((row, index) => (
            <TableRow
              key={index}
              className={cn({
                'bg-accent/40':
                  interactionFilter?.dimensionColumn &&
                  interactionFilter.dimensionValues.includes(
                    row[interactionFilter.dimensionColumn] as string | number
                  ),
              })}
              onClick={() => handleRowClick(row)}
            >
              {queryData.columns.map(({ column, fieldSource }) => (
                <TableCell key={column}>
                  {fieldSource ? (
                    <CellValue
                      formatImageUrl={(url) => url}
                      field={fieldSource as any}
                      value={row[column]}
                    />
                  ) : (
                    `${row[column]}`
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
