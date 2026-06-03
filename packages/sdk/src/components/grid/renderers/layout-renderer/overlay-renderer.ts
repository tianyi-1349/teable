import { contractColorForTheme } from '@teable/core';
import { groupBy, isEqual } from 'lodash';
import type { IVisibleRegion } from '../../hooks';
import type { ICell, ICellItem, ICollaborator, ILinearRow } from '../../interface';
import { LinearRowType } from '../../interface';
import { calculateMaxRange, hexToRGBA } from '../../utils';
import { drawRect } from '../base-renderer';
import { getCellScrollState } from '../cell-renderer';
import type { ICellDrawerProps, ILayoutDrawerProps } from './interface';

type DrawCellContent = (ctx: CanvasRenderingContext2D, props: ICellDrawerProps) => void;

export const drawSearchCursor = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps,
  drawCellContent: DrawCellContent
) => {
  const {
    theme,
    scrollState,
    coordInstance,
    real2RowIndex,
    getLinearRow,
    searchCursor,
    imageManager,
    spriteManager,
    getCellContent,
  } = props;

  if (!searchCursor) return;

  const [searchColumnIndex, searchRowIndex] = searchCursor;

  const { scrollTop, scrollLeft } = scrollState;
  const { fontSizeSM, fontFamily } = theme;
  const {
    freezeColumnCount,
    freezeRegionWidth,
    containerWidth,
    containerHeight,
    columnCount,
    rowInitSize,
  } = coordInstance;
  const activeLinearRowIndex = real2RowIndex(searchRowIndex);
  const linearRow = getLinearRow(activeLinearRowIndex);

  if (searchColumnIndex >= columnCount || linearRow?.type !== LinearRowType.Row) return;

  const isFreezeRegion = searchColumnIndex < freezeColumnCount;
  const x = coordInstance.getColumnRelativeOffset(searchColumnIndex, scrollLeft);
  const y = coordInstance.getRowOffset(activeLinearRowIndex) - scrollTop;

  const width = coordInstance.getColumnWidth(searchColumnIndex);
  const height = coordInstance.getRowHeight(activeLinearRowIndex);

  ctx.save();
  ctx.beginPath();
  ctx.rect(
    isFreezeRegion ? 0 : freezeRegionWidth,
    rowInitSize,
    isFreezeRegion ? freezeRegionWidth + 1 : containerWidth - freezeRegionWidth,
    containerHeight - rowInitSize
  );
  ctx.clip();

  ctx.font = `${fontSizeSM}px ${fontFamily}`;

  drawRect(ctx, {
    x: x + 1,
    y: y + 1,
    width: width - 1,
    height: height - 1,
    fill: theme.searchCursorBg,
    radius: 0.5,
  });

  ctx.save();
  ctx.beginPath();

  drawCellContent(ctx, {
    x: x + 0.5,
    y: y + 0.5,
    width,
    height,
    rowIndex: searchRowIndex,
    columnIndex: searchColumnIndex,
    getCellContent,
    isActive: false,
    imageManager,
    spriteManager,
    theme,
  });

  ctx.restore();
  ctx.restore();
};

