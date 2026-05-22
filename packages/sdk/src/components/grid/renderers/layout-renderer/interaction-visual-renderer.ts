import { GRID_DEFAULT } from '../../configs';
import { getDropTargetIndex } from '../../hooks';
import { DragRegionType, RegionType } from '../../interface';
import { GridInnerIcon } from '../../managers';
import { drawLine, drawRect } from '../base-renderer';
import type { ILayoutDrawerProps } from './interface';
import { DividerRegion } from './interface';

const {
  columnHeadHeight,
  columnAppendBtnWidth,
  columnResizeHandlerWidth,
  columnResizeHandlerPaddingTop,
  columnFreezeHandlerWidth,
  columnFreezeHandlerHeight,
} = GRID_DEFAULT;

export const drawAppendColumn = (ctx: CanvasRenderingContext2D, props: ILayoutDrawerProps) => {
  const { coordInstance, theme, mouseState, scrollState, isColumnAppendEnable, spriteManager } =
    props;
  const { scrollLeft, scrollTop } = scrollState;
  const { totalWidth, totalHeight } = coordInstance;
  const { type: hoverRegionType } = mouseState;

  if (!isColumnAppendEnable) return;

  const { iconSizeSM, columnHeaderBg, cellLineColor, columnHeaderBgHovered } = theme;
  const isHover = hoverRegionType === RegionType.AppendColumn;
  const x = totalWidth - scrollLeft;

  drawRect(ctx, {
    x: x + 1,
    y: 0.5,
    width: columnAppendBtnWidth,
    height: totalHeight - scrollTop,
    fill: isHover ? columnHeaderBgHovered : columnHeaderBg,
  });
  drawLine(ctx, {
    x: x + 0.5,
    y: columnHeadHeight + 0.5,
    points: [0, 0, 0, totalHeight - scrollTop - columnHeadHeight],
    stroke: cellLineColor,
  });

  const halfIconSize = iconSizeSM / 2;
  spriteManager.drawSprite(ctx, {
    sprite: GridInnerIcon.Add,
    x: x + columnAppendBtnWidth / 2 - halfIconSize + 0.5,
    y: columnHeadHeight / 2 - halfIconSize + 0.5,
    size: iconSizeSM,
    theme,
  });
};

export const drawColumnResizeHandler = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps
) => {
  const {
    theme,
    scrollState,
    coordInstance,
    isColumnResizable,
    columnResizeState,
    hoveredColumnResizeIndex,
  } = props;
  const { columnIndex: resizeColumnIndex } = columnResizeState;
  const isHover = isColumnResizable && hoveredColumnResizeIndex > -1;
  const isResizing = resizeColumnIndex > -1;

  if (!isHover && !isResizing) return;

  const { scrollLeft } = scrollState;
  const { rowInitSize } = coordInstance;
  const { columnResizeHandlerBg } = theme;
  let x = 0;

  if (isResizing) {
    const columnWidth = coordInstance.getColumnWidth(resizeColumnIndex);
    x = coordInstance.getColumnRelativeOffset(resizeColumnIndex, scrollLeft) + columnWidth;
  } else {
    const realColumnWidth = coordInstance.getColumnWidth(hoveredColumnResizeIndex);
    x =
      coordInstance.getColumnRelativeOffset(hoveredColumnResizeIndex, scrollLeft) + realColumnWidth;
  }

  drawRect(ctx, {
    x: x - columnResizeHandlerWidth / 2 + 0.5,
    y: columnResizeHandlerPaddingTop + 0.5,
    width: columnResizeHandlerWidth,
    height: rowInitSize - columnResizeHandlerPaddingTop * 2,
    fill: columnResizeHandlerBg,
    radius: 3,
  });
};

