import {
  CellType,
  DraggableType,
  Grid,
  LinearRowType,
  RowControlType,
  useGridIcons,
  useGridTheme,
} from '@teable/sdk/components';
import type {
  CombinedSelection,
  ICell,
  ICellItem,
  IGridRef,
  IGroupCollection,
  IGroupPoint,
  IPosition,
  IRectangle,
} from '@teable/sdk/components';
import { AppProvider } from '@teable/sdk/context';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const columns = [
  {
    id: 'primary',
    name: 'Primary',
    width: 180,
    isPrimary: true,
    description: 'Primary field description',
    statisticLabel: { label: 'Summary', showAlways: true },
  },
  {
    id: 'status',
    name: 'Status',
    width: 160,
    statisticLabel: { label: 'Group', showAlways: true },
  },
  {
    id: 'score',
    name: 'Score',
    width: 140,
    statisticLabel: { label: 'Total', showAlways: true },
  },
  {
    id: 'flag',
    name: 'Flag',
    width: 120,
    statisticLabel: { label: 'Checked', showAlways: true },
  },
];

const records = [
  ['Alpha', 'Queued', '12', true],
  ['Bravo', 'Running', '24', false],
  ['Charlie', 'Done', '18', true],
  ['Delta', 'Blocked', '6', false],
  ['Echo', 'Queued', '30', true],
  ['Foxtrot', 'Done', '15', true],
  ['Golf', 'Queued', '42', false],
  ['Hotel', 'Running', '27', true],
  ['India', 'Done', '33', false],
  ['Juliet', 'Blocked', '9', true],
  ['Kilo', 'Queued', '21', false],
  ['Lima', 'Done', '39', true],
];

const groupPoints: IGroupPoint[] = [
  { type: LinearRowType.Group, id: 'group-a', depth: 0, value: 'North', isCollapsed: false },
  { type: LinearRowType.Row, count: 6 },
  { type: LinearRowType.Group, id: 'group-b', depth: 0, value: 'South', isCollapsed: false },
  { type: LinearRowType.Row, count: 6 },
];

const columnStatistics = {
  primary: { total: '12 records', 'group-a': '6 records', 'group-b': '6 records' },
  status: { total: '4 states', 'group-a': '6 states', 'group-b': '6 states' },
  score: { total: '276', 'group-a': '105', 'group-b': '171' },
  flag: { total: '6 true', 'group-a': '3 true', 'group-b': '3 true' },
};

const groupCollection: IGroupCollection = {
  groupColumns: [columns[0]],
  getGroupCell: (cellValue: unknown) => ({
    type: CellType.Text,
    data: String(cellValue),
    displayData: String(cellValue),
  }),
};

const getCellContent = ([columnIndex, rowIndex]: ICellItem): ICell => {
  const row = records[rowIndex];
  const value = row?.[columnIndex];

  if (columnIndex === 2) {
    return {
      type: CellType.Number,
      data: Number(value),
      displayData: String(value ?? ''),
    };
  }

  if (columnIndex === 3) {
    return {
      type: CellType.Boolean,
      data: Boolean(value),
    };
  }

  return {
    id: `rec-${rowIndex}-col-${columnIndex}`,
    type: CellType.Text,
    data: String(value ?? ''),
    displayData: String(value ?? ''),
  };
};

