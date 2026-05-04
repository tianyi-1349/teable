import { render } from '@/test-utils';
import { Chart } from './Chart';

const { initMock, getInstanceByDomMock } = vi.hoisted(() => ({
  initMock: vi.fn(),
  getInstanceByDomMock: vi.fn(),
}));

vi.mock('echarts', () => ({
  init: initMock,
  getInstanceByDom: getInstanceByDomMock,
}));

describe('Chart', () => {
  const resizeMock = vi.fn();
  const setOptionMock = vi.fn();
  const disposeMock = vi.fn();

  let resizeObserverCallback: ResizeObserverCallback | null = null;

  beforeEach(() => {
    vi.clearAllMocks();

    resizeObserverCallback = null;

    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeObserverCallback = callback;
      }
      observe = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    getInstanceByDomMock.mockReturnValue(null);
    initMock.mockReturnValue({
      resize: resizeMock,
      setOption: setOptionMock,
      dispose: disposeMock,
    });
  });

  it('initializes once, updates option, resizes and disposes on unmount', () => {
    const chartInstance = {
      getOptions: vi.fn(() => ({ series: [{ type: 'bar', data: [1, 2, 3] }] })),
    };

    const { unmount, rerender } = render(
      <Chart
        chartInstance={chartInstance as unknown as Parameters<typeof Chart>[0]['chartInstance']}
      />
    );

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(getInstanceByDomMock).toHaveBeenCalledTimes(1);
    expect(setOptionMock).toHaveBeenCalledTimes(1);
    expect(setOptionMock).toHaveBeenLastCalledWith(
      chartInstance.getOptions(),
      expect.objectContaining({ notMerge: true, lazyUpdate: true })
    );

    const nextInstance = {
      getOptions: vi.fn(() => ({ series: [{ type: 'line', data: [3, 2, 1] }] })),
    };

    rerender(
      <Chart
        chartInstance={nextInstance as unknown as Parameters<typeof Chart>[0]['chartInstance']}
      />
    );

    expect(setOptionMock).toHaveBeenCalledTimes(2);
    expect(setOptionMock).toHaveBeenLastCalledWith(
      nextInstance.getOptions(),
      expect.objectContaining({ notMerge: true, lazyUpdate: true })
    );

    const chartContainer = document.querySelector('.size-full.overflow-hidden.p-2') as Element;
    resizeObserverCallback?.(
      [
        {
          target: chartContainer,
          contentRect: { width: 500, height: 300 } as DOMRectReadOnly,
        } as ResizeObserverEntry,
      ],
      {} as ResizeObserver
    );

    expect(resizeMock).toHaveBeenCalledWith({ width: 500, height: 300 });

    unmount();
    expect(disposeMock).toHaveBeenCalledTimes(1);
  });

  it('uses merge mode when updateMode is merge', () => {
    const chartInstance = {
      getOptions: vi.fn(() => ({ series: [{ type: 'bar', data: [1, 2, 3] }] })),
    };

    render(
      <Chart
        chartInstance={chartInstance as unknown as Parameters<typeof Chart>[0]['chartInstance']}
        updateMode="merge"
      />
    );

    expect(setOptionMock).toHaveBeenCalledTimes(1);
    expect(setOptionMock).toHaveBeenLastCalledWith(
      chartInstance.getOptions(),
      expect.objectContaining({ notMerge: false, lazyUpdate: true })
    );
  });

  it('reuses existing chart instance from dom when available', () => {
    const existingSetOption = vi.fn();
    const existingResize = vi.fn();
    const existingDispose = vi.fn();

    getInstanceByDomMock.mockReturnValue({
      setOption: existingSetOption,
      resize: existingResize,
      dispose: existingDispose,
    });

    const chartInstance = {
      getOptions: vi.fn(() => ({ series: [{ type: 'bar', data: [4, 5, 6] }] })),
    };

    const { unmount } = render(
      <Chart
        chartInstance={chartInstance as unknown as Parameters<typeof Chart>[0]['chartInstance']}
      />
    );

    expect(initMock).not.toHaveBeenCalled();
    expect(existingSetOption).toHaveBeenCalledTimes(1);

    unmount();
    expect(existingDispose).toHaveBeenCalledTimes(1);
  });
});
