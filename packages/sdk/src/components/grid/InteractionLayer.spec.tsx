import { fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import type * as ReactModule from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  DEFAULT_COLUMN_RESIZE_STATE,
  DEFAULT_DRAG_STATE,
  DEFAULT_MOUSE_STATE,
  DEFAULT_SCROLL_STATE,
  gridTheme,
} from './configs';
import { InteractionLayer, type IInteractionLayerRef } from './InteractionLayer';
import {
  DraggableType,
  LinearRowType,
  RegionType,
  SelectableType,
  SelectionRegionType,
  type ILinearRow,
} from './interface';
import { CoordinateManager } from './managers';

let currentRegionType = RegionType.None;
let mouseCoords = { elX: 180, elY: 20 };

vi.mock('react-use', async () => {
  const actual = await vi.importActual('react-use');
  return {
    ...actual,
    useMouse: () => mouseCoords,
  };
});

vi.mock('./RenderLayer', () => ({
  RenderLayer: () => <div data-testid="render-layer" />,
}));

vi.mock('./CellScroller', () => ({
  CellScroller: () => null,
}));

vi.mock('./components', async () => {
  const { forwardRef } = await vi.importActual<typeof ReactModule>('react');
  const MockEditorContainer = forwardRef(() => null);

  MockEditorContainer.displayName = 'MockEditorContainer';

  return {
    EditorContainer: MockEditorContainer,
  };
});

type MockSelectionState = {
  isCellSelection: boolean;
  ranges: [number, number][];
  reset: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  serialize: ReturnType<typeof vi.fn>;
};

const selectionState = {} as MockSelectionState;

selectionState.isCellSelection = false;
selectionState.ranges = [[1, 1]];
selectionState.reset = vi.fn(() => selectionState);
selectionState.set = vi.fn(() => selectionState);
selectionState.serialize = vi.fn(() => [
  [1, 1],
  [1, 1],
]);

const onSelectionClick = vi.fn();
const onSelectionContextMenu = vi.fn((mouseState, callback) =>
  callback(selectionState, mouseState)
);

vi.mock('./hooks', () => ({
  useSelection: () => ({
    selection: selectionState,
    isSelecting: false,
    setSelection: vi.fn(),
    onSelectionStart: vi.fn(),
    onSelectionChange: vi.fn(),
    onSelectionEnd: vi.fn(),
    onSelectionClick,
    onSelectionContextMenu,
  }),
  useAutoScroll: () => ({
    onAutoScroll: vi.fn(),
    onAutoScrollStop: vi.fn(),
  }),
  useColumnResize: () => ({
    columnResizeState: DEFAULT_COLUMN_RESIZE_STATE,
    hoveredColumnResizeIndex: -1,
    setHoveredColumnResizeIndex: vi.fn(),
    setColumnResizeState: vi.fn(),
    onColumnResizeStart: vi.fn(),
    onColumnResizeChange: vi.fn(),
    onColumnResizeEnd: vi.fn(),
  }),
  useColumnFreeze: () => ({
    columnFreezeState: { sourceIndex: -1, targetIndex: -1, isFreezing: false },
    onColumnFreezeStart: vi.fn(),
    onColumnFreezeMove: vi.fn(),
    onColumnFreezeEnd: vi.fn(),
  }),
  useEventListener: vi.fn(),
}));

vi.mock('./hooks/useDrag', () => ({
  useDrag: () => ({
    dragState: DEFAULT_DRAG_STATE,
    setDragState: vi.fn(),
    onDragStart: vi.fn(),
    onDragChange: vi.fn(),
    onDragEnd: vi.fn(),
  }),
}));

vi.mock('./hooks/useVisibleRegion', () => ({
  useVisibleRegion: () => ({ startRow: 0, endRow: 5, startColumn: 0, endColumn: 3 }),
}));

vi.mock('./utils', async () => {
  const actual = await vi.importActual('./utils');
  return {
    ...actual,
    getRegionData: () => ({
      type: currentRegionType,
      x: 10,
      y: 5,
      width: 100,
      height: 40,
    }),
  };
});

const createCoordInstance = () =>
  new CoordinateManager({
    rowCount: 10,
    pureRowCount: 10,
    columnCount: 4,
    containerWidth: 400,
    containerHeight: 240,
    rowHeight: 40,
    columnWidth: 100,
    rowHeightMap: {},
    columnWidthMap: {},
    rowInitSize: 40,
    columnInitSize: 70,
    freezeColumnCount: 1,
  });

