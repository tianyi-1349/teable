import { useTranslation } from 'next-i18next';
import type { IThemeRiverConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const ThemeRiverForm = (props: {
  config: IThemeRiverConfig;
  onChange: (config: IThemeRiverConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.themeRiver.time', 'Time')}
      valueLabel={t('form.themeRiver.value', 'Value')}
      dimensionValue={config.time}
      valueValue={config.value}
      onDimensionChange={(time) => onChange({ ...config, time })}
      onValueChange={(value) => onChange({ ...config, value })}
    />
  );
};
