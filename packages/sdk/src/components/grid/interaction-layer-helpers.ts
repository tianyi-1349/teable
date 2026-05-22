import { isEqual } from 'lodash';
import { GRID_DEFAULT } from './configs';
import type { IGridTheme } from './configs';
import type { IGridProps } from './Grid';
import type {
  ICellItem,
  ICellPosition,
  ILinearRow,
  IMouseState,
  IRange,
  IRectangle,
} from './interface';
import { DraggableType, LinearRowType, RegionType, SelectableType } from './interface';
import type { CoordinateManager } from './managers';
import { CellRegionType, getCellRenderer } from './renderers';

const { columnAppendBtnWidth } = GRID_DEFAULT;

interface IGetPositionParams {
  mouseX: number;
  mouseY: number;
  coordInstance: CoordinateManager;
  scrollTop: number;
  scrollLeft: number;
}

export const getStagePosition = ({
  mouseX: x,
  mouseY: y,
  coordInstance,
  scrollTop,
  scrollLeft,
}: IGetPositionParams) => {
  const { freezeRegionWidth, totalWidth, rowInitSize, columnInitSize, columnCount } = coordInstance;
  const rowIndex =
    y < 0 ? -Infinity : y <= rowInitSize ? -1 : coordInstance.getRowStartIndex(scrollTop + y);
  const columnIndex =
    x < 0
      ? -Infinity
      : scrollLeft + x > totalWidth && scrollLeft + x < totalWidth + columnAppendBtnWidth
        ? -2
        : x <= freezeRegionWidth
          ? x <= columnInitSize
            ? -1
            : coordInstance.getColumnStartIndex(x)
          : coordInstance.getColumnStartIndex(scrollLeft + x);

  return { x, y, rowIndex, columnIndex: Math.min(columnIndex, columnCount - 1) };
};

interface IGetHoverCellPositionParams {
  mouseState: IMouseState;
  activeCell: ICellItem | null;
  coordInstance: CoordinateManager;
  freezeColumnCount: number;
  scrollLeft: number;
  scrollTop: number;
  getLinearRow: (index: number) => ILinearRow;
  getCellContent: IGridProps['getCellContent'];
}

export const getHoverCellPosition = ({
  mouseState,
  activeCell,
  coordInstance,
  freezeColumnCount,
  scrollLeft,
  scrollTop,
  getLinearRow,
  getCellContent,
}: IGetHoverCellPositionParams): ICellPosition | null => {
  const { rowIndex, columnIndex, x, y } = mouseState;
  const { realIndex, type } = getLinearRow(rowIndex);
  const isCellRange = columnIndex > -1 && type === LinearRowType.Row;

  if (isCellRange) {
    const cell = getCellContent([columnIndex, realIndex] as ICellItem);
    const cellRenderer = getCellRenderer(cell.type);

    if (
      cellRenderer.needsHoverPosition ||
      (cellRenderer.needsHoverPositionWhenActive &&
        activeCell &&
        isEqual(activeCell, [columnIndex, realIndex]))
    ) {
      const offsetX = coordInstance.getColumnOffset(columnIndex);
      return [
        columnIndex < freezeColumnCount ? x - offsetX : x - offsetX + scrollLeft,
        y - coordInstance.getRowOffset(rowIndex) + scrollTop,
      ] as ICellPosition;
    }
  }

  return null;
};

interface IResolveCursorParams {
  regionType: RegionType;
  selectable: SelectableType | undefined;
  draggable: DraggableType | undefined;
  activeCell: ICellItem | null;
  isScrolling: boolean;
  isFreezing: boolean;
  isDragging: boolean;
}

export const resolveCursor = ({
  regionType,
  selectable,
  draggable,
  activeCell,
  isScrolling,
  isFreezing,
  isDragging,
}: IResolveCursorParams) => {
  if (isScrolling) return null;
  if (isFreezing) return 'grab';
  if (isDragging) return 'grabbing';

  switch (regionType) {
    case RegionType.AppendRow:
      return activeCell == null ? 'pointer' : 'default';
    case RegionType.AppendColumn:
    case RegionType.GroupStatistic:
    case RegionType.ColumnStatistic:
    case RegionType.ColumnHeaderMenu:
    case RegionType.ColumnDescription:
    case RegionType.ColumnPrimaryIcon:
    case RegionType.RowGroupControl:
    case RegionType.RowHeaderExpandHandler:
      return 'pointer';
    case RegionType.ColumnFreezeHandler:
      return 'grab';
    case RegionType.AllCheckbox:
    case RegionType.RowHeaderCheckbox:
      return [SelectableType.None, SelectableType.Column, SelectableType.Cell].includes(
        selectable as SelectableType
      )
        ? 'not-allowed'
        : 'pointer';
    case RegionType.RowHeaderDragHandler:
      return draggable === DraggableType.Column || draggable === DraggableType.None
        ? 'not-allowed'
        : 'grabbing';
    case RegionType.ColumnResizeHandler:
      return 'ew-resize';
    case RegionType.FillHandler:
      return 'crosshair';
    default:
      return 'default';
  }
};

