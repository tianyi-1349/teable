import { Spin } from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';
import { useBaseQueryData } from '../../../hooks/useBaseQueryData';
import type {
  IBoxplotConfig,
  ICandlestickConfig,
  IFunnelConfig,
  IGaugeConfig,
  IGraphConfig,
  IHeatmapConfig,
  IParallelConfig,
  IPictorialBarConfig,
  IProgressConfig,
  IRadarConfig,
  IRoseConfig,
  ISankeyConfig,
  IScatterConfig,
  ISunburstConfig,
  IThemeRiverConfig,
  ITreemapConfig,
  IWordCloudConfig,
} from '../../../types';
import { ChartContext } from '../../ChartProvider';
import { ChartCombo } from './combo/Combo';
import {
  ChartBoxplot,
  ChartCandlestick,
  ChartGauge,
  ChartGraph,
  ChartHeatmap,
  ChartParallel,
  ChartPictorialBar,
  ChartSankey,
  ChartSunburst,
  ChartThemeRiver,
  ChartTreemap,
  ChartWordCloud,
} from './echarts/EChartsAdvanced';
import { ChartFunnel } from './funnel/Funnel';
import { ChartPie } from './pie/Pie';
import { ChartProgress } from './progress/Progress';
import { ChartRadar } from './radar/Radar';
import { ChartRose } from './rose/Rose';
import { ChartScatter } from './scatter/Scatter';
import { ChartTable } from './table/ChartTable';

export const ChartDisplay = (props: { previewTable?: boolean }) => {
  const { previewTable } = props;
  const { storage, queryError } = useContext(ChartContext);
  const queryData = useBaseQueryData();

  const { t } = useTranslation('chart');

  if (queryError) {
    return (
      <div className="font-sm text-destructive flex size-full items-center justify-center text-center">
        Error: {queryError}
      </div>
    );
  }

  if (!queryData) {
    return (
      <div>
        <Spin />
      </div>
    );
  }

  if (previewTable) {
    return <ChartTable />;
  }
  if (!storage?.config?.type) {
    return;
  }
  switch (storage?.config?.type) {
    case 'bar':
    case 'line':
    case 'area':
      return <ChartCombo config={storage.config} defaultType={storage?.config?.type} />;
    case 'pie':
      return <ChartPie config={storage.config} />;
    case 'table':
      return <ChartTable config={storage.config} />;
    case 'scatter':
      return <ChartScatter config={storage.config as IScatterConfig} />;
    case 'funnel':
      return <ChartFunnel config={storage.config as IFunnelConfig} />;
    case 'progress':
      return <ChartProgress config={storage.config as IProgressConfig} />;
    case 'rose':
      return <ChartRose config={storage.config as IRoseConfig} />;
    case 'radar':
      return <ChartRadar config={storage.config as IRadarConfig} />;
    case 'gauge':
      return <ChartGauge config={storage.config as IGaugeConfig} />;
    case 'heatmap':
      return <ChartHeatmap config={storage.config as IHeatmapConfig} />;
    case 'sunburst':
      return <ChartSunburst config={storage.config as ISunburstConfig} />;
    case 'candlestick':
      return <ChartCandlestick config={storage.config as ICandlestickConfig} />;
    case 'boxplot':
      return <ChartBoxplot config={storage.config as IBoxplotConfig} />;
    case 'parallel':
      return <ChartParallel config={storage.config as IParallelConfig} />;
    case 'pictorialBar':
      return <ChartPictorialBar config={storage.config as IPictorialBarConfig} />;
    case 'treemap':
      return <ChartTreemap config={storage.config as ITreemapConfig} />;
    case 'sankey':
      return <ChartSankey config={storage.config as ISankeyConfig} />;
    case 'graph':
      return <ChartGraph config={storage.config as IGraphConfig} />;
    case 'map':
      return <div>{t('notSupport')}</div>;
    case 'themeRiver':
      return <ChartThemeRiver config={storage.config as IThemeRiverConfig} />;
    case 'wordCloud':
      return <ChartWordCloud config={storage.config as IWordCloudConfig} />;
    default:
      return <div>{t('notSupport')}</div>;
  }
};
