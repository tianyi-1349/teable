import { GRID_DEFAULT } from '../../configs';
import { LinearRowType, RegionType } from '../../interface';
import type { ISingleLineTextProps } from '../base-renderer';
import { drawLine, drawRect, drawSingleLineText } from '../base-renderer';
import type { IGroupStatisticDrawerProps, ILayoutDrawerProps } from './interface';
import { RenderRegion } from './interface';

const { columnStatisticHeight, cellVerticalPaddingMD, cellHorizontalPadding } = GRID_DEFAULT;

export const drawColumnStatistics = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps,
  renderRegion: RenderRegion
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const {
    coordInstance,
    columns,
    theme,
    height,
    visibleRegion,
    mouseState,
    scrollState,
    columnStatistics,
    groupCollection,
    getLinearRow,
  } = props;

  if (columnStatistics == null) return;

  const { scrollLeft, scrollTop } = scrollState;
  let { startColumnIndex, stopColumnIndex } = visibleRegion;
  const { startRowIndex, stopRowIndex } = visibleRegion;
  const { type, columnIndex: hoverColumnIndex, rowIndex: hoverRowIndex } = mouseState;
  const { rowInitSize, containerHeight, containerWidth, freezeRegionWidth, freezeColumnCount } =
    coordInstance;
  const {
    fontSizeXS,
    fontFamily,
    columnHeaderBg,
    groupHeaderBgTertiary,
    groupHeaderBgSecondary,
    groupHeaderBgPrimary,
    columnStatisticBgHoveredPrimary,
    columnStatisticBgHoveredSecondary,
    columnStatisticBgHoveredTertiary,
  } = theme;
  const isFreezeRegion = renderRegion === RenderRegion.Freeze;
  const y = containerHeight + 0.5;

  startColumnIndex = isFreezeRegion ? 0 : Math.max(freezeColumnCount, startColumnIndex);
  stopColumnIndex = isFreezeRegion ? Math.max(freezeColumnCount - 1, 0) : stopColumnIndex;

  ctx.save();
  ctx.beginPath();
  ctx.rect(
    isFreezeRegion ? 0 : freezeRegionWidth,
    rowInitSize,
    isFreezeRegion ? freezeRegionWidth : containerWidth - freezeRegionWidth,
    height
  );
  ctx.clip();
  ctx.font = `${fontSizeXS}px ${fontFamily}`;

  const { groupColumns } = groupCollection ?? {};

  for (let columnIndex = startColumnIndex; columnIndex <= stopColumnIndex; columnIndex++) {
    const x = coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft);
    const columnWidth = coordInstance.getColumnWidth(columnIndex);
    const isFirstColumn = columnIndex === 0;
    const isColumnHovered = columnIndex === hoverColumnIndex;
    const column = columns[columnIndex];

    if (column == null) continue;

    const { id: columnId, name, statisticLabel } = column;

    if (groupColumns != null) {
      const bgList = [groupHeaderBgTertiary, groupHeaderBgSecondary, groupHeaderBgPrimary].slice(
        -groupColumns.length
      );
      const hoverBgList = [
        columnStatisticBgHoveredTertiary,
        columnStatisticBgHoveredSecondary,
        columnStatisticBgHoveredPrimary,
      ].slice(-groupColumns.length);

      for (let rowIndex = startRowIndex; rowIndex <= stopRowIndex; rowIndex++) {
        const linearRow = getLinearRow(rowIndex);
        const rowHeight = coordInstance.getRowHeight(rowIndex);
        const { type: linearRowType } = linearRow;
        const y = coordInstance.getRowOffset(rowIndex) - scrollTop;

        if (linearRowType === LinearRowType.Group) {
          const { id, depth } = linearRow;
          const text = columnStatistics[columnId ?? name]?.[id];

          const labelWidth = isFirstColumn
            ? Math.min(
                drawSingleLineText(ctx, {
                  maxWidth: columnWidth,
                  text: text ?? statisticLabel?.label ?? 'Summary',
                  needRender: false,
                  fontSize: fontSizeXS,
                }).width + cellHorizontalPadding,
                columnWidth
              )
            : columnWidth - 1;

          drawStatisticCell(ctx, {
            x: isFirstColumn ? x + columnWidth - labelWidth : x + 1,
            y: y + 1,
            textOffsetY: columnStatisticHeight / 2 - 2,
            width: labelWidth,
            height: rowHeight - 1,
            text,
            defaultLabel: statisticLabel?.label,
            bgColor: isFirstColumn && text ? bgList[depth] : undefined,
            hoverBgColor: hoverBgList[depth],
            isHovered:
              isColumnHovered && rowIndex === hoverRowIndex && type === RegionType.GroupStatistic,
            theme,
          });
        }
      }
    }

    const text = columnStatistics[columnId ?? name]?.total;

    drawStatisticCell(ctx, {
      x,
      y: y + 1,
      textOffsetY: cellVerticalPaddingMD,
      width: columnWidth,
      height: columnStatisticHeight,
      text,
      bgColor: columnHeaderBg,
      isHovered: isColumnHovered && type === RegionType.ColumnStatistic,
      showAlways: statisticLabel?.showAlways,
      defaultLabel: statisticLabel?.label,
      theme,
    });
  }

  ctx.restore();
};

export const drawStatisticCell = (
  ctx: CanvasRenderingContext2D,
  props: IGroupStatisticDrawerProps
) => {
  const {
    x,
    y,
    width,
    height,
    text,
    textOffsetY,
    isHovered,
    showAlways,
    theme,
    defaultLabel,
    bgColor,
    hoverBgColor,
  } = props;
  const { rowHeaderTextColor, columnStatisticBgHoveredPrimary, fontSizeXS } = theme;

  if (text || isHovered || showAlways || bgColor) {
    drawRect(ctx, {
      x,
      y,
      width,
      height,
      fill: isHovered ? hoverBgColor ?? columnStatisticBgHoveredPrimary : bgColor,
    });
  }

  const textProp: Omit<ISingleLineTextProps, 'text'> = {
    x: x + 0.5,
    y: y + (textOffsetY ?? 0.5),
    textAlign: 'right',
    maxWidth: width - cellHorizontalPadding / 2,
    fill: rowHeaderTextColor,
    fontSize: fontSizeXS,
  };

  if (isHovered || showAlways) {
    !text && drawSingleLineText(ctx, { ...textProp, text: defaultLabel || 'Summary' });
  }

  if (text) {
    drawSingleLineText(ctx, { ...textProp, text });
  }
};

export const drawColumnStatisticsRegion = (
  ctx: CanvasRenderingContext2D,
  props: ILayoutDrawerProps
) => {
  const { coordInstance, theme, columnStatistics, height } = props;
  const { containerWidth } = coordInstance;
  const { cellLineColor } = theme;
  const y = height - columnStatisticHeight + 0.5;

  if (columnStatistics == null) return;

  [RenderRegion.Freeze, RenderRegion.Other].forEach((r) => drawColumnStatistics(ctx, props, r));

  drawLine(ctx, {
    x: 0,
    y,
    points: [0, 0, containerWidth, 0],
    stroke: cellLineColor,
  });
};
