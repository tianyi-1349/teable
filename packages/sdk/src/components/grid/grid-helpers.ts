import type { IGridTheme } from './configs';
import type { IGridProps } from './Grid';
import type {
  ICellItem,
  IGridColumn,
  ILinearRow,
  IRectangle,
  IScrollState,
  IGroupPoint,
} from './interface';
import { LinearRowType } from './interface';
import type { CoordinateManager, IIndicesMap } from './managers';
import { getCellRenderer } from './renderers';
import { measuredCanvas } from './utils';

export const getGridTotalWidth = (
  columns: IGridColumn[],
  defaultColumnWidth: number,
  scrollBufferX: number,
  hasAppendColumn: boolean,
  columnAppendBtnWidth: number
) => {
  return columns.reduce(
    (prev, column) => prev + (column.width || defaultColumnWidth),
    hasAppendColumn ? scrollBufferX + columnAppendBtnWidth : scrollBufferX
  );
};

export const buildDefaultRowsInfo = (
  originRowCount: number,
  hasAppendRow: boolean,
  appendRowHeight: number
) => {
  return {
    linearRows: [] as ILinearRow[],
    real2LinearRowMap: null as Record<number, number> | null,
    pureRowCount: originRowCount,
    rowCount: hasAppendRow ? originRowCount + 1 : originRowCount,
    rowHeightMap: hasAppendRow ? { [originRowCount]: appendRowHeight } : undefined,
  };
};

export const buildGroupRowsInfo = (
  groupPoints: IGroupPoint[] | null | undefined,
  hasAppendRow: boolean,
  appendRowHeight: number,
  groupHeaderHeight: number
) => {
  if (!groupPoints?.length) return null;

  let rowIndex = 0;
  let totalIndex = 0;
  let currentValue: unknown = null;
  let collapsedDepth = Number.MAX_VALUE;
  const linearRows: ILinearRow[] = [];
  const rowHeightMap: IIndicesMap = {};
  const real2LinearRowMap: Record<number, number> = {};

  groupPoints.forEach((point) => {
    const { type } = point;
    if (type === LinearRowType.Group) {
      const { id, value, depth, isCollapsed } = point;
      const isSubGroup = depth > collapsedDepth;

      if (isCollapsed) {
        collapsedDepth = Math.min(collapsedDepth, depth);
        if (isSubGroup) return;
      } else if (!isSubGroup) {
        collapsedDepth = Number.MAX_VALUE;
      } else {
        return;
      }

      rowHeightMap[totalIndex] = groupHeaderHeight;
      linearRows.push({
        id,
        type: LinearRowType.Group,
        depth,
        value,
        realIndex: rowIndex,
        isCollapsed: Boolean(isCollapsed),
      });
      currentValue = value;
      totalIndex++;
    }

    if (type === LinearRowType.Row) {
      const count = point.count;

      for (let i = 0; i < count; i++) {
        real2LinearRowMap[rowIndex + i] = totalIndex + i;
        linearRows.push({
          type: LinearRowType.Row,
          displayIndex: i + 1,
          realIndex: rowIndex + i,
        });
      }

      rowIndex += count;
      totalIndex += count;

      if (hasAppendRow) {
        rowHeightMap[totalIndex] = appendRowHeight;
        linearRows.push({
          type: LinearRowType.Append,
          value: currentValue,
          realIndex: rowIndex - 1,
        });
        totalIndex++;
      }
    }
  });

  return {
    linearRows,
    real2LinearRowMap,
    pureRowCount: rowIndex,
    rowCount: totalIndex,
    rowHeightMap,
  };
};

export const getFallbackLinearRow = (index: number, pureRowCount: number): ILinearRow => {
  return index >= pureRowCount
    ? {
        type: LinearRowType.Append,
        realIndex: index - 1,
        value: null,
      }
    : {
        type: LinearRowType.Row,
        displayIndex: index + 1,
        realIndex: index,
      };
};

export const buildColumnWidthMap = (columns: IGridColumn[], defaultColumnWidth: number) => {
  return columns.reduce(
    (acc, column, index) => ({
      ...acc,
      [index]: column.width || defaultColumnWidth,
    }),
    {}
  );
};

export const getCellIndicesAtPosition = (
  x: number,
  y: number,
  scrollState: IScrollState,
  coordInstance: CoordinateManager,
  getLinearRow: (index: number) => ILinearRow
): ICellItem | null => {
  const { scrollLeft, scrollTop } = scrollState;
  const rowIndex = coordInstance.getRowStartIndex(scrollTop + y);
  const columnIndex = coordInstance.getColumnStartIndex(scrollLeft + x);
  const { type, realIndex } = getLinearRow(rowIndex);

  if (type !== LinearRowType.Row) return null;

  return [columnIndex, realIndex];
};

