import { useBaseQueryData } from '../../../../hooks/useBaseQueryData';
import type { IRoseConfig } from '../../../../types';
import { buildRoseOption } from '../echarts/builders';
import { EChartRenderer } from '../echarts/EChartRenderer';

export const ChartRose = (props: { config: IRoseConfig }) => {
  const { config } = props;
  const queryData = useBaseQueryData();
  const rows = queryData?.rows ?? [];
  return (
    <EChartRenderer
      option={buildRoseOption(
        config.dimension,
        config.value,
        rows,
        config.showLegend,
        config.showLabel,
        config.padding
      )}
      rows={rows}
    />
  );
};
