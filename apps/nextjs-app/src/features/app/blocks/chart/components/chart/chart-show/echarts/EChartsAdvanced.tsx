import { useBaseQueryData } from '../../../../hooks/useBaseQueryData';
import type {
  IBoxplotConfig,
  ICandlestickConfig,
  IGaugeConfig,
  IGraphConfig,
  IHeatmapConfig,
  IMapConfig,
  IParallelConfig,
  IPictorialBarConfig,
  ISankeyConfig,
  ISunburstConfig,
  IThemeRiverConfig,
  ITreemapConfig,
  IWordCloudConfig,
} from '../../../../types';
import {
  buildBoxplotOption,
  buildCandlestickOption,
  buildGaugeOption,
  buildGraphOption,
  buildHeatmapOption,
  buildMapOption,
  buildParallelOption,
  buildPictorialBarOption,
  buildSankeyOption,
  buildSunburstOption,
  buildThemeRiverOption,
  buildTreemapOption,
  buildWordCloudOption,
} from './builders';
import { EChartRenderer } from './EChartRenderer';
import './wordcloud-loader';

export const ChartGauge = (props: { config: IGaugeConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildGaugeOption(props.config, rows)} rows={rows} />;
};

export const ChartHeatmap = (props: { config: IHeatmapConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildHeatmapOption(props.config, rows)} rows={rows} />;
};

export const ChartSunburst = (props: { config: ISunburstConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildSunburstOption(props.config, rows)} rows={rows} />;
};

export const ChartCandlestick = (props: { config: ICandlestickConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildCandlestickOption(props.config, rows)} rows={rows} />;
};

export const ChartBoxplot = (props: { config: IBoxplotConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildBoxplotOption(props.config, rows)} rows={rows} />;
};

export const ChartParallel = (props: { config: IParallelConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildParallelOption(props.config, rows)} rows={rows} />;
};

export const ChartPictorialBar = (props: { config: IPictorialBarConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildPictorialBarOption(props.config, rows)} rows={rows} />;
};

export const ChartTreemap = (props: { config: ITreemapConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildTreemapOption(props.config, rows)} rows={rows} />;
};

export const ChartSankey = (props: { config: ISankeyConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildSankeyOption(props.config, rows)} rows={rows} />;
};

export const ChartGraph = (props: { config: IGraphConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildGraphOption(props.config, rows)} rows={rows} />;
};

export const ChartMap = (props: { config: IMapConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildMapOption(props.config, rows)} rows={rows} />;
};

export const ChartThemeRiver = (props: { config: IThemeRiverConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildThemeRiverOption(props.config, rows)} rows={rows} />;
};

export const ChartWordCloud = (props: { config: IWordCloudConfig }) => {
  const rows = useBaseQueryData()?.rows ?? [];
  return <EChartRenderer option={buildWordCloudOption(props.config, rows)} rows={rows} />;
};
