import { useTranslation } from 'next-i18next';
import type { IPictorialBarConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const PictorialBarForm = (props: {
  config: IPictorialBarConfig;
  onChange: (config: IPictorialBarConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.pictorialBar.dimension', 'Dimension')}
      valueLabel={t('form.pictorialBar.value', 'Value')}
      dimensionValue={config.dimension}
      valueValue={config.value}
      onDimensionChange={(dimension) => onChange({ ...config, dimension })}
      onValueChange={(value) => onChange({ ...config, value })}
    />
  );
};