export const drawActiveCell = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps,
  drawCellContent: DrawCellContent
) => {
  const {
    theme,
    mouseState,
    scrollState,
    coordInstance,
    activeCellBound,
    hoverCellPosition,
    imageManager,
    spriteManager,
    real2RowIndex,
    getLinearRow,
    getCellContent,
  } = props;

  if (activeCellBound == null) return;

  const { scrollTop, scrollLeft } = scrollState;
  const { width, height, columnIndex, rowIndex: activeRowIndex } = activeCellBound;
  const { rowIndex: hoverLinearRowIndex, columnIndex: hoverColumnIndex } = mouseState;
  const { cellBg, cellLineColorActived, fontSizeSM, fontFamily, scrollBarBg } = theme;
  const {
    freezeColumnCount,
    freezeRegionWidth,
    containerWidth,
    containerHeight,
    columnCount,
    rowInitSize,
  } = coordInstance;
  const activeLinearRowIndex = real2RowIndex(activeRowIndex);
  const linearRow = getLinearRow(activeLinearRowIndex);

  if (columnIndex >= columnCount || linearRow?.type !== LinearRowType.Row) return;

  const isFreezeRegion = columnIndex < freezeColumnCount;
  const x = coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft);
  const y = coordInstance.getRowOffset(activeLinearRowIndex) - scrollTop;
  const { realIndex: hoverRowIndex } = getLinearRow(hoverLinearRowIndex);

  ctx.save();
  ctx.beginPath();
  ctx.rect(
    isFreezeRegion ? 0 : freezeRegionWidth,
    rowInitSize,
    isFreezeRegion ? freezeRegionWidth + 1 : containerWidth - freezeRegionWidth,
    containerHeight - rowInitSize
  );
  ctx.clip();

  ctx.font = `${fontSizeSM}px ${fontFamily}`;

  drawRect(ctx, {
    x: x + 0.5,
    y: y + 0.5,
    width,
    height,
    fill: cellBg,
    stroke: cellLineColorActived,
    radius: 2,
  });

  const cellScrollState = getCellScrollState(activeCellBound);
  const { scrollBarHeight, scrollBarScrollTop, contentScrollTop } = cellScrollState;

  ctx.save();
  ctx.beginPath();

  if (activeCellBound.scrollEnable) {
    ctx.translate(0, scrollBarScrollTop);

    drawRect(ctx, {
      x: x + width - 6 - 5,
      y: y + 5,
      width: 6,
      height: scrollBarHeight,
      fill: scrollBarBg,
      radius: 3,
    });

    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y + 1, width, height - 1);
    ctx.clip();
    ctx.translate(0, -contentScrollTop);
  }

  drawCellContent(ctx, {
    x: x + 0.5,
    y: y + 0.5,
    width,
    height,
    rowIndex: activeRowIndex,
    columnIndex,
    hoverCellPosition:
      hoverRowIndex === activeRowIndex && hoverColumnIndex === columnIndex
        ? hoverCellPosition
        : null,
    getCellContent,
    isActive: true,
    imageManager,
    spriteManager,
    theme,
  });

  ctx.restore();
  ctx.restore();
};

export const drawSearchResult = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps,
  drawCellContent: DrawCellContent,
  result?: [number, number]
) => {
  const {
    theme,
    scrollState,
    coordInstance,
    real2RowIndex,
    getLinearRow,
    imageManager,
    spriteManager,
    getCellContent,
  } = props;

  if (!result) return;

  const [searchColumnIndex, searchRowIndex] = result;

  const { scrollTop, scrollLeft } = scrollState;
  const { fontSizeSM, fontFamily, searchTargetIndexBg } = theme;
  const {
    freezeColumnCount,
    freezeRegionWidth,
    containerWidth,
    containerHeight,
    columnCount,
    rowInitSize,
  } = coordInstance;
  const activeLinearRowIndex = real2RowIndex(searchRowIndex);
  const linearRow = getLinearRow(activeLinearRowIndex);

  if (searchColumnIndex >= columnCount || linearRow?.type !== LinearRowType.Row) return;

  const isFreezeRegion = searchColumnIndex < freezeColumnCount;
  const x = coordInstance.getColumnRelativeOffset(searchColumnIndex, scrollLeft);
  const y = coordInstance.getRowOffset(activeLinearRowIndex) - scrollTop;

  const width = coordInstance.getColumnWidth(searchColumnIndex);
  const height = coordInstance.getRowHeight(activeLinearRowIndex);

  ctx.save();
  ctx.beginPath();
  ctx.rect(
    isFreezeRegion ? 0 : freezeRegionWidth,
    rowInitSize,
    isFreezeRegion ? freezeRegionWidth + 1 : containerWidth - freezeRegionWidth,
    containerHeight - rowInitSize
  );
  ctx.clip();

  ctx.font = `${fontSizeSM}px ${fontFamily}`;

  drawRect(ctx, {
    x: x + 1,
    y: y + 1,
    width: width - 1,
    height: height - 1,
    fill: searchTargetIndexBg,
    radius: 0.5,
  });

  ctx.save();
  ctx.beginPath();

  drawCellContent(ctx, {
    x: x + 0.5,
    y: y + 0.5,
    width,
    height,
    rowIndex: linearRow.realIndex,
    columnIndex: searchColumnIndex,
    getCellContent,
    isActive: false,
    imageManager,
    spriteManager,
    theme,
  });

  ctx.restore();
  ctx.restore();
};

export const getVisibleSearchTargetIndex = (
  searchHitIndex: { fieldId: string; recordId: string }[],
  visibleRegion: IVisibleRegion,
  freezeColumnCount: number,
  getCellContent: (cell: ICellItem) => ICell,
  getLinearRow: (rowNumber: number) => ILinearRow
) => {
  const { startColumnIndex, stopColumnIndex, startRowIndex, stopRowIndex } = visibleRegion;

  const searchCells = [];
  const columnIndices = [
    ...Array.from({ length: freezeColumnCount }, (_, i) => i),
    ...Array.from(
      { length: stopColumnIndex - Math.max(freezeColumnCount, startColumnIndex) + 1 },
      (_, i) => Math.max(freezeColumnCount, startColumnIndex) + i
    ),
  ];

  const searchCellIds = searchHitIndex?.map((item) => `${item.recordId}-${item.fieldId}`) || [];

  for (const i of columnIndices) {
    for (let j = startRowIndex; j <= stopRowIndex; j++) {
      const line = getLinearRow(j);
      const { realIndex } = line;
      const cell = getCellContent([i, realIndex]);

      if (!cell?.id) {
        continue;
      }

      if (searchCellIds.includes(cell.id)) {
        searchCells.push([i, realIndex]);
      }
    }
  }

  return searchCells as [number, number][];
};

