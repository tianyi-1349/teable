import { useTranslation } from 'next-i18next';
import type { ISankeyConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const SankeyForm = (props: {
  config: ISankeyConfig;
  onChange: (config: ISankeyConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.sankey.source', 'Source')}
      valueLabel={t('form.sankey.value', 'Value')}
      dimensionValue={config.source}
      valueValue={config.value}
      onDimensionChange={(source) => onChange({ ...config, source })}
      onValueChange={(value) => onChange({ ...config, value })}
    />
  );
};
