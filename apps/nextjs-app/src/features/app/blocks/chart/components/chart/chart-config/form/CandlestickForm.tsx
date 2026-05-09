import { useTranslation } from 'next-i18next';
import type { ICandlestickConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const CandlestickForm = (props: {
  config: ICandlestickConfig;
  onChange: (config: ICandlestickConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.candlestick.time', 'Time')}
      valueLabel={t('form.candlestick.value', 'Value')}
      dimensionValue={config.time}
      valueValue={config.close}
      onDimensionChange={(time) => onChange({ ...config, time })}
      onValueChange={(close) => onChange({ ...config, close })}
    />
  );
};
