import { describe, expect, test } from 'vitest';
import {
  getColumnHeaderRect,
  getFillSelectionResult,
  resolveCursor,
  resolveRowDropTarget,
  toggleCollapsedGroupIds,
} from './interaction-layer-helpers';
import {
  DraggableType,
  LinearRowType,
  RegionType,
  SelectableType,
  type ILinearRow,
} from './interface';
import { CoordinateManager } from './managers';

const coordinateManager = new CoordinateManager({
  rowCount: 10,
  pureRowCount: 10,
  columnCount: 4,
  containerWidth: 400,
  containerHeight: 240,
  rowHeight: 40,
  columnWidth: 100,
  rowHeightMap: {},
  columnWidthMap: {},
  rowInitSize: 40,
  columnInitSize: 70,
  freezeColumnCount: 1,
});

describe('interaction-layer-helpers', () => {
  test('builds header rect with scrolled column offset', () => {
    expect(getColumnHeaderRect(coordinateManager, 2, 30, 40)).toEqual({
      x: 240,
      y: 0,
      width: 100,
      height: 40,
    });
  });

  test('toggles collapsed group ids', () => {
    expect(toggleCollapsedGroupIds(null, 'g1')).toEqual(new Set(['g1']));
    expect(toggleCollapsedGroupIds(new Set(['g1']), 'g1')).toEqual(new Set());
    expect(toggleCollapsedGroupIds(new Set(['g1']), 'g2')).toEqual(new Set(['g1', 'g2']));
  });

  test('extends fill selection downward', () => {
    expect(getFillSelectionResult([1, 2], [2, 4], 7)).toEqual({
      finalStart: [1, 2],
      finalEnd: [2, 7],
    });
  });

  test('extends fill selection upward', () => {
    expect(getFillSelectionResult([1, 5], [2, 7], 3)).toEqual({
      finalStart: [1, 3],
      finalEnd: [2, 7],
    });
  });

  test('resolves row drop target around append row boundary', () => {
    const getLinearRow = (index: number): ILinearRow => {
      if (index === 2) {
        return { type: LinearRowType.Row, realIndex: 1, displayIndex: 2 };
      }
      if (index === 3) {
        return { type: LinearRowType.Append, realIndex: 1, value: null };
      }
      return { type: LinearRowType.Row, realIndex: index, displayIndex: index + 1 };
    };

    expect(resolveRowDropTarget(getLinearRow, 3)).toBe(2);
  });

  test('resolves pointer and restricted cursors by region', () => {
    expect(
      resolveCursor({
        regionType: RegionType.ColumnHeaderMenu,
        selectable: SelectableType.All,
        draggable: DraggableType.All,
        activeCell: null,
        isScrolling: false,
        isFreezing: false,
        isDragging: false,
      })
    ).toBe('pointer');

    expect(
      resolveCursor({
        regionType: RegionType.RowHeaderDragHandler,
        selectable: SelectableType.All,
        draggable: DraggableType.None,
        activeCell: null,
        isScrolling: false,
        isFreezing: false,
        isDragging: false,
      })
    ).toBe('not-allowed');
  });
});
