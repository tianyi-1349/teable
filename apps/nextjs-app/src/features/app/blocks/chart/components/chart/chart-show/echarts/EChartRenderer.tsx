import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import { Chart } from '@/features/app/components/Chart/Chart';

class OptionChart {
  constructor(private option: EChartsOption) {}
  getOptions() {
    return this.option;
  }
}

const fallback = (rows: Record<string, unknown>[]): OptionChart => {
  const keys = Object.keys(rows[0] ?? {});
  const first = keys[0];
  const second = keys[1];
  const option = {
    xAxis: { type: 'category', data: rows.map((r) => String(r[first] ?? '')) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: rows.map((r) => Number(r[second] ?? 0)) }],
  } satisfies EChartsOption;
  return new OptionChart(option);
};

export const EChartRenderer = (props: {
  option?: EChartsOption;
  rows: Record<string, unknown>[];
}) => {
  const { option, rows } = props;

  const chartInstance = useMemo(() => {
    if (option) {
      return new OptionChart(option);
    }

    if (rows.length > 0 && Object.keys(rows[0] ?? {}).length >= 2) {
      return fallback(rows);
    }

    return new OptionChart({
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [] }],
    });
  }, [option, rows]);

  return <Chart chartInstance={chartInstance} />;
};
