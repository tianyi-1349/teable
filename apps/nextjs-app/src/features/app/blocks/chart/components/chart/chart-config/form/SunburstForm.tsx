import { useTranslation } from 'next-i18next';
import type { ISunburstConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const SunburstForm = (props: {
  config: ISunburstConfig;
  onChange: (config: ISunburstConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.sunburst.path', 'Path')}
      valueLabel={t('form.sunburst.value', 'Value')}
      dimensionValue={config.path?.[0]}
      valueValue={config.value}
      onDimensionChange={(path) => onChange({ ...config, path: [path] })}
      onValueChange={(value) => onChange({ ...config, value })}
    />
  );
};