const baseProps = (mouseType = DEFAULT_MOUSE_STATE.type) => ({
  theme: gridTheme,
  width: 400,
  height: 240,
  columns: [
    { name: 'A', width: 100 },
    { name: 'B', width: 100 },
    { name: 'C', width: 100 },
    { name: 'D', width: 100 },
  ],
  commentCountMap: {},
  draggable: DraggableType.All,
  selectable: SelectableType.All,
  rowControls: [],
  mouseState: { ...DEFAULT_MOUSE_STATE, type: mouseType },
  scrollState: DEFAULT_SCROLL_STATE,
  imageManager: { setCallback: vi.fn() } as never,
  spriteManager: {} as never,
  coordInstance: createCoordInstance(),
  activeCell: null,
  activeCellBound: null,
  columnStatistics: undefined,
  forceRenderFlag: 'test',
  rowIndexVisible: true,
  groupCollection: null,
  isMultiSelectionEnable: true,
  columnHeaderHeight: 40,
  collapsedGroupIds: new Set<string>(['g0']),
  collaborators: [],
  searchCursor: null,
  searchHitIndex: [],
  real2RowIndex: (index: number) => index,
  getLinearRow: (index: number): ILinearRow => {
    if (index === 1) {
      return {
        type: LinearRowType.Group,
        id: 'g1',
        depth: 0,
        realIndex: 0,
        isCollapsed: false,
        value: 'Group 1',
      };
    }
    return { type: LinearRowType.Row, realIndex: Math.max(index, 0), displayIndex: index + 1 };
  },
  setActiveCell: vi.fn(),
  setMouseState: vi.fn(),
  scrollBy: vi.fn(),
  scrollToItem: vi.fn(),
  getCellContent: vi.fn(() => ({ type: 'text', data: null }) as never),
  onSelectionChanged: vi.fn(),
  onColumnHeaderClick: vi.fn(),
  onColumnHeaderDblClick: vi.fn(),
  onGroupHeaderContextMenu: vi.fn(),
  onContextMenu: vi.fn(),
});

describe('InteractionLayer', () => {
  const mockStageRect = (stage: Element) => {
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 400,
      bottom: 240,
      width: 400,
      height: 240,
      toJSON: () => ({}),
    } as DOMRect);
  };

  beforeEach(() => {
    currentRegionType = RegionType.None;
    mouseCoords = { elX: 180, elY: 20 };
    selectionState.isCellSelection = false;
    selectionState.ranges = [[1, 1]];
    onSelectionClick.mockClear();
    onSelectionContextMenu.mockClear();
  });

  test('dispatches column header click with computed bounds', () => {
    currentRegionType = RegionType.ColumnHeader;
    const props = baseProps(RegionType.ColumnHeader);
    const { container } = render(<InteractionLayer {...props} />);
    const stage = container.querySelector('[data-t-grid-stage]')!;
    mockStageRect(stage);

    fireEvent.click(stage, { detail: 1, clientX: 180, clientY: 20 });

    expect(props.onColumnHeaderClick).toHaveBeenCalledWith(1, {
      x: 170,
      y: 0,
      width: 100,
      height: 32,
    });
  });

  test('dispatches column header double click when the pointer hits a header', () => {
    currentRegionType = RegionType.ColumnHeader;
    selectionState.ranges = [[1, 1]];
    const props = baseProps(RegionType.ColumnHeader);
    const { container } = render(<InteractionLayer {...props} />);
    const stage = container.querySelector('[data-t-grid-stage]')!;
    mockStageRect(stage);

    fireEvent.doubleClick(stage, { detail: 2, clientX: 180, clientY: 20 });

    expect(props.onColumnHeaderDblClick).toHaveBeenCalledWith(1, {
      x: 170,
      y: 0,
      width: 100,
      height: 32,
    });
  });

  test('dispatches group header context menu to group handler', () => {
    currentRegionType = RegionType.RowGroupHeader;
    mouseCoords = { elX: 180, elY: 100 };
    const props = baseProps(RegionType.RowGroupHeader);
    const { container } = render(<InteractionLayer {...props} />);
    const stage = container.querySelector('[data-t-grid-stage]')!;
    mockStageRect(stage);

    fireEvent.contextMenu(stage, { clientX: 180, clientY: 100 });

    expect(props.onGroupHeaderContextMenu).toHaveBeenCalledWith('g1', { x: 180, y: 100 });
  });

  test('exposes imperative setSelection and scrolls active target', () => {
    const props = baseProps();
    const ref = createRef<IInteractionLayerRef>();
    render(<InteractionLayer {...props} ref={ref} />);

    ref.current?.setSelection({ type: SelectionRegionType.Cells, ranges: [[2, 3]] } as never);

    expect(props.setActiveCell).toHaveBeenCalledWith([2, 3]);
    expect(props.scrollToItem).toHaveBeenCalledWith([2, 3]);
  });
});