export const drawColumnDraggingRegion = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps
) => {
  const { columns, theme, mouseState, scrollState, dragState, coordInstance } = props;
  const { columnDraggingPlaceholderBg, interactionLineColorHighlight } = theme;
  const { type, isDragging, ranges: draggingRanges, delta } = dragState;
  const { containerHeight } = coordInstance;
  const { x } = mouseState;
  const { scrollLeft } = scrollState;

  if (!isDragging || type !== DragRegionType.Columns) return;

  const draggingColIndex = draggingRanges[0][0];
  drawRect(ctx, {
    x: x - delta,
    y: 0.5,
    width: columns[draggingColIndex].width as number,
    height: containerHeight,
    fill: columnDraggingPlaceholderBg,
  });

  const targetColumnIndex = getDropTargetIndex(coordInstance, mouseState, scrollState, type);
  const finalX = coordInstance.getColumnRelativeOffset(targetColumnIndex, scrollLeft);

  drawRect(ctx, {
    x: finalX - 0.5,
    y: 0.5,
    width: 2,
    height: containerHeight,
    fill: interactionLineColorHighlight,
  });
};

export const drawRowDraggingRegion = (ctx: CanvasRenderingContext2D, props: ILayoutDrawerProps) => {
  const { theme, mouseState, scrollState, dragState, coordInstance } = props;
  const { columnDraggingPlaceholderBg, interactionLineColorHighlight } = theme;
  const { type, isDragging, ranges: draggingRanges, delta } = dragState;
  const { containerWidth } = coordInstance;
  const { scrollTop } = scrollState;
  const { y } = mouseState;

  if (!isDragging || type !== DragRegionType.Rows) return;

  const draggingRowIndex = draggingRanges[0][0];
  drawRect(ctx, {
    x: 0.5,
    y: y - delta,
    width: containerWidth,
    height: coordInstance.getRowHeight(draggingRowIndex),
    fill: columnDraggingPlaceholderBg,
  });

  const targetRowIndex = getDropTargetIndex(coordInstance, mouseState, scrollState, type);
  const offsetY = coordInstance.getRowOffset(targetRowIndex);
  const finalY = offsetY - scrollTop;

  drawRect(ctx, {
    x: 0.5,
    y: finalY - 0.5,
    width: containerWidth,
    height: 2,
    fill: interactionLineColorHighlight,
  });
};

export const drawColumnFreezeHandler = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps
) => {
  const { coordInstance, mouseState, scrollState, columnFreezeState, theme } = props;
  const { isFreezing, targetIndex } = columnFreezeState;
  const { type, x, y } = mouseState;

  if (type !== RegionType.ColumnFreezeHandler && !isFreezing) return;

  const { scrollLeft } = scrollState;
  const { interactionLineColorHighlight } = theme;
  const { containerHeight, freezeRegionWidth } = coordInstance;
  const hoverX = isFreezing ? x : freezeRegionWidth;

  if (isFreezing) {
    const targetX = coordInstance.getColumnRelativeOffset(targetIndex + 1, scrollLeft);
    drawRect(ctx, {
      x: targetX - 1,
      y: 0,
      width: 2,
      height: containerHeight,
      fill: interactionLineColorHighlight,
    });
  }

  drawRect(ctx, {
    x: hoverX - columnFreezeHandlerWidth / 2,
    y: y - columnFreezeHandlerHeight / 2,
    width: columnFreezeHandlerWidth,
    height: columnFreezeHandlerHeight,
    fill: interactionLineColorHighlight,
    radius: 4,
  });
  drawRect(ctx, {
    x: hoverX - 1,
    y: 0,
    width: 2,
    height: containerHeight,
    fill: interactionLineColorHighlight,
  });
};

export const drawFreezeRegionDivider = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps,
  dividerRegion: DividerRegion
) => {
  const { theme, coordInstance, scrollState, height } = props;
  const { interactionLineColorCommon } = theme;
  const { scrollLeft } = scrollState;
  const { freezeRegionWidth, containerHeight } = coordInstance;
  const isTop = dividerRegion === DividerRegion.Top;

  const startY = isTop ? 0 : containerHeight;
  const endY = isTop ? containerHeight : height;

  if (scrollLeft === 0) {
    return drawRect(ctx, {
      x: freezeRegionWidth,
      y: startY + 0.5,
      width: 1,
      height: endY - startY,
      fill: interactionLineColorCommon,
    });
  }

  ctx.save();
  ctx.beginPath();

  ctx.shadowColor = interactionLineColorCommon;
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 3;
  ctx.strokeStyle = interactionLineColorCommon;

  ctx.moveTo(freezeRegionWidth + 0.5, startY);
  ctx.lineTo(freezeRegionWidth + 0.5, endY);
  ctx.stroke();

  ctx.restore();
};
