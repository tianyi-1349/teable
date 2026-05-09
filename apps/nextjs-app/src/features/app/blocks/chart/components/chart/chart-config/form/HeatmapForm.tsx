import { useTranslation } from 'next-i18next';
import type { IHeatmapConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const HeatmapForm = (props: {
  config: IHeatmapConfig;
  onChange: (config: IHeatmapConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.heatmap.x', 'X')}
      valueLabel={t('form.heatmap.value', 'Value')}
      dimensionValue={config.x}
      valueValue={config.value}
      onDimensionChange={(x) => onChange({ ...config, x })}
      onValueChange={(value) => onChange({ ...config, value })}
    />
  );
};