export const getColumnHeaderRect = (
  coordInstance: CoordinateManager,
  columnIndex: number,
  scrollLeft: number,
  columnHeadHeight: number
) => ({
  x: coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft),
  y: 0,
  width: coordInstance.getColumnWidth(columnIndex),
  height: columnHeadHeight,
});

export const toggleCollapsedGroupIds = (
  collapsedGroupIds: Set<string> | null | undefined,
  groupId: string
) => {
  if (collapsedGroupIds == null) {
    return new Set([groupId]);
  }

  if (collapsedGroupIds.has(groupId)) {
    const next = new Set(collapsedGroupIds);
    next.delete(groupId);
    return next;
  }

  return new Set([...collapsedGroupIds, groupId]);
};

export const getFillSelectionResult = (
  start: IRange,
  end: IRange,
  targetRealRow: number
): { finalStart: IRange; finalEnd: IRange } | null => {
  const minRow = Math.min(start[1], end[1]);
  const maxRow = Math.max(start[1], end[1]);

  if (Number.isFinite(targetRealRow) && targetRealRow > maxRow) {
    const startCol = Math.min(start[0], end[0]);
    const endCol = Math.max(start[0], end[0]);
    const startRow = Math.min(start[1], end[1]);
    return {
      finalStart: [startCol, startRow],
      finalEnd: [endCol, targetRealRow],
    };
  }

  if (Number.isFinite(targetRealRow) && targetRealRow < minRow) {
    const startCol = Math.min(start[0], end[0]);
    const endCol = Math.max(start[0], end[0]);
    return {
      finalStart: [startCol, targetRealRow],
      finalEnd: [endCol, maxRow],
    };
  }

  return null;
};

export const resolveRowDropTarget = (
  getLinearRow: (index: number) => ILinearRow,
  dropIndex: number
) => {
  const { type: prevType } = getLinearRow(dropIndex - 1);
  const { type, realIndex } = getLinearRow(dropIndex);

  if (
    (prevType === LinearRowType.Row && type === LinearRowType.Append) ||
    (prevType === LinearRowType.Group && type === LinearRowType.Row && realIndex !== 0)
  ) {
    return realIndex + 1;
  }

  return realIndex;
};

interface IResolveCellHoverParams {
  mouseState: IMouseState;
  hoverCellPosition: ICellPosition | null;
  coordInstance: CoordinateManager;
  scrollLeft: number;
  scrollTop: number;
  theme: IGridTheme;
  activeCellBound: {
    width: number;
    height: number;
    totalHeight: number;
    rowIndex: number;
    columnIndex: number;
    scrollTop: number;
    scrollEnable: boolean;
  } | null;
  getLinearRow: (index: number) => ILinearRow;
  getCellContent: IGridProps['getCellContent'];
}

export const resolveCellHoverRegion = ({
  mouseState,
  hoverCellPosition,
  coordInstance,
  scrollLeft,
  scrollTop,
  theme,
  activeCellBound,
  getLinearRow,
  getCellContent,
}: IResolveCellHoverParams) => {
  const { columnIndex, rowIndex, type } = mouseState;
  const { realIndex } = getLinearRow(rowIndex);
  const cell = getCellContent([columnIndex, realIndex] as ICellItem);
  const cellRenderer = getCellRenderer(cell.type);
  const { needsHover, needsHoverPosition, needsHoverWhenActive, needsHoverPositionWhenActive } =
    cellRenderer;
  const isActive = type === RegionType.ActiveCell;

  if ((needsHoverPosition || (needsHoverPositionWhenActive && isActive)) && hoverCellPosition) {
    const region = cellRenderer.checkRegion?.(cell as never, {
      width: coordInstance.getColumnWidth(columnIndex),
      height: coordInstance.getRowHeight(rowIndex),
      theme,
      isActive,
      activeCellBound,
      hoverCellPosition,
    }) ?? { type: CellRegionType.Blank };

    if (region.type === CellRegionType.Hover) {
      const { x, y, width, height, ...extraData } = region.data as IRectangle & {
        [key: string]: unknown;
      };
      const offsetX = coordInstance.getColumnOffset(columnIndex);
      const offsetY = coordInstance.getRowOffset(rowIndex);

      return {
        cursor: 'pointer',
        hoverType: RegionType.CellValue,
        hoverBounds: {
          x: columnIndex < coordInstance.freezeColumnCount ? x + offsetX : x + offsetX - scrollLeft,
          y: y + offsetY - scrollTop,
          width,
          height,
        },
        hoverCell: [columnIndex, realIndex] as ICellItem,
        hoverData: extraData,
      };
    }

    return {
      cursor: region.type !== CellRegionType.Blank ? 'pointer' : null,
      hoverType: null,
      hoverBounds: null,
      hoverCell: null,
      hoverData: null,
    };
  }

  return {
    cursor: needsHover || (needsHoverWhenActive && isActive) ? 'pointer' : null,
    hoverType: null,
    hoverBounds: null,
    hoverCell: null,
    hoverData: null,
  };
};
