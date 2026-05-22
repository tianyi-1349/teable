/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import { uniqueId } from 'lodash';
import type { CSSProperties, ForwardRefRenderFunction } from 'react';
import {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useRafState } from 'react-use';
import { LoadingIndicator, ErrorIndicator } from './components';
import type { IGridTheme } from './configs';
import { gridTheme, GRID_DEFAULT, DEFAULT_SCROLL_STATE, DEFAULT_MOUSE_STATE } from './configs';
import {
  getActiveCellBound,
  buildColumnWidthMap,
  buildDefaultRowsInfo,
  buildGroupRowsInfo,
  getCellBounds,
  getCellIndicesAtPosition,
  getFallbackLinearRow,
  getGridTotalWidth,
  getScrollToItemTarget,
} from './grid-helpers';
import { useResizeObserver } from './hooks';
import type { ScrollerRef } from './InfiniteScroller';
import { InfiniteScroller } from './InfiniteScroller';
import type { IInteractionLayerRef } from './InteractionLayer';
import { InteractionLayer } from './InteractionLayer';
import type {
  IRectangle,
  IScrollState,
  ICellItem,
  IGridColumn,
  IMouseState,
  IPosition,
  IRowControlItem,
  IColumnStatistics,
  ICollaborator,
  IGroupPoint,
  IGroupCollection,
  DragRegionType,
  IColumnLoading,
  IRange,
  ICellError,
} from './interface';
import { RegionType, RowControlType, DraggableType, SelectableType } from './interface';
import type { ISpriteMap, CombinedSelection } from './managers';
import { CoordinateManager, SpriteManager, ImageManager } from './managers';
import type { ICell, IInnerCell } from './renderers';
import { TouchLayer } from './TouchLayer';

export interface IGridExternalProps {
  theme?: Partial<IGridTheme>;
  customIcons?: ISpriteMap;
  rowControls?: IRowControlItem[];
  smoothScrollX?: boolean;
  smoothScrollY?: boolean;
  scrollBufferX?: number;
  scrollBufferY?: number;
  scrollBarVisible?: boolean;
  rowIndexVisible?: boolean;
  collaborators?: ICollaborator;
  // [rowIndex, colIndex]
  searchCursor?: [number, number] | null;
  searchHitIndex?: { fieldId: string; recordId: string }[];

  /**
   * Indicates which areas can be dragged, including rows, columns or no drag
   * - 'all': Allow drag of rows, columns and cells (default)
   * - 'none': Disable drag for all areas
   * - 'row': Allow row drag only
   * - 'column': Allow column drag only
   */
  draggable?: DraggableType;

  /**
   * Indicates which areas can be selected, including row selection,
   * column selection, cell selection, all areas, or no selection
   * - 'all': Allow selection of rows, columns and cells (default)
   * - 'none': Disable selection for all areas
   * - 'row': Allow row selection only
   * - 'column': Allow column selection only
   * - 'cell': Allow cell selection only
   */
  selectable?: SelectableType;

  /**
   * Whether to allow multiple selection operations, including rows, columns and cells
   * If true, allow multiple selection of rows/columns/cells (default)
   * If false, disable multiple selection operations
   * @type {boolean}
   */
  isMultiSelectionEnable?: boolean;

  groupCollection?: IGroupCollection | null;
  collapsedGroupIds?: Set<string> | null;
  groupPoints?: IGroupPoint[] | null;

  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: (selection: CombinedSelection, e: React.ClipboardEvent) => void;
  onPaste?: (selection: CombinedSelection, e: React.ClipboardEvent) => void;
  onDelete?: (selection: CombinedSelection) => void;
  onCellEdited?: (cell: ICellItem, newValue: IInnerCell) => void;
  onCellDblClick?: (cell: ICellItem) => void;
  onSelectionChanged?: (selection: CombinedSelection) => void;
  onVisibleRegionChanged?: (rect: IRectangle) => void;
  onCollapsedGroupChanged?: (collapsedGroupIds: Set<string>) => void;
  onColumnFreeze?: (freezeColumnCount: number) => void;
  onColumnAppend?: () => void;
  onRowExpand?: (rowIndex: number) => void;
  onRowAppend?: (targetIndex?: number) => void;
  onRowOrdered?: (dragRowIndexCollection: number[], dropRowIndex: number) => void;
  onColumnOrdered?: (dragColIndexCollection: number[], dropColIndex: number) => void;
  onColumnResize?: (column: IGridColumn, newSize: number, colIndex: number) => void;
  onColumnHeaderClick?: (colIndex: number, bounds: IRectangle) => void;
  onColumnHeaderDblClick?: (colIndex: number, bounds: IRectangle) => void;
  onColumnHeaderMenuClick?: (colIndex: number, bounds: IRectangle) => void;
  onColumnStatisticClick?: (colIndex: number, bounds: IRectangle) => void;
  onContextMenu?: (selection: CombinedSelection, position: IPosition) => void;
  onGroupHeaderContextMenu?: (groupId: string, position: IPosition) => void;
  onScrollChanged?: (scrollLeft: number, scrollTop: number) => void;
  onDragStart?: (type: DragRegionType, dragIndexs: number[]) => void;

