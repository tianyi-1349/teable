import { useTranslation } from 'next-i18next';
import type { IRadarConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const RadarForm = (props: {
  config: IRadarConfig;
  onChange: (config: IRadarConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.radar.dimension', 'Dimension')}
      valueLabel={t('form.radar.value', 'Value')}
      dimensionValue={config.dimensions?.[0]}
      valueValue={config.value}
      onDimensionChange={(dimension) => onChange({ ...config, dimensions: [dimension] })}
      onValueChange={(value) => onChange({ ...config, value })}
    />
  );
};
