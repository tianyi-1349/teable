import { describe, expect, test, vi } from 'vitest';
import { GRID_DEFAULT } from '../../configs';
import { LinearRowType, RegionType, SelectionRegionType } from '../../interface';
import { calcCells } from './cell-region-renderer';
import { RenderRegion } from './interface';

const createCoordInstance = () => ({
  freezeColumnCount: 1,
  columnInitSize: GRID_DEFAULT.rowHeadWidth,
  totalWidth: 360,
  rowCount: 4,
  getColumnRelativeOffset: (columnIndex: number) => columnIndex * 100,
  getColumnWidth: () => 100,
  getRowHeight: () => 32,
  getRowOffset: (rowIndex: number) => 32 + rowIndex * 32,
});

const createProps = () => ({
  coordInstance: createCoordInstance(),
  visibleRegion: { startRowIndex: 0, stopRowIndex: 2, startColumnIndex: 0, stopColumnIndex: 2 },
  activeCell: [1, 1],
  mouseState: {
    columnIndex: 0,
    rowIndex: 1,
    type: RegionType.RowHeader,
    isOutOfBounds: false,
  },
  scrollState: { scrollLeft: 0, scrollTop: 0 },
  selection: {
    isRowSelection: true,
    isColumnSelection: false,
    includes: vi.fn((range: [number, number]) => range[0] === 1),
  },
  isSelecting: false,
  rowControls: [],
  rowIndexVisible: true,
  hoverCellPosition: null,
  theme: {
    cellBg: '#fff',
    cellBgHovered: '#eee',
    cellBgSelected: '#ddd',
  },
  columns: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
  commentCountMap: { rec1: 3 },
  imageManager: {},
  spriteManager: {},
  groupCollection: null,
  getLinearRow: (rowIndex: number) => ({
    type: LinearRowType.Row,
    realIndex: rowIndex,
    displayIndex: rowIndex + 1,
  }),
  getCellContent: ([columnIndex, rowIndex]: [number, number]) => ({
    id: `rec${rowIndex}-${columnIndex}`,
    type: 'text',
    data: null,
  }),
});

describe('cell-region-renderer', () => {
  test('splits freeze and non-freeze cell regions while preserving row header comment counts', () => {
    const props = createProps();

    const freezeCells = calcCells(props as never, RenderRegion.Freeze);
    const otherCells = calcCells(props as never, RenderRegion.Other);

    expect(freezeCells.cellPropList).toHaveLength(3);
    expect(otherCells.cellPropList).toHaveLength(6);
    expect(freezeCells.rowHeaderPropList[1]).toMatchObject({
      displayIndex: '2',
      commentCount: 3,
      isChecked: true,
      isHover: true,
    });
  });

  test('keeps append rows and grouped rows out of normal cell rendering lists', () => {
    const props = {
      ...createProps(),
      selection: {
        type: SelectionRegionType.Cells,
        isRowSelection: false,
        isColumnSelection: false,
        includes: vi.fn(() => false),
      },
      getLinearRow: (rowIndex: number) => {
        if (rowIndex === 0) {
          return {
            type: LinearRowType.Group,
            realIndex: 0,
            depth: 0,
            value: 'A',
            isCollapsed: false,
          };
        }
        if (rowIndex === 2) {
          return { type: LinearRowType.Append, realIndex: 2, value: null };
        }
        return { type: LinearRowType.Row, realIndex: rowIndex, displayIndex: rowIndex + 1 };
      },
    };

    const freezeCells = calcCells(props as never, RenderRegion.Freeze);

    expect(freezeCells.groupRowList).toHaveLength(1);
    expect(freezeCells.groupRowHeaderList).toHaveLength(1);
    expect(freezeCells.appendRowList).toHaveLength(1);
    expect(freezeCells.cellPropList).toHaveLength(1);
  });
});