const getVisibleCollaborators = (
  collaborators: ICollaborator,
  visibleRegion: IVisibleRegion,
  freezeColumnCount: number,
  getCellContent: (cell: ICellItem) => ICell,
  getLinearRow: (rowNumber: number) => ILinearRow
) => {
  const groupedCollaborators = groupBy(collaborators, 'activeCellId');
  const { startColumnIndex, stopColumnIndex, startRowIndex, stopRowIndex } = visibleRegion;

  const visibleCells = [];
  const columnIndices = [
    ...Array.from({ length: freezeColumnCount }, (_, i) => i),
    ...Array.from(
      { length: stopColumnIndex - Math.max(freezeColumnCount, startColumnIndex) + 1 },
      (_, i) => Math.max(freezeColumnCount, startColumnIndex) + i
    ),
  ];

  for (const i of columnIndices) {
    for (let j = startRowIndex; j <= stopRowIndex; j++) {
      const realIndex = getLinearRow(j).realIndex;
      const cell = getCellContent([i, realIndex]);
      if (!cell?.id) {
        continue;
      }
      const visibleCell = groupedCollaborators[cell.id];
      if (visibleCell) {
        const newCell = visibleCell.map((collaborator, index) =>
          index === 0
            ? { ...collaborator, activeCell: [i, realIndex] as [number, number] }
            : collaborator
        );
        visibleCells.push(newCell);
      }
    }
  }

  return visibleCells;
};

export const drawCollaborators = (ctx: CanvasRenderingContext2D, props: ILayoutDrawerProps) => {
  const {
    collaborators,
    scrollState,
    coordInstance,
    activeCellBound,
    theme,
    real2RowIndex,
    getCellContent,
    visibleRegion,
    getLinearRow,
  } = props;
  const { scrollTop, scrollLeft } = scrollState;
  const { themeKey } = theme;

  const { freezeColumnCount, freezeRegionWidth, rowInitSize, containerWidth, containerHeight } =
    coordInstance;

  if (!collaborators?.length) return;

  ctx.save();

  const visibleCells = getVisibleCollaborators(
    collaborators,
    visibleRegion,
    freezeColumnCount,
    getCellContent,
    getLinearRow
  );

  for (let i = 0; i < visibleCells.length; i++) {
    const conflictCollaborators = visibleCells[i].sort((a, b) => b.timeStamp - a.timeStamp);
    const { activeCell, borderColor } = conflictCollaborators[0];
    if (!activeCell) {
      continue;
    }
    const [columnIndex, _rowIndex] = activeCell;
    const rowIndex = real2RowIndex(_rowIndex);
    const x = coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft);
    const y = coordInstance.getRowOffset(rowIndex) - scrollTop;
    const width = coordInstance.getColumnWidth(columnIndex);
    const height =
      activeCellBound?.columnIndex === columnIndex && activeCellBound?.rowIndex === _rowIndex
        ? activeCellBound.height
        : coordInstance.getRowHeight(rowIndex);

    ctx.save();
    ctx.beginPath();

    const isFreezeRegion = columnIndex < freezeColumnCount;

    ctx.rect(
      isFreezeRegion ? 0 : freezeRegionWidth,
      rowInitSize,
      isFreezeRegion ? freezeRegionWidth + 1 : containerWidth - freezeRegionWidth,
      containerHeight - rowInitSize
    );
    ctx.clip();

    drawRect(ctx, {
      x: x + 0.5,
      y: y + 0.5,
      width,
      height,
      stroke: hexToRGBA(contractColorForTheme(borderColor, themeKey)),
      radius: 2,
    });

    ctx.restore();
  }
  ctx.restore();
};

export const drawSearchTargetIndex = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps,
  drawCellContent: DrawCellContent
) => {
  const { getCellContent, coordInstance, visibleRegion, searchHitIndex, getLinearRow } = props;

  const { freezeColumnCount } = coordInstance;

  if (!searchHitIndex?.length) return;

  const searchCellIds = getVisibleSearchTargetIndex(
    searchHitIndex,
    visibleRegion,
    freezeColumnCount,
    getCellContent,
    getLinearRow
  );

  for (let i = 0; i < searchCellIds.length; i++) {
    drawSearchResult(ctx, props, drawCellContent, searchCellIds[i]);
  }
};