function GridRuntimePreviewContent() {
  const theme = useGridTheme();
  const customIcons = useGridIcons();
  const gridRef = useRef<IGridRef>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [selectionText, setSelectionText] = useState('none');
  const [headerClickText, setHeaderClickText] = useState('none');
  const [headerDblClickText, setHeaderDblClickText] = useState('none');
  const [groupMenuText, setGroupMenuText] = useState('none');
  const [scrollText, setScrollText] = useState('0,0');
  const [boundsText, setBoundsText] = useState('none');
  const [visibleRegionText, setVisibleRegionText] = useState('none');

  const rowControls = useMemo(
    () => [{ type: RowControlType.Expand }, { type: RowControlType.Checkbox }],
    []
  );

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  const onSelectionChanged = useCallback((selection: CombinedSelection) => {
    setSelectionText(`${selection.type}:${JSON.stringify(selection.serialize())}`);
  }, []);

  const onColumnHeaderClick = useCallback((colIndex: number, bounds: IRectangle) => {
    setHeaderClickText(`${colIndex}:${Math.round(bounds.x)},${Math.round(bounds.width)}`);
  }, []);

  const onColumnHeaderDblClick = useCallback((colIndex: number, bounds: IRectangle) => {
    setHeaderDblClickText(`${colIndex}:${Math.round(bounds.x)},${Math.round(bounds.width)}`);
  }, []);

  const onGroupHeaderContextMenu = useCallback((groupId: string, position: IPosition) => {
    setGroupMenuText(`${groupId}:${Math.round(position.x)},${Math.round(position.y)}`);
  }, []);

  const onScrollChanged = useCallback((scrollLeft = 0, scrollTop = 0) => {
    setScrollText(`${Math.round(scrollLeft)},${Math.round(scrollTop)}`);
  }, []);

  const onVisibleRegionChanged = useCallback((rect: IRectangle) => {
    setVisibleRegionText(
      `${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.width)},${Math.round(rect.height)}`
    );
  }, []);

  const handleScrollToTarget = () => {
    gridRef.current?.scrollToItem([3, 11]);
  };

  const handleReadBounds = () => {
    const bounds = gridRef.current?.getCellBounds([2, 10]);
    setBoundsText(bounds ? JSON.stringify(bounds) : 'null');
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Grid Runtime Preview</h1>
          <p className="text-sm text-slate-300">
            Real-browser preview for rendering, header interaction, grouped rows, statistics, and
            imperative scroll behavior.
          </p>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded border border-slate-700 bg-slate-900 p-3">
            <div className="text-xs text-slate-400">Selection</div>
            <div data-testid="selection-state" className="mt-1 break-all text-sm">
              {selectionText}
            </div>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900 p-3">
            <div className="text-xs text-slate-400">Header Click</div>
            <div data-testid="header-click-state" className="mt-1 text-sm">
              {headerClickText}
            </div>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900 p-3">
            <div className="text-xs text-slate-400">Header Double Click</div>
            <div data-testid="header-dblclick-state" className="mt-1 text-sm">
              {headerDblClickText}
            </div>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900 p-3">
            <div className="text-xs text-slate-400">Group Context Menu</div>
            <div data-testid="group-menu-state" className="mt-1 text-sm">
              {groupMenuText}
            </div>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900 p-3">
            <div className="text-xs text-slate-400">Scroll</div>
            <div data-testid="scroll-state" className="mt-1 text-sm">
              {scrollText}
            </div>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900 p-3">
            <div className="text-xs text-slate-400">Visible Region</div>
            <div data-testid="visible-region-state" className="mt-1 break-all text-sm">
              {visibleRegionText}
            </div>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900 p-3 md:col-span-2">
            <div className="text-xs text-slate-400">Cell Bounds</div>
            <div data-testid="bounds-state" className="mt-1 break-all text-sm">
              {boundsText}
            </div>
          </div>
        </section>

        <section className="flex gap-3">
          <button
            type="button"
            data-testid="scroll-target"
            onClick={handleScrollToTarget}
            className="rounded bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950"
          >
            Scroll To Target Cell
          </button>
          <button
            type="button"
            data-testid="read-bounds"
            onClick={handleReadBounds}
            className="rounded border border-slate-600 px-3 py-2 text-sm"
          >
            Read Cell Bounds
          </button>
        </section>

        <section
          data-testid="grid-preview-shell"
          className="rounded-xl border border-slate-700 bg-slate-900 p-4"
        >
          <div data-testid="grid-client-state" className="sr-only">
            {isClientMounted ? 'mounted' : 'ssr'}
          </div>
          <div className="relative h-[260px] max-w-[520px] overflow-hidden rounded-lg bg-white">
            {isClientMounted ? (
              <Grid
                ref={gridRef}
                style={{ width: '100%', height: '100%' }}
                theme={theme}
                customIcons={customIcons}
                columns={columns}
                rowCount={records.length}
                rowControls={rowControls}
                freezeColumnCount={1}
                draggable={DraggableType.All}
                groupPoints={groupPoints}
                groupCollection={groupCollection}
                columnStatistics={columnStatistics}
                getCellContent={getCellContent}
                onSelectionChanged={onSelectionChanged}
                onColumnHeaderClick={onColumnHeaderClick}
                onColumnHeaderDblClick={onColumnHeaderDblClick}
                onGroupHeaderContextMenu={onGroupHeaderContextMenu}
                onScrollChanged={onScrollChanged}
                onVisibleRegionChanged={onVisibleRegionChanged}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function GridRuntimePreviewPage() {
  return (
    <AppProvider lang="en" disabledWs>
      <GridRuntimePreviewContent />
    </AppProvider>
  );
}