  /**
   * Triggered when the mouse hovers over the every type of region
   */
  onItemHovered?: (
    type: RegionType,
    bounds: IRectangle,
    cellItem: ICellItem,
    data?: unknown
  ) => void;

  /**
   * Triggered when the mouse clicks the every type of region
   */
  onItemClick?: (type: RegionType, bounds: IRectangle, cellItem: ICellItem) => void;

  /**
   * Triggered when user drags the fill handle downward to auto-fill cells
   * Only vertical fill is supported. Provides current selection ranges and the target end real row index
   */
  onFillSelection?: (selectionRanges: [IRange, IRange], targetEndRealRowIndex: number) => void;

  /**
   * Triggered when user clicks a row control (checkbox, expand, drag)
   * For checkbox: checked indicates the state after click (true = selected, false = deselected)
   */
  onRowControlClick?: (rowIndex: number, type: RowControlType, checked: boolean) => void;

  /**
   * Triggered when user shift+clicks to select a range of rows
   * Provides the row ranges selected (can be used to fetch recordIds via API)
   */
  onRowRangeSelected?: (ranges: IRange[]) => void;
}

export interface IGridProps extends IGridExternalProps {
  columns: IGridColumn[];
  commentCountMap?: Record<string, number>;
  freezeColumnCount?: number;
  rowCount: number;
  rowHeight?: number;
  style?: CSSProperties;
  isTouchDevice?: boolean;
  columnHeaderHeight?: number;
  columnStatistics?: IColumnStatistics;
  getCellContent: (cell: ICellItem) => ICell;
}

export interface IGridRef {
  resetState: () => void;
  forceUpdate: () => void;
  getActiveCell: () => ICellItem | null;
  getRowOffset: (rowIndex: number) => number;
  setSelection: (selection: CombinedSelection) => void;
  getScrollState: () => IScrollState;
  scrollBy: (deltaX: number, deltaY: number) => void;
  scrollTo: (scrollLeft?: number, scrollTop?: number) => void;
  scrollToItem: (position: [columnIndex: number, rowIndex: number]) => void;
  setActiveCell: (cell: ICellItem | null) => void;
  getCellIndicesAtPosition: (x: number, y: number) => ICellItem | null;
  getContainer: () => HTMLDivElement | null;
  getCellBounds: (cell: ICellItem) => IRectangle | null;
  setCellLoading: (cells: ICellItem[]) => void;
  setColumnLoadings: (columnLoadings: IColumnLoading[]) => void;
  setCellErrors: (cellErrors: ICellError[]) => void;
  isEditing: () => boolean | undefined;
}

const {
  scrollBuffer,
  appendRowHeight,
  groupHeaderHeight,
  cellScrollBuffer,
  columnAppendBtnWidth,
  columnStatisticHeight,
  rowHeight: defaultRowHeight,
  columnWidth: defaultColumnWidth,
  columnHeadHeight: defaultColumnHeaderHeight,
} = GRID_DEFAULT;

