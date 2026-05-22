import { GRID_DEFAULT } from '../../configs';
import { GridInnerIcon } from '../../managers';
import { drawRect, drawSingleLineText } from '../base-renderer';
import { getCellRenderer } from '../cell-renderer';
import type {
  IAppendRowDrawerProps,
  IGroupRowDrawerProps,
  IGroupRowHeaderDrawerProps,
} from './interface';

const { cellHorizontalPadding, cellVerticalPaddingSM } = GRID_DEFAULT;

export const drawGroupRowHeader = (
  ctx: CanvasRenderingContext2D,
  props: IGroupRowHeaderDrawerProps
) => {
  const { x, y, width, height, theme, depth, isCollapsed, spriteManager, groupCollection } = props;
  const {
    iconSizeSM,
    cellLineColor,
    groupHeaderBgPrimary,
    groupHeaderBgSecondary,
    groupHeaderBgTertiary,
  } = theme;

  if (groupCollection == null) return;

  const { groupColumns } = groupCollection;

  if (!groupColumns.length) return;

  const bgList = [groupHeaderBgTertiary, groupHeaderBgSecondary, groupHeaderBgPrimary].slice(
    -groupColumns.length
  );

  drawRect(ctx, {
    x,
    y,
    width,
    height,
    fill: bgList[depth],
  });
  drawRect(ctx, {
    x,
    y,
    width,
    height: 1,
    fill: cellLineColor,
  });

  spriteManager.drawSprite(ctx, {
    sprite: isCollapsed ? GridInnerIcon.Collapse : GridInnerIcon.Expand,
    x: (width - iconSizeSM) / 2 + (depth - 1) * 16,
    y: y + (height - iconSizeSM) / 2,
    size: iconSizeSM,
    theme,
  });
};

export const drawGroupRow = (ctx: CanvasRenderingContext2D, props: IGroupRowDrawerProps) => {
  const {
    x,
    y,
    width,
    height,
    theme,
    columnIndex,
    rowIndex,
    depth,
    value,
    imageManager,
    spriteManager,
    groupCollection,
  } = props;
  const {
    fontSizeSM,
    fontFamily,
    cellLineColor,
    rowHeaderTextColor,
    groupHeaderBgPrimary,
    groupHeaderBgTertiary,
    groupHeaderBgSecondary,
  } = theme;

  if (groupCollection == null) return;

  const { groupColumns, getGroupCell } = groupCollection;

  if (!groupColumns.length) return;

  const bgList = [groupHeaderBgTertiary, groupHeaderBgSecondary, groupHeaderBgPrimary].slice(
    -groupColumns.length
  );

  drawRect(ctx, {
    x,
    y,
    width,
    height,
    fill: bgList[depth],
  });
  drawRect(ctx, {
    x,
    y,
    width,
    height: 1,
    fill: cellLineColor,
  });

  if (columnIndex !== 0) return;

  const groupColumn = groupColumns[depth];

  if (groupColumn == null) return;

  ctx.save();
  ctx.beginPath();
  ctx.font = `${fontSizeSM}px ${fontFamily}`;

  drawSingleLineText(ctx, {
    x: x + cellHorizontalPadding,
    y: y + cellVerticalPaddingSM,
    text: groupColumn.name,
    fill: rowHeaderTextColor,
  });

  const cell = getGroupCell(value, depth);
  const cellRenderer = getCellRenderer(cell.type);
  const offsetY = 18;
  cellRenderer.draw(cell as never, {
    ctx,
    theme,
    rect: {
      x,
      y: y + offsetY,
      width,
      height: height - offsetY,
    },
    rowIndex,
    columnIndex,
    imageManager,
    spriteManager,
  });
  ctx.restore();
};

export const drawAppendRow = (ctx: CanvasRenderingContext2D, props: IAppendRowDrawerProps) => {
  const { x, y, width, height, theme, isHover, coordInstance, spriteManager } = props;
  const { appendRowBgHovered, iconSizeSM, cellBg, cellLineColor } = theme;
  const { columnInitSize } = coordInstance;
  const halfIconSize = iconSizeSM / 2;

  ctx.save();
  ctx.beginPath();
  drawRect(ctx, {
    x: x + 0.5,
    y: y + 0.5,
    width,
    height,
    fill: isHover ? appendRowBgHovered : cellBg,
  });
  drawRect(ctx, {
    x,
    y: y + height,
    width,
    height: 1,
    fill: cellLineColor,
  });
  spriteManager.drawSprite(ctx, {
    sprite: GridInnerIcon.Add,
    x: x + columnInitSize / 2 - halfIconSize + 0.5,
    y: y + height / 2 - halfIconSize + 0.5,
    size: iconSizeSM,
    theme,
  });
  ctx.restore();
};
