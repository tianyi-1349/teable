import { useTranslation } from 'next-i18next';
import type { IBoxplotConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const BoxplotForm = (props: {
  config: IBoxplotConfig;
  onChange: (config: IBoxplotConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.boxplot.group', 'Group')}
      valueLabel={t('form.boxplot.value', 'Value')}
      dimensionValue={config.group}
      valueValue={config.median}
      onDimensionChange={(group) => onChange({ ...config, group })}
      onValueChange={(median) => onChange({ ...config, median })}
    />
  );
};
