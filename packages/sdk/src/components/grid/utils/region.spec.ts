import { describe, expect, test } from 'vitest';
import { LinearRowType, RegionType, type ILinearRow } from '../interface';
import { CoordinateManager } from '../managers';
import { getColumnStatisticData } from './region';

const getRow = (realIndex: number, displayIndex = realIndex + 1): ILinearRow => ({
  type: LinearRowType.Row,
  realIndex,
  displayIndex,
});

const getGroup = (id: string, realIndex: number): ILinearRow => ({
  type: LinearRowType.Group,
  id,
  depth: 0,
  value: id,
  realIndex,
  isCollapsed: false,
});

const coordinateManager = new CoordinateManager({
  rowCount: 10,
  pureRowCount: 10,
  columnCount: 3,
  containerWidth: 500,
  containerHeight: 300,
  rowHeight: 40,
  columnWidth: 120,
  rowHeightMap: {},
  columnWidthMap: {},
  rowInitSize: 40,
  columnInitSize: 70,
  freezeColumnCount: 1,
});

describe('getColumnStatisticData', () => {
  test('returns grouped statistic region for first column group row hit', () => {
    const result = getColumnStatisticData({
      height: 260,
      scrollState: { scrollLeft: 0, scrollTop: 0, isScrolling: false },
      coordInstance: coordinateManager,
      columnStatistics: { col0: { total: '10', group1: '5' } },
      getLinearRow: (index) => (index === 1 ? getGroup('group1', 1) : getRow(index)),
      position: {
        rowIndex: 1,
        columnIndex: 0,
        x: 145,
        y: 90,
      },
    });

    expect(result).toEqual({
      type: RegionType.GroupStatistic,
      x: 70,
      y: 80,
      width: 120,
      height: 40,
    });
  });

  test('returns bottom statistic region for column statistic hit', () => {
    const result = getColumnStatisticData({
      height: 260,
      scrollState: { scrollLeft: 0, scrollTop: 0, isScrolling: false },
      coordInstance: coordinateManager,
      columnStatistics: { col1: { total: '20' } },
      getLinearRow: () => getRow(0, 1),
      position: {
        rowIndex: -1,
        columnIndex: 1,
        x: 200,
        y: 240,
      },
    });

    expect(result).toEqual({
      type: RegionType.ColumnStatistic,
      x: 190,
      y: 220,
      width: 120,
      height: 40,
    });
  });

  test('returns null when statistics are unavailable', () => {
    const result = getColumnStatisticData({
      height: 260,
      scrollState: { scrollLeft: 0, scrollTop: 0, isScrolling: false },
      coordInstance: coordinateManager,
      columnStatistics: undefined,
      getLinearRow: () => getRow(0, 1),
      position: {
        rowIndex: -1,
        columnIndex: 1,
        x: 200,
        y: 240,
      },
    });

    expect(result).toBeNull();
  });
});
