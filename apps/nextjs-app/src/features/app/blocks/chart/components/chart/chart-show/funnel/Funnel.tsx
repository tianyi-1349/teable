import { useBaseQueryData } from '../../../../hooks/useBaseQueryData';
import type { IFunnelConfig } from '../../../../types';
import { buildFunnelOption } from '../echarts/builders';
import { EChartRenderer } from '../echarts/EChartRenderer';

export const ChartFunnel = (props: { config: IFunnelConfig }) => {
  const { config } = props;
  const queryData = useBaseQueryData();
  const rows = queryData?.rows ?? [];
  return <EChartRenderer option={buildFunnelOption(config, rows)} rows={rows} />;
};
