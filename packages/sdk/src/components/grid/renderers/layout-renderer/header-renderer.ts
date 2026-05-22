import { isEqual } from 'lodash';
import { GRID_DEFAULT } from '../../configs';
import type { IGridTheme } from '../../configs';
import { RegionType, RowControlType } from '../../interface';
import { GridInnerIcon } from '../../managers';
import {
  drawCheckbox,
  drawLine,
  drawMultiLineText,
  drawRect,
  drawRoundPoly,
  drawSingleLineText,
} from '../base-renderer';
import type {
  IFieldHeadDrawerProps,
  IGridHeaderDrawerProps,
  ILayoutDrawerProps,
  IRowHeaderDrawerProps,
} from './interface';
import { RenderRegion } from './interface';

const spriteIconMap = {
  [RowControlType.Drag]: GridInnerIcon.Drag,
  [RowControlType.Expand]: GridInnerIcon.Detail,
};

const {
  cellTextLineHeight,
  rowHeadIconPaddingTop,
  columnHeadHeight,
  columnHeadPadding,
  columnHeadMenuSize,
  cellVerticalPaddingMD,
} = GRID_DEFAULT;

export const drawCommentCount = (
  ctx: CanvasRenderingContext2D,
  props: {
    x: number;
    y: number;
    count: number;
    theme: IGridTheme;
  }
) => {
  const { theme } = props;
  const { commentCountBg, commentCountTextColor } = theme;
  drawRect(ctx, {
    ...props,
    x: props.x,
    y: props.y,
    width: 18,
    height: 16,
    stroke: commentCountBg,
    radius: 3,
    fill: commentCountBg,
  });

  drawSingleLineText(ctx, {
    ...props,
    x: props.x + 9,
    y: props.y + 3.5,
    text: props.count > 99 ? '99+' : props.count.toString(),
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 10,
    fill: commentCountTextColor,
  });
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const drawRowHeader = (ctx: CanvasRenderingContext2D, props: IRowHeaderDrawerProps) => {
  const {
    x,
    y,
    width,
    height,
    displayIndex,
    theme,
    isHover,
    isChecked,
    rowControls,
    spriteManager,
    rowIndexVisible,
    commentCount,
  } = props;

  const {
    cellBg,
    cellBgHovered,
    cellBgSelected,
    cellLineColor,
    rowHeaderTextColor,
    iconSizeXS,
    staticWhite,
    iconBgSelected,
  } = theme;
  let fill = cellBg;

  if (isChecked) {
    fill = cellBgSelected;
  } else if (isHover) {
    fill = cellBgHovered;
  }

  drawRect(ctx, {
    x,
    y,
    width,
    height,
    fill,
  });
  drawLine(ctx, {
    x,
    y,
    points: [0, 0, width, 0],
    stroke: cellLineColor,
  });
  drawLine(ctx, {
    x,
    y,
    points: [0, height, width, height],
    stroke: cellLineColor,
  });
  const halfSize = iconSizeXS / 2;

  ctx.font = `${10}px ${theme.fontFamily}`;

  if (commentCount) {
    const controlSize = width / rowControls.length;
    const offsetX = controlSize * (2 + 0.5);
    drawCommentCount(ctx, {
      x: x + offsetX - halfSize,
      y: y + rowHeadIconPaddingTop,
      count: commentCount,
      theme,
    });
  }

  if (isChecked || isHover || !rowIndexVisible) {
    const controlSize = width / rowControls.length;
    for (let i = 0; i < rowControls.length; i++) {
      const { type, icon } = rowControls[i];
      const offsetX = controlSize * (i + 0.5);

      if (type === RowControlType.Checkbox) {
        drawCheckbox(ctx, {
          x: x + offsetX - halfSize,
          y: y + rowHeadIconPaddingTop,
          size: iconSizeXS,
          stroke: isChecked ? staticWhite : rowHeaderTextColor,
          fill: isChecked ? iconBgSelected : undefined,
          isChecked,
        });
      } else {
        if (isChecked && !isHover && rowIndexVisible && type === RowControlType.Expand) continue;
        if (!commentCount || type !== RowControlType.Expand) {
          spriteManager.drawSprite(ctx, {
            sprite: icon || spriteIconMap[type],
            x: x + offsetX - halfSize,
            y: y + rowHeadIconPaddingTop,
            size: iconSizeXS,
            theme,
          });
        }
      }
    }
    return;
  }

  drawSingleLineText(ctx, {
    x: x + width / 2,
    y: y + cellVerticalPaddingMD + 1,
    text: displayIndex,
    textAlign: 'center',
    fill: rowHeaderTextColor,
  });
};

export const drawColumnHeader = (ctx: CanvasRenderingContext2D, props: IFieldHeadDrawerProps) => {
  const { x, y, width, height, theme, fill, column, hasMenu, spriteManager } = props;
  const { name, icon, description, hasMenu: hasColumnMenu, isPrimary } = column;
  const {
    cellLineColor,
    columnHeaderBg,
    iconFgCommon,
    columnHeaderNameColor,
    fontSizeSM,
    iconSizeXS,
  } = theme;
  let maxTextWidth = width - columnHeadPadding * 2;
  let iconOffsetX = columnHeadPadding;
  const hasMenuInner = hasMenu && hasColumnMenu;

  drawRect(ctx, {
    x: x + 0.5,
    y,
    width: width - 0.5,
    height,
    fill: fill ?? columnHeaderBg,
  });
  drawLine(ctx, {
    x,
    y,
    points: [0, height, width, height, width, 0],
    stroke: cellLineColor,
  });

  if (isPrimary) {
    maxTextWidth = maxTextWidth - iconSizeXS - columnHeadPadding;
    spriteManager.drawSprite(ctx, {
      sprite: GridInnerIcon.Lock,
      x: x + iconOffsetX,
      y: y + (columnHeadHeight - iconSizeXS) / 2,
      size: iconSizeXS,
      theme,
    });
    iconOffsetX += iconSizeXS + columnHeadPadding / 2;
  }

  if (icon) {
    maxTextWidth = maxTextWidth - iconSizeXS;
    spriteManager.drawSprite(ctx, {
      sprite: icon,
      x: x + iconOffsetX,
      y: y + (columnHeadHeight - iconSizeXS) / 2,
      size: iconSizeXS,
      theme,
    });
    iconOffsetX += iconSizeXS + columnHeadPadding / 2;
  }

  if (hasMenuInner) {
    maxTextWidth = maxTextWidth - columnHeadMenuSize - columnHeadPadding;
    drawRoundPoly(ctx, {
      points: [
        {
          x: x + width - columnHeadPadding - columnHeadMenuSize,
          y: y + columnHeadHeight / 2 - columnHeadMenuSize / 4,
        },
        {
          x: x + width - columnHeadPadding,
          y: y + columnHeadHeight / 2 - columnHeadMenuSize / 4,
        },
        {
          x: x + width - columnHeadPadding - columnHeadMenuSize / 2,
          y: y + columnHeadHeight / 2 + columnHeadMenuSize / 4,
        },
      ],
      radiusAll: 1,
      fill: iconFgCommon,
    });
  }

  if (description) {
    spriteManager.drawSprite(ctx, {
      sprite: GridInnerIcon.Description,
      x: hasMenuInner
        ? x + width - 2 * iconSizeXS - columnHeadPadding
        : x + width - iconSizeXS - columnHeadPadding,
      y: y + (columnHeadHeight - iconSizeXS) / 2,
      size: iconSizeXS,
      theme,
    });

    maxTextWidth = maxTextWidth - iconSizeXS - columnHeadPadding;
  }

  drawMultiLineText(ctx, {
    x: x + iconOffsetX,
    y: y + cellVerticalPaddingMD,
    text: name,
    maxLines: Math.floor((height - cellVerticalPaddingMD) / cellTextLineHeight),
    lineHeight: cellTextLineHeight,
    fontSize: fontSizeSM,
    maxWidth: maxTextWidth,
    fill: columnHeaderNameColor,
  });
};

export const drawGridHeader = (ctx: CanvasRenderingContext2D, props: IGridHeaderDrawerProps) => {
  const { x, y, width, height, theme, rowControls, isChecked, isMultiSelectionEnable } = props;
  const {
    iconSizeXS,
    staticWhite,
    columnHeaderBg,
    cellLineColor,
    rowHeaderTextColor,
    iconBgSelected,
  } = theme;
  const halfSize = iconSizeXS / 2;
  drawRect(ctx, {
    x,
    y,
    width,
    height,
    fill: columnHeaderBg,
  });
  drawLine(ctx, {
    x,
    y,
    points: [0, height, width, height],
    stroke: cellLineColor,
  });

  if (isMultiSelectionEnable && rowControls.some((item) => item.type === RowControlType.Checkbox)) {
    drawCheckbox(ctx, {
      x: width / 2 - halfSize + 0.5,
      y: height / 2 - halfSize + 0.5,
      size: iconSizeXS,
      stroke: isChecked ? staticWhite : rowHeaderTextColor,
      fill: isChecked ? iconBgSelected : undefined,
      isChecked,
    });
  }
};

export const drawColumnHeaders = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps,
  renderRegion: RenderRegion
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const {
    visibleRegion,
    coordInstance,
    columns,
    theme,
    spriteManager,
    mouseState,
    scrollState,
    selection,
    rowControls,
    isInteracting,
    isColumnHeaderMenuVisible,
    isMultiSelectionEnable,
  } = props;
  const { startColumnIndex: originStartColumnIndex, stopColumnIndex: originStopColumnIndex } =
    visibleRegion;
  const {
    containerWidth,
    freezeRegionWidth,
    rowInitSize,
    columnInitSize,
    freezeColumnCount,
    pureRowCount,
  } = coordInstance;
  const { scrollLeft } = scrollState;
  const { fontSizeSM, fontFamily } = theme;
  const { isColumnSelection, isRowSelection, ranges: selectionRanges } = selection;
  const { type: hoverRegionType, columnIndex: hoverColumnIndex } = mouseState;
  const isFreezeRegion = renderRegion === RenderRegion.Freeze;
  const startColumnIndex = isFreezeRegion ? 0 : Math.max(freezeColumnCount, originStartColumnIndex);
  const stopColumnIndex = isFreezeRegion
    ? Math.max(freezeColumnCount - 1, 0)
    : originStopColumnIndex;
  const endRowIndex = pureRowCount - 1;

  ctx.save();
  ctx.beginPath();
  ctx.rect(
    isFreezeRegion ? 0 : freezeRegionWidth + 1,
    0,
    isFreezeRegion ? freezeRegionWidth + 1 : containerWidth - freezeRegionWidth,
    rowInitSize + 1
  );
  ctx.clip();
  ctx.font = `normal ${fontSizeSM}px ${fontFamily}`;

  for (let columnIndex = startColumnIndex; columnIndex <= stopColumnIndex; columnIndex++) {
    const column = columns[columnIndex];
    const finalTheme = column?.customTheme ? { ...theme, ...column.customTheme } : theme;
    const { columnHeaderBgHovered, columnHeaderBgSelected } = finalTheme;
    const x = coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft);
    const columnWidth = coordInstance.getColumnWidth(columnIndex);
    const isActive = isColumnSelection && selection.includes([columnIndex, columnIndex]);
    const isHover =
      !isInteracting &&
      [RegionType.ColumnHeader, RegionType.ColumnHeaderMenu].includes(hoverRegionType) &&
      hoverColumnIndex === columnIndex;
    let fill = undefined;

    if (isActive) {
      fill = columnHeaderBgSelected;
    } else if (isHover) {
      fill = columnHeaderBgHovered;
    }

    column &&
      drawColumnHeader(ctx, {
        x: x + 0.5,
        y: 0.5,
        width: columnWidth,
        height: rowInitSize,
        column,
        fill,
        hasMenu: isColumnHeaderMenuVisible,
        theme: finalTheme,
        spriteManager,
      });
  }

  const isChecked = isRowSelection && isEqual(selectionRanges[0], [0, endRowIndex]);
  drawGridHeader(ctx, {
    x: 0,
    y: 0.5,
    width: columnInitSize + 1.5,
    height: rowInitSize,
    theme,
    rowControls,
    isChecked,
    isMultiSelectionEnable,
  });

  ctx.restore();
};

export const drawColumnHeadersRegion = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps,
  drawAppendColumn: (ctx: CanvasRenderingContext2D, props: ILayoutDrawerProps) => void
) => {
  const { columnHeaderHeight } = props;

  if (columnHeaderHeight === 0) return;

  [RenderRegion.Freeze, RenderRegion.Other].forEach((r) => drawColumnHeaders(ctx, props, r));
  drawAppendColumn(ctx, props);
};
