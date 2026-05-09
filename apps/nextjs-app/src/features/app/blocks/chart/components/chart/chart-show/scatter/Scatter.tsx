import type { EChartsOption } from 'echarts';
import { useCallback, useContext } from 'react';
import { useBaseQueryData } from '../../../../hooks/useBaseQueryData';
import type { IScatterConfig } from '../../../../types';
import { ChartContext } from '../../../ChartProvider';
import { EChartRenderer } from '../echarts/EChartRenderer';

export const ChartScatter = (props: { config: IScatterConfig }) => {
  const { config } = props;
  const queryData = useBaseQueryData();
  const { onInteractionFilterChange } = useContext(ChartContext);

  const rows = queryData?.rows ?? [];
  const x = config.x;
  const y = config.y;
  const option: EChartsOption | undefined =
    x && y
      ? {
          xAxis: { type: 'value' as const },
          yAxis: { type: 'value' as const },
          tooltip: { trigger: 'item' },
          series: [
            {
              type: 'scatter' as const,
              symbolSize: config.pointSize ?? 10,
              data: rows.map((row) => [Number(row[x] ?? 0), Number(row[y] ?? 0)]),
            },
          ],
        }
      : undefined;

  const handleInteraction = useCallback(() => {
    if (x) {
      void onInteractionFilterChange({
        source: 'scatter',
        dimensionColumn: x,
        dimensionValues: [],
      });
    }
  }, [x, onInteractionFilterChange]);

  return (
    <div
      className="size-full"
      role="button"
      tabIndex={0}
      onClick={handleInteraction}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleInteraction();
        }
      }}
    >
      <EChartRenderer option={option} rows={rows} />
    </div>
  );
};
