import { useTranslation } from 'next-i18next';
import type { IMapConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const MapForm = (props: { config: IMapConfig; onChange: (config: IMapConfig) => void }) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.map.region', 'Region')}
      valueLabel={t('form.map.value', 'Value')}
      dimensionValue={config.region}
      valueValue={config.value}
      onDimensionChange={(region) => onChange({ ...config, region })}
      onValueChange={(value) => onChange({ ...config, value })}
    />
  );
};
