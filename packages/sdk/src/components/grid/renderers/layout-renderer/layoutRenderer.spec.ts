import { beforeEach, describe, expect, test, vi } from 'vitest';

const hoisted = vi.hoisted(() => {
  const callOrder: string[] = [];
  return {
    callOrder,
    interactionVisualMocks: {
      drawAppendColumn: vi.fn(),
      drawColumnDraggingRegion: vi.fn(() => callOrder.push('drawColumnDraggingRegion')),
      drawColumnFreezeHandler: vi.fn(() => callOrder.push('drawColumnFreezeHandler')),
      drawColumnResizeHandler: vi.fn(() => callOrder.push('drawColumnResizeHandler')),
      drawFreezeRegionDivider: vi.fn((_ctx, _props, region) =>
        callOrder.push(`drawFreezeRegionDivider:${String(region)}`)
      ),
      drawRowDraggingRegion: vi.fn(() => callOrder.push('drawRowDraggingRegion')),
    },
    headerMocks: {
      drawColumnHeadersRegion: vi.fn(() => callOrder.push('drawColumnHeadersRegion')),
      drawCommentCount: vi.fn(),
      drawColumnHeader: vi.fn(),
      drawGridHeader: vi.fn(),
    },
    cellRegionMocks: {
      drawCellContent: vi.fn(),
      drawCells: vi.fn(() => callOrder.push('drawCells')),
    },
    overlayMocks: {
      drawActiveCell: vi.fn(() => callOrder.push('drawActiveCell')),
      drawCollaborators: vi.fn(() => callOrder.push('drawCollaborators')),
      drawFillHandler: vi.fn(() => callOrder.push('drawFillHandler')),
      drawFillPreview: vi.fn(() => callOrder.push('drawFillPreview')),
      drawSearchCursor: vi.fn(() => callOrder.push('drawSearchCursor')),
      drawSearchTargetIndex: vi.fn(() => callOrder.push('drawSearchTargetIndex')),
    },
    statisticsMocks: {
      drawColumnStatisticsRegion: vi.fn(() => callOrder.push('drawColumnStatisticsRegion')),
    },
  };
});

const { callOrder } = hoisted;

vi.mock('./interaction-visual-renderer', () => hoisted.interactionVisualMocks);
vi.mock('./header-renderer', () => hoisted.headerMocks);
vi.mock('./cell-region-renderer', () => hoisted.cellRegionMocks);
vi.mock('./overlay-renderer', () => hoisted.overlayMocks);
vi.mock('./statistics-renderer', () => hoisted.statisticsMocks);

import { DividerRegion } from './interface';
import { computeShouldRerender, drawGrid } from './layoutRenderer';

const createContext = () => {
  const ctx = {
    clearRect: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    restore: vi.fn(),
  };

  return ctx as unknown as CanvasRenderingContext2D;
};

const createCanvas = (ctx: CanvasRenderingContext2D) => {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'getContext', {
    value: vi.fn(() => ctx),
  });
  return canvas;
};

const createProps = (columnStatistics: Record<string, unknown> | null = { total: true }) => ({
  theme: {},
  columns: [],
  getLinearRow: vi.fn((index: number) => ({ realIndex: index })),
  real2RowIndex: vi.fn((index: number) => index),
  getCellContent: vi.fn(),
  coordInstance: {
    containerWidth: 320,
    freezeColumnCount: 1,
  },
  visibleRegion: { startColumnIndex: 0, stopColumnIndex: 2, startRowIndex: 0, stopRowIndex: 3 },
  forceRenderFlag: 'flag',
  hoverCellPosition: null,
  scrollState: {
    isScrolling: false,
    scrollLeft: 0,
    scrollTop: 0,
  },
  height: 240,
  columnStatistics,
  imageManager: {
    setWindow: vi.fn(),
  },
});

describe('layoutRenderer', () => {
  beforeEach(() => {
    callOrder.length = 0;
    vi.clearAllMocks();
    vi.stubGlobal('devicePixelRatio', 1);
  });

  test('keeps renderer orchestration order stable', () => {
    const mainCtx = createContext();
    const cacheCtx = createContext();
    const props = createProps();

    drawGrid(createCanvas(mainCtx), createCanvas(cacheCtx), props as never);

    expect(callOrder).toEqual([
      'drawCells',
      'drawColumnHeadersRegion',
      `drawFreezeRegionDivider:${DividerRegion.Top}`,
      'drawCollaborators',
      'drawSearchTargetIndex',
      'drawSearchCursor',
      'drawColumnStatisticsRegion',
      'drawActiveCell',
      'drawFillPreview',
      `drawFreezeRegionDivider:${DividerRegion.Bottom}`,
      'drawFillHandler',
      'drawColumnResizeHandler',
      'drawRowDraggingRegion',
      'drawColumnDraggingRegion',
      'drawColumnFreezeHandler',
    ]);
  });

  test('skips bottom statistics divider when statistics are absent', () => {
    const mainCtx = createContext();
    const cacheCtx = createContext();
    const props = createProps(null);

    drawGrid(createCanvas(mainCtx), createCanvas(cacheCtx), props as never);

    expect(callOrder).toContain(`drawFreezeRegionDivider:${DividerRegion.Top}`);
    expect(callOrder).not.toContain(`drawFreezeRegionDivider:${DividerRegion.Bottom}`);
  });

  test('computeShouldRerender tracks stable orchestration inputs', () => {
    const props = createProps();

    expect(computeShouldRerender(props as never, props as never)).toBe(false);
    expect(
      computeShouldRerender(
        { ...props, hoverCellPosition: { rowIndex: 1, columnIndex: 2 } } as never,
        props as never
      )
    ).toBe(true);
  });
});
