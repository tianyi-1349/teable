import { ROW_RELATED_REGIONS } from '../../configs';
import { LinearRowType, RegionType } from '../../interface';
import type { IRectangle } from '../../interface';
import { GridInnerIcon } from '../../managers';
import { checkIfRowOrCellActive, checkIfRowOrCellSelected } from '../../utils';
import { drawRect } from '../base-renderer';
import { getCellRenderer } from '../cell-renderer';
import { drawAppendRow, drawGroupRow, drawGroupRowHeader } from './group-renderer';
import { drawRowHeader } from './header-renderer';
import type {
  IAppendRowDrawerProps,
  ICellDrawerProps,
  IGroupRowDrawerProps,
  IGroupRowHeaderDrawerProps,
  ILayoutDrawerProps,
  IRowHeaderDrawerProps,
} from './interface';
import { RenderRegion } from './interface';

export const drawCellContent = (ctx: CanvasRenderingContext2D, props: ICellDrawerProps) => {
  const {
    x,
    y,
    width,
    height,
    theme,
    rowIndex,
    columnIndex,
    imageManager,
    spriteManager,
    isActive,
    hoverCellPosition,
    getCellContent,
  } = props;

  const cell = getCellContent([columnIndex, rowIndex]);
  const cellRenderer = getCellRenderer(cell.type);
  cellRenderer.draw(cell as never, {
    ctx,
    theme,
    rect: {
      x,
      y,
      width,
      height,
    },
    rowIndex,
    columnIndex,
    imageManager,
    spriteManager,
    hoverCellPosition,
    isActive,
  });
  if (cell.hidden) {
    spriteManager.drawSprite(ctx, {
      sprite: GridInnerIcon.EyeOff,
      x: x + width - 14,
      y: y - 1,
      size: 12,
      theme,
      colors: [theme.cellLineColorActived, theme.cellBg],
    });
  } else if (isActive && cell.locked) {
    spriteManager.drawSprite(ctx, {
      sprite: GridInnerIcon.Lock,
      x: x + width - 13,
      y: y + 1,
      size: 12,
      theme,
      colors: [theme.cellLineColorActived, theme.cellBg],
    });
  }
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const calcCells = (props: ILayoutDrawerProps, renderRegion: RenderRegion) => {
  const {
    coordInstance,
    visibleRegion,
    activeCell,
    mouseState,
    scrollState,
    selection,
    isSelecting,
    rowControls,
    rowIndexVisible,
    hoverCellPosition,
    theme,
    columns,
    commentCountMap,
    imageManager,
    spriteManager,
    groupCollection,
    getLinearRow,
    getCellContent,
  } = props;
  const {
    startRowIndex,
    stopRowIndex,
    startColumnIndex: originStartColumnIndex,
    stopColumnIndex: originStopColumnIndex,
  } = visibleRegion;
  const { freezeColumnCount, columnInitSize, totalWidth, rowCount } = coordInstance;
  const { isRowSelection, isColumnSelection } = selection;
  const { scrollLeft, scrollTop } = scrollState;
  const {
    columnIndex: hoverColumnIndex,
    rowIndex: hoverRowIndex,
    type: hoverRegionType,
    isOutOfBounds,
  } = mouseState;

  const cellPropList: ICellDrawerProps[] = [];
  const rowHeaderPropList: IRowHeaderDrawerProps[] = [];
  const groupRowList: IGroupRowDrawerProps[] = [];
  const groupRowHeaderList: IGroupRowHeaderDrawerProps[] = [];
  const appendRowList: IAppendRowDrawerProps[] = [];

  if (!rowCount) {
    return {
      cellPropList,
      rowHeaderPropList,
      groupRowList,
      groupRowHeaderList,
      appendRowList,
    };
  }

  const isFreezeRegion = renderRegion === RenderRegion.Freeze;
  const startColumnIndex = isFreezeRegion ? 0 : Math.max(freezeColumnCount, originStartColumnIndex);
  const stopColumnIndex = isFreezeRegion
    ? Math.max(freezeColumnCount - 1, 0)
    : originStopColumnIndex;
  const isFreezeWithoutColumns = isFreezeRegion && freezeColumnCount === 0;

  for (let columnIndex = startColumnIndex; columnIndex <= stopColumnIndex; columnIndex++) {
    const column = columns[columnIndex];
    const x = coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft);
    const columnWidth = coordInstance.getColumnWidth(columnIndex);
    const isColumnActive = isColumnSelection && selection.includes([columnIndex, columnIndex]);
    const isFirstColumn = columnIndex === 0;
    const isColumnHovered = hoverColumnIndex === columnIndex;
    const finalTheme = column?.customTheme ? { ...theme, ...column.customTheme } : theme;
    const { cellBg, cellBgHovered, cellBgSelected } = finalTheme;

    for (let rowIndex = startRowIndex; rowIndex <= stopRowIndex; rowIndex++) {
      const linearRow = getLinearRow(rowIndex);
      const { type: linearRowType } = linearRow;
      const rowHeight = coordInstance.getRowHeight(rowIndex);
      const y = coordInstance.getRowOffset(rowIndex) - scrollTop;

      const cell = getCellContent([columnIndex, linearRow.realIndex]);
      const recordId = cell.id?.split('-')[0];

      if (linearRowType === LinearRowType.Group) {
        const { depth, value, isCollapsed, realIndex } = linearRow;
        if (isFirstColumn) {
          groupRowHeaderList.push({
            x: 0.5,
            y,
            width: columnInitSize,
            height: rowHeight,
            spriteManager,
            depth,
            theme,
            isCollapsed,
            groupCollection,
          });
        }

        if (isFreezeWithoutColumns) continue;

        groupRowList.push({
          x: x + 0.5,
          y,
          width: columnWidth,
          height: rowHeight,
          columnIndex,
          rowIndex: realIndex,
          depth,
          theme,
          value,
          isHover: false,
          isCollapsed,
          imageManager,
          spriteManager,
          groupCollection,
        });
        continue;
      }

      if (linearRowType === LinearRowType.Append) {
        if (isFirstColumn) {
          const isHover = hoverRegionType === RegionType.AppendRow && hoverRowIndex === rowIndex;

          appendRowList.push({
            x: 0.5,
            y: y + 0.5,
            width: totalWidth - scrollLeft,
            height: rowHeight,
            theme,
            isHover,
            spriteManager,
            coordInstance,
          });
        }
        continue;
      }

      const { displayIndex, realIndex: realRowIndex } = linearRow;
      const isRowHovered =
        !isOutOfBounds &&
        !isSelecting &&
        ROW_RELATED_REGIONS.has(hoverRegionType) &&
        rowIndex === hoverRowIndex;
      const { isCellActive, isRowActive } = checkIfRowOrCellActive(
        activeCell,
        realRowIndex,
        columnIndex
      );
      const { isRowSelected, isCellSelected } = checkIfRowOrCellSelected(
        selection,
        realRowIndex,
        columnIndex
      );
      let fill;

      if (isCellSelected || isRowSelected || isColumnActive) {
        fill = cellBgSelected;
      } else if (isRowHovered || isRowActive) {
        fill = cellBgHovered;
      }

      if (isFirstColumn) {
        rowHeaderPropList.push({
          x: 0.5,
          y: y + 0.5,
          width: columnInitSize + 0.5,
          height: rowHeight,
          displayIndex: String(displayIndex),
          isHover: isRowHovered || isRowActive,
          isChecked: isRowSelection && isRowSelected,
          rowIndexVisible,
          rowControls,
          theme,
          spriteManager,
          commentCount: recordId ? commentCountMap?.[recordId] : undefined,
        });
      }

      if (isFreezeWithoutColumns) continue;

      cellPropList.push({
        x: x + 0.5,
        y: y + 0.5,
        width: columnWidth,
        height: rowHeight,
        rowIndex: realRowIndex,
        columnIndex,
        hoverCellPosition: isColumnHovered && isRowHovered ? hoverCellPosition : null,
        getCellContent,
        imageManager,
        spriteManager,
        theme: finalTheme,
        fill: isCellActive ? cellBg : fill ?? cellBg,
      });
    }
  }

  return {
    cellPropList,
    rowHeaderPropList,
    groupRowList,
    groupRowHeaderList,
    appendRowList,
  };
};