const GridBase: ForwardRefRenderFunction<IGridRef, IGridProps> = (props, forwardRef) => {
  const {
    columns,
    commentCountMap,
    groupCollection,
    collapsedGroupIds,
    draggable = DraggableType.All,
    selectable = SelectableType.All,
    columnStatistics,
    freezeColumnCount: _freezeColumnCount = 1,
    rowCount: originRowCount,
    rowHeight = defaultRowHeight,
    rowControls = [{ type: RowControlType.Checkbox }],
    theme: customTheme,
    isTouchDevice,
    smoothScrollX = true,
    smoothScrollY = true,
    scrollBufferX = scrollBuffer,
    scrollBufferY = scrollBuffer,
    scrollBarVisible = true,
    rowIndexVisible = true,
    isMultiSelectionEnable = true,
    style,
    customIcons,
    collaborators,
    searchCursor,
    searchHitIndex,
    groupPoints,
    columnHeaderHeight = defaultColumnHeaderHeight,
    getCellContent,
    onUndo,
    onRedo,
    onCopy,
    onPaste,
    onDelete,
    onRowAppend,
    onRowExpand,
    onRowOrdered,
    onCellEdited,
    onCellDblClick,
    onColumnAppend,
    onColumnResize,
    onColumnOrdered,
    onDragStart,
    onContextMenu,
    onSelectionChanged,
    onVisibleRegionChanged,
    onColumnFreeze,
    onColumnHeaderClick,
    onColumnHeaderDblClick,
    onColumnHeaderMenuClick,
    onColumnStatisticClick,
    onCollapsedGroupChanged,
    onGroupHeaderContextMenu,
    onItemHovered,
    onItemClick,
    onScrollChanged,
    onFillSelection,
    onRowControlClick,
    onRowRangeSelected,
  } = props;

  useImperativeHandle(forwardRef, () => ({
    resetState: () => interactionLayerRef.current?.resetState(),
    forceUpdate: () => setForceRenderFlag(uniqueId('grid_')),
    getActiveCell: () => activeCell,
    setSelection: (selection: CombinedSelection) => {
      interactionLayerRef.current?.setSelection(selection);
    },
    getRowOffset: (rowIndex: number) => {
      const { scrollTop } = scrollState;
      const realRowIndex = real2RowIndex(rowIndex);
      return coordInstance.getRowOffset(realRowIndex) - scrollTop;
    },
    scrollBy,
    scrollTo,
    scrollToItem,
    setActiveCell,
    getScrollState: () => scrollState,
    getCellIndicesAtPosition: (x: number, y: number): ICellItem | null => {
      return getCellIndicesAtPosition(x, y, scrollState, coordInstance, getLinearRow);
    },
    getContainer: () => containerRef.current,
    setCellLoading: (cells: ICellItem[]) => {
      setCellLoadings(cells);
    },
    setColumnLoadings: (columnLoadings: IColumnLoading[]) => {
      setColumnLoadings(columnLoadings);
    },
    setCellErrors: (cellErrors: ICellError[]) => {
      setCellErrors(cellErrors);
    },
    getCellBounds: (cell: ICellItem) => {
      return getCellBounds(cell, real2RowIndex, scrollState, coordInstance);
    },
    isEditing: () => {
      return interactionLayerRef.current?.isEditing();
    },
  }));

  const hasAppendRow = onRowAppend != null;
  const hasAppendColumn = onColumnAppend != null;
  const rowControlCount = rowControls.length;
  const totalWidth = getGridTotalWidth(
    columns,
    defaultColumnWidth,
    scrollBufferX,
    hasAppendColumn,
    columnAppendBtnWidth
  );

  const [forceRenderFlag, setForceRenderFlag] = useState(uniqueId('grid_'));
  const [mouseState, setMouseState] = useState<IMouseState>(DEFAULT_MOUSE_STATE);
  const [scrollState, setScrollState] = useState<IScrollState>(DEFAULT_SCROLL_STATE);
  const [activeCell, setActiveCell] = useRafState<ICellItem | null>(null);
  const [cellLoadings, setCellLoadings] = useState<ICellItem[]>([]);
  const [columnLoadings, setColumnLoadings] = useState<IColumnLoading[]>([]);
  const [cellErrors, setCellErrors] = useState<ICellError[]>([]);
  const scrollerRef = useRef<ScrollerRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const interactionLayerRef = useRef<IInteractionLayerRef | null>(null);
  const { ref, width, height } = useResizeObserver<HTMLDivElement>();

  const hoverRegionType = mouseState.type;
  const hasColumnStatistics = columnStatistics != null;
  const containerHeight = hasColumnStatistics ? height - columnStatisticHeight : height;
  const columnCount = columns.length;
  const freezeColumnCount = Math.min(_freezeColumnCount, columnCount);

  const theme = useMemo(() => ({ ...gridTheme, ...customTheme }), [customTheme]);
  const { iconSizeMD } = theme;

  const columnInitSize = useMemo(() => {
    return !rowIndexVisible && !rowControlCount ? 0 : Math.max(rowControlCount, 2) * iconSizeMD;
  }, [rowControlCount, rowIndexVisible, iconSizeMD]);

  const defaultRowsInfo = useMemo(() => {
    return buildDefaultRowsInfo(originRowCount, hasAppendRow, appendRowHeight);
  }, [hasAppendRow, originRowCount]);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const groupRowsInfo = useMemo(() => {
    return buildGroupRowsInfo(groupPoints, hasAppendRow, appendRowHeight, groupHeaderHeight);
  }, [groupPoints, hasAppendRow]);

  const { rowCount, pureRowCount, rowHeightMap, linearRows, real2LinearRowMap } = useMemo(() => {
    return { ...defaultRowsInfo, ...groupRowsInfo };
  }, [defaultRowsInfo, groupRowsInfo]);

  const getLinearRow = useCallback(
    (index: number) => {
      if (!linearRows.length) {
        return getFallbackLinearRow(index, pureRowCount);
      }
      return linearRows[index] ?? { realIndex: -2 };
    },
    [linearRows, pureRowCount]
  );

  const real2RowIndex = useCallback(
    (index: number) => {
      if (real2LinearRowMap == null) return index;
      return real2LinearRowMap[index];
    },
    [real2LinearRowMap]
  );

  const columnWidthMap = useMemo(() => {
    return buildColumnWidthMap(columns, defaultColumnWidth);
  }, [columns]);

  const coordInstance = useMemo<CoordinateManager>(() => {
    return new CoordinateManager({
      rowHeight,
      columnWidth: defaultColumnWidth,
      pureRowCount,
      rowCount,
      columnCount,
      freezeColumnCount,
      containerWidth: width,
      containerHeight,
      rowInitSize: columnHeaderHeight,
      columnInitSize,
      rowHeightMap,
      columnWidthMap,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowHeight, pureRowCount, rowCount, rowHeightMap, columnHeaderHeight]);

  const totalHeight = coordInstance.totalHeight + scrollBufferY;

  useEffect(() => {
    coordInstance.refreshColumnDimensions({ columnInitSize, columnCount, columnWidthMap });
    setForceRenderFlag(uniqueId('grid_'));
  }, [coordInstance, columnInitSize, columnCount, columnWidthMap]);

  useEffect(() => {
    coordInstance.containerWidth = width;
    coordInstance.containerHeight = containerHeight;
    coordInstance.freezeColumnCount = freezeColumnCount;
    setForceRenderFlag(uniqueId('grid_'));
  }, [coordInstance, width, containerHeight, freezeColumnCount]);

  const activeCellBound = useMemo(() => {
    return getActiveCellBound({
      activeCell,
      getCellContent,
      coordInstance,
      theme,
      real2RowIndex,
    });
  }, [activeCell, coordInstance, theme, getCellContent, real2RowIndex]);

  const scrollEnable =
    hoverRegionType !== RegionType.None &&
    !(hoverRegionType === RegionType.ActiveCell && activeCellBound?.scrollEnable);

  const spriteManager = useMemo(
    () => new SpriteManager(customIcons, () => setForceRenderFlag(uniqueId('grid_'))),
    [customIcons]
  );

  const imageManager = useMemo<ImageManager>(() => {
    const imgManager = new ImageManager();
    imgManager.setCallback(() => setForceRenderFlag(uniqueId('grid_')));
    return imgManager;
  }, []);

  const scrollTo = useCallback((sl?: number, st?: number) => {
    scrollerRef.current?.scrollTo(sl, st);
  }, []);

  const scrollBy = useCallback((deltaX: number, deltaY: number) => {
    scrollerRef.current?.scrollBy(deltaX, deltaY);
  }, []);

  const scrollToItem = useCallback(
    (position: [columnIndex: number, rowIndex: number]) => {
      try {
        const { nextScrollLeft, nextScrollTop } = getScrollToItemTarget({
          position,
          coordInstance,
          scrollState,
          real2RowIndex,
          cellScrollBuffer,
        });

        if (nextScrollLeft != null) {
          scrollTo(nextScrollLeft, undefined);
        }

        if (nextScrollTop != null) {
          scrollTo(undefined, nextScrollTop);
        }
      } catch (error) {
        console.error('scrollToItem error', error);
      }
    },
    [coordInstance, scrollState, scrollTo, real2RowIndex]
  );

  const onMouseDown = () => {
    containerRef.current?.focus();
  };

  const { rowInitSize } = coordInstance;

  return (
    <div className="size-full" style={style} ref={ref}>
      <div
        data-t-grid-container
        ref={containerRef}
        tabIndex={0}
        className="relative outline-none"
        onMouseDown={onMouseDown}
      >
        {isTouchDevice ? (
          <TouchLayer
            width={width}
            height={height}
            theme={theme}
            columns={columns}
            commentCountMap={commentCountMap}
            mouseState={mouseState}
            scrollState={scrollState}
            rowControls={rowControls}
            collaborators={collaborators}
            searchCursor={searchCursor}
            searchHitIndex={searchHitIndex}
            imageManager={imageManager}
            spriteManager={spriteManager}
            coordInstance={coordInstance}
            columnStatistics={columnStatistics}
            collapsedGroupIds={collapsedGroupIds}
            columnHeaderHeight={columnHeaderHeight}
            forceRenderFlag={forceRenderFlag}
            rowIndexVisible={rowIndexVisible}
            groupCollection={groupCollection}
            getLinearRow={getLinearRow}
            real2RowIndex={real2RowIndex}
            getCellContent={getCellContent}
            setMouseState={setMouseState}
            setActiveCell={setActiveCell}
            onDelete={onDelete}
            onRowAppend={onRowAppend}
            onRowExpand={onRowExpand}
            onCellEdited={onCellEdited}
            onContextMenu={onContextMenu}
            onColumnAppend={onColumnAppend}
            onColumnHeaderClick={onColumnHeaderClick}
            onColumnStatisticClick={onColumnStatisticClick}
            onCollapsedGroupChanged={onCollapsedGroupChanged}
            onSelectionChanged={onSelectionChanged}
          />
        ) : (
          <InteractionLayer
            ref={interactionLayerRef}
            width={width}
            height={height}
            theme={theme}
            columns={columns}
            commentCountMap={commentCountMap}
            draggable={draggable}
            selectable={selectable}
            collaborators={collaborators}
            searchCursor={searchCursor}
            searchHitIndex={searchHitIndex}
            rowControls={rowControls}
            imageManager={imageManager}
            spriteManager={spriteManager}
            coordInstance={coordInstance}
            columnStatistics={columnStatistics}
            collapsedGroupIds={collapsedGroupIds}
            columnHeaderHeight={columnHeaderHeight}
            isMultiSelectionEnable={isMultiSelectionEnable}
            activeCell={activeCell}
            mouseState={mouseState}
            scrollState={scrollState}
            activeCellBound={activeCellBound}
            forceRenderFlag={forceRenderFlag}
            rowIndexVisible={rowIndexVisible}
            groupCollection={groupCollection}
            getLinearRow={getLinearRow}
            real2RowIndex={real2RowIndex}
            getCellContent={getCellContent}
            setMouseState={setMouseState}
            setActiveCell={setActiveCell}
            scrollToItem={scrollToItem}
            scrollBy={scrollBy}
            onUndo={onUndo}
            onRedo={onRedo}
            onCopy={onCopy}
            onPaste={onPaste}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onRowAppend={onRowAppend}
            onRowExpand={onRowExpand}
            onRowOrdered={onRowOrdered}
            onCellEdited={onCellEdited}
            onCellDblClick={onCellDblClick}
            onContextMenu={onContextMenu}
            onColumnAppend={onColumnAppend}
            onColumnResize={onColumnResize}
            onColumnOrdered={onColumnOrdered}
            onColumnHeaderClick={onColumnHeaderClick}
            onColumnStatisticClick={onColumnStatisticClick}
            onColumnHeaderDblClick={onColumnHeaderDblClick}
            onColumnHeaderMenuClick={onColumnHeaderMenuClick}
            onCollapsedGroupChanged={onCollapsedGroupChanged}
            onGroupHeaderContextMenu={onGroupHeaderContextMenu}
            onSelectionChanged={onSelectionChanged}
            onColumnFreeze={onColumnFreeze}
            onItemHovered={onItemHovered}
            onItemClick={onItemClick}
            onFillSelection={onFillSelection}
            onRowControlClick={onRowControlClick}
            onRowRangeSelected={onRowRangeSelected}
          />
        )}
      </div>

      <InfiniteScroller
        ref={scrollerRef}
        coordInstance={coordInstance}
        top={rowInitSize}
        left={columnInitSize}
        containerWidth={width}
        containerHeight={containerHeight}
        scrollWidth={totalWidth}
        scrollHeight={totalHeight}
        smoothScrollX={smoothScrollX}
        smoothScrollY={smoothScrollY}
        scrollBarVisible={scrollBarVisible}
        containerRef={containerRef}
        scrollState={scrollState}
        scrollEnable={scrollEnable}
        getLinearRow={getLinearRow}
        setScrollState={setScrollState}
        onScrollChanged={onScrollChanged}
        onVisibleRegionChanged={onVisibleRegionChanged}
      />

      <LoadingIndicator
        cellLoadings={cellLoadings}
        columnLoadings={columnLoadings}
        coordInstance={coordInstance}
        scrollState={scrollState}
        real2RowIndex={real2RowIndex}
      />

      <ErrorIndicator
        cellErrors={cellErrors}
        coordInstance={coordInstance}
        scrollState={scrollState}
      />
    </div>
  );
};

export const Grid = forwardRef(GridBase);
