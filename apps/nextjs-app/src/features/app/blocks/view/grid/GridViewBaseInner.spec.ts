import { CombinedSelection, RowControlType, SelectionRegionType } from '@teable/sdk';
import {
  buildGridRowControls,
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
