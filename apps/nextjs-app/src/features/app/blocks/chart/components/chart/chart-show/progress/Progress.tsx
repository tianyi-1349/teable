import { useBaseQueryData } from '../../../../hooks/useBaseQueryData';
import type { IProgressConfig } from '../../../../types';
import { buildProgressOption } from '../echarts/builders';
import { EChartRenderer } from '../echarts/EChartRenderer';

export const ChartProgress = (props: { config: IProgressConfig }) => {
  const { config } = props;
  const queryData = useBaseQueryData();
  const rows = queryData?.rows ?? [];
  return <EChartRenderer option={buildProgressOption(config, rows)} rows={rows} />;
};