export const getCellBounds = (
  cell: ICellItem,
  real2RowIndex: (index: number) => number,
  scrollState: IScrollState,
  coordInstance: CoordinateManager
): IRectangle | null => {
  const [columnIndex, realRowIndex] = cell;
  const rowIndex = real2RowIndex(realRowIndex);
  const { scrollLeft, scrollTop } = scrollState;
  const columnOffsetX = coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft);
  const columnWidth = coordInstance.getColumnWidth(columnIndex);

  if (columnOffsetX == null || columnWidth == null) {
    return null;
  }

  const rowOffsetY = coordInstance.getRowOffset(rowIndex);
  const rowHeight = coordInstance.getRowHeight(rowIndex);

  if (rowOffsetY == null || rowHeight == null) {
    return null;
  }

  return {
    x: columnOffsetX,
    y: rowOffsetY - scrollTop,
    width: columnWidth,
    height: rowHeight,
  };
};

export const getActiveCellBound = ({
  activeCell,
  getCellContent,
  coordInstance,
  theme,
  real2RowIndex,
}: {
  activeCell: ICellItem | null;
  getCellContent: IGridProps['getCellContent'];
  coordInstance: CoordinateManager;
  theme: IGridTheme;
  real2RowIndex: (index: number) => number;
}) => {
  if (activeCell == null) {
    return null;
  }

  const [activeColumnIndex, activeRowIndex] = activeCell;
  const cell = getCellContent([activeColumnIndex, activeRowIndex]);
  const cellRenderer = getCellRenderer(cell.type);
  const originWidth = coordInstance.getColumnWidth(activeColumnIndex);
  const originHeight = coordInstance.getRowHeight(real2RowIndex(activeRowIndex));

  if (cellRenderer?.measure && measuredCanvas?.ctx != null) {
    const { width, height, totalHeight } = cellRenderer.measure(cell as never, {
      theme,
      ctx: measuredCanvas.ctx,
      width: originWidth,
      height: originHeight,
    });

    return {
      rowIndex: activeRowIndex,
      columnIndex: activeColumnIndex,
      width,
      height,
      totalHeight,
      scrollTop: 0,
      scrollEnable: totalHeight > height,
    };
  }

  return {
    rowIndex: activeRowIndex,
    columnIndex: activeColumnIndex,
    width: originWidth,
    height: originHeight,
    totalHeight: originHeight,
    scrollTop: 0,
    scrollEnable: false,
  };
};

export const getScrollToItemTarget = ({
  position,
  coordInstance,
  scrollState,
  real2RowIndex,
  cellScrollBuffer,
}: {
  position: [columnIndex: number, rowIndex: number];
  coordInstance: CoordinateManager;
  scrollState: IScrollState;
  real2RowIndex: (index: number) => number;
  cellScrollBuffer: number;
}) => {
  const { containerHeight, containerWidth, freezeRegionWidth, freezeColumnCount, rowInitSize } =
    coordInstance;
  const { scrollTop, scrollLeft } = scrollState;
  const [columnIndex, realRowIndex] = position;
  const rowIndex = real2RowIndex(realRowIndex);
  const isFreezeColumn = columnIndex < freezeColumnCount;
  let nextScrollLeft: number | undefined;
  let nextScrollTop: number | undefined;

  if (!isFreezeColumn) {
    const offsetX = coordInstance.getColumnOffset(columnIndex);
    const columnWidth = coordInstance.getColumnWidth(columnIndex);
    const deltaLeft = Math.min(offsetX - scrollLeft - freezeRegionWidth, 0);
    const deltaRight = Math.max(offsetX + columnWidth - scrollLeft - containerWidth, 0);
    const targetScrollLeft = scrollLeft + deltaLeft + deltaRight;

    if (targetScrollLeft !== scrollLeft) {
      const scrollBuffer =
        deltaLeft < 0 ? -cellScrollBuffer : deltaRight > 0 ? cellScrollBuffer : 0;
      nextScrollLeft = targetScrollLeft + scrollBuffer;
    }
  }

  const rowHeight = coordInstance.getRowHeight(rowIndex);
  const offsetY = coordInstance.getRowOffset(rowIndex);
  const deltaTop = Math.min(offsetY - scrollTop - rowInitSize, 0);
  const deltaBottom = Math.max(offsetY + rowHeight - scrollTop - containerHeight, 0);
  const targetScrollTop = scrollTop + deltaTop + deltaBottom;

  if (targetScrollTop !== scrollTop) {
    nextScrollTop = targetScrollTop;
  }

  return {
    nextScrollLeft,
    nextScrollTop,
  };
};