export const drawClipRegion = (
  ctx: CanvasRenderingContext2D,
  clipRect: IRectangle,
  draw: (ctx: CanvasRenderingContext2D) => void
) => {
  const { x, y, width, height } = clipRect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  draw(ctx);

  ctx.restore();
};

export const drawCells = (
  mainCtx: CanvasRenderingContext2D,
  cacheCtx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps
) => {
  const { coordInstance, theme, shouldRerender } = props;
  const { fontFamily, fontSizeSM, fontSizeXS, cellLineColor } = theme;
  const { rowInitSize, freezeRegionWidth, containerWidth, containerHeight } = coordInstance;

  const { cellPropList: otherCellPropList, groupRowList } = calcCells(props, RenderRegion.Other);
  const {
    cellPropList: freezeCellPropList,
    groupRowList: freezeGroupRowList,
    rowHeaderPropList,
    groupRowHeaderList,
    appendRowList,
  } = calcCells(props, RenderRegion.Freeze);

  appendRowList.forEach((cellProps) => drawAppendRow(mainCtx, cellProps));

  drawClipRegion(
    mainCtx,
    {
      x: 0,
      y: rowInitSize + 1,
      width: freezeRegionWidth + 1,
      height: containerHeight - rowInitSize - 1,
    },
    (ctx: CanvasRenderingContext2D) => {
      freezeCellPropList.forEach((cellProps) => {
        const { x, y, width, height, fill } = cellProps;
        drawRect(ctx, {
          x,
          y,
          width,
          height,
          fill,
          stroke: cellLineColor,
        });
      });
      ctx.font = `${fontSizeXS}px ${fontFamily}`;
      rowHeaderPropList.forEach((rowHeaderProps) => drawRowHeader(ctx, rowHeaderProps));
      freezeGroupRowList.forEach((cellProps) => drawGroupRow(ctx, cellProps));
      groupRowHeaderList.forEach((cellProps) => drawGroupRowHeader(ctx, cellProps));
    }
  );

  drawClipRegion(
    mainCtx,
    {
      x: freezeRegionWidth + 1,
      y: rowInitSize + 1,
      width: containerWidth - freezeRegionWidth,
      height: containerHeight - rowInitSize - 1,
    },
    (ctx: CanvasRenderingContext2D) => {
      otherCellPropList.forEach((cellProps) => {
        const { x, y, width, height, fill } = cellProps;
        drawRect(ctx, {
          x,
          y,
          width,
          height,
          fill,
          stroke: cellLineColor,
        });
      });
      groupRowList.forEach((cellProps) => drawGroupRow(ctx, cellProps));
    }
  );

  if (shouldRerender) {
    drawClipRegion(
      cacheCtx,
      {
        x: 0,
        y: rowInitSize + 1,
        width: freezeRegionWidth + 1,
        height: containerHeight - rowInitSize - 1,
      },
      (ctx: CanvasRenderingContext2D) => {
        ctx.font = `${fontSizeSM}px ${fontFamily}`;
        freezeCellPropList.forEach((cellProps) => {
          drawCellContent(ctx, cellProps);
        });
      }
    );

    drawClipRegion(
      cacheCtx,
      {
        x: freezeRegionWidth + 1,
        y: rowInitSize + 1,
        width: containerWidth - freezeRegionWidth,
        height: containerHeight - rowInitSize - 1,
      },
      (ctx: CanvasRenderingContext2D) => {
        ctx.font = `${fontSizeSM}px ${fontFamily}`;
        otherCellPropList.forEach((cellProps) => {
          drawCellContent(ctx, cellProps);
        });
      }
    );
  }
};
