import { render } from '@testing-library/react';
import { act, createRef, forwardRef, useImperativeHandle } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Grid, type IGridRef } from './Grid';
import { SelectionRegionType } from './interface';

const MockInteractionLayer = forwardRef((props: Record<string, unknown>, ref) => {
  useImperativeHandle(ref, () => interactionApi);
  return <div data-testid="interaction-layer" data-props={JSON.stringify(Object.keys(props))} />;
});

MockInteractionLayer.displayName = 'MockInteractionLayer';

const MockInfiniteScroller = forwardRef((props: Record<string, unknown>, ref) => {
  latestInfiniteScrollerProps = props;
  useImperativeHandle(ref, () => scrollerApi);
  return <div data-testid="infinite-scroller" />;
});

MockInfiniteScroller.displayName = 'MockInfiniteScroller';

const interactionApi = {
  resetState: vi.fn(),
  setSelection: vi.fn(),
  isEditing: vi.fn(() => true),
};

const scrollerApi = {
  scrollTo: vi.fn(),
  scrollBy: vi.fn(),
};

let latestInfiniteScrollerProps: Record<string, unknown> | null = null;

vi.mock('./hooks', async () => {
  const actual = await vi.importActual('./hooks');
  return {
    ...actual,
    useResizeObserver: () => ({
      ref: { current: null },
      width: 400,
      height: 240,
    }),
  };
});

vi.mock('./InteractionLayer', () => ({
  InteractionLayer: MockInteractionLayer,
}));

vi.mock('./InfiniteScroller', () => ({
  InfiniteScroller: MockInfiniteScroller,
}));

vi.mock('./TouchLayer', () => ({
  TouchLayer: () => <div data-testid="touch-layer" />,
}));

vi.mock('./components', () => ({
  LoadingIndicator: () => null,
  ErrorIndicator: () => null,
}));

const baseProps = () => ({
  columns: [
    { name: 'A', width: 100 },
    { name: 'B', width: 100 },
    { name: 'C', width: 100 },
    { name: 'D', width: 100 },
  ],
  rowCount: 10,
  getCellContent: vi.fn(() => ({ type: 'text', data: null }) as never),
});

describe('Grid', () => {
  beforeEach(() => {
    interactionApi.resetState.mockClear();
    interactionApi.setSelection.mockClear();
    interactionApi.isEditing.mockClear();
    scrollerApi.scrollTo.mockClear();
    scrollerApi.scrollBy.mockClear();
    latestInfiniteScrollerProps = null;
  });

  test('delegates resetState, setSelection and isEditing through IGridRef', () => {
    const ref = createRef<IGridRef>();
    render(<Grid {...baseProps()} ref={ref} />);

    act(() => {
      ref.current?.resetState();
      ref.current?.setSelection({ type: SelectionRegionType.Cells, ranges: [[2, 3]] } as never);
    });

    expect(interactionApi.resetState).toHaveBeenCalledTimes(1);
    expect(interactionApi.setSelection).toHaveBeenCalledWith({
      type: SelectionRegionType.Cells,
      ranges: [[2, 3]],
    });
    expect(ref.current?.isEditing()).toBe(true);
  });

  test('scrollToItem forwards computed scroll targets to scroller', () => {
    const ref = createRef<IGridRef>();
    render(<Grid {...baseProps()} ref={ref} />);

    act(() => {
      ref.current?.scrollToItem([3, 6]);
    });

    expect(scrollerApi.scrollTo).toHaveBeenNthCalledWith(1, 64, undefined);
    expect(scrollerApi.scrollTo).toHaveBeenNthCalledWith(2, undefined, 16);
  });

  test('exposes getCellBounds and getContainer through IGridRef', () => {
    const ref = createRef<IGridRef>();
    render(<Grid {...baseProps()} ref={ref} />);

    expect(ref.current?.getCellBounds([2, 3])).toEqual({
      x: 248,
      y: 128,
      width: 100,
      height: 32,
    });
    expect(ref.current?.getContainer()).toBeInstanceOf(HTMLDivElement);
  });

  test('passes disabled scroll state and callbacks into InfiniteScroller', () => {
    const onScrollChanged = vi.fn();
    const onVisibleRegionChanged = vi.fn();
    render(
      <Grid
        {...baseProps()}
        onScrollChanged={onScrollChanged}
        onVisibleRegionChanged={onVisibleRegionChanged}
      />
    );

    expect(latestInfiniteScrollerProps).toMatchObject({
      scrollEnable: false,
      onScrollChanged,
      onVisibleRegionChanged,
    });
  });
});
