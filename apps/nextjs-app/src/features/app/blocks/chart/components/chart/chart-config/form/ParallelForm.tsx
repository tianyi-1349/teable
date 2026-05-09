import { useTranslation } from 'next-i18next';
import type { IParallelConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const ParallelForm = (props: {
  config: IParallelConfig;
  onChange: (config: IParallelConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.parallel.dimension', 'Dimension')}
      valueLabel={t('form.parallel.value', 'Value')}
      dimensionValue={config.dimensions?.[0]}
      valueValue={config.dimensions?.[1]}
      onDimensionChange={(d) => onChange({ ...config, dimensions: [d] })}
      onValueChange={(v) =>
        onChange({
          ...config,
          dimensions: config.dimensions?.[0] ? [config.dimensions[0], v] : [v],
        })
      }
    />
  );
};
