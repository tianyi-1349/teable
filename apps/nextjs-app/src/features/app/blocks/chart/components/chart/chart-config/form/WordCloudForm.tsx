import { useTranslation } from 'next-i18next';
import type { IWordCloudConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const WordCloudForm = (props: {
  config: IWordCloudConfig;
  onChange: (config: IWordCloudConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.wordCloud.word', 'Word')}
      valueLabel={t('form.wordCloud.value', 'Value')}
      dimensionValue={config.word}
      valueValue={config.value}
      onDimensionChange={(word) => onChange({ ...config, word })}
      onValueChange={(value) => onChange({ ...config, value })}
    />
  );
};