export const drawFillPreview = (ctx: CanvasRenderingContext2D, props: ILayoutDrawerProps) => {
  const {
    selection,
    mouseState,
    coordInstance,
    scrollState,
    theme,
    isFilling,
    isFillEnabled,
    real2RowIndex,
    getLinearRow,
  } = props;
  if (!isFilling || !isFillEnabled) return;
  const { isCellSelection, ranges } = selection;
  if (!isCellSelection) return;
  const [start, end] = ranges;
  const startCol = Math.min(start[0], end[0]);
  const endCol = Math.max(start[0], end[0]);
  const topRow = Math.min(start[1], end[1]);
  const bottomRow = Math.max(start[1], end[1]);
  const hoverLinear = getLinearRow(mouseState.rowIndex);
  const targetRealRow = hoverLinear.realIndex;
  const { scrollLeft, scrollTop } = scrollState;
  const startX = coordInstance.getColumnRelativeOffset(startCol, scrollLeft);
  const endX =
    coordInstance.getColumnRelativeOffset(endCol, scrollLeft) +
    coordInstance.getColumnWidth(endCol);
  let startY: number | null = null;
  let endY: number | null = null;

  if (Number.isFinite(targetRealRow) && targetRealRow > bottomRow) {
    startY = coordInstance.getRowOffset(real2RowIndex(bottomRow + 1)) - scrollTop;
    endY =
      coordInstance.getRowOffset(real2RowIndex(targetRealRow)) +
      coordInstance.getRowHeight(real2RowIndex(targetRealRow)) -
      scrollTop;
  } else if (Number.isFinite(targetRealRow) && targetRealRow < topRow) {
    startY = coordInstance.getRowOffset(real2RowIndex(targetRealRow)) - scrollTop;
    endY =
      coordInstance.getRowOffset(real2RowIndex(topRow - 1)) +
      coordInstance.getRowHeight(real2RowIndex(topRow - 1)) -
      scrollTop;
  }

  if (startY != null && endY != null) {
    const width = endX - startX;
    const height = endY - startY;
    drawRect(ctx, {
      x: startX + 0.5,
      y: startY + 0.5,
      width,
      height,
      fill: hexToRGBA(theme.interactionLineColorHighlight, 0.12),
      stroke: theme.interactionLineColorHighlight,
    });
  }
};

export const drawFillHandler = (ctx: CanvasRenderingContext2D, props: ILayoutDrawerProps) => {
  const {
    coordInstance,
    scrollState,
    selection,
    isSelecting,
    isEditing,
    theme,
    activeCellBound,
    isFillEnabled,
    real2RowIndex,
    getLinearRow,
  } = props;

  if (!isFillEnabled || isEditing || isSelecting) return;

  const { scrollTop, scrollLeft } = scrollState;
  const { freezeColumnCount, freezeRegionWidth, rowInitSize, containerWidth, containerHeight } =
    coordInstance;
  const maxRange = calculateMaxRange(selection);

  if (maxRange == null) return;

  const [columnIndex, realRowIndex] = maxRange;
  const { cellBg, cellLineColorActived } = theme;
  const isFreezeRegion = columnIndex < freezeColumnCount;
  const x = coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft);
  const linearRowIndex = real2RowIndex(realRowIndex);
  const y = coordInstance.getRowOffset(linearRowIndex) - scrollTop;
  const width = coordInstance.getColumnWidth(columnIndex);
  const defaultHeight = coordInstance.getRowHeight(linearRowIndex);
  const isSingleCell =
    selection.isCellSelection && isEqual(selection.ranges[0], selection.ranges[1]);
  const isSameAsActive =
    isSingleCell &&
    activeCellBound &&
    activeCellBound.columnIndex === columnIndex &&
    activeCellBound.rowIndex === realRowIndex &&
    getLinearRow(linearRowIndex).type === LinearRowType.Row;
  const height = isSameAsActive && activeCellBound ? activeCellBound.height : defaultHeight;

  ctx.save();
  ctx.beginPath();
  if (!isFreezeRegion) {
    ctx.rect(
      freezeRegionWidth,
      rowInitSize,
      containerWidth - freezeRegionWidth,
      containerHeight - rowInitSize
    );
    ctx.clip();
  }

  drawRect(ctx, {
    x: x + width - 4 / 2 - 0.5,
    y: y + height - 4 / 2 - 0.5,
    width: 4,
    height: 4,
    stroke: cellLineColorActived,
    fill: cellBg,
  });

  ctx.restore();
};
