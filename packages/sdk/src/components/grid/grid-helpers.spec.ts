import { describe, expect, test } from 'vitest';
import { getActiveCellBound, getScrollToItemTarget } from './grid-helpers';
import { CoordinateManager } from './managers';

const createCoordinateManager = () =>
  new CoordinateManager({
    rowCount: 20,
    pureRowCount: 20,
    columnCount: 5,
    containerWidth: 300,
    containerHeight: 200,
    rowHeight: 40,
    columnWidth: 100,
    rowHeightMap: {},
    columnWidthMap: {},
    rowInitSize: 40,
    columnInitSize: 70,
    freezeColumnCount: 1,
  });

describe('grid-helpers', () => {
  test('computes active cell bound without custom measure', () => {
    const coordInstance = createCoordinateManager();

    const result = getActiveCellBound({
      activeCell: [2, 3],
      getCellContent: () => ({ type: 'text', data: null }) as never,
      coordInstance,
      theme: {} as never,
      real2RowIndex: (index) => index,
    });

    expect(result).toEqual({
      rowIndex: 3,
      columnIndex: 2,
      width: 100,
      height: 40,
      totalHeight: 40,
      scrollTop: 0,
      scrollEnable: false,
    });
  });

  test('computes scroll target for non-frozen cell outside viewport', () => {
    const coordInstance = createCoordinateManager();

    const result = getScrollToItemTarget({
      position: [3, 6],
      coordInstance,
      scrollState: { scrollLeft: 0, scrollTop: 0, isScrolling: false },
      real2RowIndex: (index) => index,
      cellScrollBuffer: 40,
    });

    expect(result).toEqual({
      nextScrollLeft: 210,
      nextScrollTop: 120,
    });
  });

  test('keeps scroll target empty when cell is already visible', () => {
    const coordInstance = createCoordinateManager();

    const result = getScrollToItemTarget({
      position: [0, 1],
      coordInstance,
      scrollState: { scrollLeft: 0, scrollTop: 0, isScrolling: false },
      real2RowIndex: (index) => index,
      cellScrollBuffer: 40,
    });

    expect(result).toEqual({
      nextScrollLeft: undefined,
      nextScrollTop: undefined,
    });
  });
});
