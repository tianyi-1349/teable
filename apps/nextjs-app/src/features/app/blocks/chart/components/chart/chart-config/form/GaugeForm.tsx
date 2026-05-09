import { useTranslation } from 'next-i18next';
import type { IGaugeConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const GaugeForm = (props: {
  config: IGaugeConfig;
  onChange: (config: IGaugeConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');
  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.gauge.dimension', 'Dimension')}
      valueLabel={t('form.gauge.value', 'Value')}
      dimensionValue={config.value}
      valueValue={config.value}
      onDimensionChange={(value) => onChange({ ...config, value })}
      onValueChange={(value) => onChange({ ...config, value })}
    />
  );
};
