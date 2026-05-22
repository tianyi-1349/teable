import { CombinedSelection, RowControlType, SelectionRegionType, RegionType } from '@teable/sdk';
import {
  buildGridRowControls,
  getFieldsForColumnSelection,
  getFieldsForSingleColumn,
  getGroupHeaderMenuState,
  getHeaderMenuPosition,
  getHoverTooltipRequest,
  getRowRangesFromSelection,
  getSelectedColumnRange,
  getSelectedFieldIdsFromColumns,
} from './GridViewBaseInner';

describe('buildGridRowControls', () => {
  it('keeps touch devices focused on record detail entry', () => {
    expect(
      buildGridRowControls({
        isTouchDevice: true,
        canDragRow: true,
      })
    ).toEqual([
      {
        type: RowControlType.Expand,
        icon: RowControlType.Expand,
      },
    ]);
  });

  it('keeps desktop checkbox and expand controls, plus drag when allowed', () => {
    expect(
      buildGridRowControls({
        isTouchDevice: false,
        canDragRow: true,
      })
    ).toEqual([
      {
        type: RowControlType.Drag,
        icon: RowControlType.Drag,
      },
      {
        type: RowControlType.Checkbox,
        icon: RowControlType.Checkbox,
      },
      {
        type: RowControlType.Expand,
        icon: RowControlType.Expand,
      },
    ]);
  });

  it('keeps desktop checkbox and expand controls when drag is unavailable', () => {
    expect(
      buildGridRowControls({
        isTouchDevice: false,
        canDragRow: false,
      })
    ).toEqual([
      {
        type: RowControlType.Checkbox,
        icon: RowControlType.Checkbox,
      },
      {
        type: RowControlType.Expand,
        icon: RowControlType.Expand,
      },
    ]);
  });
});

describe('getRowRangesFromSelection', () => {
  it('returns the selected row range for cell selections', () => {
    expect(
      getRowRangesFromSelection(
        new CombinedSelection(SelectionRegionType.Cells, [
          [1, 5],
          [3, 2],
        ])
      )
    ).toEqual([[2, 5]]);
  });

  it('normalizes each row selection range independently', () => {
    expect(
      getRowRangesFromSelection(
        new CombinedSelection(SelectionRegionType.Rows, [
          [7, 4],
          [2, 2],
        ])
      )
    ).toEqual([
      [2, 2],
      [4, 7],
    ]);
  });

  it('returns null for column-only selections', () => {
    expect(
      getRowRangesFromSelection(
        new CombinedSelection(SelectionRegionType.Columns, [
          [0, 3],
          [0, 5],
        ])
      )
    ).toBeNull();
  });
});

describe('getSelectedColumnRange', () => {
  it('normalizes reversed cell selections', () => {
    expect(
      getSelectedColumnRange(
        new CombinedSelection(SelectionRegionType.Cells, [
          [4, 0],
          [1, 0],
        ])
      )
    ).toEqual([1, 4]);
  });

  it('returns null for non-cell selections', () => {
    expect(
      getSelectedColumnRange(
        new CombinedSelection(SelectionRegionType.Rows, [
          [0, 1],
          [0, 3],
        ])
      )
    ).toBeNull();
  });
});

describe('getSelectedFieldIdsFromColumns', () => {
  it('collects field ids in normalized column order', () => {
    const selection = new CombinedSelection(SelectionRegionType.Cells, [
      [3, 2],
      [1, 2],
    ]);

    expect(
      getSelectedFieldIdsFromColumns(selection, [
        { id: 'fld0' },
        { id: 'fld1' },
        { id: 'fld2' },
        { id: 'fld3' },
      ])
    ).toEqual(['fld1', 'fld2', 'fld3']);
  });
});

describe('grid view interaction wiring helpers', () => {
  it('collects a single visible field for header menu actions', () => {
    expect(
      getFieldsForSingleColumn(
        [{ id: 'fld0' }, { id: 'fld1' }, { id: 'fld2' }],
        [{ id: 'fld0' }, { id: 'fld2' }],
        2
      )
    ).toEqual([{ id: 'fld2' }]);
  });

  it('collects visible fields for normalized column selections', () => {
    const selection = new CombinedSelection(SelectionRegionType.Columns, [[3, 1]]);

    expect(
      getFieldsForColumnSelection(
        selection,
        [{ id: 'fld0' }, { id: 'fld1' }, { id: 'fld2' }, { id: 'fld3' }],
        [{ id: 'fld0' }, { id: 'fld1' }, { id: 'fld3' }]
      )
    ).toEqual([{ id: 'fld1' }, { id: 'fld3' }]);
  });

  it('maps header bounds to menu positions', () => {
    expect(getHeaderMenuPosition({ x: 180, height: 32 })).toEqual({ x: 180, y: 32 });
  });

  it('preserves group header menu state payload', () => {
    const refs = [{ id: 'g0', depth: 0 }];
    expect(getGroupHeaderMenuState('g1', { x: 10, y: 20 }, refs)).toEqual({
      groupId: 'g1',
      position: { x: 10, y: 20 },
      allGroupHeaderRefs: refs,
    });
  });

  it('builds hover tooltip requests for description, primary key, and autosort drag regions', () => {
    const bounds = { x: 1, y: 2, width: 3, height: 4 };
    const t = (key: string) => key;
    const componentId = 'grid-view-1';

    expect(
      getHoverTooltipRequest({
        type: RegionType.ColumnDescription,
        description: 'Field description',
        bounds,
        componentId,
        isAutoSort: false,
        t,
      })
    ).toEqual({
      id: componentId,
      text: 'Field description',
      position: bounds,
    });

    expect(
      getHoverTooltipRequest({
        type: RegionType.ColumnPrimaryIcon,
        bounds,
        componentId,
        isAutoSort: false,
        t,
      })
    ).toEqual({
      id: componentId,
      text: 'sdk:hidden.primaryKey',
      position: bounds,
    });

    expect(
      getHoverTooltipRequest({
        type: RegionType.RowHeaderDragHandler,
        bounds,
        componentId,
        isAutoSort: true,
        t,
      })
    ).toEqual({
      id: componentId,
      text: 'table:view.dragToolTip',
      position: bounds,
    });
  });

  it('returns null when hover region has no tooltip contract', () => {
    expect(
      getHoverTooltipRequest({
        type: RegionType.Cell,
        bounds: { x: 1, y: 2, width: 3, height: 4 },
        componentId: 'grid-view-1',
        isAutoSort: true,
        t: (key: string) => key,
      })
    ).toBeNull();
  });
});
