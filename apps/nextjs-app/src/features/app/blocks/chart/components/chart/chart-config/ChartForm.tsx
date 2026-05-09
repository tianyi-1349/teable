import { useTranslation } from 'next-i18next';
import type { IChartConfig } from '../../../types';
import { AreaForm } from './form/AreaForm';
import { BarForm } from './form/BarForm';
import { BoxplotForm } from './form/BoxplotForm';
import { CandlestickForm } from './form/CandlestickForm';
import { FunnelForm } from './form/FunnelForm';
import { GaugeForm } from './form/GaugeForm';
import { GraphForm } from './form/GraphForm';
import { HeatmapForm } from './form/HeatmapForm';
import { LineForm } from './form/LineForm';
import { MapForm } from './form/MapForm';
import { ParallelForm } from './form/ParallelForm';
import { PictorialBarForm } from './form/PictorialBarForm';
import { PieForm } from './form/PieForm';
import { ProgressForm } from './form/ProgressForm';
import { RadarForm } from './form/RadarForm';
import { RoseForm } from './form/RoseForm';
import { SankeyForm } from './form/SankeyForm';
import { ScatterForm } from './form/ScatterForm';
import { SunburstForm } from './form/SunburstForm';
import { TableForm } from './form/TableForm';
import { ThemeRiverForm } from './form/ThemeRiverForm';
import { TreemapForm } from './form/TreemapForm';
import { WordCloudForm } from './form/WordCloudForm';

export const ChartForm = (props: {
  value: IChartConfig;
  onChange: (value: IChartConfig) => void;
}) => {
  const { value, onChange } = props;
  const { t } = useTranslation('chart');
  switch (value.type) {
    case 'bar':
      return <BarForm config={value} onChange={onChange} />;
    case 'line':
      return <LineForm config={value} onChange={onChange} />;
    case 'area':
      return <AreaForm config={value} onChange={onChange} />;
    case 'pie':
      return <PieForm config={value} onChange={onChange} />;
    case 'table':
      return <TableForm config={value} onChange={onChange} />;
    case 'scatter':
      return <ScatterForm config={value} onChange={onChange} />;
    case 'funnel':
      return <FunnelForm config={value} onChange={onChange} />;
    case 'progress':
      return <ProgressForm config={value} onChange={onChange} />;
    case 'rose':
      return <RoseForm config={value} onChange={onChange} />;
    case 'radar':
      return <RadarForm config={value} onChange={onChange} />;
    case 'gauge':
      return <GaugeForm config={value} onChange={onChange} />;
    case 'heatmap':
      return <HeatmapForm config={value} onChange={onChange} />;
    case 'sunburst':
      return <SunburstForm config={value} onChange={onChange} />;
    case 'candlestick':
      return <CandlestickForm config={value} onChange={onChange} />;
    case 'boxplot':
      return <BoxplotForm config={value} onChange={onChange} />;
    case 'parallel':
      return <ParallelForm config={value} onChange={onChange} />;
    case 'pictorialBar':
      return <PictorialBarForm config={value} onChange={onChange} />;
    case 'treemap':
      return <TreemapForm config={value} onChange={onChange} />;
    case 'sankey':
      return <SankeyForm config={value} onChange={onChange} />;
    case 'graph':
      return <GraphForm config={value} onChange={onChange} />;
    case 'map':
      return <MapForm config={value} onChange={onChange} />;
    case 'themeRiver':
      return <ThemeRiverForm config={value} onChange={onChange} />;
    case 'wordCloud':
      return <WordCloudForm config={value} onChange={onChange} />;
    default:
      throw new Error(t('form.typeError'));
  }
};
