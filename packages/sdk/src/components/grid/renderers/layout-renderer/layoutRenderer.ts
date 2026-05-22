import { GRID_DEFAULT } from '../../configs';
import { drawCellContent, drawCells } from './cell-region-renderer';
import { drawColumnHeadersRegion } from './header-renderer';
import {
  drawAppendColumn,
  drawColumnDraggingRegion,
  drawColumnFreezeHandler,
  drawColumnResizeHandler,
  drawFreezeRegionDivider,
  drawRowDraggingRegion,
} from './interaction-visual-renderer';
import type { ICacheDrawerProps, ILayoutDrawerProps } from './interface';
import { DividerRegion } from './interface';
import {
  drawActiveCell,
  drawCollaborators,
  drawFillHandler,
  drawFillPreview,
  drawSearchCursor,
  drawSearchTargetIndex,
} from './overlay-renderer';
import { drawColumnStatisticsRegion } from './statistics-renderer';

const { columnStatisticHeight: _columnStatisticHeight } = GRID_DEFAULT;

const setVisibleImageRegion = (props: ILayoutDrawerProps) => {
  const { imageManager, coordInstance, visibleRegion, getLinearRow } = props;
  const { startColumnIndex, stopColumnIndex, startRowIndex, stopRowIndex } = visibleRegion;
  const realStartRowIndex = getLinearRow(startRowIndex).realIndex;
  const realStopRowIndex = getLinearRow(stopRowIndex).realIndex;
  const { freezeColumnCount } = coordInstance;
  imageManager?.setWindow(
    {
      x: startColumnIndex,
      y: realStartRowIndex,
      width: stopColumnIndex - startColumnIndex,
      height: realStopRowIndex - realStartRowIndex,
    },
    freezeColumnCount
  );
};

export const computeShouldRerender = (current: ILayoutDrawerProps, last?: ILayoutDrawerProps) => {
  if (last == null) return true;
  return !(
    current.theme === last.theme &&
    current.columns === last.columns &&
    current.getLinearRow === last.getLinearRow &&
    current.real2RowIndex === last.real2RowIndex &&
    current.getCellContent === last.getCellContent &&
    current.coordInstance === last.coordInstance &&
    current.visibleRegion === last.visibleRegion &&
    current.forceRenderFlag === last.forceRenderFlag &&
    current.hoverCellPosition === last.hoverCellPosition
  );
};

export const drawCacheContent = (
  cacheCanvas: HTMLCanvasElement | undefined,
  props: ICacheDrawerProps
) => {
  if (!cacheCanvas) return;

  const { containerWidth, containerHeight, pixelRatio, shouldRerender, draw } = props;
  const width = Math.ceil(containerWidth * pixelRatio);
  const height = Math.ceil(containerHeight * pixelRatio);

  if (cacheCanvas.width !== width || cacheCanvas.height !== height) {
    cacheCanvas.width = width;
    cacheCanvas.height = height;
  }

  const cacheCtx = cacheCanvas.getContext('2d');
  if (cacheCtx == null) return;

  if (shouldRerender) {
    cacheCtx.clearRect(0, 0, width, height);
    cacheCtx.save();

    if (pixelRatio !== 1) {
      cacheCtx.scale(pixelRatio, pixelRatio);
    }

    cacheCtx.beginPath();
    cacheCtx.rect(0, 0, containerWidth, containerHeight);
    cacheCtx.clip();
  }

  draw(cacheCtx);

  if (shouldRerender) {
    cacheCtx.restore();
  }
};

export const drawGrid = (
  mainCanvas: HTMLCanvasElement,
  cacheCanvas: HTMLCanvasElement,
  props: ILayoutDrawerProps,
  lastProps?: ILayoutDrawerProps
) => {
  const { coordInstance, scrollState, height: originHeight, columnStatistics } = props;
  const { isScrolling } = scrollState;
  const { containerWidth } = coordInstance;

  if (containerWidth === 0 || originHeight === 0) return;

  const pixelRatio = Math.ceil(window.devicePixelRatio ?? 1);
  const width = Math.ceil(containerWidth * pixelRatio);
  const height = Math.ceil(originHeight * pixelRatio);
  const shouldRerender = isScrolling || computeShouldRerender(props, lastProps);

  if (mainCanvas.width !== width || mainCanvas.height !== height) {
    mainCanvas.width = width;
    mainCanvas.height = height;
    mainCanvas.style.width = containerWidth + 'px';
    mainCanvas.style.height = originHeight + 'px';
  }

  const mainCtx = mainCanvas.getContext('2d');
  if (mainCtx == null) return;

  mainCtx.clearRect(0, 0, width, height);
  mainCtx.save();

  if (pixelRatio !== 1) {
    mainCtx.scale(pixelRatio, pixelRatio);
  }

  mainCtx.beginPath();
  mainCtx.rect(0, 0, containerWidth, originHeight);
  mainCtx.clip();

  drawCacheContent(cacheCanvas, {
    containerWidth,
    containerHeight: originHeight,
    pixelRatio,
    shouldRerender,
    draw: (cacheCtx) => {
      drawCells(mainCtx, cacheCtx, { ...props, shouldRerender });
    },
  });

  mainCtx.save();
  mainCtx.setTransform(1, 0, 0, 1, 0, 0);
  mainCtx.drawImage(cacheCanvas, 0, 0, width, height);
  mainCtx.restore();

  drawColumnHeadersRegion(mainCtx, props, drawAppendColumn);

  drawFreezeRegionDivider(mainCtx, props, DividerRegion.Top);

  drawCollaborators(mainCtx, props);

  drawSearchTargetIndex(mainCtx, props, drawCellContent);

  drawSearchCursor(mainCtx, props, drawCellContent);

  drawColumnStatisticsRegion(mainCtx, props);

  drawActiveCell(mainCtx, props, drawCellContent);

  drawFillPreview(mainCtx, props);

  columnStatistics != null && drawFreezeRegionDivider(mainCtx, props, DividerRegion.Bottom);

  // Fill handle for vertical drag-fill
  drawFillHandler(mainCtx, props);

  drawColumnResizeHandler(mainCtx, props);

  drawRowDraggingRegion(mainCtx, props);

  drawColumnDraggingRegion(mainCtx, props);

  drawColumnFreezeHandler(mainCtx, props);

  setVisibleImageRegion(props);

  mainCtx.restore();
};
