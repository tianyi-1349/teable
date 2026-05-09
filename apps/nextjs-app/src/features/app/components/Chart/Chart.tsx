import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useEffect, useRef } from 'react';

type ChartUpdateMode = 'replace' | 'merge';

export const Chart = (props: {
  chartInstance: { getOptions: () => EChartsOption };
  updateMode?: ChartUpdateMode;
}) => {
  const { chartInstance, updateMode = 'replace' } = props;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) {
      return;
    }

    // Reuse an existing instance for React strict mode remounts.
    chartRef.current = echarts.getInstanceByDom(container) || echarts.init(container);

    const resizeObserver = new ResizeObserver((entries) => {
      const chart = chartRef.current;
      if (!chart) {
        return;
      }
      entries.forEach((entry) => {
        chart.resize({ width: entry.contentRect.width, height: entry.contentRect.height });
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    chart.setOption(chartInstance.getOptions(), {
      notMerge: updateMode === 'replace',
      lazyUpdate: true,
    });
  }, [chartInstance, updateMode]);

  return (
    <div
      ref={chartContainerRef}
      className={'size-full overflow-hidden p-2'}
      style={{ minHeight: '300px', minWidth: '200px' }}
    />
  );
};
