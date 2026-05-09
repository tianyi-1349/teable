import type { EChartsOption } from 'echarts';
import { useBaseQueryData } from '../../../../hooks/useBaseQueryData';
import type { IRadarConfig } from '../../../../types';
import { EChartRenderer } from '../echarts/EChartRenderer';

export const ChartRadar = (props: { config: IRadarConfig }) => {
  const { config } = props;
  const queryData = useBaseQueryData();
  const rows = queryData?.rows ?? [];

  const dimensions = config.dimensions ?? [];
  const value = config.value;

  if (dimensions.length === 0 || !value) {
    return <EChartRenderer option={undefined} rows={rows} />;
  }

  const values = rows.map((r) => Number(r[value] ?? 0));
  const maxValue = Math.max(100, ...values);

  const option: EChartsOption = {
    tooltip: {},
    legend: config.showLegend !== false ? { left: 'center' } : undefined,
    grid: config.padding
      ? {
          top: config.padding.top ?? 40,
          right: config.padding.right ?? 40,
          bottom: config.padding.bottom ?? 40,
          left: config.padding.left ?? 40,
        }
      : undefined,
    radar: {
      indicator: dimensions.map((dim) => ({
        name: dim,
        max: maxValue,
      })),
    },
    series: [
      {
        type: 'radar' as const,
        data: [
          {
            value: rows.map((r) => Number(r[value] ?? 0)),
          },
        ],
      },
    ],
  };

  return <EChartRenderer option={option} rows={rows} />;
};
